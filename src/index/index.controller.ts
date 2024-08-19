import { AppController } from "src/app.controller";
import { BlogController } from "src/blog/blog.controller";
import { BuynowController } from "src/buynow/buynow.controller";
import { CategoryController } from "src/category/category.controller";
import { FormController } from "src/form/form.controller";
import { PressreleaseController } from "src/pressrelease/pressrelease.controller";
import { RssController } from "src/rss/rss.controller";
import { SampleController } from "src/sample/sample.controller";
import { SearchController } from "src/search/search.controller";
import { ServicesController } from "src/services/services.controller";
import { SitempaController } from "src/sitemap/sitemap.comtroller";
import { HomeController } from "../home/home.controller";
import { ReportController } from "../report/report.controller";
import { CaseStudyController } from "src/casestudy/casestudy.controller";
import { ChartImageController } from "src/chart-image/chartimage.controller";
import { TestimonialController } from "src/testimonial/testimonial.controller";
import { ChatbotContorller } from "src/chatbot/chatbot.controller";
import { VPointLaunchController } from "src/vpoint-launch/vpoint-launch.controller";

export default [
    ChatbotContorller,
    TestimonialController,
    ChartImageController,
    CaseStudyController,
    BuynowController,
    SampleController,
    RssController,
    SearchController,
    ServicesController,
    SitempaController,
    PressreleaseController,
    BlogController,
    FormController,
    CategoryController,
    HomeController,
    ReportController,
    VPointLaunchController
];

export {
    VPointLaunchController,
    ChatbotContorller,
    TestimonialController,
    ChartImageController,
    CaseStudyController,
    BuynowController,
    SampleController,
    RssController,
    SearchController,
    ServicesController,
    SitempaController,
    PressreleaseController,
    BlogController,
    FormController,
    CategoryController,
    HomeController,
    ReportController
};