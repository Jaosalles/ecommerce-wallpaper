import { ApiResponse } from "@/types";
import { NextResponse } from "next/server";

type FailOptions = {
  code?: string;
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
    },
    { status },
  );
}

export function fail(message: string, status = 400, options: FailOptions = {}) {
  return NextResponse.json<ApiResponse<null>>(
    {
      success: false,
      error: message,
      code: options.code,
    },
    { status },
  );
}
