import { Controller, Get, NotFoundException, Param, Redirect, Render, Res, Response, UseInterceptors } from "@nestjs/common";
import { PressreleaseService, ReportService } from "src/index/index.service";
import { Feed } from 'feed';

@Controller()
export class PressreleaseController {
    constructor(
        private readonly pressreleaseService: PressreleaseService,
        private readonly reportService: ReportService
    ) { }

    @Get('insight/press-releases')
    async redirectAllPressrelease(@Res() res) {
        res.redirect('/press-releases');
    }

    @Get('press-releases')
    @Render('all-news')
    async getAllPressrelease() {
        //let pr = await this.pressreleaseService.getrecentPressrelease(10);

        let recentReports = await this.reportService.getRecentReports(10);

        return {
            recentReports,
            metatitle: '[Latest Market Research Pressrelease]',
            metadescription: 'Stay informed with the latest market research news! Our expert analysts provide in-depth analysis and insights across various industries and markets.',
            metakeywords: 'Press Releases, All News, Latest PR, Latest News, Latest Press Releases'
        };
    }

    @Get('insight/press-release/:url')
    @Redirect()
    async getPressrelease(@Param() param, @Res() res) {
        //res.redirect('/press-release/' + param.url);
        return {
            url: '/press-release/' + param.url,
            statusCode: 301
        };
    }

    @Get('press-release/:url')
    @Render('pressrelease')
    async getPr(@Param() pram, @Res() res) {
        let pr: any = await this.pressreleaseService.getPr(pram.url);

        if (!pr) {
            //res.status(400);
            throw new NotFoundException();
        } else {

            let metatitle = pr['reportDataTable'].Revenue_Forecast ? `${pr.report.keyword.trim().replace(/ market/gmi, '')} Market Share Worth $${pr['reportDataTable'].Revenue_Forecast.replace(/usd/gmi, '')} by ${pr['reportDataTable'].Forecast_Year} | CAGR ${pr['reportDataTable'].CAGR_Revenue}`
                : `Size ${pr['reportDataTable'].Volume_Forecast} by ${pr['reportDataTable'].Forecast_Year} | CAGR ${pr.Volume_CAGR}`;
            return {
                rptId: pr.report._id,
                pr,
                metatitle,
                metakeywords: `Global ${pr.report.keyword.trim()} Size, Global ${pr.report.keyword.trim()} Share, Global ${pr.report.keyword.trim()} Outlook, Global ${pr.report.keyword.trim()} Forecast`,
                metadescription: `The ${pr.report.keyword.trim()} Market is expected to reach ${pr['reportDataTable'].Revenue_Current} by 2028, growing at a CAGR of ${pr['reportDataTable'].Revenue_Forecast} from 2022 to 2028`,
                reportImage: pr.report.keyword.trim().replace(/\s/gmi, '-').replace(/&/gmi, 'and'),
                ...pr.reportDataTable
            }
        }
    }

    @Get('pressreleaserss')
    async pressreleaseRss(@Res() res) {
        let prs = await this.pressreleaseService.getAllPressReleaseWithDescription();
        const feed = new Feed({
            title: "Vantage Press Release Feed",
            description: "Vantage Press Release Feed",
            id: "http://www.vantagemarketresearch.com/pressreleasefeed",
            link: "http://www.vantagemarketresearch.com/pressreleasefeed",
            language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
            image: "https://www.vantagemarketresearch.com/assets/images/logo/favicon.png",
            favicon: "https://www.vantagemarketresearch.com/favicon.ico",
            copyright: `All rights reserved ${new Date().getFullYear()}, Vantage Market Research`,
            generator: "Vantage Market Research",
            author: {
                name: "Vantage Market Research",
                email: "sales@vantagemarketresearch.com",
                link: "https://www.vantagemarketresearch.com"
            }
        });
        prs.forEach(p => {
            feed.addItem({
                title: p.title,
                id: `https://www.vantagemarketresearch.com/press-release/${p.slug}`,
                link: `https://www.vantagemarketresearch.com/press-release/${p.slug}`,
                description: p.description,
                content: p.description,
                date: new Date(),
                image: 'https://www.vantagemarketresearch.com/assets/images/logo/logo.webp'
            });
        });

        let rr = feed.rss2();

        res.set('Content-Type', 'text/xml');
        res.send(rr);

    }

    @Get('/all-news-json/:page?/:limit?')
    async getAllPressreleases(@Param() pram) {
        return await this.pressreleaseService.getAllPressreleases(pram.page, pram.limit);
    }
}