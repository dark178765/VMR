import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId, Types } from "mongoose";
import { EmailService } from "src/email/email.service";
import { FormType } from "src/global/global.constant";
import { ReportService } from "src/report/report.service";
import { Lead, LeadDocument } from "src/schema/lead.schema";
import { Captcha } from "src/util/captcha";
import { FormEntity } from "./form.entity";
import { request } from "http";
import axios from "axios";

import * as allCountries from './countrydata.json';

@Injectable()
export class FormService {
    constructor(
        @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
        private readonly emailService: EmailService,
        private readonly reportService: ReportService
    ) { }


    async createLead(formModel: FormEntity, ipAddress: string) {
        let objID = Types.ObjectId;
        let lead: any = await this.leadModel.findOneAndUpdate({
            _id: new objID()
        }, {
            businessEmail: formModel.businessEmail,
            comment: formModel.comment,
            company: formModel.company,
            country: formModel.country,
            createdAt: new Date(),
            firstName: formModel.firstName,
            formName: this.getFormName(formModel.formType),
            ipAddress: ipAddress,
            jobTitle: formModel.jobTitle,
            lastName: "",
            phNo: formModel.phNo,
            reportId: new objID(formModel.reportId),
            updatedAt: new Date(),
            leadId: await this.gencode(),
            title: formModel.title
        }, {
            new: true,
            upsert: true
        });

        if (lead) {
            return {
                leadId: lead._id,
                success: true
            };
        }

        return {
            success: false
        };
    }

    async submitPopup(popupForm: any, ip: string) {
        let popup = await this.leadModel.findByIdAndUpdate(new Types.ObjectId(), {
            firstName: popupForm.firstName,
            businessEmail: popupForm.businessEmail,
            phNo: popupForm.phNo,
            comment: popupForm.comment,
            reportId: new Types.ObjectId(popupForm.reportId),
            leadId: await this.gencode(),
            ipAddress: ip,
            formName: this.getFormName(popupForm.formType.toString()),
            company: popupForm.company,
            createdAt: new Date()
        }, {
            upsert: true,
            new: true
        });

        if (popup)
            return popup;
        else
            false;
    }

    async submit(formModel: any, ip: string) {

        let validations = this.validateForm(formModel);

        if (validations.length > 0) {
            return {
                success: false,
                message: 'Validation Error',
                controlValidations: validations
            }
        }

        let res = await this.createLead(formModel, ip);

        formModel.ipAddress = ip;

        formModel['Source'] = 1;

        try {
            await this.sendLeadToCRM(formModel);
        } catch (ex) { }
        if (res.success) {
            await this.sendLeadEmail(formModel)
        }

        return res;
    }

    async sendLeadToCRM(formModel: any) {
        try {
            let crmUrl = process.env.CRM_URL;
            let res = await axios.post(crmUrl, formModel);
            return res;
        } catch (ex) {
            console.log('Error while sending to CRM', ex);
        }
        return null;
    }

    async sendLeadEmail(formValues: FormEntity, sendMailToUser = true) {
        let report = formValues.formType !== FormType.ContactUs && formValues.reportId ? await this.reportService.getReportById(formValues.reportId) : null;
        formValues['ref'] = report ? `https://www.vantagemarketresearch.com/industry-report/${report.slug}` : formValues.reportUrl && formValues.reportUrl !== '' ? formValues.reportUrl : '';
        let formSubject = this.getFormName(formValues.formType);

        formValues['title'] = report ? report.title
            .replace('2016 - 2021', '2017 - 2022')
            .replace('2022 - 2028', '2023 - 2030')
            .replace('2021 – 2028', '2023 - 2030') : formValues['title']
                .replace('2016 - 2021', '2017 - 2022')
                .replace('2022 - 2028', '2023 - 2030')
                .replace('2021 – 2028', '2023 - 2030')

        if (sendMailToUser) {
            //TODO: Send email to user
            await this.emailService.sendEmail('Vantage Market Research <sales@vantagemarketresearch.com>',
                formValues.businessEmail, [], [],
                formSubject, (formValues.formType == 11 ? 'vpointrequest.hbs' : 'userEmail.hbs'), formValues, function (err, info) {
                    if (err)
                        console.log(err);

                    //console.log(info);
                });
        }

        //TODO: send email to admin
        await this.emailService.sendEmail('Vantage Market Research <sales@vantagemarketresearch.com>',
            ['sales@vantagemarketresearch.com',
                'virendra.workmail@gmail.com',
                'susanne.frank@vantagemarketresearch.com',
                'neha@vantagemarketresearch.com',
                'coralia.joe@vantagemarketresearch.com'], [], [], this.getFormName(formValues.formType), 'adminEmail.hbs', formValues,
            (err, info) => {
                if (err)
                    console.log(err);
                //console.log(info);
            }
        );
    }

    async sendPopupEmail(formValues, sendMailToUser = true) {

        if (!formValues.ReportTitle && !formValues.ReportUrl) {
            let report = await this.reportService.getReportById(formValues.reportId);
            formValues['ref'] = 'https://www.vantagemarketresearch.com/industry-report/' + report.slug;
            formValues['title'] = report.title;
        } else {
            formValues['ref'] = formValues.ReportUrl;
            formValues['title'] = formValues.ReportTitle;
        }

        if (sendMailToUser) {
            //TODO: Send email to user
            await this.emailService.sendEmail('Vantage Market Research <sales@vantagemarketresearch.com>',
                formValues.businessEmail, [], [],
                'Popup', 'userEmail.hbs', formValues, function (err, info) {
                    if (err)
                        console.log(err);

                    //console.log(info);
                });
        }

        //TODO: send email to admin
        await this.emailService.sendEmail('Vantage Market Research <sales@vantagemarketresearch.com>',
            ['sales@vantagemarketresearch.com'], [], [
            'virendra.workmail@gmail.com',
            'susanne.frank@vantagemarketresearch.com',
            'neha@vantagemarketresearch.com',
            'coralia.joe@vantagemarketresearch.com'], 'Popup' + (formValues['isChatBot'] && formValues['isChatBot'] === true ? ' (ChatBot)' : ''), 'adminEmail.hbs', formValues,
            (err, info) => {
                if (err)
                    console.log(err);
                //console.log(info);
            }
        );
    }

    getFormName(formType) {
        let formName = '';
        switch (parseInt(formType)) {
            case 1:
                formName = 'Request Sample';
                break;
            case 2:
                formName = 'Buying Inquiry';
                break;
            case 3:
                formName = 'Contact Us';
                break;
            case 4:
                formName = 'Customization Request';
                break;
            case 5:
                formName = 'Speak To Analyst';
                break;
            case 6:
                formName = 'Not Found';
                break;
            case 7:
                formName = "Popup";
                break;
            case 11:
                formName = 'Vantage Point';
                break;
        }
        return formName;
    }

    getFormType(formName: string) {
        let formType: number;
        switch (formName) {
            case 'request-sample':
                formType = FormType.SampleRequest;
                break;
            case 'customization-request':
                formType = FormType.CustomizationRequest;
                break;
            case 'contact-analyst':
                formType = FormType.SpeakToAnalyst;
                break;
            case 'inquiry-before-buying':
                formType = FormType.BuyingInquiry;
                break;
            case 'buynow':
                formType = FormType.BuyNow;
                break;
        }
        return formType;
    }

    async getAllCountries() {

        return allCountries;
    }

    async getRandomToken(ref, formType) {
        return await this.gencode();
    }

    async gencode() {
        const stringToken = '00000000000000000000111111111111111111112222222222222222222233333333333333333333444444444444444444445555555555555555555566666666666666666666777777777777777777778888888888888888888899999999999999999999';
        let token = '';
        for (let i = 0; i <= 5; i++) {
            token += stringToken[Math.floor(Math.random() * 200)];
        }
        return await token;
    }


    async getCaptcha(formType) {
        let token = await this.getRandomToken(formType, formType);
        let cap = new Captcha().getCaptcha(token);
        return cap;
    }

    validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    validateForm(formData) {
        let validationError = [];
        if (!formData.firstName || formData.firstName == '') {
            validationError.push({
                field: 'firstName',
                messgae: 'Full Name should not be empty'
            });
        }

        if (!formData.businessEmail || formData.businessEmail == '') {
            validationError.push({
                field: 'businessEmail',
                messgae: 'Email ID is required.'
            });
        }

        if (!this.validateEmail(formData.businessEmail)) {
            validationError.push({
                field: 'businessEmail',
                messgae: 'Email ID is invalid.'
            });
        }

        if (!formData.country || formData.country == '') {
            validationError.push({
                field: 'country',
                messgae: 'Please select country.'
            });
        }

        if (!formData.phNo || formData.phNo == '') {
            validationError.push({
                field: 'phNo',
                messgae: 'Phone Number is required.'
            });
        }

        if (!formData.jobTitle || formData.jobTitle == '') {
            validationError.push({
                field: 'jobTitle',
                messgae: 'Job Title is required.'
            });
        }

        if (!formData.company || formData.company == '') {
            validationError.push({
                field: 'company',
                messgae: 'Company is required.'
            });
        }

        if (!formData.comment || formData.comment == '') {
            validationError.push({
                field: 'comment',
                messgae: 'Comment is required.'
            });
        }

        if (!formData.captcha || formData.captcha == '') {
            validationError.push({
                field: 'captcha',
                messgae: 'Captcha is required.'
            });
        }

        if (!formData.formType || formData.formType == '' || formData.formType == 0) {
            validationError.push({
                field: 'formType',
                messgae: 'Form Type is required.'
            });
        }
        return validationError;

    }

    async getLeadInformation(leadID: string) {
        return await this.leadModel.findById(new Types.ObjectId(leadID));
    }

    async saveVantagePointRequest(formData: any, ip: string) {
        let cl = await this.createLead(formData, ip);
        await this.sendLeadToCRM({
            title: formData.reportTitle,
            reportUrl: formData.reportUrl,
            formType: 11,
            firstName: formData.firstName,
            businessEmail: formData.businessEmail,
            phNo: formData.phNo,
            ipAddress: ip,
            Source: 1,
            company: formData.company
        });

        if (cl.success) {
            await this.sendLeadEmail(formData);
        }

        return cl;
    }

}