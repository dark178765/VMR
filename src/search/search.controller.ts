import { Controller, Get, Param, Render, Req } from "@nestjs/common";
import { SearchService } from "./search.service";
import * as moment from 'moment';

@Controller()
export class SearchController {
    constructor(
        private readonly searchService: SearchService
    ) { }

    @Get('search-home/:text')
    async searchFromHome(@Param() pram, @Req() req) {
        return await this.searchService.searchReportFromHome(pram.text);
    }

    @Get('search-blog/:text')
    async searchBlog(@Param() pram) {
        let blogs = await this.searchService.searchBlogs(pram.text);

        blogs = blogs.map(item => {
            item.createdAt = item.createdAt;
            return item;
        })

        return blogs;
    }

    @Get('search-pressrelease/:text')
    async searchPressrelease(@Param() pram) {
        return await this.searchService.searchPressRelease(pram.text);
    }

    @Get('search')
    @Render('searchresult')
    async searchresult(@Req() req) {
        let reports = await this.searchService.searchReportFromHome(req.query.q, 10);
        let pr = await this.searchService.searchPressRelease(req.query.q, 10);
        let blogs = await this.searchService.searchBlogs(req.query.q, 10);

        return { reports, pr, blogs };
    }
}