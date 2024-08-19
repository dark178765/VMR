import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


import { Types, Document } from 'mongoose';
import { Report } from "./report.schema";


export type VideoDocument = Video & Document;

@Schema({
    collection: 'videos'
})
export class Video {
    @Prop()
    _id: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: Report.name })
    ReportId: any;

    @Prop()
    url: String;

    @Prop()
    createdDate: Date;

}

export const VideoSchema = SchemaFactory.createForClass(Video);