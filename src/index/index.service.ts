import { BlogService } from "src/blog/blog.service";
import { BuynowService } from "src/buynow/buynow.service";
import { CategoryService } from "src/category/category.service";
import { EmailService } from "src/email/email.service";
import { FormService } from "src/form/form.service";
import { RedirectService } from "src/middleware/redirect.service";
import { PressreleaseService } from "src/pressrelease/pressrelease.service";
import { ReportService } from "src/report/report.service";
import { RssService } from "src/rss/rss.service";
import { SampleService } from "src/sample/sample.service";
import { BuynowSchema } from "src/schema/buynow.schema";
import { SearchService } from "src/search/search.service";
import { SitemapSerive } from "src/sitemap/sitemap.service";
import { CaseStudyService } from "src/casestudy/casestudy.service";
import { VideoService } from "src/video/video.service";
import { TestimonialService } from "src/testimonial/testimonial.service";
import { ChatBotService } from "src/chatbot/chatbot.service";

export default [
    ChatBotService,
    TestimonialService,
    VideoService,
    CaseStudyService,
    BuynowService,
    EmailService,
    SampleService,
    RssService,
    SearchService,
    SitemapSerive,
    PressreleaseService,
    BlogService,
    FormService,
    CategoryService,
    ReportService,
    PressreleaseService,
    RedirectService
];

export {
    ChatBotService,
    TestimonialService,
    VideoService,
    CaseStudyService,
    BuynowService,
    EmailService,
    SampleService,
    RssService,
    SearchService,
    SitemapSerive,
    BlogService,
    FormService,
    CategoryService,
    ReportService,
    PressreleaseService,
    RedirectService
};