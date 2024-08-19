'use strict';

var barChartElement = React.createElement;

function BarChart() {

    var data = [{
        label: 'React Charts',
        data: [{
            date: new Date(),
            stars: 202123
            // ...
        }]
    }, {
        label: 'React Query',
        data: [{
            date: new Date(),
            stars: 10234230
            // ...
        }]
    }];

    var primaryAxis = React.useMemo(function () {
        return {
            getValue: function getValue(datum) {
                return datum.date;
            }
        };
    }, []);

    var secondaryAxes = React.useMemo(function () {
        return [{
            getValue: function getValue(datum) {
                return datum.stars;
            }
        }];
    }, []);

    return React.createElement(
        'div',
        null,
        React.createElement(
            'h1',
            null,
            'Chart'
        ),
        React.createElement(Chart, {
            options: {
                data: data,
                primaryAxis: primaryAxis,
                secondaryAxes: secondaryAxes
            }
        })
    );
}

var barChartContainer = document.querySelector('#barChart');
var barChartRoot = ReactDOM.createRoot(barChartContainer);
barChartRoot.render(barChartElement(BarChart));