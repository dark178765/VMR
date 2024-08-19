//import { validate } from 'deep-email-validator';

import axios from "axios";

import validate from "deep-email-validator";
import { appendFileSync, writeFileSync } from "fs";
import * as moment from "moment";
import { join } from "path";

export const VerifyEmail = {
    verify: async(email) => {
        let imp = await validate({
            email,
            validateSMTP: false
        })

        appendFileSync(`${join(__dirname, '..', '..')}/emailValidation.log`, moment().format('DD-MM-YYYY hh:mm:ss') + ' : ' + JSON.stringify({...imp, email}) + '\n')

        if(imp.valid) {
            let res: any = await axios.get(`https://api.bouncify.io/v1/verify?apikey=${process.env.bouncify_key}&email=${email}`).catch(err => {
                return true;
            });
            if(res.status == 200) {
                appendFileSync(`${join(__dirname, '..', '..')}/emailValidation.log`, moment().format('DD-MM-YYYY hh:mm:ss') + ' : ' + JSON.stringify(res.data) + '\n')
                return res.data.success && res.data.result !== 'undeliverable' && res.data.disposable === 0 && res.data.spamtrap === 0;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }
}