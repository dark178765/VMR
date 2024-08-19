import { createCanvas, loadImage, registerFont } from "canvas";
import { writeFile, writeFileSync } from "fs";
import { join } from "path";
import { s3FileHandling } from "./uploadtos3";

export const create = {
    createImage: async (img, textAttributes, fileName, callback) => {
        registerFont(join(__dirname, '../..', '/public/font/Poppins.ttf'), { family: 'Poppins' });

        img = await loadImage(img); // Load the image first to get its dimensions
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0); // Draw the image onto the canvas

        let fnt = 'Poppins'

        textAttributes.forEach(item => {
            ctx.font = `${item.fontSize}px "${fnt}"`;
            ctx.fillStyle = item.color;
            ctx.textAlign = item.align;
            if (item.maxWidth && item.maxWidth > 0) {
                if (item.text.indexOf('|') > -1) {
                    let text = item.text.split('|');
                    var aboveLineWrapped = false;
                    text.forEach((txt, index) => {
                        if (index > 0 && ctx.measureText(text[index - 1]).width > item.maxWidth) {
                            aboveLineWrapped = true;
                        }
                        if (aboveLineWrapped) {
                            item.y = parseInt(item.y) + (parseInt(item.spacing) + parseInt(item.spacing));
                            aboveLineWrapped = false;
                        } else {
                            item.y = parseInt(item.y) + parseInt(item.spacing);
                        }
                        fillTextCustom(ctx, txt.trim(), item.x, item.y, item.maxWidth, parseInt(item.spacing), item.drawRect);
                    });
                } else {
                    fillTextCustom(ctx, item.text, item.x, item.y, item.maxWidth, parseInt(item.spacing));
                }
            } else {
                ctx.fillText(item.text, item.x, item.y);
            }

        });

        fileName = fileName.replace(/\s/gmi, '-') + ".png";

        writeFileSync(join(__dirname, '../..', '/public/image/report/') + fileName, canvas.toBuffer('image/png'));

        s3FileHandling.uploadToS3(join(__dirname, '../..', '/public/image/report/') + fileName, (err, data) => {
            callback(err, data);
        });
        // writeFile(join(__dirname, '../..', '/public/image/report/') + fileName, canvas.toBuffer('image/png'), () => {
        //     s3FileHandling.uploadToS3(join(__dirname, '../..', '/public/image/report/') + fileName, (err, data) => {
        //         callback(err, data);
        //     });
        // });
    }
}

function fillTextCustom(ctx, text, x, y, maxWidth, spacing, isdrawRect = false) {
    var words = text.split(' ');
    var line = '';

    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = ctx.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y = parseInt(y) + spacing;
            //y += 0;
        } else {
            line = testLine;
            if (isdrawRect === true && n == 0) {
                drawRect(ctx, x - 15, y - 113);
            }
        }
       

    }
   
    ctx.fillText(line, x, y);
}

function drawRect(ctx, x, y) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y + 100, 10, 10);
}