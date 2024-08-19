import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ImageDocument = Image & Document;  

@Schema({
    collection: 'image'
})
export class Image{
    @Prop()
    _id: Types.ObjectId;

    @Prop()
    imageName: String;

    @Prop()
    bucket: String;

    @Prop()
    CreatedAt: Date;

    @Prop()
    UpdatedAt: Date;
}

export const ImageSchema = SchemaFactory.createForClass(Image);