import { NextResponse, type NextRequest } from "next/server";
import { isRoleKey, ROUTE_ACCESS, roles } from "@/lib/auth/roles";
import { SESSION_COOKIE } from "@/lib/auth/session";

const PUBLIC_PATHS = ["/login"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p) || pathname.startsWith("/_next") || pathname === "/favicon.ico";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const sessionValue = request.cookies.get(SESSION_COOKIE)?.value;

  if (!isRoleKey(sessionValue)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const allowedPrefixes = ROUTE_ACCESS[sessionValue];
  const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isAllowed) {
    // Signed in, but this role can't see this route group — send them home
    // instead of showing a 404 or, worse, the wrong data.
    return NextResponse.redirect(new URL(roles[sessionValue].homePath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.svg$).*)"],
};
