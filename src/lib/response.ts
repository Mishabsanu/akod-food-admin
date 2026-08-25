import { NextResponse } from 'next/server';

export function sendSuccess(data: any, message = 'Operation successful', statusCode = 200) {
  if (data && typeof data === 'object' && 'data' in data && 'total' in data) {
    return NextResponse.json({
      success: true,
      message,
      data: data.data,
      total: data.total,
      pages: data.pages,
      page: data.page,
    }, { status: statusCode });
  }

  return NextResponse.json({
    success: true,
    message,
    data,
  }, { status: statusCode });
}

export function sendError(error: any, statusCode = 500) {
  const message = typeof error === 'string' ? error : (error?.message || 'Internal server error');
  return NextResponse.json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
  }, { status: statusCode });
}
