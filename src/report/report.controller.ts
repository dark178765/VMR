import { CACHE_MANAGER, ConsoleLogger, Controller, Get, Inject, NotFoundException, Param, Render, Req, Request, Res } from "@nestjs/common";
import { ReportService } from "./report.service";
import * as hbs from 'hbs';
import { FormService } from "src/form/form.service";
import { s3FileHandling } from "src/util/uploadtos3";
import { join } from "path";
import { createReadStream, createWriteStream, readFileSync, writeFileSync } from "fs";
import { helper } from "src/util/helper";
import { RealIp } from "nestjs-real-ip";
import { CheckIP } from '../util/checkip';
import * as cleaner from 'clean-html';
import { ChartImage } from "src/chart-image/chartimage";
import ampify from "ampify";
import { Cache } from "cache-manager";
import * as moment from "moment";
import axios from "axios";

@Controller()
export class ReportController {
    constructor(
        private readonly reportService: ReportService,
        private readonly formService: FormService,
        @Inject(CACHE_MANAGER) private cacheService: Cache
    ) { }


    // @Get('report-assets/report/cover/:imageUrl')
    // async getImage(@Req() req, @Param() param, @Res() res) {
    //     let data = await s3FileHandling.getFile(param.imageUrl);
    //     if (!data) {
    //         //this.reportService.addImage()
    //     }
    //     writeFileSync('temp.png', data);
    //     const file = createReadStream('temp.png');
    //     file.pipe(res);
    // }

    @Get(['industry-report/:url/market-segmentation', 'industry-report/:url/methodology', 'industry-report/:url/toc'])
    async redirectUrl(@Param() pram, @Req() req, @Res() res) {
        let urlSegmentation = req.url.split('/');
        res.redirect(301, `/${urlSegmentation[urlSegmentation.length - 1]}/${pram.url}`);
    }

    @Get([':url/toc', ':url/market-segmentation', ':url/methodology'])
    async redirectAnother(@Param() pram, @Req() req, @Res() res) {
        let modify = req.url.split('/').filter(x => x.trim() !== '');
        res.redirect(301, `/${modify[modify.length - 1]}/${pram.url}`);
    }

    @Get(['industry-report/:url', 'industry-report/mobile/:url', 'toc/:url', 'market-segmentation/:url', 'methodology/:url', 'included/:url'])
    async getReport(@Param() pram, @Req() req, @Res() res, @RealIp() ip) {

        let isMobileUser = this.reportService.isMobileUser(req.headers['user-agent']) || (req.url.indexOf('/mobile/') > -1);

        let key = isMobileUser ? `mobile-${pram.url}` : pram.url;

        let data: any = await this.cacheService.get(key);

        let descriptionTab: boolean, tocTab: boolean, marketSegmentTab, methodologyTab = false;

        descriptionTab = req.url.startsWith('/industry-report/');
        tocTab = req.url.startsWith('/toc/');
        marketSegmentTab = req.url.startsWith('/market-segmentation/');
        methodologyTab = req.url.startsWith('/methodology/');
        let include = req.url.startsWith('/included/');

        let country: any = await this.reportService.getCountry(ip);
        let showChat = country.country !== 'India' && country.country !== 'india';

        if (!data) {

            let report: any = await this.reportService.getReport(pram.url, req.url.startsWith('/methodology/'));

            if (!report) {
                throw new NotFoundException();
            }

            if (report['redirect'] && report['redirect'] === true) {
                res.redirect(301, `/industry-report/${report.slug}`);
                return;
            }

            let actualReportID = report._id;

            if (report.res1) {

                let html = this.reportService.getProcessedDescription(typeof report.res1.unprocessedHtml === 'string' ? report.res1.unprocessedHtml
                    : report.res1.unprocessedHtml[report.res1.unprocessedHtml.length - 1], report.res1.table, report.res1.segments, report.keyword, false, true, true, report['video'], isMobileUser, report.slug);

                let pureReportDescription = typeof report.res1.unprocessedHtml === 'string' ? report.res1.unprocessedHtml
                    : report.res1.unprocessedHtml[report.res1.unprocessedHtml.length - 1];


                let xx = html.reportData;

                delete xx.region_map_image;
                delete xx.segment_image;

                let prd = hbs.compile(pureReportDescription);
                let unprocessedrd = prd(xx);

                if (unprocessedrd) {
                    unprocessedrd = unprocessedrd.replace(/&lt;/gmi, '<').replace(/&gt;/gmi, '>').replace(/( style=["'])([a-zA-Z0-9:;\.\s\(\)\-\,]*)(['"])/gmi, '').replace(/\r?\n|\r/g, '');
                }

                let metaDescriptionSegments = 'by ' + report.res1.segments.map(s => {
                    return `${s.segment} (${s.subSegments.map(ss => { return ss.text.replace(/&amp;/gmi, '&').trim(); }).join(', ')})`
                }).join(' by ');

                if (!isMobileUser && showChat)
                    html.html = this.reportService.addChatbot(html.html, report.keyword);
                else
                    html.html = this.reportService.removeChatBot(html.html);


                let tableValues = this.reportService.getTable(report.res1.table);

                let mDesc = tableValues['Volume_Current'] == null || tableValues["Volume_Current"] == '' ? `The {{keyword}} market is projected to grow from {{Revenue_Current}} in {{Current_Year}} to {{Revenue_Forecast}} by {{Forecast_Year}}, at a CAGR of {{CAGR_Revenue}} during the forecast period.` :
                    `The {{keyword}} market is projected to grow from volume {{Volume_Current}} in ${tableValues['Current_Year']} to {{Volume_Forecast}} volume by ${tableValues['Forecast_Year']}, at a CAGR of {{CAGR_Volume}} during the forecast period.`;

                mDesc = helper.replaceString(mDesc, { ...this.reportService.getTable(report.res1.table), keyword: report.keyword });

                let metatitle = '';

                if (tableValues['Volume_Current'] == null || tableValues["Volume_Current"] == '')
                    metatitle = !report.metaData || !report.metaData.metaTitle || report.metaData.metaTitle == '' ? `${report.keyword.replace("Market", "").replace("Global", "")} Market Size USD ${tableValues['Revenue_Forecast'].replace('USD', '')} by ${tableValues['Forecast_Year']}`
                        : report.metaData.metaTitle;
                else
                    metatitle = !report.metaData?.metaTitle || report.metaData.metaTitle == '' ? `${report.keyword.replace("Market", "").replace("Global", "")} Market Volume ${tableValues['Volume_Forecast']} by ${tableValues['Forecast_Year']}`
                        : report.metaData.metaTitle;

                metatitle = metatitle.indexOf(' XX ') > -1 ? report.title : metatitle.replace(/\s+/g, ' ').trim();

                let mkeyword = helper.replaceString('{{keyword}}, {{keyword}} share, {{keyword}} trends, {{keyword}} industry size, {{keyword}} industry analysis', { ...this.reportService.getTable(report.res1.table), keyword: report.keyword });

                let toc = this.reportService.getTableOfContent(report.keyword, report.res1.table, report.res1.segments);

                //let summaryTable = this.reportService.addSummaryTable({ ...html.reportData, Keyword: report.keyword });

                let viewToShow = this.reportService.isMobileUser(req.headers['user-agent']) ? (descriptionTab ? 'mobileview' : "mobile-report-detail") : 'new-report-detail';

                let setLayout = this.reportService.isMobileUser(req.headers['user-agent']) && descriptionTab ? {
                    layout: ''
                } : {
                    layout: 'layout'
                };

                //set cache
                await this.cacheService.set(key, {
                    //summaryTable,
                    reportDescription: html.html,
                    ...html.reportData,
                    toc,
                    methodology: {
                        segments: report.res1.segments,
                        methodology: report.methodology,
                        keyword: report.keyword
                    },
                    title: report.title,
                    createdAt: this.reportService.getDate(report.createdAt),
                    updatedAt: this.reportService.getDate(report.updatedAt),
                    utcCreatedAt: moment(report.createdAt).utc(false).format('YYYY-MM-DDThh:mm:ssZ'),
                    utcUpdatedAt: moment(report.updatedAt).utc(false).format('YYYY-MM-DDThh:mm:ssZ'),
                    baseYear: report.baseYear || new Date().getFullYear() - 1,
                    numberOfPages: report.noOfPages,
                    deliveryFormat: report.deliveryFormat || 'PDF',
                    reportId: report.reportId,
                    keyword: report.keyword,
                    category: report.parentCategoryId ?? report.childCategory[0].parentCategoryId[0],
                    childCategory: report.childCategory && report.childCategory.length > 0 ? report.childCategory[0] : undefined,
                    slug: report.slug,
                    reportSlug: report.reportSlug,
                    driver_1: report.res1.drivers[0]?.text,
                    metatitle,
                    metadescription: report.metaData?.metaDescription || mDesc,
                    metakeywords: report.metaData?.metaKeywords || mkeyword,
                    marketSeg: {
                        marketSegregationWitSubSegments: report.res1.segments.filter(x => x.segment.toLowerCase() !== 'region' && x.segment.toLowerCase() !== 'regions').map(item => {
                            return {
                                textType: 'segmentationWithGraph',
                                title: `${report.keyword} ${item.segment} Outlook (Revenue, USD Million, 2018 - 2030)`,
                                subSegment: JSON.parse(JSON.stringify(item.subSegments)).map(e => { return e.text; }).join(','),
                                segment: item.segment,
                            }
                        }),
                        title: `${report.keyword} Market Segment Analysis`,
                        segmentation: this.reportService.getGrphValuesNew(report.res1.segments),
                        keyword: report.keyword,
                    },
                    pr: report.pr,
                    rptId: actualReportID,
                    pricingOptions: report.pricingOptions,
                    faq: report.res1.faq,
                    tableValues,
                    categoryIconFileName: report.childCategory[0].parentCategoryId[0].title.trim().replace(/\s/gmi, '-').replace(/&/gmi, 'and'),
                    categoryUrl: report.childCategory[0].parentCategoryId[0].slug,
                    reportImage: report.keyword.trim().replace(/\s/gmi, '-').replace(/&/gmi, 'and').replace(/[^a-zA-Z0-9\-]/gmi, ''),
                    video: report['video'],
                    isOldReport: false,
                    ready: JSON.parse(JSON.stringify(report)),
                    unprocessedrd
                }, {
                    ttl: 5000
                });



                res.render(viewToShow, {
                    ...setLayout,
                    //summaryTable,
                    reportDescription: html.html,
                    ...html.reportData,
                    descriptionTab,
                    tocTab,
                    include,
                    toc,
                    marketSegmentTab,
                    methodologyTab,
                    methodology: {
                        segments: report.res1.segments,
                        methodology: report.methodology,
                        keyword: report.keyword
                    },
                    title: report.title + (include ? ' - Includes' : ''),
                    createdAt: this.reportService.getDate(report.createdAt),
                    updatedAt: this.reportService.getDate(report.updatedAt),
                    utcCreatedAt: moment(report.createdAt).utc(false).format('YYYY-MM-DDThh:mm:ssZ'),
                    utcUpdatedAt: moment(report.updatedAt).utc(false).format('YYYY-MM-DDThh:mm:ssZ'),
                    baseYear: report.baseYear || new Date().getFullYear() - 1,
                    numberOfPages: report.noOfPages,
                    deliveryFormat: report.deliveryFormat || 'PDF',
                    reportId: report.reportId,
                    keyword: report.keyword,
                    category: report.parentCategoryId ?? report.childCategory[0].parentCategoryId[0],
                    childCategory: report.childCategory && report.childCategory.length > 0 ? report.childCategory[0] : undefined,
                    slug: report.slug,
                    reportSlug: report.reportSlug,
                    driver_1: report.res1.drivers[0]?.text,

                    ...this.reportService.getMeta({
                        metatitle,
                        metadescription: report.metaData?.metaDescription || mDesc,
                        metakeywords: report.metaData?.metaKeywords || mkeyword,
                    }, {
                        isInclusion: include,
                        isTOC: tocTab,
                        isSegmentation: marketSegmentTab,
                        isDescription: descriptionTab
                    }),
                    marketSeg: {
                        marketSegregationWitSubSegments: report.res1.segments.filter(x => x.segment.toLowerCase() !== 'region' && x.segment.toLowerCase() !== 'regions').map(item => {
                            return {
                                textType: 'segmentationWithGraph',
                                title: `${report.keyword} ${item.segment} Outlook (Revenue, USD Million, 2018 - 2030)`,
                                segment: item.segment,
                                subSegment: JSON.parse(JSON.stringify(item.subSegments)).map(e => { return e.text; }).join(','),
                            }
                        }),
                        keyword: report.keyword,
                        title: `${report.keyword} Market Segment Analysis`,
                        segmentation: this.reportService.getGrphValuesNew(report.res1.segments)
                    },
                    pr: report.pr,
                    rptId: actualReportID,
                    pricingOptions: report.pricingOptions,
                    faq: report.res1.faq,
                    tableValues,
                    categoryIconFileName: report.childCategory[0].parentCategoryId[0].title.trim().replace(/\s/gmi, '-').replace(/&/gmi, 'and'),
                    categoryUrl: report.childCategory[0].parentCategoryId[0].slug,
                    reportImage: report.keyword.trim().replace(/\s/gmi, '-').replace(/&/gmi, 'and').replace(/[^a-zA-Z0-9\-]/gmi, ''),
                    video: report['video'],
                    showChat,
                    ready: JSON.parse(JSON.stringify(report)),
                    unprocessedrd
                });
            } else {
                let meth = await this.reportService.getMethodology({
                    parentCategory: report.parentCategoryId,
                    reportExcel: report.excelData
                });



                let tableOfContent = this.reportService.getToc(report.templates);
                let tocTemplates = hbs.compile(tableOfContent);
                tocTemplates(report.excelData);
                let noOfPages = report.template.noOfPages || this.reportService.getNoOfPages(report.templates) || report.excelData.noofpages;


                let reportDetail = {
                    title: report.title,
                    createdAt: this.reportService.getDate(report.createdAt),
                    updatedAt: this.reportService.getDate(report.updatedAt),
                    utcCreatedAt: moment(report.createdAt).utc(false).format('YYYY-MM-DDThh:mm:ssZ'),
                    utcUpdatedAt: moment(report.updatedAt).utc(false).format('YYYY-MM-DDThh:mm:ssZ'),
                    baseYear: report.baseYear,
                    numberOfPages: noOfPages,
                    deliveryFormat: report.deliveryFormat || 'PDF',
                    reportId: report.reportId,
                    keyword: report.keyword,
                    category: report.childCategory[0].parentCategoryId[0],
                    slug: report.slug,
                    templates: JSON.parse(JSON.stringify(report.templates)),
                    excelData: JSON.parse(JSON.stringify(report.excelData)),
                    reportSlug: report.reportSlug,
                    toc: this.reportService.getToc(report.templates),
                    marketSeg: {
                        marketSegmentDescription: this.reportService.getMarketSegmentDescription(report.templates),
                        marketSegregationWitSubSegments: this.reportService.getMarketSegregationWitSubSegments(report.templates),
                    },
                    segmentation: this.reportService.getGraphValues(report.templates),
                    methodology: {
                        excelData: report.excelData,
                        methodology: meth,
                        keyword: report.keyword
                    },
                    pricingOptions: report.pricingOptions,
                    actualCreatedAt: report.createdAt,
                    parentCategory: report.parentCategoryId,
                    segments: this.reportService.getSegments(report.excelData),
                    Revenue_Current: report.excelData.revenue_2020,
                    Revenue_Forecast: report.excelData.Revenue_Forecast,
                    CAGR_Revenue: report.excelData.revenue_CAGR,
                    Fastest_Region: report.excelData.leading_region,
                    ready: JSON.parse(JSON.stringify(report))
                }

                let tableValues = this.reportService.getOldTable(JSON.parse(JSON.stringify(report.excelData)))

                let mDesc = `The {{keyword}} industry is projected to grow from ${tableValues['Revenue_Current']} in ${tableValues['Current_Year']} and to reach USD ${tableValues['Revenue_Forecast']} by ${tableValues['Forecast_Year']}, at a Compound Annual Growth Rate (CAGR) of ${tableValues['CAGR_Revenue']} during the forecast period.`;

                mDesc = helper.replaceString(mDesc, { ...report.excelData, keyword: report.excelData.keyword, CAGR_Revenue: report.excelData.revenue_CAGR.replace('%', '') + '%' });
                let mkeyword = helper.replaceString('{{keyword}}, {{keyword}} share, {{keyword}} trends, {{keyword}} industry size, {{keyword}} industry analysis', { ...report.excelData, keyword: report.excelData.keyword });


                let viewToShow = this.reportService.isMobileUser(req.headers['user-agent']) ? 'mobile-old-report-detail' : 'oldreportreportdetail';



                //set cache
                this.cacheService.set(key, {
                    include,
                    ...reportDetail,
                    ...tableValues,
                    tableValues,
                    metatitle: `${report.keyword.replace("Market", "").replace("Global", "")} Market Size USD ${tableValues['Revenue_Forecast']} by ${tableValues['Forecast_Year']}`,
                    metadescription: report.excelData.meta_description !== '' && report.excelData.meta_description !== '#NAME?' ? report.excelData.meta_description : mDesc,
                    metakeywords: mkeyword,
                    rptId: actualReportID,
                    isOldReport: true
                }, {
                    ttl: 5000
                });

                res.render(viewToShow, {
                    layout: 'layout',
                    include,
                    ...reportDetail,
                    ...tableValues,
                    descriptionTab,
                    tocTab,
                    marketSegmentTab,
                    methodologyTab,


                    ...this.reportService.getMeta({
                        metatitle: `${report.keyword.replace("Market", "").replace("Global", "")} Market Size USD ${tableValues['Revenue_Forecast']} by ${tableValues['Forecast_Year']}`,
                        metadescription: report.excelData.meta_description !== '' && report.excelData.meta_description !== '#NAME?' ? report.excelData.meta_description : mDesc,
                        metakeywords: mkeyword,
                    }, {
                        isInclusion: include,
                        isTOC: tocTab,
                        isSegmentation: marketSegmentTab,
                        isDescription: descriptionTab
                    }),

                    rptId: actualReportID
                });
            }
        } else {
            let viewToShow = '';
            let setLayout = {};
            let tabs = {};

            if (!data.isOldReport) {

                if (!isMobileUser && showChat)
                    data.reportDescription = this.reportService.addChatbot(data.reportDescription, data.keyword);
                else
                    data.reportDescription = this.reportService.removeChatBot(data.reportDescription);

                viewToShow = isMobileUser ? (descriptionTab ? 'mobileview' : "mobile-report-detail") : 'new-report-detail';

                setLayout = isMobileUser && descriptionTab ? {
                    layout: ''
                } : {
                    layout: 'layout'
                };
                tabs = {
                    descriptionTab,
                    tocTab,
                    include,
                    marketSegmentTab,
                    methodologyTab
                };
            } else {
                viewToShow = isMobileUser ? 'mobile-old-report-detail' : 'oldreportreportdetail';
                setLayout = {
                    layout: 'layout'
                }

                tabs = {
                    descriptionTab,
                    tocTab,
                    marketSegmentTab,
                    methodologyTab
                };
            }

            res.render(viewToShow, {
                ...data,
                ...this.reportService.getMeta({
                    metatitle: data.metatitle,
                    metadescription: data.metadescription,
                    metakeywords: data.metakeywords,
                }, {
                    isInclusion: include,
                    isTOC: tocTab,
                    isSegmentation: marketSegmentTab,
                    isDescription: descriptionTab
                }),
                ...setLayout,
                ...tabs,
                showChat
            });
        }
    }


    @Get('industry-report/:lang/:url')
    async translatedPage(@Param() param, @Res() res) {
        let data = await axios.get(`${process.env.TRANSLATE_SERVER}?url=https://www.vantagemarketresearch.com/industry-report/${param.url}&lang=${param.lang}`);

        if (data.data !== '') {
            res.send(data.data)
        } else {
            res.redirect(301, `https://www.vantagemarketresearch.com/industry-report/${param.url}`);
        }
    }

    @Get('add-url/:lang/:url')
    async addUrl(@Param() param) {
        await axios.get(`https://5e59-122-169-21-132.ngrok-free.app/add-url?url=${param.url}&lang=${param.lang}`);
        return {
            success: true
        }
    }

    @Get('related-reports/:reportID')
    async getRelatedReports(@Param() pram) {
        return await this.reportService.getRelatedReports(pram.reportID);
    }

    @Get(['amp/industry-report/:url'])
    async getReportAMP(@Param() pram, @Req() req: Request, @Res() res) {
        let report: any = await this.reportService.getReport(pram.url);

        if (!report) {
            throw new NotFoundException();
        }

        if (report['redirect'] && report['redirect'] === true) {
            res.redirect(301, `/industry-report/${report.slug}`);
            return;
        }

        let actualReportID = report._id;

        let descriptionTab: boolean, tocTab: boolean, marketSegmentTab, methodologyTab = false;

        descriptionTab = req.url.startsWith('/industry-report/');
        tocTab = req.url.startsWith('/toc/');
        marketSegmentTab = req.url.startsWith('/market-segmentation/');
        methodologyTab = req.url.startsWith('/methodology/');
        let include = req.url.startsWith('/included/');

        if (report.res1) {
            let html = this.reportService.getProcessedDescription(report.res1.unprocessedHtml, report.res1.table, report.res1.segments, report.keyword, false, true, true, report['video']);

            let metaDescriptionSegments = 'by ' + report.res1.segments.map(s => {
                return `${s.segment} (${s.subSegments.map(ss => { return ss.text.replace(/&amp;/gmi, '&').trim(); }).join(', ')})`
            }).join(' by ');


            let tableValues = this.reportService.getTable(report.res1.table);

            let mDesc = tableValues['Volume_Current'] == null || tableValues["Volume_Current"] == '' ? `The {{keyword}} market is projected to grow from {{Revenue_Current}} in 2021 to {{Revenue_Forecast}} by 2028, at a CAGR of {{CAGR_Revenue}} during the forecast period.` :
                `The {{keyword}} market is projected to grow from volume {{Volume_Current}} in 2021 to {{Volume_Forecast}} volume by 2028, at a CAGR of {{CAGR_Volume}} during the forecast period.`;

            mDesc = helper.replaceString(mDesc, { ...this.reportService.getTable(report.res1.table), keyword: report.keyword });

            let metatitle = '';

            if (tableValues['Volume_Current'] == null || tableValues["Volume_Current"] == '')
                metatitle = !report.metaData.metaTitle || report.metaData.metaTitle == '' ? `${report.keyword.replace("Market", "").replace("Global", "")} Market Size USD ${tableValues['Revenue_Forecast'].replace('USD', '')} by 2028`
                    : report.metaData.metaTitle;
            else
                metatitle = !report.metaData?.metaTitle || report.metaData.metaTitle == '' ? `${report.keyword.replace("Market", "").replace("Global", "")} Market Volume ${tableValues['Volume_Forecast']} by 2030`
                    : report.metaData.metaTitle;

            metatitle = metatitle.replace(/\s+/g, ' ').trim();

            let mkeyword = helper.replaceString('{{keyword}}, {{keyword}} share, {{keyword}} trends, {{keyword}} industry size, {{keyword}} industry analysis', { ...this.reportService.getTable(report.res1.table), keyword: report.keyword });

            let toc = this.reportService.getTableOfContent(report.keyword, report.res1.table, report.res1.segments);

            let summaryTable = this.reportService.addSummaryTable({ ...html.reportData, Keyword: report.keyword });

            let reportHtml = readFileSync(join(__dirname, '../..', 'views/mobileview.hbs'));

            let rd = hbs.compile(reportHtml.toString());
            let ht = rd({
                summaryTable,
                reportDescription: html.html,
                ...html.reportData,
                descriptionTab,
                tocTab,
                include,
                toc,
                marketSegmentTab,
                methodologyTab,
                methodology: {
                    segments: report.res1.segments,
                    methodology: report.methodology,
                    keyword: report.keyword
                },
                title: report.title,
                createdAt: this.reportService.getDate(report.createdAt),
                baseYear: report.baseYear || new Date().getFullYear() - 1,
                numberOfPages: report.noOfPages,
                deliveryFormat: report.deliveryFormat || 'PDF',
                reportId: report.reportId,
                keyword: report.keyword,
                Keyword: report.keyword,
                category: report.parentCategoryId ?? report.childCategory[0].parentCategoryId[0],
                childCategory: report.childCategory && report.childCategory.length > 0 ? report.childCategory[0] : undefined,
                slug: report.slug,
                reportSlug: report.reportSlug,
                driver_1: report.res1.drivers[0]?.text,
                metatitle,
                metadescription: report.metaData?.metaDescription || mDesc,
                metakeywords: report.metaData?.metaKeywords || mkeyword,
                marketSeg: {
                    marketSegregationWitSubSegments: report.res1.segments.map(item => {
                        return {
                            textType: 'segmentationWithGraph',
                            title: `Global ${report.keyword} Market: ${item.segment} Segment Analysis`,
                            subSegment: JSON.parse(JSON.stringify(item.subSegments)).map(e => { return e.text; }).join(','),
                        }
                    }),
                    segmentation: this.reportService.getGrphValuesNew(report.res1.segments)
                },
                pr: report.pr,
                rptId: actualReportID,
                pricingOptions: report.pricingOptions,
                faq: report.res1.faq,
                tableValues,
                categoryIconFileName: report.childCategory[0].parentCategoryId[0].title.trim().replace(/\s/gmi, '-').replace(/&/gmi, 'and'),
                categoryUrl: report.childCategory[0].parentCategoryId[0].slug,
                reportImage: report.keyword.trim().replace(/\s/gmi, '-').replace(/&/gmi, 'and').replace(/[^a-zA-Z0-9\-]/gmi, ''),
                video: report['video']
            });

            let amp = await ampify(ht, { cwd: 'amp' });

            res.send(amp);
        } else {
            let meth = await this.reportService.getMethodology({
                parentCategory: report.parentCategoryId,
                reportExcel: report.excelData
            });



            let tableOfContent = this.reportService.getToc(report.templates);
            let tocTemplates = hbs.compile(tableOfContent);
            tocTemplates(report.excelData);
            let noOfPages = report.template.noOfPages || this.reportService.getNoOfPages(report.templates) || report.excelData.noofpages;


            let reportDetail = {
                title: report.title,
                createdAt: this.reportService.getDate(report.createdAt),
                baseYear: report.baseYear,
                numberOfPages: noOfPages,
                deliveryFormat: report.deliveryFormat || 'PDF',
                reportId: report.reportId,
                keyword: report.keyword,
                category: report.category,
                slug: report.slug,
                templates: JSON.parse(JSON.stringify(report.templates)),
                excelData: JSON.parse(JSON.stringify(report.excelData)),
                reportSlug: report.reportSlug,
                toc: this.reportService.getToc(report.templates),
                marketSeg: {
                    marketSegmentDescription: this.reportService.getMarketSegmentDescription(report.templates),
                    marketSegregationWitSubSegments: this.reportService.getMarketSegregationWitSubSegments(report.templates),
                },
                segmentation: this.reportService.getGraphValues(report.templates),
                methodology: {
                    excelData: report.excelData,
                    methodology: meth,
                    keyword: report.keyword
                },
                pricingOptions: report.pricingOptions,
                actualCreatedAt: report.createdAt,
                parentCategory: report.parentCategoryId,
                segments: this.reportService.getSegments(report.excelData),
                Revenue_Current: report.excelData.revenue_2020,
                Revenue_Forecast: report.excelData.Revenue_Forecast,
                CAGR_Revenue: report.excelData.revenue_CAGR,
                Fastest_Region: report.excelData.leading_region
            }

            let mDesc = `The {{keyword}} industry is projected to grow from {{Revenue_2020}} in 2020 and to reach USD {{Revenue_Forecast}} by 2028, at a Compound Annual Growth Rate (CAGR) of {{CAGR_Revenue}} during the forecast period.`;

            mDesc = helper.replaceString(mDesc, { ...report.excelData, keyword: report.excelData.keyword, CAGR_Revenue: report.excelData.revenue_CAGR.replace('%', '') + '%' });
            let mkeyword = helper.replaceString('{{keyword}}, {{keyword}} share, {{keyword}} trends, {{keyword}} industry size, {{keyword}} industry analysis', { ...report.excelData, keyword: report.excelData.keyword });

            res.render('oldreportreportdetail', {
                ...reportDetail,
                descriptionTab,
                tocTab,
                marketSegmentTab,
                methodologyTab,
                metatitle: `${report.keyword.replace("Market", "").replace("Global", "")} Market Size USD ${JSON.parse(JSON.stringify(report.excelData)).Revenue_Forecast} by 2028`,
                metadescription: report.excelData.meta_description !== '' && report.excelData.meta_description !== '#NAME?' ? report.excelData.meta_description : mDesc,
                metakeywords: mkeyword,
                rptId: actualReportID
            });
        }
    }

    @Get('pricing/:url')
    //@Render('pricing')
    async getPricing(@Param() pram, @Res() res) {
        res.redirect(301, `/buy-now/${pram.url}/0`);
        // const report = await this.reportService.getReport(pram.url);
        // return {
        //     slug: pram.url,
        //     ...report.pricingOptions
        // };
    }

    @Get('proxy-error')
    @Render('proxy-error')
    async proxyerror() {
        return {};
    }

    @Get('all-reports/:page?')
    @Render('allreports_new')
    async getAllReports(@Param() pram) {
        return {
            ...await this.reportService.getAllReportsPaging(pram.page ? parseInt(pram.page) : 1, 20),
            metatitle: '[Latest Market Research Reports], Vantage Market Research',
            metadescription: 'Our extensive collection of reports cover various industries and markets, providing in-depth analysis and insights to help you make informed business decisions. Browse our website today to discover the latest trends and opportunities in your industry.',
            metakeywords: 'Latest, Research, Latest Research, Latest Research - Vantage Market Research'
        };
    }

    @Get('all-reports-json/:page?/:limit?')
    async getReportsByPaging(@Param() pram) {
        return {
            ...await this.reportService.getAllReportsPaging(pram.page ? parseInt(pram.page) : 1, pram.limit ? parseInt(pram.limit) : 20),
        };
    }

    @Get('/get-report-pricing/:id')
    async getReportPricing(@Param() pram) {
        return await this.reportService.getReportPricing(pram.id);
    }

    @Get('/get-globe-news')
    async getGlobeNews(@Param() pram, @Req() req) {
        return await this.reportService.getGlobeNewsWireNews(req.query.keyword);
    }
}