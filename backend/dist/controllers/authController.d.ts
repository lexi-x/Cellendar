import { Request, Response } from 'express';
import { ApiResponse, AuthRequest } from '../types';
interface AuthResponse {
    user: any;
    session: any;
}
interface LogoutResponse {
    message: string;
}
export declare class AuthController {
    static register(req: Request<{}, {}, AuthRequest>, res: Response<ApiResponse<AuthResponse>>): Promise<Response<ApiResponse<AuthResponse>, Record<string, any>>>;
    static login(req: Request<{}, {}, AuthRequest>, res: Response<ApiResponse<AuthResponse>>): Promise<Response<ApiResponse<AuthResponse>, Record<string, any>>>;
    static logout(req: Request, res: Response<ApiResponse<LogoutResponse>>): Promise<Response<ApiResponse<LogoutResponse>, Record<string, any>>>;
    static refreshToken(req: Request<{}, {}, {
        refresh_token: string;
    }>, res: Response<ApiResponse<{
        session: any;
    }>>): Promise<Response<ApiResponse<{
        session: any;
    }>, Record<string, any>>>;
    static getProfile(req: Request, res: Response<ApiResponse<{
        user: any;
    }>>): Promise<Response<ApiResponse<{
        user: any;
    }>, Record<string, any>>>;
}
export {};
//# sourceMappingURL=authController.d.ts.map