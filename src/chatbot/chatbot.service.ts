import { Injectable } from "@nestjs/common";
import { Configuration, OpenAIApi } from "openai";
import { config } from './openai.config';
import { InjectModel } from "@nestjs/mongoose";
import { Chatbot, ChatbotDocument } from "src/schema/chatbot.schema";
import { Model, Types } from 'mongoose';
import * as moment from "moment";
import { FormService } from "src/form/form.service";



@Injectable()
export class ChatBotService {
    constructor(
        @InjectModel(Chatbot.name) private chatbotModel: Model<ChatbotDocument>,
        private leadService: FormService
    ) {

    }
    async complete(reportInfo, prompt, ip, reportData, context: any[] = []) {

        if (await this.checkCredits(ip, prompt, '')) {
            const configuation = new Configuration({
                apiKey: config.APIKey
            });

            const openai = new OpenAIApi(configuation);
            try {

                const completion = await openai.createChatCompletion({
                    max_tokens: 50,
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system', content: `
                        you are ${reportInfo.Keyword} report bot
                        response should not be more than 300 words, even if user give number of words
                        always mention Vantage Market Research
                        always say according to Vantage Market Research
                        do not mention other market research companies
                        do not mention OpenAI and information about ChatGPT
                        if response is negative then just contact us for more information
                        do not mention that information is not found or not available or don't have that information
                        if no data found for user query then echo exact following text: The information can only be given by our analyst. Please send the sample request with your specific requirements.
                        strictly answer only those questions which are depend on following information:
                        Purpose: To answer the questions which are related to Vantage Market Research's data
                        Keyword: ${reportInfo.Keyword}
                        Base Year:	2022
                        Forecast YearsForecast Years:	2023 - 2030
                        Historical YearsHistorical Years:	2017 - 2021
                        Revenue 2022Revenue 2022:	${reportInfo.Revenue_Current}
                        Revenue 2030Revenue 2030:	${reportInfo.Revenue_Forecast}
                        Revenue CAGRRevenue CAGR (2023 - 2030):	${reportInfo.CAGR_Revenue}
                        Fastest Growing Region Fastest Growing Region (2023 - 2030): ${reportInfo.Fastest_Region}
                        Largest Region Largest Region (2022):	${reportInfo.Largest_Region}
                        Segments Covered: ${reportInfo.segments.map(s => s).join('\n')}
                        Regions & Countries Covered: North America - (U.S., Canada, Mexico)
                        Europe - (U.K., France, Germany, Italy, Spain, Rest Of Europe)
                        Asia Pacific - (China, Japan, India, South Korea, South East Asia, Rest Of Asia Pacific)
                        Latin America - (Brazil, Argentina, Rest Of Latin America)
                        Middle East & Africa - (GCC Countries, South Africa, Rest Of Middle East & Africa)
                        Companies Covered: ${reportInfo.Players}
                        Report Coverage: Market growth drivers, restraints, opportunities, Porter’s five forces analysis, PEST analysis, value chain analysis, regulatory landscape, technology landscape, patent analysis, market attractiveness analysis by segments and North America, company market share analysis, and COVID-19 impact analysis
                        Customisation: Available
                        Discount: Yes
                        After purchase support: yes
                        20 hours of free analyst support after purchase
                        mention following text when user ask about companies: Companies are not limited, you can always ask for the additional company information
                        no data found: Send us sample request
                        `,
                        },
                        ...context,
                        {
                            role: 'user', content: prompt
                        }]

                });

                let generatedText = completion.data.choices[0].message.content;

                generatedText = generatedText.replace(/\n/gmi, '<br/>');

                let saveRes = await this.saveResponse(ip, prompt, generatedText, reportData);

                return { generatedText, id: saveRes[0]._id.toString() };
            } catch (exception) {
                console.log('Exception', exception);
            }
        }

        return null;
    }

    async checkCredits(ip: string, prompt: string, res: string) {

        let maxCredits = 1;

        let rec = await this.chatbotModel.find({
            IP: ip
        }).sort({
            _id: -1
        });

        if (rec && rec.length > 0) {
            if (moment(rec[0].date).add(24, 'h') <= moment(new Date()) || rec.length <= 1) {
                return true;
            }
            return false;
        }
        return true;
    }

    async saveResponse(ip: string, prompt: string, res: string, reportData: any) {
        return await this.chatbotModel.insertMany([{
            _id: new Types.ObjectId(),
            IP: ip,
            date: new Date(),
            chatResponse: res,
            prompt,
            Keyword: reportData.Keyword,
            reportId: new Types.ObjectId(reportData.reportId)
        }]);
    }

    async loadMore(id, chatId, reportInfo, ip, reportData) {
        let chat = await this.chatbotModel.findById(new Types.ObjectId(chatId));

        let prompts: string[] = [];

        // if(chat.chatResponse.toString().indexOf('I\'m sorry, ') == -1) {
        //     prompts = (await this.complete(reportInfo, '5 question related to previous question, comma seprated without numbering', ip, reportData, [{ role: 'system', content: chat.prompt }])).generatedText.split('<br/>')
        // }

        let lead = await this.leadService.getLeadInformation(id);

        if (lead && lead.reportId.toString() === reportData.reportId) {
            const configuation = new Configuration({
                apiKey: config.APIKey
            });

            prompts = [
                'Definition of the market describe in detail',
                'Top Players describe in detail',
                'How will be the market growing describe in detail',
                'give more information about the market in detail']

            let res = await Promise.all(prompts.map(async (prompt) => {
                return await this.complete(reportInfo, prompt, ip, reportData);
            }))

            return res
        }

        return [];
    }
}