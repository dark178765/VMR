import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from 'mongoose';
import { HttpClient } from "src/httpclient/httpclient";
import { ChildCategory, ChildCategoryDocument } from "src/schema/childcategory.schema";
import { ParentCategory, ParentCategoryDocument } from "src/schema/parent-category.schema";
import { Report, ReportDocument } from "src/schema/report.schema";

@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(ChildCategory.name) private childCateogryModel: Model<ChildCategoryDocument>,
        @InjectModel(ParentCategory.name) private parentCategoryModel: Model<ParentCategoryDocument>,
        @InjectModel(Report.name) private reportModel: Model<ReportDocument>
    ) { }


    async getCategory(categoryUrl) {
console.log("Category model ", this.parentCategoryModel);
        return await this.parentCategoryModel.findOne({
            slug: categoryUrl
        });
    }

    async getCategoryReports(categoryUrl) {
        let category = await this.childCateogryModel.find({
            slug: categoryUrl
        });


        let parentCategory = {};

        if (category && category.length > 0) {
            parentCategory = await this.parentCategoryModel.find({
                _id: category[0].parentCategoryId
            });
        } else {
            parentCategory = await this.parentCategoryModel.find({
                slug: categoryUrl
            });

        }

        let allChildCategories = await this.childCateogryModel.find({
            parentCategoryId: parentCategory[0]._id
        });

        let reports = await this.reportModel.find({

            parentCategoryId: parentCategory[0]._id,
            status: 'Active'
        });

        return { reports, parentCategory, category }
    }

    async getAllCategories() {
        return await this.parentCategoryModel.find({
            status: {
                $ne: 'Archive'
            }
        });
    }

    async getSubScategories(url) {
        let parent = await this.parentCategoryModel.find({
            slug: url
        });

        if (!parent) {
            let child = await this.childCateogryModel.findOne({
                slug: url
            });

            parent = await this.parentCategoryModel.find({
                _id: child.parentCategoryId
            });
        }

        return await this.childCateogryModel.find({
            parentCategoryId: parent[0]._id
        })
    }

    async getAllParentCategories() {
        return await this.parentCategoryModel.find({
            status: {
                $ne: 'Archive'
            }
        });
    }

    async getParentCategory(url) {
        let child = await this.childCateogryModel.findOne({
            slug: url
        });

        return await this.parentCategoryModel.findOne({
            _id: child.parentCategoryId
        })
    }

    async getAllChildCategories(categoryID) {
        let child = await this.childCateogryModel.findOne({
            _id: categoryID
        });


        if (child) {
            let allChilds = await this.childCateogryModel.find({
                parentCategoryId: { $in: [child.parentCategoryId[0]] }
            });

            return allChilds;

        } else {
            let parent = await this.parentCategoryModel.findOne({
                _id: categoryID
            });

            return await this.childCateogryModel.find({
                parentCategoryId: parent._id
            })
        }
    }

    async getReportsByCategory(obj) {
        let { categories, limit, page } = obj;

        let reports = await this.reportModel.find({
            childCategory: {
                $in: categories
            },
            status: {
                $ne: 'Inactive'
            }
        }).populate({
            path: 'childCategory',
            populate: {
                path: 'parentCategoryId'
            }
        }).sort({ _id: -1 }).limit(limit ?? 20).skip(((page ?? 1) - 1) * limit ?? 20);

        return reports.map(x => {
            let rt = JSON.parse(JSON.stringify(x));
            return {
                ...rt,
                publishedDate: rt.updatedAt,
                childCategory: {
                    title: x.childCategory[0].title,
                    slug: x.childCategory[0].slug
                },
                parentCategory: {
                    title: x.childCategory[0].parentCategoryId[0].title,
                    slug: x.childCategory[0].parentCategoryId[0].slug
                }
            }
        })

    };
}