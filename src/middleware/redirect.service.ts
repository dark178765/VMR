import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Redirect, RedirectDocument } from "src/schema/redirect.schema";
import { Model } from 'mongoose';

@Injectable()
export class RedirectService {
    @InjectModel(Redirect.name) private redirectModel: Model<RedirectDocument>

    async getRedirectedUrl(url: string) {
        return await this.redirectModel.findOne({
            OldUrl: url
        });
    }

    async findUrl(url) {
        return await this.redirectModel.find({
            OldUrl: url
        });
    }
}