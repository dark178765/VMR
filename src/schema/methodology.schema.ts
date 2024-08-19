import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type MethodologyDocument = Methodology & Document;
@Schema({
    collection: 'methodologies'
})
export class Methodology {
    @Prop()
    _id: Types.ObjectId;

    @Prop()
    parentCategory: Types.ObjectId;

    @Prop()
    primaryResearch: String;

    @Prop()
    secondaryResearch: String;

    @Prop()
    sizeEstimation: String;

    @Prop()
    title: String;

    @Prop()
    status: String;
}

export const MethodologySchema = SchemaFactory.createForClass(Methodology);