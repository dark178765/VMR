import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Report } from "./report.schema";
import { ReportV3 } from "./reportv3.schema";

export type PressreleaseDocument = Pressrelease & Document;

@Schema({
    collection: 'press-releases'
})
export class Pressrelease {
    @Prop()
    createdAt: Date;

    @Prop()
    slug: string;

    @Prop()
    updatedAt: Date;

    @Prop()
    title: string;

    @Prop()
    description: string;

    @Prop({ type: Types.ObjectId, ref: Report.name })
    report: any;

    @Prop({ type: Types.ObjectId, ref: ReportV3.name })
    writeup: any;

    @Prop()
    prtype: string;

    @Prop()
    status: string;
}

export const PressreleaseSchema = SchemaFactory.createForClass(Pressrelease);