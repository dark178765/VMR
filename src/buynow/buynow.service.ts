import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { SubscriptionLog } from "rxjs/internal/testing/SubscriptionLog";
import { EmailService } from "src/email/email.service";

@Injectable()
export class BuynowService {
    constructor(
        private readonly emailService: EmailService
    ) { }

    async paymentInitiateMail(reportTitle, reporturl, paymentType, buynow: any, ip: string) {
        let subjectLine = 'Payment Initiated' + (buynow.discount ? `| Congrats ${buynow.discount}% Discount Applied!` : '');

        await this.emailService.sendEmail('', buynow.email, [], [], subjectLine, 'paymentInitiate.hbs',
            { title: reportTitle, firstName: buynow.fullName, ref: reporturl });

        buynow['ref'] = reporturl;

        await this.emailService.sendEmail('', [], [], ['payments@vantagemarketresearch.com',
            'virendra.workmail@gmail.com'], `Payment Inititated Through - ${paymentType}`, 'adminPayment.hbs', {
            fullName: buynow.fullName,
            email: buynow.email,
            phoneNo: buynow.phoneNo,
            country: buynow.country,
            city: buynow.city,
            state: buynow.state,
            zip: buynow.zip,
            paymentThrough: buynow.paymentThrough,
            paymentStatus: buynow.paymentStatus,
            ipAddress: ip,
            title: reportTitle,
            ref: reporturl,
            address: buynow.address,
            //license: buynow.paymentType == 0 ? 'Single User' : buynow.paymentType == 1 ? 'Multi User' : buynow.paymentType == 2 ? 'Corporate User' : 'Single User',
            license: buynow.license,
            Price: buynow.price,
            Regions: buynow.selectedRegion ? buynow.selectedRegion.map(x => x.fullName).join(', ') : '',
            AddOn: buynow.selectedAdOn ? buynow.selectedAdOn.map(x => x.fullName).join(', ') : '',
            discount: (buynow.discount ? buynow.discount : '0') + '%'
        });
    }

    async sendPaymentUpdateMail(reportTitle, reporturl, paymentType, buynow: any, ip: string) {
        buynow['ref'] = reporturl;

        await this.emailService.sendEmail('', [], [], ['payments@vantagemarketresearch.com',
            'virendra.workmail@gmail.com'], `Update Payment Information - ${paymentType}`, 'adminPayment.hbs', {
            fullName: buynow.fullName,
            email: buynow.email,
            phoneNo: buynow.phoneNo,
            country: buynow.country,
            city: buynow.city,
            state: buynow.state,
            zip: buynow.zip,
            paymentThrough: buynow.paymentThrough,
            paymentStatus: buynow.paymentStatus,
            ipAddress: ip,
            title: reportTitle,
            ref: reporturl,
            address: buynow.address,
            //license: buynow.paymentType == 0 ? 'Single User' : buynow.paymentType == 1 ? 'Multi User' : buynow.paymentType == 2 ? 'Corporate User' : 'Single User',
            license: buynow.license,
            Price: buynow.price,
            Regions: buynow.selectedRegion ? buynow.selectedRegion.map(x => x.fullName).join(', ') : '',
            AddOn: buynow.selectedAdOn ? buynow.selectedAdOn.map(x => x.fullName).join(', ') : '',
            discount: (buynow.discount ? buynow.discount : '0') + '%'
        });
    }

    calculateDiscount(detail, price) {
        let discount = detail.couponCode && detail.couponCode == process.env.COUPON_CODE && moment() <= moment(process.env.DISCOUNT_LAST_DATE, 'MM-DD-YYYY') ? parseInt(process.env.DISCOUNT) : 0;
        return price - (price * (discount / 100));
    }

    getDiscount(couponCode) {
        return couponCode && couponCode.toUpperCase() == process.env.COUPON_CODE && moment() <= moment(process.env.DISCOUNT_LAST_DATE, 'MM-DD-YYYY') ? parseInt(process.env.DISCOUNT) : 0;
    }

    async paymentSuccessMail(reportTitle, reporturl, paymentType, buynow: any) {
        await this.emailService.sendEmail('', buynow.email, [], [], 'Payment Success!!!', 'paymentStatus.hbs',
            { title: reportTitle, firstName: buynow.fullName, paymentStatus: 'S' });

        await this.emailService.sendEmail('', [], [], ['payments@vantagemarketresearch.com',
            'virendra.workmail@gmail.com'], `Payment Success Through - ${paymentType}`, 'adminPayment.hbs', {
            fullName: buynow.fullName,
            email: buynow.email,
            phoneNo: buynow.phoneNo,
            country: buynow.country,
            city: buynow.city,
            state: buynow.state,
            zip: buynow.zip,
            paymentThrough: buynow.paymentThrough,
            paymentStatus: buynow.paymentStatus,
            title: reportTitle,
            ref: reporturl,
            address: buynow.address
        });
    }

    async paymentFailedMail(reportTitle, reporturl, paymentType, buynow: any) {
        await this.emailService.sendEmail('', buynow.email, [], [], 'Payment Failed :(', 'paymentStatus.hbs',
            { title: reportTitle, firstName: buynow.fullName, paymentStatus: 'F' });

        await this.emailService.sendEmail('', [], [], ['payments@vantagemarketresearch.com', 'virendra.workmail@gmail.com'], `Payment Failed Through - ${paymentType}`, 'adminPayment.hbs', {
            fullName: buynow.fullName,
            email: buynow.email,
            phoneNo: buynow.phoneNo,
            country: buynow.country,
            city: buynow.city,
            state: buynow.state,
            zip: buynow.zip,
            paymentThrough: buynow.paymentThrough,
            paymentStatus: buynow.paymentStatus,
            title: reportTitle,
            ref: reporturl,
            address: buynow.address
        });
    }

    calculatePrice(details, report, discount = 0) {

        let actualPrice = details.SingleUser ?
            report.pricingOptions.singleUser : details.MultiUser ?
                report.pricingOptions.multiUser : details.CorporateUser ? report.pricingOptions.cooperateUser : report.pricingOptions.singleUser;

        let minPrice = actualPrice - 1500;

        if (details.SelectedRegion && details.SelectedRegion.length < 5) {
            actualPrice = actualPrice - (500 * (5 - details.SelectedRegion.length));

            if (actualPrice < minPrice) {
                actualPrice = minPrice;
            }
        }

        if (details.SingleUser && details.SelectedAdOn) {
            details.SelectedAdOn.forEach(item => {
                switch (item.value) {

                    case 1:
                        if (item.selected) {
                            actualPrice += 800;
                        }
                        break;
                    case 2:
                        if (item.selected) {
                            actualPrice += 500;
                        }
                        break;
                }
            });
        }

        return actualPrice - (actualPrice * (discount / 100));
    }
}