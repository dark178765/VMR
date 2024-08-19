import { Controller, Get, Render } from "@nestjs/common";
import { ReportService } from "src/report/report.service";

@Controller()
export class VPointLaunchController {


    constructor(
        private readonly reportService: ReportService
    ) { }

    @Get('vantage-point')
    @Render('vantagepoint')
    async index() {
        const reports = await this.reportService.getRecentReports(20);

        let recentReports = await Promise.all(reports.map(async (item) => {
            let reportData = await this.reportService.getReportData(item.reportDataId);
            let html = this.reportService.getReportDescription(reportData, item.keyword).replace(/(<([^>]+)>)/igm, '').substring(0, 300);

            return {
                reportTitle: item.keyword,
                reportDescription: html,
                url: item.slug,
                category: { title: item.childCategory[0].title, slug: item.childCategory[0].slug },
                singleUser: item.pricingOptions.singleUser,
                imageThumbnail: item.keyword,
                parentCategory: item.childCategory[0].parentCategoryId[0]
            };
        }));

        return {
            title: 'Vantage Point',
            recentReports,
            metadescription: 'Explore the Vantage Point at Vantage Market Research for unparalleled strategic insights. Elevate your decision-making with cutting-edge market analysis and expert perspectives. Discover the advantage of informed choices with Vantage Point.',
            metakeywords: 'market research, strategic insights, business intelligence, Vantage Point, market analysis, industry trends, data-driven decisions, competitive intelligence, market trends, market reports',
            metatitle: 'Vantage Point Interactive Dashboard | Vantage Market Research'
        }
    }
}