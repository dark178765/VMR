import { Body, Controller, Get, NotFoundException, Param, Post, Render, Req, Res, UseInterceptors } from "@nestjs/common";
import { FormService } from "./form.service";
import { Captcha } from "src/util/captcha";
import { ReportService } from "src/report/report.service";
import { FormType } from "src/global/global.constant";
import { RealIP } from 'nestjs-real-ip';
import { Request, Response } from "express";
import { SanitizeInputInterceptor } from "src/middleware/sanitinze.inputs";
import { VerifyEmail } from "src/util/verifyemail";
import { EncryptDescrypt } from "src/util/encrypt";

@Controller()
export class FormController {
    constructor(
        private readonly formService: FormService,
        private readonly reportService: ReportService
    ) { }

    @Post('form/submit')
    @UseInterceptors(SanitizeInputInterceptor)
    async submit(@Req() req: Request, @RealIP() ip: string) {
        req.session['FillForm'] = 'yes';

        //let token = new EncryptDescrypt().encrypt(req.body.captcha);
        //if (req.body.token == token) {
        if (req.session[`captcha_${req.body.formType}`] == req.body.captcha) {
            //reset the captcha in session
            let res: any = await this.formService.submit(req.body, ip);

            if (res.success && res.success == true) {
                req.session[`captcha_${req.body.formType}`] = null;
                return {
                    success: res.success,
                    leadid: res.leadId,
                    formType: req.body.formType,
                    reportUrl: req.body?.reportUrl
                };
            } else {
                return {
                    success: res.success,
                    validationError: res.controlValidations,
                    message: res.message
                }
            }
        } else {
            return {
                success: false,
                message: 'Invalid Captcha'
            };
        }
    }

    @Get(['industry-report/:url/request-sample', 'industry-report/:url/customization-request',
        'industry-report/:url/contact-analyst', 'industry-report/:url/inquiry-before-buying', 'reports/:url/request-sample'])
    async redirectSample(@Res() res: Response, @Param() pram, @Req() req) {
        let redirection = req.url.split('/');

        res.redirect(`/${pram.url}/${redirection[redirection.length - 1]}`, 301);
    }

    @Get([':url/request', ':url/customization', ':url/sample-request'])
    async redirectRequestAndCustom(@Res() res, @Param() pram, @Req() req) {
        let redirection = req.url.split('/');
        let modifyUrl = redirection[redirection.length - 1] == 'request' || redirection[redirection.length - 1] == 'sample-request' ? 'request-sample' : 'customization-request';
        res.redirect(`/${pram.url}/${modifyUrl}`, 301);
    }

    @Get([':url/request-sample', ':url/customization-request', ':url/contact-analyst', ':url/inquiry-before-buying'])
    @Render('newform')
    async sampleRequest(@Param() pram, @Req() req: Request, @Res() res) {

        let report = await this.reportService.getReport(pram.url);

        if (!report)
            throw new NotFoundException();

        let formTitle = this.getFormTitle(req.url) + ' of ' + report.keyword + ' Market';

        if (!report) {
            throw new NotFoundException();
        } else {
            return {
                reportID: report._id,
                formTitle,
                reportTitle: report.title,
                keyword: report.keyword,
                reportUrl: report.slug,
                category: report && report.childCategory && report.childCategory.length > 0 && report.childCategory[0].parentCategoryId && report.childCategory[0].parentCategoryId.length > 0 ? report.childCategory[0].parentCategoryId[0] : {},
                metatitle: `${formTitle} | Vantage Market Research`
            }

        }
    }

    @Get('form/get-form-values/:url?')
    async getFormValues(@Param() pram, @Req() req: Request, @Res() res) {
        let formTitle = req.query.formUrl ? this.getFormTitle(req.query.formUrl) : 'Contact Us';

        let report = pram.url ? await this.reportService.getReport(pram.url) : null;

        let cap = await this.getCaptcha(req.query.formType ?? FormType.SampleRequest);

        let urlSegments = req.query.formUrl ? req.query.formUrl.toString().split('/') : '';

        if (!req.query.formType) {
            req.session[`captcha_${this.formService.getFormType(urlSegments[urlSegments.length - 1])}`] = cap.captchaString;
        } else {
            req.session[`captcha_${req.query.formType}`] = cap.captchaString;

        }

        let r = report ? {
            reportTitle: report.title
                .replace('2016 - 2021', '2017 - 2022')
                .replace('2022 - 2028', '2023 - 2030').replace('2021 – 2028', '2023 - 2030'),
            reportId: report._id,
            reportUrl: 'https://www.vantagemarketresearch.com/industry-report/' + report.slug,
            tocUrl: '/toc/' + report.slug,
            Referer: req.get('Referer')
        } : {};

        //let token = new EncryptDescrypt().encrypt(cap.captchaString);

        req.query.formType ? res.json({
            formType: FormType.ContactUs,
            title: 'Contact Us',
            captcha: cap.dataUrl,
            countries: await this.formService.getAllCountries(),
            ...r
        }) : res.json({
            formType: this.formService.getFormType(urlSegments[urlSegments.length - 1]),
            title: formTitle,
            reportTitle: report.title
                .replace('2016 - 2021', '2017 - 2022')
                .replace('2022 - 2028', '2023 - 2030').replace('2021 – 2028', '2023 - 2030'),
            reportId: report._id,
            reportUrl: 'https://www.vantagemarketresearch.com/industry-report/' + report.slug,
            tocUrl: '/toc/' + report.slug,
            captcha: cap.dataUrl,
            countries: await this.formService.getAllCountries(),
            Referer: req.get('Referer')
        });
    }

    @Get('refresh-captcha/:formType')
    async refreshCaptcha(@Param() pram, @Req() req: Request, @Res() res) {
        let d = new EncryptDescrypt();
        let cap = await this.getCaptcha(pram.formType);

        console.log('captcha', cap);

        let encrypted = d.encrypt(JSON.parse(JSON.stringify(cap)).captchaString.toString());
        console.log('encry', encrypted)

        req.session[`captcha_${pram.formType}`] = cap.captchaString.toString();
        req.session.save(err => {
            if (err)
                this.refreshCaptcha(pram, req, res);
        })
        res.set('X-Robots-Tag', 'noindex');
        res.json({ captcha: cap.dataUrl, encode: encrypted });
    }

    getFormTitle(f) {
        let rf = f.split('/');
        let formTitle = '';
        switch (rf[rf.length - 1].split('?')[0]) {
            case 'request-sample':
                formTitle = 'Request Sample Report';
                break;
            case 'customization-request':
                formTitle = 'Customization Request';
                break;
            case 'contact-analyst':
                formTitle = 'Speak To Analyst';
                break;
            case 'inquiry-before-buying':
                formTitle = 'Inquiry Before Buying';
                break;
        }
        return formTitle;
    }

    @Get([':url/:formType/:leadid/thank-you', '/:leadid/thank-you'])
    @Render('thanks')
    async thanks(@Param() pram, @Req() req) {

        if (req.session['FillForm'] == null) {
            throw new NotFoundException();
        }

        req.session['FillForm'] = null;

        let leadInfo = await this.formService.getLeadInformation(pram.leadid);

        if (leadInfo && leadInfo.createdAt == new Date()) {

        }

        let report = pram.url ? await this.reportService.getReport(pram.url) : null;
        return {
            reportTitle: report ? report.title : '',
            slug: report ? report.slug : ''
        };
    }


    async getCaptcha(formType) {
        let token = await this.formService.getRandomToken(formType, formType);
        return new Captcha().getCaptcha(token);
    }

    @Post('form/submit-popup')
    async submitPopup(@Req() req, @RealIP() ip: string) {
        let d = new EncryptDescrypt();

        // if (req.body.token == d.encrypt(req.body.captcha)) {
        if (req.session[`captcha_${req.body.formType}`] == req.body.captcha || req.session[`captcha_7`] == req.body.captcha || d.decrypt(req.body.encode) == req.body.captcha) {

            if (await VerifyEmail.verify(req.body.businessEmail)) {

                let st = await this.formService.submitPopup({
                    firstName: req.body.name,
                    formType: FormType.PopUp,
                    businessEmail: req.body.businessEmail,
                    comment: req.body.message,
                    phNo: req.body.phNo,
                    reportId: req.body.reportId,
                    company: req.body.company
                }, ip);


                let report = await this.reportService.getReportById(req.body.reportId);

                let formModel = req.body;
                formModel['firstName'] = req.body.name;
                formModel['isChatBot'] = req.body.formType == 10;
                formModel['Source'] = 1;
                formModel['formType'] = FormType.PopUp;
                formModel['comment'] = req.body.message;
                formModel['title'] = report.title;
                formModel['reportUrl'] = `https://www.vantagemarketresearch.com/industry-report/${report.slug}`;
                formModel['ipAddress'] = ip;

                this.formService.sendLeadToCRM(formModel);

                if (st) {
                    st['formType'] = FormType.PopUp;
                    st['isChatBot'] = formModel['isChatBot'];
                    this.formService.sendPopupEmail({
                        ...st.toJSON(),
                        isChatBot: formModel['isChatBot'], formType: FormType.PopUp
                    });
                }

                return st ? { success: true, id: st._id } : { success: false };
            } else {
                return {
                    success: false, emailError: true, message: 'Invalid Email'
                }
            }
        } else {
            return { success: false, message: 'Invalid Captcha' };
        }
    }

    @Post('form/send-mail')
    async sendmail(@Req() req) {
        if (req.body?.ClientCompany && req.body?.ClientDesignation) {
            await this.formService.sendLeadEmail({
                firstName: req.body.ClientName,
                businessEmail: req.body.ClientEmail,
                country: req.body.ClientCountry,
                phNo: req.body.ClientPhone,
                jobTitle: req.body.ClientDesignation,
                company: req.body.ClientCompany,
                comment: req.body.ClientComment,
                formType: req.body.FormType,
                reportUrl: req.body.ReportUrl,
                title: req.body.ReportTitle,
                source: req.body?.Source,
                ipAddress: req.body?.ClientIP
            }, false);

        } else {
            await this.formService.sendPopupEmail({
                firstName: req.body.ClientName,
                formType: FormType.PopUp,
                businessEmail: req.body.ClientEmail,
                comment: req.body.ClientComment,
                phNo: req.body.ClientPhone,
                reportId: 0,
                company: '',
                ReportTitle: req.body.ReportTitle,
                ReportUrl: req.body.ReportUrl,
                source: req.body?.Source,
                ipAddress: req.body?.ClientIP
            });
        }

        return {};
    }

    @Post('verify-email')
    async VerifyEmail(@Req() req) {
        return await VerifyEmail.verify(req.body.email);
    }

    @Post('vpoint-request')
    async VantagePointRequest(@Req() req, @RealIP() ip: string) {
        if (req.session[`captcha_${req.body.formType}`] == req.body.Captcha) {
            return await this.formService.saveVantagePointRequest(req.body, ip);
        } else {
            return { success: false, message: 'Invalid Captcha' }
        }
    }
}