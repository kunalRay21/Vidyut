import { Response } from 'express';

export interface ApiResponseMeta {
  timestamp: string;
  version: string;
}

export interface ApiResponseEnvelope<T = any> {
  success: boolean;
  data: T | null;
  error: {
    code?: string;
    message: string;
    details?: any;
  } | null;
  meta: ApiResponseMeta;
}

export function apiResponse<T = any>(
  res: Response,
  data: T | null = null,
  success = true,
  error: { code?: string; message: string; details?: any } | null = null,
  statusCode = 200
) {
  const envelope: ApiResponseEnvelope<T> = {
    success,
    data,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
  };

  return res.status(statusCode).json(envelope);
}

export function apiSuccess<T = any>(res: Response, data: T, statusCode = 200) {
  return apiResponse(res, data, true, null, statusCode);
}

export function apiError(
  res: Response,
  message: string,
  statusCode = 400,
  code = 'BAD_REQUEST',
  details?: any
) {
  return apiResponse(
    res,
    null,
    false,
    { code, message, details },
    statusCode
  );
}
