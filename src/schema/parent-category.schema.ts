import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ParentCategoryDocument = ParentCategory & Document;
@Schema({
    collection: 'parent-categories'
})
export class ParentCategory {
    @Prop()
    _id: Types.ObjectId;

    @Prop()
    title: String;

    @Prop()
    slug: String;

    @Prop({ type: String, enum: ['Archive', 'Active'], default: 'Active' })
    status: String;
}

export const ParentCategorySchema = SchemaFactory.createForClass(ParentCategory);