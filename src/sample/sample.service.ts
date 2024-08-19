import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Report, ReportDocument } from "src/schema/report.schema";

@Injectable()
export class SampleService {
    constructor(
        @InjectModel(Report.name) private readonly reportModel: Model<ReportDocument>
    ) { }

    async getReportData(slug) {
        let report = await this.reportModel.find({
            slug: slug
        }, {
            'templates': '$templates',
            'title': '$title',
            'excelData': '$excelData'
        }).populate('reportDataId', 'table segments reportTitle').exec().then(res => {
            return res;
        });
        return report;
    }

    getSegments(excelData) {
        let segments = Object.getOwnPropertyNames(excelData).filter(item => {
            return item.indexOf('segmentation') > -1;
        });

        let segmentObj = [];

        for (var i = 0; i < segments.length; i++) {
            let subSegments = excelData['segment' + (i + 1)].split(',').map(item => {
                return { SubSegmentName: item.trim() };
            });

            segmentObj.push({
                SegmentName: excelData[segments[i].trim()].trim(),
                SubSegment: subSegments
            });
        }
        return segmentObj;
    }

    getCompany(excelData) {
        
        let companies = excelData.company.split(',');
        let companyArray = [];
        companies.forEach(item => {
            companyArray.push({
                CompanyName: item.trim()
            })
        });
        return companyArray;
    }
}