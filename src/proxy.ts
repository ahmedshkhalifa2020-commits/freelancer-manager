import { NextRequest, NextResponse } from "next/server";
import logger from "@/lib/logger";

export function proxy(request: NextRequest) {
  const { method, url } = request;
  const userAgent = request.headers.get("user-agent") || "";
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const urlPath = new URL(url).pathname;
  logger.info({
    message: `Incoming request ${method} ${urlPath}`,
    method,
    url: urlPath,
    userAgent,
    ip,
  });

  return NextResponse.next();
}

export const config = {
  // matcher: "/api/:path*", // Log only API requests, or remove for all
  matcher: "/:path*", // Log only API requests, or remove for all
};
