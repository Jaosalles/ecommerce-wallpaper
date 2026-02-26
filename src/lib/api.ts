import { ApiResponse } from "@/types";
import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
    },
    { status },
  );
}

export function fail(message: string, status = 400) {
  return NextResponse.json<ApiResponse<null>>(
    {
      success: false,
      error: message,
    },
    { status },
  );
}
