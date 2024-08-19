import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Types } from 'mongoose';

export type CaseStudyDocument = CaseStudy & Document;

@Schema({
    collection: 'casestudy'
})
export class CaseStudy {

    @Prop()
    _id: Types.ObjectId;

    @Prop()
    Slug: string;

    @Prop()
    Description: string;

    @Prop()
    Image: string;

    @Prop()
    Summary: string;

    @Prop()
    Keyword: string;

    @Prop()
    CreatedAt: Date;
}

export const CaseStudySchema = SchemaFactory.createForClass(CaseStudy);

