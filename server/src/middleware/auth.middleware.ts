import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { User, queryUser } from "../fabric/user/User.fabric";

export async function authentication(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (token == null) return res.sendStatus(401);
        const user: any = jwt.verify(token, process.env.JWT_SECRET as string);
        const queryString: any = {};
        queryString.selector = {
            docType: "user",
            id: user.id,
        };
        const result = await queryUser(user.id, JSON.stringify(queryString));
        if (result.length === 0) return res.sendStatus(401);

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        return res.sendStatus(401);
    }
}
