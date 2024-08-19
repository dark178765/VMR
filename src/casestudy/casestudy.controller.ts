import { Controller, Get, NotFoundException, Param, Render } from "@nestjs/common";
import { FormType } from "src/global/global.constant";
import { CaseStudyService } from "src/index/index.service";

@Controller()
export class CaseStudyController {

    constructor(
        private readonly caseStudyService: CaseStudyService
    ) {

    }

    @Get('case-study/:url')
    @Render('casestudy')
    async casestudy(@Param() pram) {
        let urlSeg = pram.url.split('-');
        let caseStudy = await this.caseStudyService.getCaseStudyByID(urlSeg[urlSeg.length - 1]);
        if (!caseStudy) {
            throw new NotFoundException();
        }

        return {
            caseStudy,
            metatitle: `${caseStudy.Summary} | Vantage Market Research`,
            metadescription: `${caseStudy.Summary} | ${caseStudy.Keyword} - Case Study | Vantage Market Research`,
            metakeywords: `${caseStudy.Summary}, ${caseStudy.Keyword} | Vantage Market Research`,
            formType: FormType.ContactUs
        }
    }
}