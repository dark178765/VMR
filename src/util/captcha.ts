
import { createCanvas, registerFont } from 'canvas';
import { Captcha as cc, createCaptcha } from 'captcha-canvas';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import path from 'path';
import { join } from 'path';


export class Captcha {
    constructor() { }

    getCaptcha(cpText) {
        registerFont(join(__dirname, '../..', '/public/font/font.ttf'), { family: 'Comic Sans MS' });
        const cnv = createCanvas(200, 100);
        const ctx = cnv.getContext("2d");
        ctx.font = '12px "Comic Sans MS"';
        let captcha = this.configureText(cpText, ctx, 200, 100, 'Comic Sans MS');
        return { dataUrl: cnv.toDataURL(), captchaString: captcha };
    }

    async getAnotherCaptcha(str) {
        // console.log(str);
        // const { image, text } = createCaptcha(150, 100, {
        //     captcha: {
        //         text: 'this is captcha'
        //     }
        // });

        // return { dataUrl: 'data:image/png;base64,' + (await image).toString('base64'), captchaString: text };
        let x = new cc(150, 100);
        x.async = false;
        x.drawCaptcha({
            text: "THIS IS CAPTCHA",
            color: 'red'
        });

        // console.log(resolve('./dist/public') + '/captcha.png');

        // writeFileSync(resolve('./dist/public') + '/captcha.png', await x.png);

        return { dataUrl: 'data:image/png;base64,' + (await x.png).toString('base64'), captchaString: str };

    }

    FONTBASE = 200;
    FONTSIZE = 35;

    relativeFont = (width, font) => {
        const ratio = this.FONTSIZE / this.FONTBASE;
        const size = width * ratio;
        return `${size}px '${font}'`;
    };

    // Get a float between min and max
    arbitraryRandom = (min, max) => Math.random() * (max - min) + min;

    // Get a rotation between -degrees and degrees converted to radians
    randomRotation = (degrees = 15) => (this.arbitraryRandom(-degrees, degrees) * Math.PI) / 180;

    // https://gist.github.com/wesbos/1bb53baf84f6f58080548867290ac2b5
    alternateCapitals = str =>
        [...str].map((char, i) => char[`to${i % 2 ? "Upper" : "Lower"}Case`]()).join("");

    // Get a random string of alphanumeric characters
    randomText = () =>
        this.alternateCapitals(
            Math.random()
                .toString(36)
                .substring(2, 6)
        );

    // Configure captcha text
    configureText = (cp, ctx, width, height, font) => {
        ctx.font = this.relativeFont(width, font);
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        const text = cp;
        ctx.fillText(text, width / 2, height / 2);
        return text;
    };
}