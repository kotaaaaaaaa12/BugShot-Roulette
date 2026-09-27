import baseHandler, { GameServer } from "./index";

export { GameServer };

type RateLimitBinding = {
  limit(input: { key: string }): Promise<{ success: boolean }>;
};

type SecureEnv = {
  AUTH_RATE_LIMITER: RateLimitBinding;
};

function clientKey(request: Request): string {
  return request.headers.get("CF-Connecting-IP") || "unknown";
}

function sameOriginAllowed(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (!origin) return true;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

function isContainerRoute(pathname: string): boolean {
  return (
    pathname === "/server" ||
    pathname.startsWith("/server/") ||
    pathname === "/socket.io" ||
    pathname.startsWith("/socket.io/")
  );
}

function genericLoginFailure(): Response {
  return Response.json(
    {
      success: false,
      error: "Invalid username or password",
    },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

export default {
  async fetch(
    request: Request,
    env: SecureEnv,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (isContainerRoute(url.pathname) && !sameOriginAllowed(request)) {
      return new Response("Forbidden origin", {
        status: 403,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    if (
      request.method === "POST" &&
      (url.pathname === "/api/login" || url.pathname === "/api/register")
    ) {
      const { success } = await env.AUTH_RATE_LIMITER.limit({
        key: `${url.pathname}:${clientKey(request)}`,
      });

      if (!success) {
        return Response.json(
          {
            success: false,
            error: "Too many authentication attempts",
          },
          {
            status: 429,
            headers: {
              "Cache-Control": "no-store",
              "X-Content-Type-Options": "nosniff",
              "Retry-After": "60",
            },
          },
        );
      }
    }

    const response = await (baseHandler as any).fetch(request, env, ctx);

    if (
      request.method === "POST" &&
      url.pathname === "/api/login" &&
      (response.status === 401 || response.status === 404)
    ) {
      return genericLoginFailure();
    }

    return response;
  },
};
