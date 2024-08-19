import { Prop, Schema } from "@nestjs/mongoose";

@Schema({
    collection: 'redirection'
})
export class Redirection {
    @Prop()
    OldUrl: String;

    @Prop()
    NewUrl: String;

    @Prop()
    Status: String;
}