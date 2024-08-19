import { Controller, Get, Req, Res } from "@nestjs/common";
import { RssService } from "./rss.service";

@Controller()
export class RssController {
    constructor(
        private readonly rssService: RssService
    ) { }

    @Get('blogs/rss')
    async getBlogRss(@Res() res, @Req() req) {
        let host = `https://${req.hostname}${(req.hostname == 'localhost' ? `:${process.env.APP_PORT}` : '')}`;

        res.set('Content-Type', 'text/xml');
        res.send(await this.rssService.getBlogRss(host));
    }

    @Get('reports/rss')
    async getReportRss(@Res() res, @Req() req) {
        let host = `https://${req.hostname}${(req.host == 'localhost' ? `:${process.env.APP_PORT}` : '')}`;

        res.set('Content-Type', 'text/xml');
        res.send(await this.rssService.getReportsRss(host));
    }


}