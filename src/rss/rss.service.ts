import { Injectable } from "@nestjs/common";
import { Feed } from "feed";
import { BlogService } from "src/blog/blog.service";
import { ReportService } from "src/report/report.service";

@Injectable()
export class RssService {
    constructor(
        private readonly blogService: BlogService,
        private readonly reportService: ReportService
    ) { }

    async getBlogRss(host) {
        const feed = new Feed({
            title: `Vantage Blog Feed`,
            description: `Vantage Blog Feed`,
            id: `${host}/blogs/feed`,
            link: `${host}/blogs/feed`,
            language: `en`, // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
            image: `${host}/assets/images/logo/favicon.png`,
            favicon: `http://www.vmr.biz/favicon.ico`,
            copyright: `All rights reserved ${new Date().getFullYear()}, Vantage Market Research`,
            generator: `Vantage Market Research`,
            author: {
                name: `Vantage Market Research`,
                email: `sales@vantagemarketresearch.com`,
                link: `${host}`
            }
        });
        await this.blogService.getAllBlogsWithDescription()
            .then((res: any) => {
                res.forEach((p: any) => {

                    if (host.indexOf('vmr.biz') > -1) {
                        p.description = p.description.replace(/vantagemarketresearch.com/gmi, 'vmr.biz');
                    }

                    feed.addItem({
                        title: p.title,
                        id: `${host}/blog/${p.slug}`,
                        link: `${host}/blog/${p.slug}`,
                        description: p.description.replace('&#10;', ''),
                        content: p.description.replace('&#10;', ''),
                        date: p.updatedAt,
                        image: `${host}/assets/img/logo.webp`
                    });
                });

            });
        return feed.rss2();
    }

    async getReportsRss(host) {
        let reportsWithDescription = await this.reportService.getAllReportsWithDescription();
        const feed = new Feed({
            title: `Vantage Report Feed`,
            description: `Vantage Report Feed`,
            id: `${host}/reports/feed`,
            link: `${host}/reports/feed`,
            language: `en`, // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
            image: `${host}/assets/images/logo/favicon.png`,
            favicon: `${host}/assets/favicon.png`,
            copyright: `All rights reserved ${new Date().getFullYear()}, Vantage Market Research`,
            generator: `Vantage Market Research`,
            author: {
                name: `Vantage Market Research`,
                email: `sales@vantagemarketresearch.com`,
                link: `${host}`
            }
        });

        reportsWithDescription.forEach((p: any) => {
            feed.addItem({
                title: p.title,
                id: `${host}/industry-report/${p.slug}`,
                link: `${host}/industry-report/${p.slug}`,
                description: p.description.replace('&#10;', ''),
                content: p.description.replace('&#10;', ''),
                date: p.updatedAt,
                image: `${host}/assets/img/logo.webp`
            });
        });

        return feed.rss2();
    }
}