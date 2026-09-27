import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const nativeFetch = globalThis.fetch.bind(globalThis);

const MAX_BODY_BYTES = 256 * 1024;
const MAX_REDIRECTS = 3;

function isBlockedIpv4(address) {
  const parts = address.split(".").map(Number);
  if (
    parts.length !== 4 ||
    parts.some((value) => !Number.isInteger(value) || value < 0 || value > 255)
  ) {
    return true;
  }

  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isBlockedIp(address) {
  const version = isIP(address);

  if (version === 4) {
    return isBlockedIpv4(address);
  }

  if (version !== 6) {
    return true;
  }

  const normalized = address.toLowerCase();

  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (/^fe[89ab]/.test(normalized)) return true;

  const mapped = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return mapped ? isBlockedIpv4(mapped[1]) : false;
}

async function validateUrl(input) {
  const url = input instanceof URL ? new URL(input) : new URL(String(input));

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("Blocked outbound URL protocol");
  }

  if (url.username || url.password) {
    throw new TypeError("Credentials in outbound URLs are not allowed");
  }

  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new TypeError("Blocked private outbound destination");
  }

  if (isIP(hostname)) {
    if (isBlockedIp(hostname)) {
      throw new TypeError("Blocked private outbound destination");
    }
    return url;
  }

  const addresses = await lookup(hostname, {
    all: true,
    verbatim: true,
  });

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isBlockedIp(address))
  ) {
    throw new TypeError("Blocked private outbound destination");
  }

  return url;
}

async function boundedResponse(response) {
  const contentType = (response.headers.get("content-type") || "").toLowerCase();

  if (
    !contentType.includes("text/html") &&
    !contentType.includes("application/xhtml+xml")
  ) {
    throw new TypeError("Link preview only accepts HTML");
  }

  const declaredLength = Number(response.headers.get("content-length") || 0);

  if (declaredLength > MAX_BODY_BYTES) {
    throw new TypeError("Link preview response is too large");
  }

  if (!response.body) {
    return response;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let total = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    total += value.byteLength;

    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new TypeError("Link preview response is too large");
    }

    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

globalThis.fetch = async function securedFetch(input, init = {}) {
  let current = await validateUrl(
    input instanceof Request ? input.url : input,
  );

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const response = await nativeFetch(current, {
      ...init,
      redirect: "manual",
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");

      if (!location || redirects === MAX_REDIRECTS) {
        throw new TypeError("Too many redirects");
      }

      current = await validateUrl(new URL(location, current));
      continue;
    }

    return boundedResponse(response);
  }

  throw new TypeError("Outbound request failed");
};
