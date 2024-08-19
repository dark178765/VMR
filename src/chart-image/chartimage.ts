import * as chart from 'chartjs-to-image';


export class ChartImage {
    async generateChart(rev21: string, rev28: string, cc: string, keyword: string, currentYear?, forecastYear?, baseYear?) {

        var revenue2021: number = parseFloat(rev21.replace(/USD/gmi, '')
            .replace(/Billion/gmi, '')
            .replace(/Million/gmi, '')
            .replace(/Trillion/gmi, '')
            .replace(/Bn/gmi, '')
            .replace(/mn/gmi, '')
            .replace(/tr/gmi, ''));

        var MorB = rev21.replace(/usd/gmi, '').replace(/$/gmi, '').replace(new RegExp(revenue2021.toString(), 'gmi'), '').trim();

        if (MorB.split(' ').length > 1) {
            MorB = MorB.split(' ')[1];
        }

        let chartTitle = `${keyword} Market Size, ${currentYear ? currentYear : '2021'} To ${forecastYear ? forecastYear : '2028'} (USD ${MorB})`;
        var revenue2028: number = parseFloat(rev28.replace(/USD/gmi, '').replace(/Billion/gmi, ''));

        var cagr = parseFloat(cc.replace(/%/gmi, ''));

        let data: any = [];

        let tofor = currentYear && forecastYear ? (forecastYear - currentYear) + 1 : 8;
        let labels = Array.from({ length: tofor }, (_, i) => i + parseInt(baseYear));

        for (var i = 0; i < tofor; i++) {

            if (data.length > 0) {
                data.push((data[i - 1] * (cagr / 100)) + data[i - 1]);
            } else {
                data.push(revenue2021);
            }
        }

        // data = data.map(x => parseFloat(x).toFixed(2));

        data = data.map((x, xi) => {
            return { label: labels[xi].toString(), value: x, customLabel: x.toFixed(2) }
        });

        // if(revenue2028 !== parseFloat(data[data.length - 1])){
        //     data[data.length - 2] = revenue2028.toFixed(2);
        // }

        // data = data.map(x => {
        //     return {value: parseFloat(x).toFixed(2), label: parseFloat(x).toFixed(2)};
        // });

        data[data.length - 1].customLabel = revenue2028;

        let c = new chart();

        c.setConfig({
            type: 'bar',
            data: {
                //labels,
                datasets: [
                    {
                        data: data,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgb(54, 162, 235)',
                        borderWidth: 1
                    }]
            },
            options: {
                layout: {
                    padding: 50
                },
                parsing: {
                    xAxisKey: 'label',
                    yAxisKey: 'value'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: chartTitle,
                        color: '#000',
                        font: {
                            size: 30
                        },
                        padding: {
                            bottom: 50
                        }
                    },
                    subtitle: {
                        display: true,
                        text: 'Source: ESOMAR, Vantage Market Research',
                        position: 'bottom',
                        align: 'end',
                        font: {
                            size: 20,
                            weight: 'bold'
                        },
                        padding: {
                            top: 20
                        },
                        color: '#000'
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        color: '#000',
                        font: {
                            weight: 'bold',
                        },
                        formatter: function (value, context) {
                            let showOnly = context.chart.data.labels.length < 9 ? [0, 3, 4, 7] : [0, 3, 4, context.chart.data.labels.length - 1];
                            return showOnly.indexOf(context.dataIndex) > -1 ? (context.dataIndex == context.dataset.data.length - 1 ? context.dataset.data[context.dataset.data.length - 1].customLabel : value.customLabel) : '';
                        }
                    }
                },
                scales: {
                    y: {
                        display: false,
                        border: {
                            display: false
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                weight: 'bold',

                            },
                            color: '#000'
                        }
                    }
                }
            }
        });

        c.setChartJsVersion('4');

        c.setHeight(700);
        c.setWidth(1080);

        return await c.toBinary();
    }
}