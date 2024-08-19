import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Report, ReportDocument } from "src/schema/report.schema";

@Injectable()
export class ReportRepository {
    constructor(
        @InjectModel(Report.name) private reportModel: Model<ReportDocument>
    ) { }

    async getAllReportLinks() {
        return await this.reportModel.find({}, {
            'slug': '$slug'
        }).sort({
            'updatedAt': -1
        }).exec().then(res => {
            return res;
        });
    }
}