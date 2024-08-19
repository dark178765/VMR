import { Controller, Get, Param } from "@nestjs/common";
import { SampleService } from "./sample.service";
import { ReportService } from "src/report/report.service";

@Controller()
export class SampleController {
    constructor(
        private readonly sampleService: SampleService,
        private readonly reportService: ReportService
    ) { }


    @Get('report-data/:url')
    async getReportData(@Param() pram) {
        let reportData: any = await this.sampleService.getReportData(pram.url);
        
        if (reportData[0].reportDataId) {
            let reportData1 = JSON.parse(JSON.stringify(reportData));

           

            let segments = reportData1[0].reportDataId.segments.filter(x => {
                return x.segment !== 'Region' && x.segment !== "Regions";
            }).map(s => {
                let share = Object.getOwnPropertyNames(s.subSegments[0]).filter(x => x.toLowerCase().indexOf('share') > -1)
                return {
                    SegmentName: s.segment.trim(),
                    SubSegment: s.subSegments.map(ss => {
                        
                        return {
                            SubSegmentName: ss.text.trim(),
                            Share21: ss[share[0]].trim() !== '' ? ss[share[0]].trim() : 'XX',
                            Share_Current: ss[share[0]].trim() !== '' ? ss[share[0]].trim() : 'XX',
                            isShare21: ss[share[0]].trim().trim() !== '' ? true : false,
                            isnotShare21: ss[share[0]].trim() !== '' ? false : true,
                            Share28: ss[share[1]].trim() !== '' ? ss[share[1]].trim() : 'XX',
                            Share_Forecast: ss[share[1]].trim() !== '' ? ss[share[1]].trim() : 'XX',
                            isShare28: ss[share[1]].trim().trim() !== '' ? true : false,
                            isnotShare28: ss[share[1]].trim() !== '' ? false : true
                        };
                    })
                }
            });
            let company = reportData1[0].reportDataId.table.filter(x => {
                return x.fieldName == 'Players';
            })[0].fieldValue.split(',').map(p => {
                return {
                    CompanyName: p.trim()
                }
            });

            let table = this.reportService.getTable(reportData1[0].reportDataId.table);

            // reportData1[0].reportDataId.table.forEach(item => {
            //     table[item.fieldName] = item.fieldValue;
            // });

            // table['Revenue_Current'] = table['Revenue_2021'];
            // table['Revenue_Forecast'] = table['Revenue_2028'];

            // table['Volume_Current'] = table['Volume_2021'];
            // table['Volume_Forecast'] = table['Volume_2028'];

            return {
                segments,
                company,
                keyword: reportData1[0].reportDataId.reportTitle,
                ...table
            };
        } else {

            let company = this.sampleService.getCompany(reportData[0].excelData);
            let segments = this.sampleService.getSegments(reportData[0].excelData).map(s => {
                return {
                    SegmentName: s.SegmentName.trim(),
                    SubSegment: s.SubSegment.map(ss => {
                        return {
                            SubSegmentName: ss.SubSegmentName.trim(),
                            Share21: 'XX',
                            Share_Current: 'XX',
                            isShare21: false,
                            isnotShare21: true,
                            Share28: 'XX',
                            Share_Forecast: 'XX',
                            isShare28: false,
                            isnotShare28: true
                        };
                    })
                }
            });

            let table = {};

            table['Revenue_2021'] = reportData[0].excelData.revenue_2020;
            table['Revenue_2028'] = reportData[0].excelData.revenue_2028;

            table['Revenue_Current'] = reportData[0].excelData.revenue_2020;
            table['Revenue_Forecast'] = reportData[0].excelData.revenue_2028;


            table['CAGR_Revenue'] = reportData[0].excelData.revenue_CAGR.indexOf('%') > -1 ? reportData[0].excelData.revenue_CAGR
                : reportData[0].excelData.revenue_CAGR + '%';

            table['Volume_2021'] = reportData[0].excelData.v_2020;
            table['Volume_2028'] = reportData[0].excelData.v_2028;


            table['Volume_Current'] = reportData[0].excelData.v_2020;
            table['Volume_Forecast'] = reportData[0].excelData.v_2028;


            table['CAGR_Volume'] = reportData[0].excelData.v_CAGR;
            table['Largest_Region'] = reportData[0].excelData.infographics_for_region;
            table['MSA_Largest_Region'] = reportData[0].excelData.percentage_shareofregion;
            table['Fastest_Region'] = reportData[0].excelData.leading_region;
            table['Map_Revenue'] = reportData[0].excelData.revenueforregioninfographics + ' ' + reportData[0].excelData.unitsforinfographics;
            table['Players'] = reportData[0].excelData.company;
            table['TopPlayers'] = reportData[0].excelData.company;

            return {
                keyword: reportData[0].excelData.keyword,
                company,
                segments,
                ...table
            };
        }
    }
}