import { NextFunction, Request, Response } from "express";
interface IUserPayload {
    id: string;
    email: string;
}
declare global {
    namespace Express {
        interface Request {
            user?: IUserPayload;
        }
    }
}
export declare const currentUser: (req: Request, res: Response, next: NextFunction) => void;
export {};
