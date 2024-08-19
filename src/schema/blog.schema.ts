import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Report } from "./report.schema";
import { ReportV3 } from "./reportv3.schema";


export type BlogDocument = Blog & Document;

@Schema({
    collection: 'blogs'
})
export class Blog {
    @Prop()
    slug: string;

    @Prop()
    updatedAt: Date;

    @Prop()
    description: string;

    @Prop()
    title: string;

    @Prop({ type: Types.ObjectId, ref: ReportV3.name })
    writeupId: any;

    @Prop({ type: Types.ObjectId, ref: Report.name })
    report: any;

    @Prop()
    status: String;

    @Prop()
    createdAt: Date;

    @Prop()
    uniqueId: string;

}

export const BlogSchema = SchemaFactory.createForClass(Blog);