import { CacheInterceptor, Controller, Get, NestInterceptor, Redirect, Render, Req, Res, UseInterceptors } from "@nestjs/common";
import { FormService } from "src/form/form.service";
import { PressreleaseService } from "src/pressrelease/pressrelease.service";
import { FormType } from "src/global/global.constant";
import { ReportService } from "src/report/report.service";
import { BlogService } from "src/blog/blog.service";
import { CategoryService } from "src/category/category.service";
import { CaseStudyService } from "src/casestudy/casestudy.service";
import * as hbs from 'hbs';
import { readFileSync } from "fs";
import { join } from "path";
import * as HTMLParser from 'node-html-parser';

@Controller()
export class HomeController {
    constructor(
        private readonly reportService: ReportService,
        private readonly pressreleaseService: PressreleaseService,
        private readonly formService: FormService,
        private readonly blogService: BlogService,
        private readonly categoryService: CategoryService,
        private readonly caseStudyService: CaseStudyService
    ) {

    }

    @Get()
    @UseInterceptors(CacheInterceptor)
    @Render('home')
    async index(@Res() res, @Req() req) {
        let reports = [];
        reports = await this.reportService.getRecentReports(6);

        let pr = await this.pressreleaseService.getrecentPressrelease(6);

        let latestBlogs = await this.blogService.getRecenetBlogs(6);

        let categories = await this.categoryService.getAllCategories();

        let caseStudies = await this.caseStudyService.getCaseStudies(null, null);

        let recentReports = [];

        await reports.reduce(async (preit, cuit, cind) => {
            let item = await cuit;
            if (!item.reportDataId) {
                let keyinsight = JSON.parse(JSON.stringify(item.templates)).filter(x => {
                    return x.textType == 'keyInsights' || x.textType == 'imageWithValue';
                });

                recentReports.push({
                    reportTitle: item.keyword,
                    reportDescription: keyinsight[0].mainContent,
                    url: item.slug,
                    category: {
                        title: item.childCategory[0].title, slug: item.childCategory[0].slug,
                        parentCategory: item.parentCategoryId[0]
                    },
                    singleUser: item.pricingOptions.singleUser
                });
            } else {
                let reportData = await this.reportService.getReportData(item.reportDataId);
                let html = this.reportService.getReportDescription(reportData, item.keyword).replace(/(<([^>]+)>)/igm, '').substring(0, 300);

                recentReports.push({
                    reportTitle: item.keyword,
                    reportDescription: html,
                    url: item.slug,
                    category: { title: item.childCategory[0].title, slug: item.childCategory[0].slug },
                    singleUser: item.pricingOptions.singleUser,
                    imageThumbnail: item.keyword,
                    parentCategory: item.childCategory[0].parentCategoryId[0]
                });
            }
        }, undefined);


        return {
            canonical: `/`,
            caseStudies,
            recentReports,
            recentPressrelease: pr,
            latestBlogs,
            categories: categories.map(x => {
                x['CategoryImage'] = `${x.title.trim().replace(/&/gmi, 'and').replace(/\s/gmi, '-')}.webp`;
                return x;
            }),
            metatitle: 'Vantage Market Research - Business Intelligence | Consulting & Advisory',
            metadescription: 'Vantage Market Research is a technology-driven, technology-enabled market research firm that serves as a one-stop shop for all your research needs. ',
            metakeywords: 'Vantage Market Research, Market Research Trends, Industry Analysis, Trends, Forecast, Market Size, Market Research Reports, Marketing Research Company, Companies, Trends, Competitive Landscape, Demand, Consumption, Production, Revenue, Volume'
        };
    }

    @Get('come-join-us')
    @Render('come-join-us')
    async comejoinus() {
        return {
            metatitle: 'Join Us | Vantage Market Research',
            metadescription: 'Join us for more sophisticated data and analysis',
            metakeywords: 'join us, come join us'
        }
    }

    @Get('customer-faq')
    @Render('customer-faq')
    async customfaq() {
        return {
            metatitle: 'Frequently asked questions | Vantage Market Research',
            metadescription: 'FAQ, Frequently Asked Questions',
            metakeywords: 'FAQ, Frequently Asked Questions'
        }
    }

    @Get('how-to-order')
    @Render('how-to-order')
    async howtoorder() {
        return {
            metatitle: 'How to Order | Vantage Market Research',
            metadescription: 'This page has all methods to buy research report from Vantage Market ResearchVantage Market Research is a reputed company committed to providing high quality data and market research services in more than 20,000 emerging markets covering multiple industries including chemical materials and energy, food and beverages, healthcare, technology, etc. Vantage Market Research caters to 70% of Global Fortune 500 Companies.',
            metakeywords: 'Buy now, order, purchase now'
        }
    }

    @Get('privacy-policy')
    @Render('privacy-policy')
    async privacypolicy() {
        return {
            metatitle: 'Privacy Policy | Vantage Market Research',
            metadescription: 'Privacy Policy.',
            metakeywords: 'Privacy Policy'
        }
    }

    @Get('terms-of-services')
    @Render('terms-of-services')
    async termofservices() {
        return {
            metatitle: 'Terms of Services | Vantage Market Research',
            metadescription: 'Terms of Services, Terms and Conditions',
            metakeywords: 'Terms of Services, Terms and Conditions, terms and conditions, tnc'
        }
    }


    @Get('/about/us')
    async oldabout(@Res() res) {
        res.redirect('/about-us', 301);
    }

    @Get(['/about-us', '/about/us'])
    @Render('about')
    about(@Req() req, @Res() res) {

        // if (req.hostname.indexOf('vantagemarketresearch.com') > -1)
        //     res.redirect(301, 'https://www.vmr.biz/about-us');

        return {
            metatitle: 'About Us | Vantage Market Research',
            metadescription: 'Vantage Market Research leading technology driven market research company',
            metakeywords: 'market research, technology, technology driven, technology driven market research company'
        }
    }

    @Get('why-us')
    @Render('whyus')
    async whyus() {
        return {
            metatitle: 'Why you should choose Vantage Market Research for your market research needs?',
            metadescription: 'Vantage Market Research is one of most trusted and top market research company. Vantage has expert teams to do market research.',
            metakeywords: 'Vantage Market Research, Market Research Trends, Industry Analysis, Trends, Forecast, Market Size, Market Research Reports, Marketing Research Company, Companies, Trends, Competitive Landscape, Demand, Consumption, Production, Revenue, Volume'
        }
    }

    @Get(['contact-us', 'talk-to-analyst'])
    @Render('contact')
    async contactus(@Req() req) {
        let cap = await this.formService.getCaptcha(FormType.ContactUs);

        let l = req.url.split('/');

        let x = l[l.length - 1] == 'talk-to-analyst' ? 'Talk to analyst' : 'Contact Us'

        return {
            metatitle: `${x} | Vantage Market Research`,
            metadescription: `${x} | You can talk to analyst or Contact Us for more details`,
            metakeywords: `${x}, Analyst, contact`,
            formType: FormType.ContactUs,
            captcha: cap.dataUrl,
            countries: await this.formService.getAllCountries(),
            title: 'Contact Us',
            removeNoIndex: true
        }
    }

    @Get('contact')
    @Render('duplicateContactForm')
    async duplicateContact() {
        let cap = await this.formService.getCaptcha(FormType.ContactUs);
        return {
            metatitle: 'Contact Us | Vantage Market Research',
            formType: FormType.ContactUs,
            captcha: cap.dataUrl,
            countries: await this.formService.getAllCountries(),
            title: 'Contact Us',
            removeNoIndex: true
        }
    }

    @Get('consulting-and-advisory')
    @Render('consulting')
    async consultingandadvisory() {
        return {
            metatitle: 'Consulting and Advisory Services | Vantage Market Research',
            metakeywords: 'Consulting, consulting and advisory, consulting projects',
            metadescription: 'Consulting & Advisory - Vantage Market Research provides a wide range of consulting and advisory services to help our clients succeed in the modern market research landscape. Our team of experienced consultants can help organizations with market sizing and forecasting, primary and secondary research, data analysis, and interpretation'
        }
    }

    @Get('off-the-shelf-research')
    @Render('offtheshelf')
    async offtheshelfresearch() {
        return {
            metatitle: 'Off-the-Shelf Research | Vantage Market Research',
            metakeywords: 'Off-the-Shelf Research, off the shelf research, off the shelf, syndicate research, syndicate market research',
            metadescription: 'Off-the-Shelf Research - Vantage Market Research provides Off-the-Shelf Research'
        }
    }

    @Get('data-analytics')
    @Render('dataanalytics')
    async dataanalytics() {
        return {
            metatitle: 'Data Analytics | Vantage Market Research',
            metakeywords: 'Data Analytics',
            metadescription: 'Data Analytics - Vantage Market Research has team to analyse data to get insights'
        }
    }

    @Get('technology-solutions')
    @Render('technologysolutions')
    async technologysolutions() {
        return {
            metatitle: 'Technology Solutions | Vantage Market Research',
            metakeywords: 'Technology Solutions',
            metadescription: 'Technology Solutions - Vantage Market Research provides technology solutions to all type business, such as Mobile Application Development, Web Application Development'
        }
    }

    @Get('concept')
    @Render('concept')
    async concept() {
        return {
            metatitle: 'Concept | Vantage Market Research',
            metakeywords: 'Concept of Vantage Market Research',
            metadescription: 'Concept of Vantage Market Research'
        }
    }

    @Get('consumer-survey')
    @Render('consumer-survey')
    async consumersurvey() {
        return {
            metatitle: 'Consumer Survey | Vantage Market Research',
            metadescription: 'How can brands stay relevant today? | Check Consumer Survey | Vantage Market Research',
            metakeywords: 'Consumer Survery, consumer research | Vantage Market Research'
        }
    }

    @Get('vision')
    @Render('vision')
    async vision() {
        return {
            metatitle: 'Vision | Vantage Market Research',
            metadescription: 'Vision | Vantage Market Research',
            metakeywords: 'Vision, VMR Vision, Vantage Market Research Vision'
        }
    }

    @Get('the-vantage-point')
    // @Render('the-vantage-point')
    @Redirect('vantage-point', 301)
    async thevantagepoint() {
        return {
            metatitle: 'The Vantage Point | VP Plus | Business Intelligence | Market Insights | BI | Vantage Market Research',
            metadescription: 'Powerful BI to visualize data',
            metakeywords: 'BI, Business Intelligence, Market Insights, VMR'
        }
    }

    @Get('values')
    @Render('values')
    async values() {
        return {
            metatitle: 'Vantage - The Values | Vantage Market Research',
            metadescription: 'Vantage The Values',
            metakeywords: 'Values, Vantage - The Values'
        };
    }


    @Get('career')
    @Render('career')
    async career() {
        return {
            metatitle: 'Career | Vantage Market Research',
            metadescription: 'Join Vantage Market Research | Open Positions | Job Opportunity',
            metakeywords: 'Join Vantage Market Research, Open Positions, Job Opportunity'
        }
    }

}