'use strict';
const barChartElement = React.createElement;

function BarChart() {


    const data = [
        {
            label: 'React Charts',
            data: [
                {
                    date: new Date(),
                    stars: 202123,
                }
                // ...
            ]
        },
        {
            label: 'React Query',
            data: [
                {
                    date: new Date(),
                    stars: 10234230,
                }
                // ...
            ]
        }
    ]

    const primaryAxis = React.useMemo(
        () => ({
            getValue: datum => datum.date,
        }),
        []
    )

    const secondaryAxes = React.useMemo(
        () => [
            {
                getValue: datum => datum.stars,
            },
        ],
        []
    )

    return (
        <div>
            <h1>Chart</h1>
            <Chart
                options={{
                    data,
                    primaryAxis,
                    secondaryAxes,
                }}
            /></div>
    )

}


const barChartContainer = document.querySelector('#barChart');
const barChartRoot = ReactDOM.createRoot(barChartContainer);
barChartRoot.render(barChartElement(BarChart));
