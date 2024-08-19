import { Get, Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, Model, Types } from "mongoose";
import { HttpClient } from "src/httpclient/httpclient";
import { Pressrelease, PressreleaseDocument } from "src/schema/pressrelease.schema";
import { PrWriteup, PRWriteupDocument } from "src/schema/prwriteup.schema";
import { ReportData, ReportDataDocument } from "src/schema/report-data.schema";
import { Report, ReportDocument } from "src/schema/report.schema";
import { helper } from '../util/helper';
import * as hbs from 'hbs';
import { readFileSync } from "fs";
import { join } from "path";
import { ChildCategory, ChildCategoryDocument } from "src/schema/childcategory.schema";
import { ReportService } from "src/report/report.service";
import axios from "axios";

@Injectable()
export class PressreleaseService {
    constructor(
        @InjectModel(Pressrelease.name) private pressReleaseModel: Model<PressreleaseDocument>,
        @InjectModel(ReportData.name) private reportDataModel: Model<ReportDataDocument>,
        @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
        @InjectModel(PrWriteup.name) private prWriteupModel: Model<PRWriteupDocument>,
        @InjectModel(ChildCategory.name) private childCategoryModel: Model<ChildCategoryDocument>,
        private readonly reportService: ReportService
    ) {

    }
    async getrecentPressrelease(limit) {

        return await this.pressReleaseModel.find({
            status: {
                $ne: 'Inactive'
            },
            prtype: {
                $ne: 'PR2'
            }
        }, {
            'title': '$title',
            'slug': '$slug',
            'createdAt': '$createdAt',
            'report': '$report'
        }).populate({ path: 'report', select: '_id keyword' }).populate({ path: 'writeup', select: '_id reportTitle' }).sort({
            createdAt: -1
        }).limit(limit).exec().then(res => {
            return res;
        });

    }

    async getPr(url) {
        let pr: any = await this.pressReleaseModel.findOne({
            slug: url,
            prtype: {
                $ne: 'PR2'
            },
            status: {
                $ne: 'Inactive'
            }
        }, {
            'title': '$title',
            'description': '$description',
            'createdAt': '$createdAt',
            'writeup': '$writeup'
        }).populate('report', 'templates excelData reportDataId').exec().then(res => {
            return res;
        });

        if (!pr) {
            return undefined;
        }

        if (pr.writeup || pr.report.reportDataId) {

            let reportDataId = pr?.writeup || pr.report?.reportDataId;

            let reportData = await this.reportDataModel.findById(new Types.ObjectId(reportDataId));

            let report = await this.reportModel.findOne({
                reportDataId: new Types.ObjectId(reportDataId)
            }).populate({ path: 'childCategory', populate: { path: 'parentCategoryId' } });

            //console.log(report.childCategory[0].parentCategoryId);

            let categories = await this.childCategoryModel.find({
                parentCategoryId: report.childCategory[0].parentCategoryId[0]._id
            }).select('_id');

            let relatedReport: any = await this.reportModel.find({
                childCategory: {
                    $in: categories
                },
                status: {
                    $ne: 'Inactive'
                },
                _id: {
                    $nin: [report._id]
                }
            }).sort({
                _id: -1
            }).limit(10);

            //this is related report image generation
            // if (relatedReport && relatedReport.length > 0) {
            //     let imageURL = '';
            //     relatedReport = (await Promise.all(relatedReport.map(async (x) => {
            //         imageURL = await new Promise((resolve, reject) => {
            //             axios.get(`https://cdn.vantagemarketresearch.com/report/thumbnail/${this.getURL(x.keyword)}.webp`).then(r => {
            //                 resolve(`https://cdn.vantagemarketresearch.com/report/thumbnail/${this.getURL(x.keyword)}.webp`)
            //             }).catch(err => {
            //                 console.log(`https://cdn.vantagemarketresearch.com/report/thumbnail/${this.getURL(x.keyword)}.webp`)
            //                 console.log(err)

            //                 resolve('hello');
            //             });
            //         });

            //         return {
            //             ...JSON.parse(JSON.stringify(x)),
            //             imageURL
            //         }
            //     })));
            // }

            let recenetPressrelease = await this.pressReleaseModel.find({
                _id: {
                    $nin: [pr._id]
                }
            }).sort({
                _id: -1
            }).limit(10);

            let prWriteup = await this.prWriteupModel.find({
                pr: new Types.ObjectId(pr._id)
            });

            let segments = [];
            let segmentList = '<ul>';
            if (reportData) {
                reportData.segments.map(item => {
                    segments.push({
                        title: item.segment,
                        subSegment: item.subSegments.map(x => { return x.text; }).join(",")
                    });

                    segmentList += '<li>' + item.segment + '<ul>' +
                        item.subSegments.map(x => { return '<li>' + x.text + '</li>'; }).join('') + '</ul>' + '</li>';

                });

                segmentList += '</ul>';


                pr['segmentation'] = segments;
                pr['segments'] = reportData.segments;
                pr['keyword'] = reportData.reportTitle;
                pr['players'] = reportData.table.filter(x => {
                    return x.fieldName == 'Players'
                })[0];

                pr['market_segmentation'] = segmentList;

                let prTable = readFileSync(join(__dirname, '../..', 'views/partials/pr-table.hbs')).toString();

                let table = hbs.compile(prTable);

                if (prWriteup && prWriteup.length > 0) {

                    let reportTable = this.reportService.getTable(reportData.table);

                    prWriteup[0].description = prWriteup[0].description.replace(/{{table}}/gmi,
                        table({
                            ...reportTable,
                            segments: reportData.segments, player: pr['players'].fieldValue.split(',')
                                .filter(x => x.trim() !== '').map(x => x.trim())
                        }));


                    let tableObj = helper.convertArrayToObject(reportData.table);
                    pr = { ...pr.toJSON(), ...tableObj, pr };

                    if (prWriteup && prWriteup.length > 0) {
                        prWriteup[0].description = prWriteup[0].description.replace(/<\/?span[^>]*>/gmi, '');

                        prWriteup[0].description = prWriteup[0].description.replace(/{{market_segmentation}}/gmi, segmentList);

                        let prDescription = hbs.compile(prWriteup[0].description);
                        pr.description = prDescription({
                            ...pr, keyword: reportData.reportTitle, players: reportData.table.filter(x => {
                                return x.fieldName == 'Players'
                            })[0].fieldValue
                        });
                    }
                }

                pr['relatedReports'] = relatedReport;

                pr['recenetPressrelease'] = recenetPressrelease;

                let reportDataTable = this.reportService.getTable(reportData.table)

                pr['reportDataTable'] = reportDataTable;

                pr.report = report.toJSON();
                let reportTitle = hbs.compile(pr.report.title);
                pr.report.title = reportTitle({...reportDataTable});
            }
        } else {

            pr.report = await this.reportModel.findById(pr.report._id);
            pr['segmentation'] = JSON.parse(JSON.stringify(pr.report.templates)).filter(x => {
                return x.textType == 'segmentationWithGraph';
            });

            pr['reginalStates'] = JSON.parse(JSON.stringify(pr.report.templates)).filter((tmp) => {
                return tmp.textType == 'reginalStates' && tmp.mainContent
            })[0].mainContent;

            pr['reportDataTable'] = this.reportService.getOldTable(pr.report.excelData);
        }
        return pr;
    }

    

    getURL(str, upperCase = false) {
        if (str) {
            const ignoreWords = ['to', 'for', 'and', 'in'];
            str = str.split(' ').map(x => ignoreWords.indexOf(x.toLowerCase()) > -1 ? x.toLowerCase() : x).join(' ');
            let res = str ? str.trim().replace(/[\s\/]+/gmi, '-').replace(/&/gmi, 'and').replace(/[^a-zA-Z0-9\-]/gmi, '') : '';
            res = res.replace(/&/gmi, 'and');
            return upperCase ? res.toUpperCase() : res;
        }
    }

    async getAllPressrelease() {
        return await this.pressReleaseModel.find({
            prtype: {
                $ne: 'PR2'
            },
            status: {
                $ne: 'Inactive'
            }
        },
            {
                "createdAt": "$createdAt",
                "slug": "$slug",
                "updatedAt": '$updatedAt'
            }).sort({
                _id: -1
            }).exec().then(res => {
                return res;
            });
    }

    async getAllPressReleaseWithDescription() {
        return await this.pressReleaseModel.find({
            "slug": {
                "$ne": null
            },
            prtype: {
                $ne: 'PR2'
            },
            status: {
                $ne: 'Inactive'
            }
        }, {
            'title': '$title',
            "createdAt": "$createdAt",
            "slug": "$slug",
            "updatedAt": '$updatedAt',
            "description": "$description"
        }).sort({
            _id: -1
        }).exec().then(res => {
            return res;
        });
    }

    async search(searchText, limit?, page?) {
        return await this.pressReleaseModel.find({
            status: {
                $ne: 'Inactive'
            },
            prtype: {
                $ne: 'PR2'
            },
            title: {
                $regex: new RegExp(searchText, 'gmi')
            }
        }).limit(limit).skip(page * limit).exec().then(res => {
            return res;
        });
    }

    async getAllPressreleases(page?, limit?) {
        let pr = await this.pressReleaseModel.find({
            status: {
                $ne: 'Inactive'
            },
            prtype: {
                $ne: 'PR2'
            }
        }).sort({
            _id: -1
        }).skip((limit ?? 20) * ((page ?? 1) - 1)).limit(limit ?? 20);

        let count = await this.pressReleaseModel.count({
            status: {
                $ne: 'Inactive'
            },
            prtype: {
                $ne: 'PR2'
            }
        });

        return { pr, count }
    }
}