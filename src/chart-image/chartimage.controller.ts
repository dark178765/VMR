import { Controller, Get, Header, Param, Res, StreamableFile } from "@nestjs/common";
import { createReadStream, writeFileSync } from "fs";
import { join } from "path";
import { ReportService } from "src/report/report.service";
import { s3FileHandling } from "src/util/uploadtos3";
import { ChartImage } from "./chartimage";


@Controller()
export class ChartImageController {
    constructor(
        private readonly reportService: ReportService
    ) { };

    @Get(':url.jpg')
    async reportImage(@Param() pram, @Res() res) {

        let config = {
            awsAccessKey: "AKIA5FYUYVX5QS4W6UVA",
            awsSecurityKey: "VdC3SUXFvlqikrXY6MsVCi4VTx3m17eUM/DdcwF9",
            awsBucket: 'assets-img-reports',
            awsRegion: 'us-east-1',
            filePath: `graph/${pram.url}.jpg`
        };


        let file = await s3FileHandling.getFile('', config).catch(err => {
            console.log('GetFile Error', err);
        });

        if (file === false) {
            let report = await this.reportService.getReportByKeyword(pram.url.replace(/-/gmi, ' ')
                .trim().replace(/market/i, '').replace(/share/i, ''));

            if (report) {
                if (report.reportDataId) {

                    let table: any = this.reportService.getTable(report.reportDataId.table);

                    let img = await new ChartImage().generateChart(
                        table?.Revenue_Current,
                        table?.Revenue_Forecast,
                        table?.CAGR_Revenue, report.keyword,
                        table?.Current_Year,
                        table?.Forecast_Year,
                        table?.Base_Year
                        );

                    writeFileSync(join(__dirname, '..', '..', 'temp.jpg'), img);

                    s3FileHandling.uploadToS3(join(__dirname, '..', '..', 'temp.jpg'), () => { }, config);

                    res.sendFile(join(__dirname, '..', '..', 'temp.jpg'));

                } else {
                    let table: any = this.reportService.getOldTable(report.excelData);

                    let img = await new ChartImage().generateChart(table?.Revenue_Current,
                        table?.Revenue_Forecast,
                        table?.CAGR_Revenue, report.keyword,
                        table?.Current_Year,
                        table?.Forecast_Year,
                        table?.Base_Year);

                    writeFileSync(join(__dirname, '..', '..', 'temp.jpg'), img);

                    s3FileHandling.uploadToS3(join(__dirname, '..', '..', 'temp.jpg'), () => { }, config);

                    res.sendFile(join(__dirname, '..', '..', 'temp.jpg'));

                }
            }
        } else {
            writeFileSync(join(__dirname, '..', '..', 'temp.jpg'), file);

            res.sendFile(join(__dirname, '..', '..', 'temp.jpg'));
        }
    }
}