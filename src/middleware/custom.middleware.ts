import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from 'express';
import { RedirectService } from "./redirect.service";

@Injectable()
export class CustomMiddleware implements NestMiddleware {

    constructor(
        private redirectService: RedirectService
    ) {

    }

    async use(req: Request, res: Response, next: NextFunction) {

        let dotIndex = req.baseUrl.indexOf('.');

        let redirectUrl = req.baseUrl.indexOf('.') == -1 || (req.baseUrl.length - dotIndex) >= 2 ? await this.redirectService.getRedirectedUrl(req.baseUrl)
            : null;

        if (redirectUrl) {
            res.redirect(301, redirectUrl.NewUrl);
        } else {
            next();
        }
    }
}