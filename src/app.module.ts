import { CacheModule, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { Axios } from 'axios';
import moment from 'moment';
import { ErrorFilter } from './filters/error.filter';
import { HttpClient } from './httpclient/httpclient';
import CONTROLLERS, { BlogController } from './index/index.controller';
import SERVICES from './index/index.service';
import { BlogSchema } from './schema/blog.schema';
import { LeadSchema } from './schema/lead.schema';
import { PressreleaseSchema } from './schema/pressrelease.schema';
import { ReportSchema } from './schema/report.schema';
import { BuynowSchema } from './schema/buynow.schema';
import { ReportV3Schema } from './schema/reportv3.schema';
import { ReportDataSchema } from './schema/report-data.schema';
import { ImageSchema } from './schema/image.schema';
import { ChildCategorySchema } from './schema/childcategory.schema';
import { MethodologySchema } from './schema/methodology.schema';
import { PrWriteupSchema } from './schema/prwriteup.schema';
import { CustomMiddleware } from './middleware/custom.middleware';
import { RedirectSchema } from './schema/redirect.schema';
import { ParentCategorySchema } from './schema/parent-category.schema';
import { CaseStudySchema } from './schema/casestudy.schema';
import { BlogRedirection } from './middleware/blog.redirection';
import { VideoSchema } from './schema/video.schema';
import { TestimonialSchema } from './schema/testimonial.schema';
import * as redisStore from 'cache-manager-redis-store';
import { ChatbotSchema } from './schema/chatbot.schema';

@Module({
  imports: [ConfigModule.forRoot(), CacheModule.register({
    isGlobal: true,
    store: redisStore,
    host: '44.199.228.86',
    port: 6379,
    password: '1AMTH3800S'
  }),
  //MongooseModule.forRoot(process.env.mongourl),
  // MongooseModule.forRoot('mongodb://localhost:27017/dev-vantage-market-research'),
  MongooseModule.forRoot('mongodb://VantageDBAdmin:166jmAsRt9AoPmSd@34.205.15.69:27017/vantage-market-research?authMechanism=DEFAULT&authSource=admin'),
  MongooseModule.forFeature([
    { name: 'Pressrelease', schema: PressreleaseSchema },
    { name: 'Blog', schema: BlogSchema },
    { name: 'Report', schema: ReportSchema },
    { name: 'Lead', schema: LeadSchema },
    { name: 'Buynow', schema: BuynowSchema },
    { name: 'ReportV3', schema: ReportV3Schema },
    { name: 'ReportData', schema: ReportDataSchema },
    { name: 'Image', schema: ImageSchema },
    { name: 'ChildCategory', schema: ChildCategorySchema },
    { name: 'Methodology', schema: MethodologySchema },
    { name: 'PrWriteup', schema: PrWriteupSchema },
    { name: 'Redirect', schema: RedirectSchema },
    { name: 'ParentCategory', schema: ParentCategorySchema },
    { name: 'CaseStudy', schema: CaseStudySchema },
    { name: 'Video', schema: VideoSchema },
    { name: 'Testimonial', schema: TestimonialSchema },
    {name: 'Chatbot', schema: ChatbotSchema}
  ])],
  controllers: CONTROLLERS,
  providers: [HttpClient, ...SERVICES, {
    provide: APP_FILTER,
    useClass: ErrorFilter
  }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CustomMiddleware).forRoutes('*');
  }
}
