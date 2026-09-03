import { Request, Response, NextFunction } from 'express';
import { verifyToken, UserTokenPayload } from './jwt';
import { apiError } from '../core/responses';

export interface AuthenticatedRequest extends Request {
  user?: UserTokenPayload;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return apiError(res, 'Authentication required: missing or malformed Bearer token', 401, 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (err: any) {
    return apiError(res, 'Invalid or expired access token', 401, 'TOKEN_EXPIRED');
  }
}

export function requireRole(allowedRoles: Array<'STUDENT' | 'INSTITUTION' | 'INDUSTRY' | 'ADMIN'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return apiError(res, 'Unauthorized: user identity not verified', 401, 'UNAUTHORIZED');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return apiError(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource`,
        403,
        'FORBIDDEN'
      );
    }

    return next();
  };
}
