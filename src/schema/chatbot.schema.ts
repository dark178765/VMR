import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import * as mongoose from "mongoose";

import { Types, Document } from 'mongoose';

export type ChatbotDocument = Chatbot & Document;

//var Schema = mongoose.Schema;

@Schema({
    collection: 'chatbot'
})
export class Chatbot {
    @Prop()
    _id: Types.ObjectId;
    
    @Prop()
    IP: string;

    @Prop()
    date: Date;

    @Prop()
    prompt: string;

    @Prop()
    chatResponse: mongoose.Schema.Types.Mixed;

    @Prop()
    reportId: mongoose.Schema.Types.ObjectId;

    @Prop()
    Keyword: string;
}

export const ChatbotSchema = SchemaFactory.createForClass(Chatbot);