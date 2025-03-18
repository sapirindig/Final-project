import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.header('authorization');
    const token = authorization && authorization.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }

    if (!process.env.TOKEN_SECRET) {
        res.status(500).json({ message: 'Server Error' });
        return;
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
        if (err) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        req.params.userId = (payload as { _id: string })._id;
        next();
    });
};

export default authMiddleware;