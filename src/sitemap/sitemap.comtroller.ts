import { Controller, Get, Param, Req, Res, Response } from "@nestjs/common";
import { BlogService } from "src/blog/blog.service";
import { PressreleaseService } from "src/pressrelease/pressrelease.service";
import { ReportService } from "src/report/report.service";
import { SitemapSerive } from "./sitemap.service";
import * as moment from 'moment';
import { CategoryService } from "src/category/category.service";
import axios from "axios";

@Controller()
export class SitempaController {
    constructor(
        private readonly sitemapService: SitemapSerive,
        private readonly pressreleaseService: PressreleaseService,
        private readonly blogService: BlogService,
        private readonly reportService: ReportService,
        private readonly categoryService: CategoryService
    ) { }

    @Get('sitemap.xml')
    async getSitemap(@Response() res, @Req() req) {
        let host = `https://${req.hostname}${(req.hostname == 'localhost' ? `:${process.env.APP_PORT}` : '')}`;

        let mainSitemap = `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
        http://www.w3.org/1999/xhtml
        http://www.w3.org/2002/08/xhtml/xhtml1-strict.xsd">
                            <sitemap>
                            <loc>${host}/all_reports.xml</loc>
                            </sitemap>
                            <sitemap>
                            <loc>${host}/press_releases.xml</loc>
                            </sitemap>
                            <sitemap>
                            <loc>${host}/blogs.xml</loc>
                            </sitemap>
                            <sitemap>
                            <loc>${host}/all-categories.xml</loc>
                            </sitemap>
                            </sitemapindex>`;
        res.set('Content-Type', 'text/xml');
        res.send(mainSitemap);
    }

    @Get('all_reports.xml')
    async allReportSitemap(@Response() res, @Req() req) {
        let host = `https://${req.hostname}${(req.hostname == 'localhost' ? `:${process.env.APP_PORT}` : '')}`;

        let reportLinks = await this.reportService.getAllReportLinks();
        let loc = '';
        reportLinks.forEach(item => {
            //loc += `<url><loc>https://www.vantagemarketresearch.com/industry-report/${item.slug}</loc><lastmod>${item.updatedAt.getFullYear()}-${item.updatedAt.getMonth() + 1}-${item.updatedAt.getDate()}</lastmod></url>`;
            loc += `<url><loc>${host}/industry-report/${item.slug}</loc><lastmod>${moment(item.updatedAt).format('YYYY-MM-DD')}</lastmod></url>`;
        });
        res.set('Content-Type', 'text/xml');

        res.send(`<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
    http://www.w3.org/1999/xhtml
    http://www.w3.org/2002/08/xhtml/xhtml1-strict.xsd">
            ${loc}
        </urlset>`);
    }

    @Get('press_releases.xml')
    async getAllPressreleases(@Response() res, @Req() req) {
        let host = `https://${req.hostname}${(req.hostname == 'localhost' ? `:${process.env.APP_PORT}` : '')}`;

        let apr = await this.pressreleaseService.getAllPressrelease();
        let loc = '';
        apr.forEach(item => {
            loc += `<url><loc>${host}/press-release/${item.slug}</loc><lastmod>${moment(item.updatedAt).format('YYYY-MM-DD')}</lastmod></url>`;
        });

        res.set('Content-Type', 'text/xml');
        res.send(`<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
    http://www.w3.org/1999/xhtml
    http://www.w3.org/2002/08/xhtml/xhtml1-strict.xsd">
            ${loc}
        </urlset>`);

    }

    @Get('blogs.xml')
    async getBlogSitemap(@Response() res, @Req() req) {
        let host = `https://${req.hostname}${(req.hostname == 'localhost' ? `:${process.env.APP_PORT}` : '')}`;

        res.set('Content-Type', 'text/xml');
        let blogs = await this.blogService.getAllBlogs();
        let loc = '';
        blogs.forEach(item => {
            loc += `<url><loc>${host}/blog/${item.slug}</loc><lastmod>${moment(item.updatedAt).format('YYYY-MM-DD')}</lastmod></url>`;
        });

        res.set('Content-Type', 'text/xml');
        res.send(`<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
    http://www.w3.org/1999/xhtml
    http://www.w3.org/2002/08/xhtml/xhtml1-strict.xsd">
            ${loc}
        </urlset>`);
    }

    @Get('all-categories.xml')
    async getAllCategoriesSitemap(@Response() res, @Req() req) {

        let host = `https://${req.hostname}${(req.hostname == 'localhost' ? `:${process.env.APP_PORT}` : '')}`;

        res.set('Content-Type', 'text/xml');
        let parentCategories = await this.categoryService.getAllCategories();
        let loc = '';
        parentCategories.forEach(c => {
            loc += `<sitemap><loc>${host}/category/${c.slug}.xml</loc></sitemap>`;
        })

        res.send(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
        http://www.w3.org/1999/xhtml
        http://www.w3.org/2002/08/xhtml/xhtml1-strict.xsd">
            ${loc}
            </sitemapindex>`);
    }


    @Get('/category/:url.xml')
    async getCategorySitemap(@Param() pram, @Res() res, @Req() req) {
        let host = `https://${req.hostname}${(req.hostname == 'localhost' ? `:${process.env.APP_PORT}` : '')}`;

        let reports = await this.categoryService.getCategoryReports(pram.url);
        let loc = '';
        reports.reports.forEach(item => {
            //loc += `<url><loc>https://www.vantagemarketresearch.com/industry-report/${item.slug}</loc><lastmod>${item.updatedAt.getFullYear()}-${item.updatedAt.getMonth() + 1}-${item.updatedAt.getDate()}</lastmod></url>`;
            loc += `<url><loc>${host}/industry-report/${item.slug}</loc><lastmod>${moment().format('YYYY-MM-DD')}</lastmod></url>`;
        });
        res.set('Content-Type', 'text/xml');

        res.send(`<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
    http://www.w3.org/1999/xhtml
    http://www.w3.org/2002/08/xhtml/xhtml1-strict.xsd">
            ${loc}
        </urlset>`);
    }


    @Get('imagesitemap.xml')
    async getImageSitemap(@Res() res, @Req() req) {
        let host = `https://${req.hostname}${(req.hostname == 'localhost' ? `:${process.env.APP_PORT}` : '')}`;

        let reportLinks = await this.reportService.getAllReportLinks();
        let loc = '';
        reportLinks.forEach(item => {
            //loc += `<url><loc>https://www.vantagemarketresearch.com/industry-report/${item.slug}</loc><lastmod>${item.updatedAt.getFullYear()}-${item.updatedAt.getMonth() + 1}-${item.updatedAt.getDate()}</lastmod></url>`;
            loc += `<url>
                        <loc>${host}/industry-report/${item.slug}</loc>
                        <image:image>
                            <image:loc>${host}/${item.keyword.trim().replace(/\s/gmi, '-').replace(/&/gmi, 'and')}-Market-Share.jpg</image:loc>
                            <image:title>
                                <![CDATA[ ${item.keyword.replace(/&/gmi, '&amp;')} Market Share]]>
                            </image:title>
                        </image:image>
                        <priority>1.0</priority>
                        <changefreq>daily</changefreq>
                    </url>`;
        });
        res.set('Content-Type', 'text/xml');

        res.send(`<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" 
        xsi:schemaLocation="http://www.google.com/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
            ${loc}
        </urlset>`);
    }

    @Get('lang-sitemap.xml')
    async languageSitemap(@Response() res, @Req() req) {
        let host = `https://${req.hostname}${(req.hostname == 'localhost' ? `:${process.env.APP_PORT}` : '')}`;

        let reportLinks = await axios.get(`${process.env.TRANSLATE_SERVER}/get-urls`);
        let loc = '';
        reportLinks.data.forEach(item => {
            //loc += `<url><loc>https://www.vantagemarketresearch.com/industry-report/${item.slug}</loc><lastmod>${item.updatedAt.getFullYear()}-${item.updatedAt.getMonth() + 1}-${item.updatedAt.getDate()}</lastmod></url>`;
            loc += `<url><loc>${host}/${item.lang}/industry-report/${item.url}</loc><lastmod>${moment().format('YYYY-MM-DD')}</lastmod></url>`;
        });

        res.set('Content-Type', 'text/xml');

        res.send(`<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:xhtml="http://www.w3.org/1999/xhtml"
    xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
    http://www.w3.org/1999/xhtml
    http://www.w3.org/2002/08/xhtml/xhtml1-strict.xsd">
            ${loc}
        </urlset>`);
    }
}