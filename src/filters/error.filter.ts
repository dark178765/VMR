import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { FormService } from 'src/form/form.service';
import { FormType } from 'src/global/global.constant';
import { RedirectService } from 'src/middleware/redirect.service';

@Catch()
export class ErrorFilter implements ExceptionFilter {
    constructor(private readonly formService: FormService, private readonly redirectService: RedirectService) {

    }
    async catch(error: any, host: ArgumentsHost) {

        let response = host.switchToHttp().getResponse();
        let status = (error instanceof HttpException) ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        let request: Request = host.switchToHttp().getRequest();

        if (status === HttpStatus.NOT_FOUND) {

            let redirectUrl = await this.seeinredirect(request.url);

            if (redirectUrl) {
                response.redirect(301, redirectUrl);
                return;
            }

            let captcha = await this.formService.getCaptcha(FormType.NotFound);

            request.session[`captcha_${FormType.NotFound}`] = captcha.captchaString;

            return response.status(status).render('form', {
                title: 'Not Found',
                formType: FormType.NotFound,
                captcha: captcha.dataUrl,
                countries: await this.formService.getAllCountries()
            });
        }
        let message = error.stack;
        return response.status(status).send(message);
    }

    async seeinredirect(url) {

        let v = ['request-sample', 'customization-request', 'customization-request',
            'customization-request', 'toc', 'market-segmentation', 'methodology', 'industry-report', 'contact-analyst', 'inquiry-before-buying'];

        let findUrl = url;

        v.forEach(vv => {
            findUrl = findUrl.replace(`/${vv}/`, '').replace(`/${vv}`, '');
        })

        findUrl = findUrl.replace(/\//gmi, '');

        let redirectUrl = await this.redirectService.findUrl(new RegExp(findUrl, 'gmi'));

        if (redirectUrl && redirectUrl.length > 0) {

            let newUrl = redirectUrl[0].NewUrl;

            v.forEach(vv => {
                newUrl = newUrl.replace(`/${vv}/`, '').replace(`/${vv}`, '');
            })

            url = url.replace(findUrl, newUrl);
            return url;
        }
        return null;
    }
}