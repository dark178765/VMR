import { Get, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CaseStudy, CaseStudyDocument } from "src/schema/casestudy.schema";
import { Model, Types } from 'mongoose';

@Injectable()
export class CaseStudyService {
    constructor(
        @InjectModel(CaseStudy.name) private caseStudyModel: Model<CaseStudyDocument>
    ) {

    }

    async getCaseStudies(limit, page) {
        return await (limit ? this.caseStudyModel.find().limit(limit).skip(limit * (page - 1)) : this.caseStudyModel.find());
    }

    async getCaseStudyByID(id) {
        return await this.caseStudyModel.findOne({
            _id: new Types.ObjectId(id)
        });
    }
}