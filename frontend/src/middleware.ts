import { auth } from "@/app/api/auth/config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 公开路由列表
  const publicRoutes = ["/login", "/signup", "/password-recovery", "/reset-password"];
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  // 获取会话
  const session = await auth();

  // 如果访问公开路由
  if (isPublic) {
    // 已登录用户重定向到仪表板
    if (session?.user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 其他路由需要登录
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 超级管理员路由检查
  const isSuperuser = session.user?.is_superuser || false;
  if (pathname.startsWith("/users") && !isSuperuser) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public|sitemap.xml|robots.txt).*)"],
};
