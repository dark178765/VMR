import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ParentCategory } from "./parent-category.schema";

export type ChildCategoryDocument = ChildCategory & Document;
@Schema({
    collection: 'child-categories'
})
export class ChildCategory {
    @Prop()
    _id: Types.ObjectId;

    @Prop()
    title: String;

    @Prop()
    slug: String;

    @Prop({ type: String, enum: ['Active', 'Inactive'], default: 'Active' })
    status: String;

    @Prop()
    uniqueId: String;

    @Prop({ type: [Types.ObjectId], ref: ParentCategory.name })
    parentCategoryId: ParentCategory[];
}

export const ChildCategorySchema = SchemaFactory.createForClass(ChildCategory);