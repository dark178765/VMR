import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from 'mongoose';

export type PRWriteupDocument = PrWriteup & Document;
@Schema({
    collection: 'prwriteups'
})
export class PrWriteup {
    @Prop()
    _id: Types.ObjectId;

    @Prop()
    pr: Types.ObjectId;

    @Prop()
    description: string;
}

export const PrWriteupSchema = SchemaFactory.createForClass(PrWriteup);