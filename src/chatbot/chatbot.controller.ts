import { CACHE_MANAGER, Controller, Get, Inject, Post, Req } from "@nestjs/common";
import { ChatBotService } from "./chatbot.service";
import { ReportService } from "src/report/report.service";
import { Cache } from "cache-manager";
import { RealIP } from "nestjs-real-ip";

@Controller()
export class ChatbotContorller {
    constructor(
        private chatService: ChatBotService,
        @Inject(CACHE_MANAGER) private cacheService: Cache
    ) {}

    @Post('bot-chat')
    async chat(@Req() req, @RealIP() ip) {
        let report: any = await this.cacheService.get(req.body.url);
        return await this.chatService.complete({...report.tableValues, Keyword: report.keyword, segments: report.segments}, req.body.question, ip, 
            { Keyword: report.keyword, reportId: report.rptId});
    }

    @Post('load-more')
    async loadMore(@Req() req, @RealIP() ip) {
        let report: any = await this.cacheService.get(req.body.url);
        return await this.chatService.loadMore(req.body.id, req.body.chatId,
            {...report.tableValues, Keyword: report.keyword, segments: report.segments}, ip, 
            { Keyword: report.keyword, reportId: report.rptId})
    }
}