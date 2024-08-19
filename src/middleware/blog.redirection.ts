import { NestMiddleware } from "@nestjs/common";

export class BlogRedirection implements NestMiddleware {

    async use(req: any, res: any, next: (error?: any) => void) {
        if (req.hostname == 'www.vantagemarketresearch.com' || req.hostname == 'vantagemarketresearch.com') {
            res.redirect(301, 'https://www.vmr.biz' + req.url);
        } else {
            next();
        }
    }
}