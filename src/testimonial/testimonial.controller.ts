import { Controller, Get, Param, Post, Render, Req } from "@nestjs/common";
import { TestimonialService } from "./testimonial.service";

@Controller()
export class TestimonialController {
    constructor(
        private testimonialService: TestimonialService
    ){}

    @Get('testimonial/:id')
    @Render('submittestimonial')
    async testimonial(@Param() param) {
        let testimonial = await this.testimonialService.getTestimonial(param.id);
        return {
            Keyword: testimonial.reportID?.keyword,
            alreadySubmitted: testimonial.comment !== '',
            fullName: testimonial.fullName,
            emailID: testimonial.emailID,
            company: testimonial.company
        }
    }

    @Post('submit-testimonial')
    async submitTestimonial(@Req() req) {        
        return await this.testimonialService.clientTestimonial(req.body);
    }

    @Post('testimonial/create')
    async create(@Req() req) {
        return await this.testimonialService.createTestimonialLink(req.body);
    }
}