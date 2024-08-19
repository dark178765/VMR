import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { HttpClient } from "src/httpclient/httpclient";
import { Report, ReportDocument } from "src/schema/report.schema";
import { ReportV3, ReportV3Document } from "src/schema/reportv3.schema";
import { json } from "stream/consumers";
import { parse } from "node-html-parser";
import * as hbs from 'hbs';
import { readFile, readFileSync, readSync } from "fs";
import { join } from "path";
import { create } from '../util/createImage';
import { Image, ImageDocument } from "src/schema/image.schema";
import { ChildCategory, ChildCategoryDocument } from 'src/schema/childcategory.schema';
import { Methodology, MethodologyDocument } from 'src/schema/methodology.schema';
import { Pressrelease, PressreleaseDocument } from "src/schema/pressrelease.schema";
import { VideoService } from "src/video/video.service";
import moment from "moment";
import axios from "axios";


@Injectable()
export class ReportService {
    constructor(
        @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
        @InjectModel(ReportV3.name) private reportV3Model: Model<ReportV3Document>,
        @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
        @InjectModel(ChildCategory.name) private childCategoryModel: Model<ChildCategoryDocument>,
        @InjectModel(Methodology.name) private methodologyModel: Model<MethodologyDocument>,
        private readonly httpClient: HttpClient,
        @InjectModel(Pressrelease.name) private pressReleaseModel: Model<PressreleaseDocument>,
        private readonly videoService: VideoService
    ) {

    }

    async getGlobeNewsWireNews(keyword) {
        let res = await axios.get(`https://www.globenewswire.com/search/organization/Vantage%252520Market%252520Research/keyword/${keyword.replace(/\s/gmi, '%252520')}?pageSize=50`);

        let html = parse(res.data);
        let links = html.getElementsByTagName('a');

        let articleLinks = links.filter(x => x.hasAttribute('data-autid') && x.innerText.indexOf(keyword) > -1);
        let publishedDate = '';

        if (articleLinks.length > 0) {
            let publishedDateEle = articleLinks[0].parentNode.getElementsByTagName('span').filter(x => x.hasAttribute('data-autid') && x.attributes['data-autid'] == 'article-published-date');
            if (publishedDateEle.length > 0) {
                publishedDate = publishedDateEle[0].innerText;
            }
        }

        return { text: articleLinks[0].innerText, url: `https://www.globenewswire.com/${articleLinks[0].attributes['href']}`, publishedDate };
    }

    async getReportByKeyword(keyword) {
        let report = await this.reportModel.findOne({
            $or: [
                { keyword: new RegExp(`^${keyword.trim()}$`, 'gmi') },
                { keyword: new RegExp(`^${keyword.trim().replace(/ and /gmi, ' & ')}$`, 'gmi') },
                { slug: new RegExp(`^${keyword.trim().split(' ').join('-')}-Market-[0-9]+$`, 'gmi') }
                // { slug: new RegExp(keyword.trim().replace(/\s/gmi, '-'), 'i') }
            ],
            status: 'Active'
        }).sort({
            _id: -1
        }).populate('reportDataId');

        return report;
    }

    async getRecentReports(limit) {
        //return this.httpClient.get(`vmr/reports`);

        let reports = await this.reportModel.find({
            status: 'Active'
        }).populate({
            path: 'childCategory', populate: {
                path: 'parentCategoryId'
            }
        }).sort({
            createdAt: -1
        }).limit(limit);

        return reports;
    }

    async getReport(url, isMethodology = false) {
        let report = await this.reportModel.findOne({
            slug: url
        }).populate({
            path: 'childCategory',
            populate: {
                path: 'parentCategoryId'
            }
        }).populate({ path: 'parentCategoryId' });


        if (!report) {
            report = await this.reportModel.findOne({
                slug: new RegExp(`^${url}`, 'gmi')
            });

            if (report) {
                report['redirect'] = true;
                return report;
            }
        }

        if (!report)
            return undefined;



        if (report.status == 'Inactive') {
            report = await this.reportModel.findOne({
                keyword: new RegExp(`^${report.keyword}$`, 'i'),
                status: 'Active'
            });
            if (!report)
                return undefined;
            report['redirect'] = true;
            return report;
        }

        let category = report.childCategory[0];

        if (report.reportDataId) {
            let pressRelease = await this.pressReleaseModel.findOne({
                writeup: report.reportDataId
            }).sort({
                _id: -1
            });

            report['res1'] = await this.reportV3Model.findById(report.reportDataId).exec().then(res1 => {
                return res1;
            });

            report['pr'] = pressRelease;
        }

        if (isMethodology) {
            let methodology = await this.methodologyModel.findOne({
                parentCategory: category.parentCategoryId && category.parentCategoryId.length > 0 ? category.parentCategoryId[0]._id
                    : report.parentCategoryId._id
            });

            report['category'] = category;

            methodology.primaryResearch = methodology.primaryResearch.replace(/{{keyword}}/gmi, report.keyword);
            methodology.secondaryResearch = methodology.secondaryResearch.replace(/{{keyword}}/gmi, report.keyword);
            methodology.sizeEstimation = methodology.sizeEstimation.replace(/{{keyword}}/gmi, report.keyword);

            report['methodology'] = methodology;
            if (report['res1'] && report['res1'].segments) {
                //methodology...
                report['res1'].segments.forEach((s, sIndex) => {
                    methodology.primaryResearch = methodology.primaryResearch.replace(new RegExp(`{{segmentaion${sIndex + 1}}}`, 'gmi'), s.segment);
                    methodology.secondaryResearch = methodology.secondaryResearch.replace(new RegExp(`{{segmentaion${sIndex + 1}}}`, 'gmi'), s.segment);
                    methodology.sizeEstimation = methodology.sizeEstimation.replace(new RegExp(`{{segmentaion${sIndex + 1}}}`, 'gmi'), s.segment);

                });
            }
        }



        let video = await this.videoService.getVideoByReport(report._id);

        if (video) {
            report['video'] = video;
        }

        return report;
    }

    async getMethodology(data) {
        // return await this.httpClient.post(`vmr/v1/parsed-methodology`, data)
        //     .then((res: any) => {
        //         return res.data.doc;
        //     });

        let methodology = await this.methodologyModel.findOne({
            parentCategory: data.parentCategory._id
        });

        methodology = JSON.parse(JSON.stringify(methodology));

        let names = Object.getOwnPropertyNames(methodology).filter(x => x.indexOf('__') == -1);


        for (var i = 0; i < names.length; i++) {
            let cmp = hbs.compile(methodology[names[i]]);
            methodology[names[i]] = cmp(data.reportExcel);
        }

        return methodology;
    }

    getMeta(meta, option) {
        let result = '';

        if (option.isInclusion)
            result = 'Inclusion';

        if (option.isTOC)
            result = 'Table Of Content';

        if (option.isSegmentation)
            result = 'Market Segmentation';

        return option.isDescription ? meta : {
            ...meta,
            metatitle: `${result} - ${meta.metatitle}`,
            metadescription: `${result} - ${meta.metadescription}`,
            metakeywords: `${result}, ${meta.metakeywords}`
        };
    }

    getToc(templates) {
        if (templates) {
            templates = JSON.parse(JSON.stringify(templates));
            const toc: any = templates.filter((ele) => {
                return ele.textType == 'toc'
            });
            return toc[0].mainContent
        }
    }

    getLof(templates) {
        if (templates) {
            const lof: any = templates.filter((ele) => {
                return ele.textType == 'lof'
            });
            return lof && lof.mainContent
        }
    }

    getLot(templates) {
        if (templates) {
            const lot: any = templates.filter((ele) => {
                return ele.textType == 'lot'
            });
            return lot && lot.mainContent
        }
    }


    getMarketSegmentDescription(templates) {
        templates = JSON.parse(JSON.stringify(templates));
        const marketSegmentation = templates.filter((ele) => {
            return ele && ele.textType == 'marketSegmentationDescription'
        });

        return marketSegmentation[0];
    }

    getMarketSegregationWitSubSegments(templates) {
        templates = JSON.parse(JSON.stringify(templates));
        const marketSegmentation = templates.filter((ele) => {
            return ele && ele.textType == 'segmentationWithGraph' && ele.subSegment && ele.subSegment !== '';
        });
        // 
        return marketSegmentation;
    }

    getMarketMethodology(templates) {
        templates = JSON.parse(JSON.stringify(templates));
        const methodology = templates.filter((ele) => {
            return ele && ele.textType == 'methodology'
        });

        return methodology;
    }


    getDate(date) {
        const date1 = new Date(date);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        return monthNames[date1.getMonth()] + " - " + date1.getFullYear()
    }

    getNoOfPages(templates) {
        templates = JSON.parse(JSON.stringify(templates));
        const temp = templates.filter((tm) => {
            if (tm) {
                return tm.textType == 'noOfPages'
            }
        })

        return temp && temp.title
    }

    getGraphValues(templates) {

        let segmentx = [];
        templates = JSON.parse(JSON.stringify(templates));
        let segments = templates.filter((item) => {
            return item && item.textType == 'segmentationWithGraph' && item.subSegment !== undefined && item.subSegment.trim() !== '';
        });

        segments.forEach((ele) => {
            let segmentp = {};

            segmentp['pieChartLabels'] = [];
            segmentp['pieChartData'] = []
            let ss = ele.subSegment.split(",")

            ss = ss.filter(a => {
                return a !== '';
            });

            ss.forEach((ele1) => {

                segmentp['pieChartLabels'].push(ele1);

                //let value = Math.round(100 / parseInt(subsegments.length)).toFixed(2)
                let value = Math.random() * ss.length;
                segmentp['pieChartData'].push(value);

            });

            segmentx.push(segmentp);

        });
        return segmentx;
    }

    getGrphValuesNew(segments) {
        let segmentx = [];
        segments.forEach((ele) => {
            let segmentp = {};

            segmentp['pieChartLabels'] = [];
            segmentp['pieChartData'] = []
            let ss = JSON.parse(JSON.stringify(ele.subSegments)).map(x => { return x.text; });

            ss = ss.filter(a => {
                return a !== '';
            });

            ss.forEach((ele1) => {

                segmentp['pieChartLabels'].push(ele1);

                //let value = Math.round(100 / parseInt(subsegments.length)).toFixed(2)
                let value = Math.random() * ss.length;
                segmentp['pieChartData'].push(value);

            });

            segmentx.push(segmentp);

        });
        return segmentx;
    }

    addTable(data) {
        let text = readFileSync(join(__dirname, '../..', 'views/partials/table.hbs'));
        let tmp = hbs.compile(text.toString());
        return tmp(data);
    }

    addSegmentTree(treeData) {
        let text = readFileSync(join(__dirname, '../..', 'views/partials/segmenttree.hbs'));
        hbs.registerHelper('json', function (content) {
            return JSON.stringify(content);
        });
        let tmp = hbs.compile(text.toString());
        return tmp({ data: treeData });
    }

    addMap(mapData) {
        let text = readFileSync(join(__dirname, '../..', 'views/partials/continentmap.hbs'));
        let cta2 = readFileSync(join(__dirname, '../..', 'views/partials/cta2.hbs'));

        hbs.registerHelper('json', function (content) {
            return JSON.stringify(content);
        });

        let tmp = hbs.compile(cta2.toString() + text.toString());

        return tmp({ ...mapData });
    }

    async addImage(table, segments, keyword, image) {

        let imageName = keyword.replace(/\s/gmi, '-') + '.png';
        let fi = await this.imageModel.find({
            imageName: imageName
        });

        if (!fi || fi.length == 0) {

            let tableObj: any = this.getTable(table);

            let revenueString_2021 = tableObj.Revenue_2021.trim().replace(/USD/gmi, '').replace(/\$/gmi, '').replace('  ', ' ').split(' ');
            let revenueString_2028 = tableObj.Revenue_2028.trim().replace(/USD/gmi, '').replace(/\$/gmi, '').replace('  ', ' ').split(' ');

            let players = (tableObj.TopPlayer || tableObj.Players).replace(/, Ltd./gmi, ' Ltd.').replace(/,ltd./gmi, ' Ltd.').replace(/, Inc./gmi, ' Inc.').replace(/,Inc./gmi, ' Inc.').split(',').map((p, i) => {
                if (i <= 4)
                    return p.trim();
            });

            let mainSegments = segments.map((s, i) => {
                if (i <= 4)
                    return s.segment.trim()
            });

            let revenue_2021 = tableObj.Revenue_2021.trim().replace(/USD/gmi, '').replace(/\$/gmi, '').split(' ');
            let revenue_2028 = tableObj.Revenue_2028.trim().replace(/USD/gmi, '').replace(/\$/gmi, '').split(' ');
            create.createImage(image, [{
                fontSize: 20,
                color: '#ffffff',
                align: 'center',
                maxWidth: 250,
                text: `Revenue in 2021|(USD ${revenueString_2021[revenueString_2021.length - 1]})`, x: 155, y: 225, spacing: 25
            }, {
                fontSize: 20,
                color: '#ffffff',
                align: 'center',
                maxWidth: 250,
                text: 'CAGR %|(2022 - 2028)', x: 400, y: 225, spacing: 25
            }
                , {
                fontSize: 20,
                color: '#ffffff',
                align: 'center',
                maxWidth: 300,
                text: `Revenue in 2028|(USD ${revenueString_2028[revenueString_2028.length - 1]})`, x: 655, y: 225, spacing: 25
            }
                , {
                fontSize: 20,
                color: '#ffffff',
                align: 'center',
                maxWidth: 250,
                text: 'Largest Region|(2021)', x: 900, y: 225, spacing: 25
            }
                , {
                fontSize: 20,
                color: '#ffffff',
                align: 'center',
                maxWidth: 250,
                text: 'Market Share %|(Largest Region 2021)', x: 395, y: 450, spacing: 25
            }
                , {
                fontSize: 20,
                color: '#ffffff',
                align: 'center',
                maxWidth: 250,
                text: 'Fastest Growing Region|(2022 - 2028)', x: 650, y: 450, spacing: 25
            }
                , {
                fontSize: 20,
                color: '#000000',
                align: 'left',
                maxWidth: 450,
                text: players.splice(0, 4).join('|'), x: 1250, y: 150, spacing: 25, drawRect: true
            }
                , {
                fontSize: 20,
                color: '#000000',
                align: 'left',
                maxWidth: 450,
                text: mainSegments.splice(0, 4).join('|'), x: 1250, y: 450, spacing: 25, drawRect: true
            }
                , {
                fontSize: 20,
                color: '#000000',
                align: 'center',
                maxWidth: 0,
                text: revenue_2021[revenue_2021.length - 2], x: 145, y: 206, spacing: 0
            }
                , {
                fontSize: 20,
                color: '#000000',
                align: 'center',
                maxWidth: 0,
                text: tableObj.CAGR_Revenue.replace(/\%/gmi, ''), x: 398, y: 206, spacing: 0
            }
                , {
                fontSize: 20,
                color: '#000000',
                align: 'center',
                maxWidth: 0,
                text: revenue_2028[revenue_2028.length - 2], x: 650, y: 206, spacing: 0
            }, {
                fontSize: 15,
                color: '#000000',
                align: 'center',
                maxWidth: 0,
                text: tableObj.Largest_Region, x: 895, y: 206, spacing: 0
            }
                , {
                fontSize: 20,
                color: '#000000',
                align: 'center',
                maxWidth: 0,
                text: tableObj.MSA_Largest_Region.replace(/%/gmi, ''), x: 392, y: 426, spacing: 0
            }
                , {
                fontSize: 15,
                color: '#000000',
                align: 'center',
                maxWidth: 0,
                text: tableObj.Fastest_Region, x: 650, y: 425, spacing: 0
            }

            ], keyword, async (err, data) => {
                if (!err) {
                    let imageFound = await this.imageModel.findOneAndUpdate({
                        imageName: keyword.replace(/\s/gmi, '-') + ".png"
                    }, {
                        imageName: keyword.replace(/\s/gmi, '-') + ".png",
                        bucket: data,
                        CreatedAt: new Date()
                    }, {
                        upsert: true,
                        new: true
                    });
                } else {
                    console.log(err);
                }
            });
        }
    }

    addGraph(segments) {
        let text = readFileSync(join(__dirname, '../..', 'views/partials/segmentgraph.hbs'));
        hbs.registerHelper('json', function (content) {
            return JSON.stringify(content);
        });
        let tmp = hbs.compile(text.toString());
        return tmp(segments);
    }

    getRegions(inlineRegions = false) {
        let text = !inlineRegions ? readFileSync(join(__dirname, '../..', 'views/partials/regions.hbs')) :
            readFileSync(join(__dirname, '../..', 'views/partials/inlineregions.hbs'));
        return text.toString();
    }

    getSegmentList(segments) {
        let text = readFileSync(join(__dirname, '../..', 'views/partials/segmentlist.hbs'));
        let tmp = hbs.compile(text.toString());
        return tmp({ segments });
    }

    getSegmentTree(segments) {
        let tree = [{
            name: 'Segments',
            parent: null,
            children: []
        }];
        segments.map(s => {
            tree[0].children.push({
                name: s.segment,
                parent: 'Segments',
                children: s.subSegments.map(ss => {
                    let shareString = (ss.share21 && ss.share21 !== '' ? '2021 Share - ' + ss.share21.replace(/\%/gmi, '') + '%' : '') +
                        (ss.share28 && ss.share28 !== '' ? ' 2028 Share - ' + ss.share28.replace(/\%/, '') + '%' : '');

                    shareString = shareString.length > 0 ? ` (${shareString})` : shareString;

                    return {
                        name: ss.text + shareString,
                        parent: s.segment
                    };
                })
            })
        });
        return tree;
    }

    getTableOfContent(keyword, table, segments) {
        let text = readFileSync(join(__dirname, '../..', 'views/partials/newtableofcontent.hbs'));
        let tmp = hbs.compile(text.toString());
        let players = table.filter(x => {
            return x.fieldName == 'Players';
        });

        //console.log('segments', segments);
        return tmp({
            Keyword: keyword, companies: players[0].fieldValue.
                replace(/, Ltd./gmi, ' Ltd.').replace(/,ltd./gmi, ' Ltd.').replace(/, Inc./gmi, ' Inc.').replace(/,Inc./gmi, ' Inc.').split(','),
            segments: segments.filter(x => {
                return x.segment.toLowerCase() !== 'region'
            }).map(s => {
                return {
                    SegmentName: s.segment,
                    subSegments: s.subSegments.map(ss => {
                        return {
                            SubSegment: ss.text
                        }
                    })
                }
            })
        });
    }

    getReportDescription(reportData, keyword) {
        let table = this.getTable(reportData.table);
        let template = hbs.compile(reportData.unprocessedHtml[reportData.unprocessedHtml.length - 1]);
        let html = template({ ...table, keyword });
        return html;
    }

    async getReportData(reportDataId) {
        return await this.reportV3Model.findById(reportDataId);
    }

    async getAllReportsWithDescription() {
        return await this.reportModel.find({
            status: {
                $ne: 'Inactive'
            }
        }).sort({
            createdAt: -1
        }).populate('reportDataId', '_id unprocessedHtml table segments reportTitle').limit(200).exec().then(res => {
            let response = [];
            res.forEach((item: any, index) => {
                if (!item.reportDataId) {
                    let _templates = JSON.parse(JSON.stringify(item.templates));
                    let description = _templates.filter(x => {
                        return x.textType == 'description'
                    });

                    response.push({
                        title: item.title,
                        slug: item.slug,
                        updatedAt: item.updatedAt,
                        description: description[0].mainContent
                    });
                } else {
                    let reportData = JSON.parse(JSON.stringify(item.reportDataId));
                    let unprocessedHtml = typeof item.reportDataId.unprocessedHtml === 'string' ? item.reportDataId.unprocessedHtml :
                        item.reportDataId.unprocessedHtml[item.reportDataId.unprocessedHtml.length - 1];

                    let p = this.getProcessedDescription(unprocessedHtml,
                        item.reportDataId.table,
                        item.reportDataId.segments, reportData.reportTitle, false, false, false, false, false, null, false, false);

                    response.push({
                        title: item.title,
                        slug: item.slug,
                        updatedAt: item.updatedAt,
                        description: p.html
                    });
                }
            })
            return response;
        });
    }

    async getAllReportsPaging(page: number, limit: number = 20) {
        const reports = await this.reportModel.find({
            status: {
                $ne: 'Inactive'
            }
        }).populate({ path: 'childCategory', populate: { path: 'parentCategoryId' } })
            .populate('reportDataId', 'reportTitle unprocessedHtml table segments').sort({ _id: -1 }).limit(limit).skip(((page || 1) - 1) * limit);

        const count = await this.reportModel.countDocuments({
            status: {
                $ne: 'Inactive'
            }
        });

        let customReports: any;
        customReports = reports.map((r: any) => {
            if (r.reportDataId) {
                return {
                    title: r.title,
                    slug: r.slug,
                    keyword: r.keyword.trim(),
                    publishedDate: r.updatedAt || r.createdAt,
                    description: this.getProcessedDescription(r.reportDataId.unprocessedHtml,
                        r.reportDataId.table,
                        r.reportDataId.segments, r.keyword, false, false, false).html,
                    noOfPages: r.noOfPages,
                    deliveryFormat: r.deliveryFormat || 'PDF/EXCEL/PPT',
                    childCategory: r.childCategory && r.childCategory.length > 0 ? { title: r.childCategory[0].title, slug: r.childCategory[0].slug } : undefined,
                    parentCategory: r.childCategory[0].parentCategoryId[0],
                    pricingOptions: r.pricingOptions
                };
            } else {
                return {
                    title: r.title,
                    keyword: r.keyword.trim(),
                    slug: r.slug,
                    publishedDate: r.updatedAt || r.createdAt,
                    description: JSON.parse(JSON.stringify(r.templates)).filter(it => {
                        return it.textType == "description";
                    })[0].mainContent,
                    noOfPages: r.template.noOfPages || this.getNoOfPages(r.templates) || r.excelData.noofpages,
                    deliveryFormat: r.deliveryFormat || 'PDF/EXCEL/PPT',
                    childCategory: r.childCategory && r.childCategory.length > 0 ? { title: r.childCategory[0].title, slug: r.childCategory[0].slug } : undefined,
                    parentCategory: r.childCategory[0].parentCategoryId[0],
                    pricingOptions: r.pricingOptions
                }

            }
        })
        return { customReports, count, page: count / limit };
    }

    isMobileUser(userAgent) {
        const toMatch = [
            /Android/i,
            /webOS/i,
            /iPhone/i,
            /iPad/i,
            /iPod/i,
            /BlackBerry/i,
            /Windows Phone/i
        ];
        return toMatch.some((toMatchItem) => {
            return userAgent.match(toMatchItem);
        });
    }

    async getAllReportLinks() {
        return await this.reportModel.find({
            status: 'Active'
        }, {
            'slug': '$slug',
            'updatedAt': '$updatedAt',
            'keyword': '$keyword'
        }).sort({
            _id: -1
        }).exec().then(res => {
            return res;
        });
    }

    async getAllReports(page: number) {
        let reports = await this.reportModel.find({
            $ne: {
                status: 'Inactive'
            }
        }, {
            'title': '$title',
            'templates': '$templates',
            'slug': '$slug',
            'updatedAt': '$updatedAt',
            'excelData': '$excelData'
        }).sort({
            _id: -1
        }).limit((page == 0 ? 1 : page) * 20).exec().then(res => {
            return res;
        });

        reports.forEach((item: any, ind) => {
            item.templates = JSON.parse(JSON.stringify(item.templates));
            let description = item.templates.filter(it => {
                return it.textType == "description";
            });
            item.description = description;
            item.noOfPages = item.template.noOfPages || this.getNoOfPages(item.templates) || item.excelData.noofpages;
            item.deliveryFormat = item.deliveryFormat || 'PDF';

        });

        return reports;
    }

    async getReportById(reportID) {
        let report = await this.reportModel.findById(new Types.ObjectId(reportID));
        return report;
    }

    getTable(table) {
        let
            output = {};
        table.filter(x => x.fieldName.indexOf('Revenue_') == -1 && x.fieldName.indexOf('Volume_') == -1).forEach(item => {
            output[item.fieldName] = item.fieldValue;
        });

        let revenue = table.filter(x => x.fieldName.indexOf('Revenue_') == 0);

        let revenueYears = [];
        revenue.map(x => {
            revenueYears.push(parseInt(x.fieldName.replace('Revenue_', '')));
        });

        //revenueYears.sort((a, b) => a - b);

        output['Revenue_Forecast'] = revenue.filter(x => x.fieldName == `Revenue_${revenueYears[revenueYears.length - 1]}`)[0].fieldValue;
        output['Revenue_Current'] = revenue.filter(x => x.fieldName == `Revenue_${revenueYears[revenueYears.length - 2]}`)[0].fieldValue;

        output['Current_Year'] = revenueYears[revenueYears.length - 2];
        output['Forecast_Year'] = revenueYears[revenueYears.length - 1];

        output['History_CurrentYear'] = revenueYears[revenueYears.length - 2] - 5;
        output['History_ForecastYear'] = revenueYears[revenueYears.length - 2] - 1;
        output['Base_Year'] = revenueYears[revenueYears.length - 2];

        output['CAGR_Revenue'] = table.filter(x => x.fieldName === 'CAGR_Revenue')[0].fieldValue;

        ///############################################### Volume ###############################################
        let volume = table.filter(x => x.fieldName.indexOf('Volume_') == 0 && x.fieldValue && x.fieldValue.trim() !== '');

        if (volume.length > 0) {
            let volumeYears = [];

            volume.map(x => {
                volumeYears.push(parseInt(x.fieldName.replace('Volume_', '')));
            });

            volumeYears.sort((a, b) => a - b);

            output['Volume_Forecast'] = volume.filter(x => x.fieldName == `Volume_${volumeYears[volumeYears.length - 1]}`)[0].fieldValue;
            output['Volume_Current'] = volume.filter(x => x.fieldName == `Volume_${volumeYears[volumeYears.length - 2]}`)[0].fieldValue;

            output['CAGR_Volume'] = table.filter(x => x.fieldName === 'CAGR_Volume')[0].fieldValue;

            if (!output['Current_Year']) {
                output['Current_Year'] = volumeYears[volumeYears.length - 2];
                output['Forecast_Year'] = volumeYears[volumeYears.length - 1];

                output['History_CurrentYear'] = volumeYears[volumeYears.length - 2] - 5;
                output['History_ForecastYear'] = volumeYears[volumeYears.length - 2] - 1;
                output['Base_Year'] = volumeYears[volumeYears.length - 2];
            }
        }

        return output;
    }

    getOldTable(excelData) {
        let properties = Object.getOwnPropertyNames(excelData);
        let output = {};

        let revenueProperties = properties.filter(x => x.indexOf('revenue_') > -1
            && x.indexOf('CAGR') == -1 && x.indexOf('decimal') == -1);

        let revenueYears = [];
        revenueYears = revenueProperties.map(x => x.replace('revenue_', ''));

        output['Revenue_Forecast'] = excelData['revenue_' + revenueYears[revenueYears.length - 1]];
        output['Revenue_Current'] = excelData['revenue_' + revenueYears[revenueYears.length - 2]];

        output['Current_Year'] = revenueYears[revenueYears.length - 2];
        output['Forecast_Year'] = revenueYears[revenueYears.length - 1];

        output['History_CurrentYear'] = revenueYears[revenueYears.length - 2] - 5;
        output['History_ForecastYear'] = revenueYears[revenueYears.length - 2] - 1;
        output['Base_Year'] = revenueYears[revenueYears.length - 2];

        output['CAGR_Revenue'] = excelData.revenue_CAGR;

        return output;

    }

    addSummaryTable(data) {
        let text = readFileSync(join(__dirname, '../..', 'views/partials/summaryTable.hbs'));

        let tmp = hbs.compile(text.toString());
        return tmp(data);
    }

    addDashboard(reportData) {
        let text = readFileSync(join(__dirname, '../..', 'views/partials/reportimagenew.hbs'));
        return text.toString().replace(/{{slug}}/gmi, reportData.slug);
    }

    addBarChart(tableData) {
        let text = readFileSync(join(__dirname, '../..', 'views/partials/barchart.hbs'));
        let tmp = hbs.compile(text.toString());
        let html = tmp(tableData).toString();
        return html;
    }

    addChatbot(htmlContent, keyword) {
        let text = readFileSync(join(__dirname, '../..', 'views/partials/chatbot.hbs'));
        let loading = readFileSync(join(__dirname, '../..', 'views/partials/loading.hbs'));

        let texthtml = text.toString().replace("{{>loading}}", loading.toString()).replace(/{{keyword}}/gmi, keyword);

        //find chat-section add html using node-html-parser

        // Parse HTML content
        const root = parse(htmlContent);

        let chatBotSection = root.querySelector('.chat-bot-section');

        if (!chatBotSection) {
            // Find chat section by class name
            const chartSection = root.querySelector(".chart-section");

            // Create a new message element
            //const newMessage = parse(texthtml);

            // Append new message to chat section
            if (chartSection) {
                chartSection.insertAdjacentHTML('afterend', texthtml);
            }

        }

        // Get updated HTML content
        const updatedHtmlContent = root.toString();

        return updatedHtmlContent;

        // let tmp = hbs.compile(texthtml);
        // return tmp({});
    }

    removeChatBot(htmlContent) {
        let root = parse(htmlContent);
        let chatbotSection = root.querySelector('.chat-bot-section');
        if (chatbotSection) {
            chatbotSection.remove();
        }

        return root.toString();

    }

    getSegments(excelData) {
        let maxSegment = 4;
        let segments = [];
        for (var i = 1; i <= maxSegment; i++) {
            if (excelData[`segment${i}`] && excelData[`segment${i}`] !== '') {
                segments.push({
                    subSegments: excelData[`segment${i}`].split(',').filter(x => x.trim() !== '').map(x => { return { text: x.trim() }; }),
                    segment: excelData[`segmentation${i}`] !== undefined ? excelData[`segmentation${i}`].trim() : ''
                });
            }
        }
        return segments;
    }

    removeEmptyLinks(h) {
        let allLinks = h.getElementsByTagName('a');

        allLinks.map(l => {
            if (l.getAttribute('href') == '' || l.getAttribute('href') == undefined) {
                let innerHtml = l.innerHTML;
                l.replaceWith(innerHtml);
            }
        })
    }

    addDialogSignal(html) {
        html = html.replace(/{{dialog}}/gmi, '<div class="dialog-show"></div>');
        return html
    }

    getProcessedDescription(unprocessedHtml, reportDt, reportSegments, keyword, addImage: boolean = false, addSegmentTree: boolean = false, addTable: boolean = false, video = null, isMobileUser = false, slug = '', showChatbot = false, showBarChart = true) {
        //unprocessedHtml = unprocessedHtml.replace(/{{market_segmentation}}/gmi, '{{{market_segmentation}}}');

        let uph = '';

        //as new upload panel keeps backup of each update
        unprocessedHtml = typeof unprocessedHtml === 'string' ? unprocessedHtml : unprocessedHtml[unprocessedHtml.length - 1];

        unprocessedHtml = unprocessedHtml.indexOf('{{market_segmentation}}') > -1 ? unprocessedHtml.replace(/{{table}}/gmi, '') :
            unprocessedHtml.replace(/{{table}}/gmi, '{{{table}}}');


        //replace all keyword with real keyword
        unprocessedHtml = unprocessedHtml.replace(/{{keyword}}/gmi, keyword);

        unprocessedHtml = unprocessedHtml.replace(/{{keyword}} {{marketSegmentation}}/gmi, '{{marketSegmentation}}');

        unprocessedHtml = unprocessedHtml.replace(/{{market_segmentation}}/gmi, '{{{table}}}');

        unprocessedHtml = unprocessedHtml.replace(/{{regions_list}}/gmi, '{{{regions_list}}}');

        unprocessedHtml = unprocessedHtml.replace(/{{segment_image}}/gmi, '{{{segment_image}}}');

        unprocessedHtml = unprocessedHtml.replace(/{{region_map_image}}/gmi, '{{{region_map_image}}}');

        unprocessedHtml = unprocessedHtml.replace(/Revenue_2021/gmi, 'Revenue_Current');
        unprocessedHtml = unprocessedHtml.replace(/Revenue_2028/gmi, 'Revenue_Forecast');


        unprocessedHtml = unprocessedHtml.replace(/Revenue_2022/gmi, 'Revenue_Current');
        unprocessedHtml = unprocessedHtml.replace(/Revenue_2030/gmi, 'Revenue_Forecast');

        unprocessedHtml = unprocessedHtml.replace(/Volume_2021/gmi, 'Volume_Current');
        unprocessedHtml = unprocessedHtml.replace(/Volume_2028/gmi, 'Volume_Forecast');

        let segment_ext = `The global ${keyword} market can be categorized into ${reportSegments.map(x => '<b>' + x.segment + '</b>').join(', ')}.`;

        reportSegments.map(x => {
            segment_ext += ` The ${keyword} market can be categorized into ${x.subSegments.map(y => y.text).join(', ')} based on <i>${x.segment}</i>.`
        });

        unprocessedHtml = unprocessedHtml.replace(/{{Segmentation_Ext}}/gmi, segment_ext)

        if (unprocessedHtml.indexOf('{{Forecast_Year}}') == -1) {
            unprocessedHtml = unprocessedHtml.replace('2021', '{{Current_Year}}');
            unprocessedHtml = unprocessedHtml.replace('2028', '{{Forecast_Year}}');
        }
        unprocessedHtml = unprocessedHtml.replace(/2021&#8211;2028/gmi, `{{math Current_Year '+' 1}}-{{Forecast_Year}}`)

        unprocessedHtml = unprocessedHtml.replace(/2022 to 2028/gmi, `{{math Current_Year '+' 1}} to {{Forecast_Year}}`)


        if (addImage) {
            unprocessedHtml = unprocessedHtml.replace(/{{image1}}/gmi, `<img src='/report-image/${keyword.replace(/\s/gmi, '-') + '.png'}' alt='${keyword.replace(/\s/gmi, '-')} Market Share' height='217' width='335' />`);
            this.addImage(reportDt, reportSegments, keyword, join(__dirname, '../..', 'public/image/input.jpg'));
        }

        let reportData: any = this.getTable(reportDt);

        reportData['segments'] = reportSegments.map(item => {
            return item.segment + `(${item.subSegments.map(ss => {
                return ss.text;
            }).join()})`;
        });

        reportSegments.forEach((s, sIndex) => {
            reportData[`segment_${sIndex + 1}`] = s.segment;
            s.subSegments.forEach((ss, ssIndex) => {
                reportData[`segment_${sIndex + 1}_${ssIndex + 1}`] = ss.text;
            })
        });

        let players = reportDt.filter(x => {
            return x.fieldName == "Players";
        })[0].fieldValue;

        let player_listHTML = '<ul>'
        players.replace(/, Ltd./gmi, ' Ltd.').replace(/,ltd./gmi, ' Ltd.').replace(/, Inc./gmi, ' Inc.').replace(/,Inc./gmi, ' Inc.').split(',').forEach(item => {
            player_listHTML += `<li>${item.trim()}</li>`
        });

        player_listHTML += '</ul>';

        let table = this.addTable({
            segments: reportSegments,
            Players: reportDt.filter(x => {
                return x.fieldName == "Players";
            })[0].fieldValue,
            players_list: player_listHTML,
            regions_list: this.getRegions(true),
            slug
        });

        if (addSegmentTree && !isMobileUser) {

            let segmentTreeObject = this.getSegmentTree(reportSegments);

            let segmentTree = this.addSegmentTree(segmentTreeObject);
            reportData['segment_image'] = segmentTree;
            reportData['region_map_image'] = this.addMap({ ...reportData, slug });
        }
        //changed

        let regionsString = reportSegments.filter(x => {
            if (x.segment == 'Region') {
                return x.subSegments.map(ss => { return ss.text; }).join(',');
            }
        })[0];

        regionsString = !regionsString || regionsString == '' ? 'North America, Europe, Asia Pacific, Latin America, Middle East & Africa' : regionsString;

        reportData['table'] = table;
        reportData['regions'] = regionsString;
        reportData['regions_list'] = this.getRegions();
        reportData['market_segmentation'] = this.getSegmentList(reportSegments);
        reportData['keyword'] = keyword;
        reportData['players_list'] = player_listHTML;

        let rv = reportData['Revenue_Forecast']
            .replace(/usd/gmi, '')
            .replace(/Billion/gmi, '')
            .replace(/Million/gmi, '')
            .replace(/Trillion/gmi, '').replace(/Bn/gmi, '')
            .replace(/mn/gmi, '').replace(/tr/gmi, '');

        let mb = reportData['Revenue_Forecast'].replace(new RegExp(rv, 'gmi'), '').replace(/usd/gmi, '');

        let barGraphFormula = unprocessedHtml.indexOf('{{bar_graph}}') > -1;
        let dashboardImageFormula = unprocessedHtml.indexOf('{{dashboard_image}}') > -1;

        if (showBarChart && !isMobileUser) {
            if (barGraphFormula) {
                unprocessedHtml = unprocessedHtml.replace(/{{bar_graph}}/gmi, this.addBarChart({ ...reportData, mb }).toString())
            }

            if (dashboardImageFormula && !isMobileUser) {
                unprocessedHtml = unprocessedHtml.replace('{{dashboard_image}}', this.addDashboard(reportData))
            }
        }

        unprocessedHtml = this.addDialogSignal(unprocessedHtml);

        let template = hbs.compile(unprocessedHtml);
        let html = template({ ...reportData });

        html = html.replace(/&nbsp;/gmi, ' ');

        let h = parse(html);

        let paragraphs = h.getElementsByTagName('p');

        this.removeEmptyLinks(h);

        let selectedPara: any;

        if (!isMobileUser) {
            reportData['slug'] = slug;
            selectedPara = paragraphs && paragraphs.length > 3
                ? paragraphs[4] : paragraphs && paragraphs.length > 0
                    ? paragraphs[paragraphs.length - 1] : null;


            if (showBarChart) {
                if (!barGraphFormula) {
                    selectedPara.insertAdjacentHTML('afterend', this.addBarChart({ ...reportData, mb }).toString());
                }
            }

        } else {
            selectedPara = paragraphs && paragraphs.length > 3
                ? paragraphs[4] : paragraphs && paragraphs.length > 0
                    ? paragraphs[paragraphs.length - 1] : null;

            selectedPara.insertAdjacentHTML('afterend', `<a href='/${keyword.replace(/[^0-9a-zA-Z\- ]/gmi, '-').replace(/\s/gmi, '-')}-Market.jpg'><img class='img-fluid' src='/${keyword.replace(/[^0-9a-zA-Z\- ]/gmi, '-').replace(/\s/gmi, '-')}-Market.jpg' alt='${keyword.replace(/(\s)+/gmi, '-')} Market Share' height='217' width='335' /></a><div><a class='btn btn-primary' style='display:flex; align-items: center; height: 48px;' href="/${slug}/request-sample">To Get Free Sample and Offer On The Research Report</a></div>`);
        }

        // if (paragraphs.length > 9) {
        //     paragraphs[9].insertAdjacentHTML('afterend', this.addCTA(slug));
        // }

        if (showBarChart) {
            if (!dashboardImageFormula && !isMobileUser) {
                if (paragraphs.length > 7) {
                    paragraphs[7].insertAdjacentHTML('afterend', this.addDashboard(reportData));
                }
            }
        }

        if (video) {
            selectedPara = paragraphs && paragraphs.length > 2
                ? paragraphs[3] : paragraphs && paragraphs.length > 0
                    ? paragraphs[paragraphs.length - 1] : null;

            selectedPara.insertAdjacentHTML('beforebegin', `<div style='text-align:center;' class='center-video'><iframe width="560" height="315" src="${video.url}" 
            title="${keyword}" 
            frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`);
        }

        html = h.toString();

        return { html, reportData };
    }

    addCTA(slug) {
        let text = readFileSync(join(__dirname, '../..', 'views/partials/cta.hbs'));
        let tmp = hbs.compile(text.toString());
        return tmp({ slug });
    }

    async getReportPricing(reportID) {
        let report = await this.reportModel.findOne({
            _id: new Types.ObjectId(reportID)
        });
        return { pricingOptions: report.pricingOptions, slug: report.slug };
    }

    async getRelatedReports(reportID, keywordWiseNotFound = false) {
        //keyword wise
        let report = await this.reportModel.findOne({
            _id: new Types.ObjectId(reportID)
        });

        //console.log(report);

        if (!keywordWiseNotFound) {
            console.log(report.keyword);
            let keywords = report.keyword.trim().split(' ').map(x => {
                return { keyword: new RegExp(x.trim().replace(/[^\w\s]/gi, ''), 'gmi') }
            })

            let relatedReports = await this.reportModel.find({ $or: [...keywords], status: 'Active', _id: { $ne: report._id } })
                .populate('reportDataId')
                .sort({ _id: -1 })
                .limit(10);
            return relatedReports;

        } else {
            //category wise
            return await this.reportModel.find({
                childCategory: report.childCategory[0],
                status: 'Active'
            }).populate('reportDataId').sort({ _id: -1 })
                .limit(10);
        }
    }

    async getCountry(ip: string) {
        return await new Promise((resolve, reject) => {
            var http = require('follow-redirects').http;
            var fs = require('fs');

            var options = {
                'method': 'GET',
                //'hostname': host === '' ? 'ipwho.is' : host,
                'hostname': 'ip-api.com',
                'path': `/json/${ip}`,
                'headers': {
                },
                'maxRedirects': 20
            };

            let response = '';

            var req = http.request(options, function (res) {
                var chunks = [];

                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });

                res.on("end", async function (chunk) {
                    var body = Buffer.concat(chunks);
                    response = body.toString();

                    console.log(response);

                    let jsonRes = response.trim() !== '' ? JSON.parse(response) : {};
                    if (!jsonRes.country) {
                        console.log('Not got country');
                        //await this.getCountry(ip);
                        resolve('');
                    } else {
                        //callback(JSON.parse(response), null);
                        resolve(JSON.parse(response));
                    }
                });

                res.on("error", function (error) {
                    console.error(error);
                    reject(error);
                });
            });

            req.end();
        })
    }
}