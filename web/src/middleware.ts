import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/authentication/sign-in",
  "/authentication/sign-up",
  "/authentication/forgot-password",
  "/authentication/reset-password",
];

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/authentication/sign-in", request.url));
  }

  if (token && pathname === "/authentication/sign-in") {
    return NextResponse.redirect(new URL("/notifikasi", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
