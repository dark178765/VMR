import { Controller, Get, Post, Param, Render, Req, Res, HttpException, HttpStatus, UseGuards } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { createHmac, Hmac } from "crypto";
import * as moment from "moment";
import { Model, Types } from "mongoose";
import { RealIp } from "nestjs-real-ip";
import { FormService } from "src/form/form.service";
import { FormType } from "src/global/global.constant";
// import { RecaptchaGuard } from "src/google-recaptcha/recaptcha.gaurd";
import { PaypalPayment } from "src/payment/paypal";

import { conf } from "src/payment/razorconfig";
import { RazorpayPayment } from "src/payment/razorpay";
import { Buynow } from "src/schema/buynow.schema";
import { Report } from "src/schema/report.schema";
import { Captcha } from "src/util/captcha";
import { CheckIP } from "src/util/checkip";
import { BuynowService } from "./buynow.service";

@Controller()
export class BuynowController {
    constructor(
        @InjectModel(Buynow.name) private readonly buynowModel: Model<Buynow>,
        @InjectModel(Report.name) private readonly reportModel: Model<Report>,
        private readonly buynowService: BuynowService,
        private readonly formService: FormService
    ) { }

    @Post('create-order')
    async createRazorpayOrder(@Req() req) {
        //
        let id = req.body.buynowId;
        let objId = Types.ObjectId;
        let buynow = await this.buynowModel.findOne({
            _id: new objId(id)
        });

        let report = await this.reportModel.findOne({
            _id: new objId(buynow.reportId)
        });

        let price = 0;

        price = this.buynowService.calculatePrice(req.session.BuyNow, report, buynow.discount ?? 0);

        let razorPayment = new RazorpayPayment();
        let order = await razorPayment.createOrder({
            amount: price,
            receipt: 'receipt_' + id
        });

        await this.buynowModel.updateOne({
            _id: buynow._id
        }, {
            $set: {
                paymentReference: order.id,
                paymentThrough: 'RazorPay'
            }
        })

        return { order };
    }

    @Post('submit-form')
    async buynowForm(@Req() req, @RealIp() ip) {

        if (req.session['captcha_' + FormType.BuyNow] !== req.body.captcha) {
            return {
                success: false,
                message: 'Invalid Captcha',
                field: 'Captcha'
            }
        }

        let report = await this.reportModel.findOne({
            _id: new Types.ObjectId(req.body.reportId)
        });

        let discount = req.body.couponCode ? this.buynowService.getDiscount(req.body.couponCode) : 0;

        let price = req.session && req.session.BuyNow ? this.buynowService.calculatePrice(req.session.BuyNow, report, discount) : 0;

        let objId = Types.ObjectId;
        let buynow = await this.buynowModel.insertMany({
            _id: new objId(),
            fullName: `${req.body.fName} ${req.body.lName}`,
            reportId: req.body.reportId,
            createdDate: new Date(),
            phoneNo: req.body.phoneNo,
            address: req.body.address,
            country: req.body.country,
            city: req.body.country,
            state: req.body.state,
            email: req.body.email,
            zip: req.body.zip,
            paymentThrough: req.body.paymentThrough,
            paymentType: req.body.paymentType,
            paymentStatus: 'N', //N - New, S - Success, F - failed
            paymentReference: '',
            reason: '',
            price: price > 0 ? price : req.body.paymentType == 0 ? report.pricingOptions.singleUser : req.body.paymentType == 1 ? report.pricingOptions.multiUser : req.body.paymentType == 2 ? report.pricingOptions.cooperateUser : report.pricingOptions.singleUser,
            selectedRegion: req.session && req.session.BuyNow && req.session.BuyNow.SelectedRegion ? req.session.BuyNow.SelectedRegion.length < 5 ? req.session.BuyNow.SelectedRegion : ['Global'] : '',
            selectedAdOn: req.session && req.session.BuyNow && req.session.BuyNow.SelectedAdOn ? req.session.BuyNow.SelectedAdOn : [],
            license: req.session && req.session.BuyNow ? req.session.BuyNow.SingleUser ? 'Standard' : req.session.BuyNow.MultiUser ? 'Enterprise' : 'Data Sheet (Excel)' : 'Standard',
            discount: discount
        });

        //send lead to CRM
        await this.formService.sendLeadToCRM({
            firstName: `${req.body.fName} ${req.body.lName}`,
            businessEmail: req.body.email,
            country: req.body.country,
            phNo: req.body.phoneNo,
            ipAddress: ip,
            Source: 1,
            formType: 8,
            title: report.title,
            reportUrl: report.slug
        })

        if (req.hostname !== 'localhost')
            await this.buynowService.paymentInitiateMail(report.title, report.slug, req.body.paymentThrough, buynow[0], ip);

        if (buynow && buynow.length > 0) {
            let id = buynow[0]._id;
            return {
                success: true,
                id
            };
        }
    }

    @Post('complete-payment')
    async completePayment(@Req() req) {
        let hmac = createHmac('sha256', conf.key_secret);
        hmac.update(`${req.body.razorpay_order_id}|${req.body.razorpay_payment_id}`);
        let signature = hmac.digest('hex');
        let objId = Types.ObjectId;
        await this.buynowModel.updateOne({
            _id: new objId(req.body.buynowId)
        }, {
            $set: {
                paymentReference: `${req.body.razorpay_order_id}|${req.body.razorpay_payment_id}`,
                paymentStatus: signature == req.body.razorpay_signature ? 'S' : 'F',
                paymentThrough: 'RazorPay'
            }
        })

        //
        let buynow = await this.buynowModel.findOne({
            _id: new objId(req.body.buynowId)
        });

        let report = await this.reportModel.findOne({
            _id: new objId(buynow.reportId)
        });

        if (signature == req.body.razorpay_signature) {
            await this.buynowService.paymentSuccessMail(report.title, report.slug, 'RazorPay', buynow);
        }

        return {
            success: signature == req.body.razorpay_signature
        }
    }

    // @UseGuards(RecaptchaGuard)
    @Post('create-paypal-payment')
    async createPaypalPayment(@Req() req) {
        let paypal = new PaypalPayment();

        let buynow = await this.buynowModel.findOne({
            _id: new Types.ObjectId(req.body.buynowId)
        });

        let report = await this.reportModel.findOne({
            _id: new Types.ObjectId(buynow.reportId)
        });

        let price = buynow.paymentType == 0 ? report.pricingOptions.singleUser : buynow.paymentType == 1
            ? report.pricingOptions.multiUser : buynow.paymentType == 2 ? report.pricingOptions.coorporateUser
                : report.pricingOptions.singleUser;

        price = this.buynowService.calculatePrice(req.session.BuyNow, report, buynow.discount ?? 0);

        let createdOrder = await paypal.createOrder({
            amount: price,
            title: report.title,
            order_id: `order_${req.body.buynowId}`,
            buynowId: req.body.buynowId
        });

        let objId = Types.ObjectId;

        let updated = await this.buynowModel.updateOne({
            _id: new objId(req.body.buynowId)
        }, {
            $set: {
                paymentReference: createdOrder.result.id,
                paymentThrough: 'PayPal'
            }
        });

        return createdOrder;
    }

    async getCaptcha(formType) {
        let token = await this.formService.getRandomToken(formType, formType);
        return new Captcha().getCaptcha(token);
    }

    @Get('buy-now/:url/:type?')
    async buynow(@Req() req, @Param() pram, @RealIp() ip, @Res() res) {

        //Check user using proxy or VPN

        // let data = await new CheckIP().check(ip);

        // if (data[ip] && data[ip]['proxy'] === 'yes') {
        //     return res.redirect('/proxy-error')
        // }

        let report = await this.reportModel.findOne({ slug: pram.url });

        if (req.session.BuyNow) {
            req.session.BuyNow = {
                ...req.session.BuyNow,
                SingleUser: pram.type == "0",
                MultiUser: pram.type == "1",
                CorporateUser: pram.type == "2"
            };

            req.session.BuyNow.price = this.buynowService.calculatePrice(req.session.BuyNow, report);
        }

        let planAmount = pram.type == "0" || !pram.type ? report.pricingOptions.singleUser : pram.type == "1" ?
            report.pricingOptions.multiUser : pram.type == "2" ? report.pricingOptions.cooperateUser : report.pricingOptions.singleUser;

        if (!req.session.BuyNow) {
            req.session.BuyNow = {
                SingleUser: pram.type == "0",
                MultiUser: pram.type == "1",
                CorporateUser: pram.type == "2"
            };

            req.session.BuyNow.price = this.buynowService.calculatePrice(req.session.BuyNow, report);
        }

        planAmount = req.session.BuyNow ? parseFloat(req.session.BuyNow.price) : planAmount;

        let cap = await this.getCaptcha(FormType.BuyNow)

        req.session[`captcha_${FormType.BuyNow}`] = cap.captchaString;

        let reportTitle = report.title;
        let paypal = new PaypalPayment();
        return res.render('buynownew', {
            CLIENTID: paypal.getClientID(),
            metatitle: `${report.keyword} Market - Buy Now | Vantage Market Research`,
            metadescription: `Buy Now ${report.keyword} Market - Vantage Market Research`,
            metakeywords: `Buy Now ${report.keyword} Market, Vantage Market Resarch`,
            slug: report.slug,
            buynow: req.session.BuyNow,
            isGlobal: req.session && req.session.BuyNow && req.session.BuyNow.SelectedRegion ? req.session.BuyNow.SelectedRegion.length == 5 : true,
            planAmount,
            reportTitle,
            country: await this.formService.getAllCountries(),
            reportId: report._id,
            paymentType: pram.type ?? 0,
            paymentTypeString: pram.type == "0" ? 'Single User' : pram.type == "1" ? 'Enterprice User' : pram.type == "2" ? 'Data Sheet' : 'Single User',
            couponApplied: req.query.cc && req.query.cc.toUpperCase() == process.env.COUPON_CODE && moment() <= moment(process.env.DISCOUNT_LAST_DATE, 'MM-DD-YYYY'),
            showApplyCoupon: process.env.COUPON_CODE && moment() <= moment(process.env.DISCOUNT_LAST_DATE, 'MM-DD-YYYY'),
            CaptchaImage: cap.dataUrl
        });
    }


    @Post('apply-coupon')
    async applyCoupon(@Req() req) {

        if (moment() <= moment(process.env.DISCOUNT_LAST_DATE, 'MM-DD-YYYY')) {
            if (req.body.CouponCode !== undefined && req.body.CouponCode.toUpperCase() == process.env.COUPON_CODE) {
                let report = await this.reportModel.findOne({
                    _id: new Types.ObjectId(req.body.reportID)
                });

                let newPrice = this.buynowService.calculatePrice(req.session.BuyNow, report, parseInt(process.env.DISCOUNT));

                if (req.body.buynowID && req.body.buynowID !== '') {
                    let bn: any = await this.buynowModel.findOne({
                        _id: new Types.ObjectId(req.body.buynowID)
                    });

                    if (bn) {
                        await this.buynowModel.updateOne({
                            _id: new Types.ObjectId(req.body.buynowID)
                        }, {
                            discount: this.buynowService.getDiscount(req.body.CouponCode),
                            price: bn.price - (bn.price * (this.buynowService.getDiscount(req.body.CouponCode) / 100))
                        });

                        let report = await this.reportModel.findOne({
                            _id: new Types.ObjectId(bn.reportId)
                        });

                        bn.discount = this.buynowService.getDiscount(req.body.CouponCode);
                        bn.price = bn.price - (bn.price * (this.buynowService.getDiscount(req.body.CouponCode) / 100));

                        await this.buynowService.sendPaymentUpdateMail(report.title, report.slug, bn.paymentType, bn, '');
                    }
                }

                return {
                    newPrice,
                    discountPer: process.env.DISCOUNT
                };
            }
        }

        return {
            error: 'Invalid Coupon Code'
        };


    }

    @Get('complete-paypal-payment')
    //@Render('payment')
    async completePaypalPayment(@Req() req, @Res() res) {

        if (!req.query.buynowid || req.query.buynowid.length < 24 || req.query.buynowid.length > 24) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }

        let buynow = await this.buynowModel.findOne({
            _id: new Types.ObjectId(req.query.buynowid)
        });

        if (!buynow) {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }

        let report = await this.reportModel.findOne({
            _id: new Types.ObjectId(buynow.reportId)
        });

        let paypalresponse = await new PaypalPayment().validatePayment(buynow.paymentReference);

        //update payment reference
        await this.buynowModel.updateOne({
            _id: new Types.ObjectId(req.query.buynowid)
        }, {
            $set: {
                paymentReference: `${buynow.paymentReference}|${req.query.PayerID}|${req.query.token}`,
                paymentStatus: paypalresponse.status === 'COMPLETED' ? 'S' : 'F',
                paymentThrough: 'PayPal'
            }
        })

        if (paypalresponse.status === 'COMPLETED' || paypalresponse.status === 'APPROVED') {
            await this.buynowService.paymentSuccessMail(report.title, report.slug, 'PayPal', buynow);
            if (req.query.src == 'js') {
                res.json({ success: true });
            } else {
                return res.redirect('/payment-success/' + req.query.buynowid + "?mode=paypal");
            }
        } else {
            await this.buynowService.paymentFailedMail(report.title, report.slug, 'PayPal', buynow);
            if (req.query.src == 'js') {
                res.json({ success: false });
            } else {
                return res.redirect('/payment-fail/' + req.query.buynowid + "?mode=paypal");
            }
        }

        // return {
        //     name: buynow.fullName,
        //     reportTitle: report.title,
        //     success: paypalresponse.status === 'COMPLETED'
        // };
    }

    @Get('payment-success/:id')
    @Render('payment')
    async paymentSuccess(@Param() pram) {
        let objId = Types.ObjectId;
        let buynow = await this.buynowModel.findOne({
            _id: new objId(pram.id)
        });

        let report = await this.reportModel.findOne({
            _id: new objId(buynow.reportId)
        });

        return {
            name: buynow.fullName,
            reportTitle: report.title,
            success: buynow.paymentStatus === 'S',
            paymentThrought: buynow.paymentThrough
        };
    }

    @Get('payment-fail/:id')
    @Render('payment')
    async paymentFail(@Param() pram) {
        let objId = Types.ObjectId;
        let buynow = await this.buynowModel.findOne({
            _id: new objId(pram.id)
        });

        let report = await this.reportModel.findOne({
            _id: new objId(buynow.reportId)
        });

        return {
            name: buynow.fullName,
            reportTitle: report.title,
            success: buynow.paymentStatus === 'S',
            paymentThrought: buynow.paymentThrough
        };
    }

    @Post('complete-wiretransfer-payment')
    async completeWiretransfer(@Req() req) {
        await this.buynowModel.updateOne({
            _id: new Types.ObjectId(req.body.buynowId)
        }, {
            $set: {
                paymentStatus: 'S',
                paymentThrough: 'Wire'
            }
        });

        return {
            success: true,
            paymentThrough: 'wire'
        };
    }

    @Get('wiretransfer/:id')
    @Render('wiretransfer')
    async wiretransferSuccess(@Param() pram) {
        let objId = Types.ObjectId;
        let buynow = await this.buynowModel.findOne({
            _id: new objId(pram.id)
        });

        let report = await this.reportModel.findOne({
            _id: new objId(buynow.reportId)
        });

        return {
            name: buynow.fullName,
            reportTitle: report.title,
            success: buynow.paymentStatus === 'S',
            paymentThrought: buynow.paymentThrough
        };
    }

    @Post('select-payment')
    async SelectPayment(@Req() req) {
        let report = await this.reportModel.findOne({ _id: new Types.ObjectId(req.body.ReportID) });
        let price = this.buynowService.calculatePrice(req.body, report);

        req.session['BuyNow'] = { ...req.body, price };
        return {
            redirectUrl: `/buy-now/${report.slug}/${req.body.SingleUser ? '0' : req.body.MultiUser ? '1' : req.body.DataSheet ? '2' : '0'}`
        }
    }

    @Get('/live-chat')
    @Render('livechat')
    async LiveChatBuynow() {
        return {};
    }
}