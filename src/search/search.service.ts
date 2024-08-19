import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Pressrelease, PressreleaseDocument } from "src/schema/pressrelease.schema";
import { Report, ReportDocument } from 'src/schema/report.schema';
import { Blog, BlogDocument } from 'src/schema/blog.schema';
@Injectable()
export class SearchService {
    constructor(
        @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>,
        @InjectModel(Pressrelease.name) private readonly pressreleaseModel: Model<PressreleaseDocument>,
        @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>
    ) { }

    async searchReportFromHome(searchText, limit?) {
        return await this.reportModel.find({
            keyword: new RegExp(searchText.replace(/ market/gmi, ''), 'gmi'),
            status: {
                $ne: 'Inactive'
            }
        }).limit(limit ?? 5);
    }

    async searchBlogs(searchText, limit?) {
        return await this.blogModel.find({
            title: new RegExp(searchText, 'gmi'),
            status: {
                $ne: 'Inactive'
            }
        }).limit(limit ?? 5);
    }

    async searchPressRelease(searchText, limit?) {
        return await this.pressreleaseModel.find({
            title: new RegExp(searchText, 'gmi'),
            status: {
                $ne: 'Inactive'
            }
        }).limit(limit ?? 5);
    }
}