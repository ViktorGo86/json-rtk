document.addEventListener('DOMContentLoaded', function () {

    function fetchDataAndProcess(url) {
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                const regionsArray = data.regions; // берем массив из объекта
                if (!Array.isArray(regionsArray)) {
                    console.error('Expected an array but got:', regionsArray);
                    return {};
                }

                // Group by region_cd + region_name + coordinates + code
                return regionsArray.reduce((acc, obj) => {
                    const key = `${obj.region_cd}_${obj.region_name}_${obj.coordinat_x}_${obj.coordinat_y}_${obj.code}`;
                    if (!acc[key]) {
                        acc[key] = {
                            region_cd: obj.region_cd,
                            region_name: obj.region_name,
                            coordinat_x: obj.coordinat_x,
                            coordinat_y: obj.coordinat_y,
                            code: obj.code,
                            cpzl: 0,
                            mpi: 0,
                            mpi_cpzl: 0
                        };
                    }
                    acc[key].cpzl += obj.count_cpzl;
                    acc[key].mpi += obj.count_mpi;
                    acc[key].mpi_cpzl = (acc[key].mpi / acc[key].cpzl) * 100;
                    return acc;
                }, {});
            })
            .catch(error => console.error(`Error fetching data from ${url}:`, error));
    }

    // Разделить числа в тексте пробелами по разрядам
    function numberWithSpaces(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }

    // Fetch and process data
    fetchDataAndProcess('https://polmkiu.free.beeceptor.com/regions')
        .then(result => {
            if (!result) return;

            const seriesData = Object.values(result).map(item => ({
                x: item.coordinat_x,
                y: item.coordinat_y,
                value: item.cpzl,
                region: item.region_name,
                val_mpi: item.mpi,
                val_mpi_cpzl: item.mpi_cpzl.toFixed(2),
                hint: item.code,
                region_cd: item.region_cd
            }));

            Highcharts.chart('container', {
                chart: {
                    type: 'tilemap',
                    inverted: true,
                    height: '55%'
                },
                credits: { enabled: false },
                exporting: false,
                title: {
                    text: 'Тепловая карта по регионам. Доля ЦМП по отношению к ЗЛ в разрезе регионов',
                    style: { fontSize: '1em' }
                },
                subtitle: {
                    text: 'author: Gnidenko V. <br> График построен при помощи библиотек highcharts.com'
                },
                xAxis: { visible: false },
                yAxis: { visible: false },
                legend: {
                    title: { text: 'Количество застрахованных:' },
                    align: 'right',
                    verticalAlign: 'bottom',
                    floating: true,
                    layout: 'vertical',
                    valueDecimals: 0,
                    symbolRadius: 0,
                    symbolHeight: 14
                },
                colorAxis: {
                    dataClasses: [
                        { from: 0, to: 1000000, color: '#ECEFF1', name: '< 1M' },
                        { from: 1000000, to: 4000000, color: '#8bc34a', name: '1M - 4M' },
                        { from: 4000000, to: 7000000, color: '#afc892', name: '4M - 7M' },
                        { from: 7000000, to: 10000000, color: '#fcd9a1', name: '7M - 10M' },
                        { from: 10000000, color: '#f9a825', name: '> 10M' }
                    ]
                },
                tooltip: {
                    useHTML: true,
                    backgroundColor: {
                        linearGradient: [0, 0, 0, 60],
                        stops: [
                            [0, '#FFFFFF'],
                            [1, '#E0E0E0']
                        ]
                    },
                    pointFormatter: function () {
                        const imageFilename = this.region_cd.trim() + '.svg';
                        return `<div style="text-align: center;">
                                    <img src="./logos/${imageFilename}" style="width:100px;height:100px;">
                                </div><br>
                                <div style="background-color: white; padding: 1em 1.5em; border-radius: 0.5rem;">
                                    <b>${this.region}</b><br>
                                    Кол-во застрахованных: <b>${numberWithSpaces(this.value)}</b><br>
                                    Кол-во ЦМП: <b>${numberWithSpaces(this.val_mpi)}</b><br>
                                    Доля ЦМП: <b>${this.val_mpi_cpzl}</b>
                                </div>`;
                    }
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            useHTML: true,
                            enabled: true,
                            formatter: function () {
                                return `<div style="text-align: center;">
                                            <span>${this.point.hint}</span><br>
                                            <span>${this.point.val_mpi_cpzl}</span>
                                        </div>`;
                            },
                            color: '#2E3033',
                            style: { textOutline: false }
                        }
                    }
                },
                series: [{
                    name: 'Регион:',
                    data: seriesData
                }]
            });
        });
});