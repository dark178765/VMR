
const D3Node = require('d3-node');
const d3 = require('d3');
const fs = require('fs');
const sharp = require('sharp');


export class ChartImage {
    async generateImage(rev21: string, rev28: string, c: string, keyword: string) {

        const options = {
            d3Module: d3,
            selector: '#chart',
            container: '<div id="container"><div id="chart"></div></div>'
        };

        const d3n = new D3Node(options);

        var revenue2021: number = parseFloat(rev21.replace(/USD/gmi, '')
            .replace(/Billion/gmi, '')
            .replace(/Million/gmi, '')
            .replace(/Trillion/gmi, '')
            .replace(/Bn/gmi, '')
            .replace(/mn/gmi, '')
            .replace(/tr/gmi, ''));

        console.log(c);

        var MorB = rev21.replace(/usd/gmi, '').replace(/$/gmi, '').replace(new RegExp(revenue2021.toString(), 'gmi'), '').trim();

        let chartTitle = `${keyword} Market Size, 2021 To 2028 (USD ${MorB})`;
        var revenue2028: number = parseFloat(rev28.replace(/USD/gmi, '').replace(/Billion/gmi, ''));

        var cagr = parseFloat(c.replace(/%/gmi, ''));


        let data: any = [];
        const labels = ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028'];


        for (var i = 0; i < 8; i++) {
            if (data.length > 0) {
                data.push((data[i - 1] * (cagr / 100)) + data[i - 1]);
            } else {
                data.push(revenue2021);
            }
        }

        //data[data.length - 1] = revenue2028;

        //data[data.length - 2] = data[data.length - 1] - (data[data.length - 1] * cagr / 100);

        // maximum width of single bar so bar doesn't look like a box
        const max_bar_width = 100;

        // maximum height of the svg element
        // this will include top and bottom offset
        //const svgHeight = 400;

        const margin = {
            top: 10, right: 5, bottom: 30, left: 5
        };
        const width = 900 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        const svgWidth = width + margin.left + margin.right;
        const svgHeight = height + margin.top + margin.bottom;

        // bg color of bars
        const bar_color = "#4682b4";

        // top and bottom margins
        const top_offset = 50;
        const bottom_offset = 50;

        /**
         * Darked/Lighten a color
         * Copied from https://stackoverflow.com/a/13532993/10468888
         */
        function shadeColor(color, percent: number) {

            var R: number = parseInt(color.substring(1, 3), 16);
            var G: number = parseInt(color.substring(3, 5), 16);
            var B: number = parseInt(color.substring(5, 7), 16);

            R = R * (100 + percent) / 100;
            G = G * (100 + percent) / 100;
            B = B * (100 + percent) / 100;

            R = (R < 255) ? R : 255;
            G = (G < 255) ? G : 255;
            B = (B < 255) ? B : 255;

            var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
            var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
            var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

            return "#" + RR + GG + BB;
        }

        // append svg
        // const svg = d3n.select("#barchart")
        //     .append("svg")
        //     .attr("width", '100%')
        //     .attr("height", svgHeight);

        const svg = d3n.createSVG(1980, svgHeight);

        // to make graph responsive calcuate we set width 100%
        // here we calculate width in pixels
        //const svgWidth = svg.node().getBoundingClientRect().width;

        // decide bar width depending upon available space and no. of bars to plot
        let bar_width = Math.round((svgWidth - 60) / data.length);
        if (bar_width > max_bar_width) {
            bar_width = max_bar_width;
        }

        // spacing between two bars
        // instead of having a fixed value we set it dynamically
        const spacing = 0.15 * bar_width;

        // to center align graph we move it from left to right
        // this is applicable if there's any space left
        let left_offset = Math.round((svgWidth - bar_width * data.length) / 2);
        if (left_offset < 0) {
            left_offset = 0;
        }

        // create scale
        const scale = d3.scaleLinear()
            .domain([0, Math.max(...data)])
            .range([0, svgHeight - top_offset - bottom_offset]);

        // create scale for Y-Axis
        // we could have used scale above but for Y-Axis we need domain reversed
        const scale_y_axis = d3.scaleLinear()
            .domain([Math.max(...data), 0])
            .range([0, svgHeight - top_offset - bottom_offset]);



        let showOnly = [0, 3, 4, 7];


        //shadow
        var defs = svg.append("defs");

        var filter = defs.append("filter")
            .attr("id", "dropshadow")

        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 4)
            .attr("result", "blur");
        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 2)
            .attr("dy", 2)
            .attr("result", "offsetBlur");

        var feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
        //end shadow


        // append rect
        const rect = svg.selectAll("g")
            .data(data)
            .enter()
            .append("rect")
            .attr("fill", bar_color)
            .attr("x", (d, i) => left_offset + bar_width * i)
            .attr("y", d => svgHeight - bottom_offset)
            .attr("width", bar_width - spacing)
            .attr('class', 'bar');

        rect.attr("y", d => svgHeight - bottom_offset - scale(d))
            .attr("height", d => scale(d));

        // append text  
        svg.selectAll("g")
            .data(data)
            .enter()
            .append("text")
            .attr("dominant-baseline", "text-before-edge")
            .attr("text-anchor", "middle")
            .attr("fill", "#000000")
            .attr("x", (d, i) => left_offset + bar_width * i + bar_width / 2 - spacing / 2)
            .attr("y", svgHeight - bottom_offset + 5)
            .attr("style", "font-family:Verdana")
            .text((d, i) => labels[i]);

        // append X-Axis  
        svg.append("line")
            .attr("stroke", "#000000")
            .attr("stroke-width", 2)
            .attr("x1", left_offset)
            .attr("y1", svgHeight - bottom_offset)
            .attr("x2", bar_width * data.length + left_offset - spacing)
            .attr("y2", svgHeight - bottom_offset);

        svg.append("line")
            .attr("stroke", "#000")
            .attr("stroke-width", 2)
            .attr("x1", 950)
            .attr("y1", 20)
            .attr("x2", 350)
            .attr("y2", 20);

        svg.append("line")
            .attr("stroke", "#000")
            .attr("stroke-width", 2)
            .attr("x1", 950)
            .attr("y1", 20)
            .attr("x2", 950)
            .attr("y2", 30);

        svg.append("line")
            .attr("stroke", "#000")
            .attr("stroke-width", 2)
            .attr("x1", 350)
            .attr("y1", 20)
            .attr("x2", 350)
            .attr("y2", 30);

        svg.append('text')
            .attr("fill", "#000000")
            .attr('x', 630)
            .attr('y', 15).text('CAGR: ' + cagr + '%');


        // appen Y-Axis        
        /*svg.append("g")
            .attr("transform", "translate(0," + top_offset + ")")
            .call(d3.axisRight(scale_y_axis));*/


        //svg.append('text').attr('x', '150').attr('y', '50').attr('class', 'chart-title').text(chartTitle);

        //svg.append('text').attr('x', '100').attr('y', '100').text(`Values in ${MorB}`);


        svg.selectAll('g').data(data).enter().append('text').attr('x', (d, i) => {
            return left_offset + bar_width * i + bar_width / 2 - spacing / 2;
        }).attr('y', (d, i) => {
            return svgHeight - 55 - scale(d);
        }).text((d, i) => {
            if (showOnly.indexOf(i) > -1) {
                if (i == data.length - 1) {
                    return revenue2028.toFixed(2);
                } else {
                    return parseFloat(d).toFixed(2);
                }
            } else {
                return '';
            }
        });


        let img = await sharp(Buffer.from(d3n.svgString().replace('1em', '100em').replace('1em', '100em')));

        img.toFile('svg-out.png');

        //fs.writeFileSync('out.svg', d3n.svgString());

        // Convert the SVG into a PNG. 
        // await sharp('out.svg')
        //     .png()
        //     .toFile('sharp.png')
        //     .then((info) => {
        //         console.log('Svg to Png conversion completed', info);
        //     })
        //     .catch((err) => {
        //         console.log(err);
        //     });

    }
}