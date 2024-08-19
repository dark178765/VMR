import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ReportV3Document = ReportV3 & Document;

@Schema({
    collection: 'report-v3'
})
export class ReportV3 {
    @Prop()
    _id: Types.ObjectId;

    @Prop()
    createdAt: Date;

    @Prop()
    createdBy: Types.ObjectId;

    @Prop()
    faq: [];

    @Prop()
    table: [];

    @Prop()
    segments: [];

    @Prop({type: []})
    unprocessedHtml: string | [];

    @Prop()
    drivers: [];

    @Prop()
    restrains: [];

    @Prop()
    updatedAt: Date;

    @Prop()
    reportTitle: string;
}

export const ReportV3Schema = SchemaFactory.createForClass(ReportV3);