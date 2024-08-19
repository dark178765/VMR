import { Injectable } from "@nestjs/common";
import { HttpClient } from "src/httpclient/httpclient";

@Injectable()
export class SitemapSerive {
    constructor(
        private readonly httpClient: HttpClient
        
    ) { }

    async getAllReportSitemap() {
        return await this.httpClient.get('all_reports.xml')
            .then(res => {
                return res.data;
            })
    }

    async getAllBlogXml() {
        return await this.httpClient.get(`blogs.xml`)
            .then(res => {
                console.log(res)
                return res.data;
            })
    }

    async getAllCategorySitemap() {
        return await this.httpClient.get('all_categories.xml')
            .then(res => {
                return res.data;
            })
    }
}