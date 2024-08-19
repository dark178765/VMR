import axios from 'axios';

export class CheckIP {
    async check(ip: string) {
        let ipInfoResponse = await axios.get(`https://proxycheck.io/v2/${ip}?key=public-t0u949-290h06-7240s7&vpn=1`);
        return ipInfoResponse.data;
    }
}