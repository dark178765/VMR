import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ReportDataDocument = ReportData & Document;

@Schema({
    collection: 'report-v3'
})
export class ReportData {
    @Prop()
    _id: Types.ObjectId;

    @Prop(raw({}))
    drivers: Record<string, any>;

    @Prop(raw({}))
    restrains: Record<string, any>;

    @Prop(raw({}))
    faq: Record<string,any>;

    @Prop()
    reportTitle: String;

    @Prop(raw({}))
    segments: Record<string,any>;

    @Prop(raw({}))
    table: any[];
}

export const ReportDataSchema = SchemaFactory.createForClass(ReportData);


