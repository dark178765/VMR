import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type LeadDocument = Lead & Document;
@Schema({
    collection: 'leads'
})
export class Lead {
    @Prop()
    businessEmail: string;

    @Prop()
    comment: string;

    @Prop()
    company: string;

    @Prop()
    country: string;

    @Prop()
    createdAt: Date;

    @Prop()
    firstName: string;

    @Prop()
    formName: string;

    @Prop()
    ipAddress: string;

    @Prop()
    jobTitle: string;

    @Prop()
    lastName: string;

    @Prop()
    phNo: string;

    @Prop()
    updatedAt: Date;

    @Prop()
    reportId: Types.ObjectId;

    @Prop()
    title: string;

    @Prop()
    leadId: string;

}

export const LeadSchema = SchemaFactory.createForClass(Lead);