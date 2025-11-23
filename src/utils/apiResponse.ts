import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ApiError } from '~/types/api';

export const handleApiError = (error: unknown): NextResponse => {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        message: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        errors: error.issues,
      },
      { status: 400 }
    );
  }

  const message = error instanceof Error ? error.message : 'Internal server error';
  return NextResponse.json(
    {
      message,
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
};

export const successResponse = <T>(data: T, message?: string): NextResponse => {
  return NextResponse.json({
    success: true,
    message,
    data,
  });
};
