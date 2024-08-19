import { Prop, raw, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ReportV3 } from "./reportv3.schema";
import { ChildCategory } from './childcategory.schema';
import { ParentCategory } from "./parent-category.schema";

export type ReportDocument = Report & Document;

@Schema({
    collection: 'report-v2'
})
export class Report {
    @Prop()
    _id: Types.ObjectId;

    @Prop({ type: [Types.ObjectId], ref: ChildCategory.name })
    childCategory: any[];

    @Prop()
    status: string;

    @Prop()
    deliveryFormat: string;

    @Prop({ type: Types.ObjectId, ref: ParentCategory.name })
    parentCategoryId: ParentCategory;

    @Prop()
    wordTemplate: Types.ObjectId;

    @Prop()
    title: string;

    @Prop()
    slug: string;

    @Prop(raw({}))
    template: Record<string, any>;

    @Prop()
    reportId: string;

    @Prop()
    keyword: string;

    @Prop()
    baseYear: number;

    @Prop()
    historicalData: string;

    @Prop()
    publishedDate: Date;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop(raw({
        textType: { type: String },
        mainContent: { type: String }
    }))
    templates: Record<string, string>

    @Prop(raw({}))
    excelData: Record<string, any>;

    @Prop(raw({}))
    pricingOptions: Record<string, any>

    @Prop({ type: Types.ObjectId, ref: ReportV3.name })
    reportDataId: any;

    @Prop()
    noOfPages: Number;

    @Prop(raw({}))
    metaData: Record<string, any>;

}

export const ReportSchema = SchemaFactory.createForClass(Report);