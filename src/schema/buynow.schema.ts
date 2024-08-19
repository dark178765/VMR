import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type BuynowDocument = Buynow & Document;

@Schema({
    collection: 'buynow'
})
export class Buynow {
    @Prop()
    _id: Types.ObjectId;

    @Prop()
    reportId: string;

    @Prop()
    createdDate: Date;

    @Prop()
    fullName: string;

    @Prop()
    phoneNo: string;

    @Prop()
    address: string;

    @Prop()
    country: string;

    @Prop()
    city: string;

    @Prop()
    state: string;

    @Prop()
    email: string;

    @Prop()
    zip: string;

    @Prop()
    paymentThrough: string;

    @Prop()
    paymentType: number;

    @Prop()
    paymentReference: string;

    @Prop()
    paymentStatus: string;

    @Prop()
    reason: string;

    @Prop()
    price: number;

    @Prop()
    selectedRegion: string[];

    @Prop()
    selectedAdOn: string[];

    @Prop()
    license: string;

    @Prop()
    discount: number;

}

export const BuynowSchema = SchemaFactory.createForClass(Buynow)