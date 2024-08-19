import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from 'mongoose';
import { Report } from "./report.schema";


export type TestimonialDocument = Testimonial & Document;

@Schema({
    collection: 'testimonial'
})
export class Testimonial {
    @Prop()
    _id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Report.name })
    reportID: any;

    @Prop()
    emailID: String;

    @Prop()
    fullName: string;

    @Prop()
    company: string;

    @Prop()
    comment: string;

    @Prop()
    reportQualityRating: number;

    @Prop()
    supportQualityRating: number;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);