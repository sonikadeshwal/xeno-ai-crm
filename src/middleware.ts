export { default } from "next-auth/middleware";
export const config = { matcher: ["/dashboard/:path*", "/customers/:path*", "/orders/:path*", "/segments/:path*", "/campaigns/:path*", "/autopilot/:path*"] };
