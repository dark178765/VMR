import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from 'mongoose';


export type RedirectDocument = Redirect & Document;

@Schema({
    collection: 'redirect'
})
export class Redirect {
    @Prop()
    _id: Types.ObjectId;

    @Prop()
    OldUrl: string;

    @Prop()
    NewUrl: string;

}

export const RedirectSchema = SchemaFactory.createForClass(Redirect);