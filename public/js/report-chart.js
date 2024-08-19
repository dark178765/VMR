var xx = {{{json segmentation}}};

        


for(var i=0;i<xx.length;i++){
let randomColors = [];

xx[i].pieChartLabels.forEach((it, id) => {
    randomColors.push(getRandomColor());
});

        const data = {
                labels: xx[i].pieChartLabels,
                datasets: [{
                    label: 'My First Dataset',
                    data: xx[i].pieChartData,
                    backgroundColor: randomColors,
                    hoverOffset: 4
                }]
            };

            const config = {
                    type: 'pie',
                    data: data,
                    options: {
                    plugins: {
                        tooltip: {
                        enabled: false
                        },
                    }
                    }
                };

            const myChart = new Chart(
            document.getElementById('chart_' + i),
            config
        );
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}