import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class HttpClient {
    async get(url, data: any = {}) {
        //console.log(process.env.API_URL);
        return axios.get(`${process.env.API_URL}/${url}`, {
            params: data
        });
    }

    async post(url, data: any = {}) {
        return axios.post(`${process.env.API_URL}/${url}`, data);
    }
}