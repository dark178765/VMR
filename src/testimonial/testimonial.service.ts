import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Testimonial, TestimonialDocument } from "src/schema/testimonial.schema";
import { Model, Types } from 'mongoose';
import { randomUUID } from "crypto";
import { ReportService } from "src/report/report.service";

@Injectable()
export class TestimonialService {
    constructor(
        @InjectModel(Testimonial.name) private testimonialRepo: Model<TestimonialDocument>,
        private reportService: ReportService
    ) { }

    //this method is incomplete please
    async createTestimonialLink(t: any) {

        let reportUrl = t.reportUrl.split('/').filter(x => x.trim() !== '');

        let report = await this.reportService.getReport(reportUrl[reportUrl.length - 1]);

        let testimonial = await this.testimonialRepo.updateOne({
            _id: new Types.ObjectId()
        }, {
            reportID: report._id,
            fullName: t.fullName,
            emailID: t.emailID,
            company: t.company,
            comment: ''
        }, {
            upsert: true,
            new: true
        });
        return testimonial;
    }


    async getTestimonial(id: string) {
        let t = await this.testimonialRepo.findById(new Types.ObjectId(id)).populate('reportID');
        return t;
    }


    async clientTestimonial(t: any) {
        return await this.testimonialRepo.updateOne({
            _id: new Types.ObjectId(t.id)
        }, {
            comment: t.comment,
            reportQualityRating: t.reportQualityRating,
            supportQualityRating: t.supportQualityRating
        }, {
            upsert: false,
            new: true
        });
    }
}