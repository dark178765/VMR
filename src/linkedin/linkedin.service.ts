import { Injectable } from "@nestjs/common";

import * as oauth from 'simple-oauth2';

@Injectable()
export class LinkedinService {
    async auth() {
        const redirectUri = oauth.authorizationCode.authorizeURL({
            response_type: 'code',
            redirect_uri: 'http://localhost:3500/'
        })
    }
}