import { Injectable } from "@nestjs/common";
import * as nodemailer from 'nodemailer';
import * as hbs from 'hbs';
import { readFileSync } from "fs";
import { join, resolve } from "path";

@Injectable()
export class EmailService {
    async sendEmail(from, to: string | string[],
        cc: string | string[],
        bcc: string | string[],
        subject: string,
        template: string,
        values: any, callback = null) {
        const transporter = nodemailer.createTransport({
            host: "smtp.office365.com",
            secure: false,
            port: 587,
            auth: {
                user: "sales@vantagemarketresearch.com",
                pass: "Yobre5tlJa+AStldiqeg#%876Hy&"
            },
        });

        this.traverseObject(values, template, async function (html) {
            //let nmail = true;
            if (html) {


                //let rex = /<img.*?src="([^">]*\/([^">]*?))".*?>/g;
                let rex = /<img[.\S\W]*?src=["|'](.*?)["|']/gmi;
                let backgorund = /url\('([\w\W]*)'\)/g;
                let m: any;

                let imageAttachments = [];

                let ind = 0;
                while (m = rex.exec(html)) {
                    let fileFragment = m[1].split('/');
                    imageAttachments.push({
                        filename: fileFragment[fileFragment.length - 1],
                        path: m[1].indexOf('https://') === -1 && m[1].indexOf('http://') === -1 ? join(__dirname, 'emailTemplates', m[1]) : m[1],
                        cid: ind.toString()
                    });

                    html = html.replace(m[1], 'cid:' + ind.toString());
                    ind++;
                }

                while (m = backgorund.exec(html)) {
                    let fileFragment = m[1].split('/');
                    imageAttachments.push({
                        filename: fileFragment[fileFragment.length - 1],
                        path: join(__dirname, m[1]),
                        cid: ind.toString()
                    });

                    html = html.replace(m[1], 'cid:' + ind.toString());
                    ind++;
                }


                const mailOptions = {
                    from: from == '' ? 'Vantage Market Research <sales@vantagemarketresearch.com>' : from, // sender address
                    to: to,
                    cc: cc,
                    bcc: bcc.length == 0 ? [
                        'virendra.workmail@gmail.com',
                        'susanne.frank@vantagemarketresearch.com',
                        'neha@vantagemarketresearch.com',
                        'coralia.joe@vantagemarketresearch.com'] : bcc,
                    subject: subject, // Subject line
                    html: html,
                    attachments: imageAttachments
                };
                await transporter.sendMail(mailOptions, async (err, info) => {
                    if (callback)
                        callback(err, info)
                });
            } else {
                console.log('Error while sending email');
            }
        });
    }


    traverseObject(object, htmlTemplate, callback) {
        try {
            let fileContent = readFileSync(join(__dirname, `./emailTemplates/${htmlTemplate}`)).toString();
            if (htmlTemplate === 'userEmail.hbs')
                console.log('fileContent', fileContent);
            //let sign = readFileSync(join(__dirname, `./emailTemplates/sign.hbs`)).toString();

            //if template contains if condition
            hbs.registerHelper('if_eq', function (a, b, opts) {
                if (a === b) {
                    return opts.fn(this);
                } else {
                    return opts.inverse(this);
                }
            });
            var template = hbs.compile(fileContent);
            var result = template(object);
            result = result.replace(/{}/g, '');

            callback(result);
        } catch (e) {
            console.log(e);
            callback();
        }
    }
}