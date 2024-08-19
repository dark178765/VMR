import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NestMiddleware } from "@nestjs/common";
import { Observable } from "rxjs";
import { isBooleanObject } from "util/types";

@Injectable()
export class SanitizeInputInterceptor implements NestInterceptor {

    constructor() {
    }

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers['authorization'];

        let keys = Object.getOwnPropertyNames(request.body);

        let sanitize = '';

        keys.forEach(k => {
            sanitize = request.body[k];
            if (typeof (request.body[k]) == "string") {
                sanitize = sanitize?.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gmi, '');
                sanitize = sanitize?.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gmi, '')
                request.body[k] = sanitize;
            }
        })

        return next.handle();
    }
}