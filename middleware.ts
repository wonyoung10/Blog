import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const password = process.env.ADMIN_PASSWORD;

  if (!password || password === "change-me") {
    return NextResponse.next();
  }

  const auth = request.headers.get("authorization");
  const expected = `Basic ${btoa(`admin:${password}`)}`;

  if (auth === expected) {
    return NextResponse.next();
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Blog Studio Admin"'
    }
  });
}

export const config = {
  matcher: ["/admin/:path*"]
};
