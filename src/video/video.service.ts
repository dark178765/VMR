import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Video, VideoDocument } from "src/schema/video.schema";
import { Model } from 'mongoose';

@Injectable()
export class VideoService {
    constructor(
        @InjectModel(Video.name)
        private readonly videoModel: Model<VideoDocument>
    ) { }

    async getVideoByReport(reportId: any) {
        let video = await this.videoModel.findOne({
            ReportId: reportId
        })

        return video;
    }
}