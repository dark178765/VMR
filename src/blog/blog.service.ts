import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CategoryService } from "src/category/category.service";
import { HttpClient } from "src/httpclient/httpclient";
import { Blog, BlogDocument } from "src/schema/blog.schema";
import { Report, ReportDocument } from "src/schema/report.schema";
import { ReportV3, ReportV3Document } from "src/schema/reportv3.schema";
import { helper } from '../util/helper';
import * as cleaner from 'clean-html';

@Injectable()
export class BlogService {
    constructor(
        private readonly httpClient: HttpClient,
        @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
        @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
        private readonly categoryService: CategoryService
    ) { }

    async getBlogs(limit?) {
        return await this.blogModel.find().sort({
            _id: -1
        }).limit(limit ?? 10);
    }

    async getBlogByUniqueID(uniqueID) {
        return await this.blogModel.findOne({
            uniqueId: uniqueID
        });
    }

    async getBlogDetail(blogUrl): Promise<any> {
        let otherInfo = {};

        let blogSegments = blogUrl.split('-');

        let withoutNumber = blogSegments.filter(x => !parseInt(x));

        let blog = await this.blogModel.findOne({
            slug: blogUrl,
            status: {
                $ne: 'Inactive'
            }
        }).populate('writeupId', 'reportTitle segments table _id')
            .populate({ path: 'report', select: 'slug title', populate: 'childCategory' });


        if (!blog) {
            blog = await this.blogModel.findOne({
                slug: new RegExp(withoutNumber.join('-').replace('-market', ''), 'gmi'),
                status: {
                    $ne: 'Inactive'
                }
            });

            if (blog) {
                blog['redirect'] = blog.slug;
                return blog;
            }
        }

        if (!blog)
            return undefined;

        if (JSON.parse(JSON.stringify(blog)).writeupId) {
            let report = await this.reportModel.findOne({
                reportDataId: new Types.ObjectId(blog.writeupId._id)
            });

            otherInfo['reportTitle'] = report.title;
            otherInfo['reportslug'] = report.slug;
            otherInfo['keyword'] = report.keyword;

            let allCategories = await this.categoryService.getAllChildCategories(report.childCategory);

            otherInfo['relatedReports'] = await this.reportModel.find({
                status: 'Active',
                childCategory: {
                    $in: allCategories.map(c => c._id)
                }
            }).sort({ _id: -1 }).limit(10);

            otherInfo['table'] = helper.convertArrayToObject(blog.writeupId.table);
        } else if (blog['report'] && blog['report'] != null) {
            otherInfo['reportTitle'] = blog['report'].title;
            otherInfo['reportslug'] = blog['report'].slug;
        }

        blog.description = blog.description.replace(/&#160;/gmi, '');

        blog = await new Promise(resolve => {
            cleaner.clean(blog.description, {
                'add-remove-tags': ['span'],
                'add-remove-attributes': ['class'],
                'remove-empty-tags': ['a', 'h1', 'h2', 'p']
            }, (html) => {
                blog.description = html;
                resolve(JSON.parse(JSON.stringify(blog)));
            });
        });

        return { ...blog, ...otherInfo };
    }

    async getAllBlogs() {
        return await this.blogModel.find({
            status: {
                $ne: 'Inactive'
            }
        }, {
            'slug': '$slug',
            'updatedAt': '$updatedAt'
        }).sort({ _id: -1 }).exec().then(res => {
            return res;
        });
    }

    async getAllBlogsPaging(page, limit) {
        let blogs = await this.blogModel.find({
            status: {
                $ne: 'Inactive'
            }
        }).sort({ _id: -1 }).limit(limit ?? 20).skip(((page ?? 1) - 1) * limit ?? 20);

        let count = await this.blogModel.count({
            status: {
                $ne: 'Inactive'
            }
        });

        return { blogs, count }
    }

    async getAllBlogsWithDescription() {
        return await this.blogModel.find({
            status: {
                $ne: 'Inactive'
            }
        }, {
            'title': '$title',
            'slug': '$slug',
            'updatedAt': '$updatedAt',
            'description': '$description'
        }).sort({
            _id: -1
        }).exec().then(res => {
            return res;
        });
    }

    async getRecenetBlogs(limit) {
        return await this.blogModel.find({
            status: {
                $ne: 'Inactive'
            }
        }).populate({ path: 'writeupId', select: '_id reportTitle' }).sort({
            _id: -1
        }).limit(limit);
    }

}