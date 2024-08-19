import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { S3 } from "aws-sdk";
import { createWriteStream, readFileSync, unlink } from "fs";
import { s3Config, s3ImageConfig } from './config';

export const s3FileHandling = {
    uploadToS3: (filePath, callback, config?) => {
        try {
            const fileContent = readFileSync(filePath);
            let fileName = filePath.indexOf('\\') > -1 ? filePath.split('\\') : filePath.split('/');

            const params = {
                Bucket: config ? config.awsBucket : s3Config.awsBucket,
                Key: config ? config.filePath : fileName[fileName.length - 1],
                Body: fileContent,
                ACL: 'public-read'
            };

            let s3 = new S3({
                credentials: {
                    accessKeyId: config ? config.awsAccessKey : s3Config.awsAccessKey,
                    secretAccessKey: config ? config.awsSecurityKey : s3Config.awsSecurityKey,
                },
                region: config ? config.awsRegion : s3Config.awsRegion
            });

            s3.upload(params, (err, data: S3.ManagedUpload.SendData) => {
                if (err) {
                    console.log('File Upload Error', err);
                    return false;
                } else {
                    //console.log('S3 upload', data);
                    callback(err, data.Bucket);
                    unlink(filePath, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('file deleted')
                        }
                    });
                }
            });
        } catch (e) {
            console.log('Errrrrrrror', e);
        }
    },
    getFile: (fileName, config?): Promise<any> => {
        //s3://assets-img-reports/report/cover/3D-Printed-Footwear-Market.webp
        return new Promise(resolve => {

            const params = {
                Bucket: config ? config.awsBucket : s3ImageConfig.awsBucket,
                Key: config ? config.filePath : 'report/cover/' + fileName
            };

            let s3 = new S3({
                credentials: {
                    accessKeyId: config ? config.awsAccessKey : s3ImageConfig.awsAccessKey,
                    secretAccessKey: config ? config.awsSecurityKey : s3ImageConfig.awsSecurityKey,
                },
                region: s3ImageConfig.awsRegion,
                params: params
            });

            s3.getObject((err, data) => {
                if (err) {
                    //console.log(err);
                    resolve(false);
                }
                let size = 0;
                if (data)
                    resolve(data.Body);
                else {
                    resolve(false);
                }
            });
        });
    }
}
