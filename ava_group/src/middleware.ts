import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const middleware = createMiddleware(routing);

export function middlewareHandler(request: NextRequest) {
  const url = new URL(request.url);

  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  return middleware(request);
}

export default middlewareHandler;

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
