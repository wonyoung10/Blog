import { NextResponse } from "next/server";

// 공개 API(/api/public/*)는 메인 사이트 등 외부 도메인에서 브라우저로 호출한다.
// 읽기 전용 + 공개된 글만 내보내므로 모든 출처를 허용한다.
export const PUBLIC_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export function corsJson(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...PUBLIC_CORS_HEADERS,
      ...(init?.headers ?? {})
    }
  });
}

// CORS preflight(OPTIONS) 응답용.
export function corsPreflight() {
  return new NextResponse(null, { status: 204, headers: PUBLIC_CORS_HEADERS });
}
