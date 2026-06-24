import { NextResponse } from "next/server";

export function apiSuccess<T extends Record<string, unknown>>(
  data: T,
  status = 200
) {
  return NextResponse.json({ success: true, code: status, ...data }, { status });
}

export function apiError(error: string, status = 500) {
  return NextResponse.json(
    { success: false, error, code: status },
    { status }
  );
}
