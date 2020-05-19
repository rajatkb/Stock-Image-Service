import { injectable } from "inversify";
import { BaseMiddleware } from "inversify-express-utils";
import { Logger } from "../../utility/logger";
import { NextFunction , Request , Response} from "express";
import multer from 'multer'

@injectable()
export class MulterMiddleWare extends BaseMiddleware{

    private logger = new Logger(this.constructor.name).getLogger();
    private mult = multer()

    constructor(){
        super()
        this.logger.info(`Multer MiddleWare started !!`)
    }

    public handler = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => this.mult.single('file')(req, res , next)
}