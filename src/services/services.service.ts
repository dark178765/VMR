import { Injectable } from "@nestjs/common";
import { HttpClient } from "src/httpclient/httpclient";

@Injectable()
export class ServicesService {
    constructor(
        private readonly httpClient: HttpClient
    ) { }
}