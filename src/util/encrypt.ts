import * as crypto from 'crypto';

export class EncryptDescrypt {

    algorithm = 'aes-256-cbc';

    encrypt = (data: string) => {
        const iv = crypto.randomBytes(16);
        let key = crypto.createHash('sha256').update(process.env.ENCRYPT_SECRET).digest('base64').substring(0, 32);
        let cypher = crypto.createCipheriv(this.algorithm, key, iv);
        let encrypt = cypher.update(data);

        encrypt = Buffer.concat([encrypt, cypher.final()]);

        return iv.toString('hex') + '|' + encrypt.toString('hex');
    }

    decrypt = (encryptedData: string) => {
        let ed = encryptedData.split('|');
        let iv = Buffer.from(ed.shift(), 'hex');
        let encryptedData1 = Buffer.from(ed.join('|'), 'hex');

        let key = crypto.createHash('sha256').update(process.env.ENCRYPT_SECRET).digest('base64').substring(0, 32);

        let decypher = crypto.createDecipheriv(this.algorithm, key, iv);
        let decryptData = decypher.update(encryptedData1);
        let text = Buffer.concat([decryptData, decypher.final()]);
        return text.toString();
    }
}