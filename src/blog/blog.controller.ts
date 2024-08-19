import { Controller, Get, NotFoundException, Param, Redirect, Render, Req, Res, UseInterceptors } from "@nestjs/common";
import { ReportService } from "src/report/report.service";
import { BlogService } from "./blog.service";

import * as clean from 'clean-html';
import { RedirectInterceptor } from "src/middleware/redirection.interceptor";
import * as hbs from 'hbs';

@Controller()
export class BlogController {

    constructor(
        private readonly blogService: BlogService,
        private readonly reportService: ReportService
    ) { }


    @Get('insight/blogs')
    async redirectAllBlogs(@Res() res) {
        res.redirect('/blogs');
    }

    @Get(['insight/blog/:url'])
    async blogRedirect(@Res() res, @Param() pram) {
        res.redirect(`/blog/${pram.url}`);
    }

    @Get('insight/blog-details/:url')
    async insightblog(@Param() pram, @Res() res) {
        let blog = await this.blogService.getBlogByUniqueID(pram.url);
        if (!blog)
            throw new NotFoundException();

        res.redirect(301, `/blog/${blog.slug}`);
    }

    @Get('blogs')
    async getBlogs(@Res() res, @Req() req) {
        let recentBlogs = await this.blogService.getBlogs();

        let recentReports = await this.reportService.getRecentReports(10);

        res.render('newallblog',
            {
                recentReports,
                recentBlogs,
                metatitle: '[Latest Market Research Blogs], Vantage Market Research',
                metadescription: 'Our collection of latest market research reports blogs covers various industries and markets, providing valuable information to help you make informed business decisions. Browse our website now to discover the latest trends and analysis in your industry.',
                metakeywords: 'Vantage Market Research, Market Research Trends, Industry Analysis, Trends, Forecast, Market Size, Market Research Reports, Marketing Research Company, Companies, Trends, Competitive Landscape, Demand, Consumption, Production, Revenue, Volume'

            });
    }

    @Get('blog/:url')
    async blogdetail(@Param() pram, @Res() res, @Req() req) {

        let blog: any = await this.blogService.getBlogDetail(pram.url);

        let metatitle = '';
        if (blog) {
            if (blog['redirect']) {
                res.redirect(301, `/blog/${blog['redirect']}`);
                return;
            }

            let keyword = blog.writeupId ? JSON.parse(JSON.stringify(blog.writeupId)).reportTitle : blog.keyword;

            if (blog.writeupId) {
                let reportData = JSON.parse(JSON.stringify(blog.writeupId));

                let cagr = reportData.table.filter(x => {
                    return x.fieldName == 'CAGR_Revenue'
                });

                if (!cagr[0].fieldValue || cagr[0].fieldValue == '') {
                    cagr = reportData.table.filter(x => {
                        return x.fieldName == 'CAGR_Volume'
                    });
                }
                metatitle = `${reportData.reportTitle} Market CAGR of ${cagr[0].fieldValue} | 2022 - 2028`;
            } else {
                metatitle = blog.title;
            }

            if(!blog.description){
                let blogdesc = hbs.compile(blog.unprocessedDescription);
                blog['description'] = blogdesc(blog.table);
            }

            let mtDescription = blog.description.split('</p>').filter(x => x.replace(/\r\n/gmi, '')
                .replace(/\r/gmi, '')
                .replace(/\n/gmi, ''))[0].replace(/(<([^>]+)>)/gmi, '')
                .replace(/#10;/gmi, '')
                .replace(/\r\n/gmi, '')
                .replace(/\r/gmi, '')
                .replace(/\n/gmi, '').replace(/&&/gmi, '').replace(/&/gmi, ' ').replace(/\s+/gmi, ' ');

            blog.description = req.hostname.indexOf('vmr.biz') > -1 ? blog.description.replace(/vantagemarketresearch.com/gmi, 'vmr.biz')
                : blog.description;

            res.render('blogdetail', {
                blog,
                blogImage: '/assets/images/blogs/Blog_3.webp',
                metatitle,
                metadescription: mtDescription,
                metakeywords: `${keyword} Market Vantage Market Research, Market Research Trends, Industry Analysis, Trends, Forecast, Market Size, Market Research Reports, Marketing Research Company, Companies, Trends, Competitive Landscape, Demand, Consumption, Production, Revenue, Volume`
            });
        } else {
            //res.status(400);
            throw new NotFoundException();
        }
    }

    @Get('/all-blogs-josn/:page/:limit')
    async allBlogsJson(@Param() pram) {
        let res = await this.blogService.getAllBlogsPaging(pram.page, pram.limit);

        return res;
    }
}