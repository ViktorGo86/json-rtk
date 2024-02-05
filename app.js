document.addEventListener('DOMContentLoaded', function () {

    function fetchDataAndProcess(url) {
        return fetch(url)
          .then(response => response.json())
          .then(data => {
            // Group by category1 and category2 while summing attribut1 and counting attribut2
            return data.reduce((acc, obj) => {
                //const key = `${obj.coordinat_x}_${obj.coordinat_y}`;
                const key = `${obj.region_cd}_${obj.region_name}_${obj.coordinat_x}_${obj.coordinat_y}_${obj.code}`;
                if (!acc[key]) {
                    //acc[key] = { coordinat_x: obj.coordinat_x, category2: obj.coordinat_y, sumcpzl: 0, summpi: 0 };
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
                //acc[key].mpi_cpzl += obj.count_mpi;
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
//fetchDataAndProcess('https://mocki.io/v1/7a1d8097-9b41-4f6b-9eb2-fd337ec9b386')
fetchDataAndProcess('https://mp505737ab307e812387.free.beeceptor.com/regions')
//fetchDataAndProcess('http://localhost:3000/regions')
.then(result => {
    console.log('Result:', Object.values(result));


        // Load data from JSON file
      /*  fetch('http://localhost:3000/regions')
        .then(response => response.json())
        .then(data => {
            // Create series data for tilemap
            const seriesData = data.map(item => ({
                        x: item.coordinat_x, //x: item.coordinates[0],
                        y: item.coordinat_y, //y: item.coordinates[1],
                        value: item.cpzl,
                        region: item.region_name,
                        val_mpi: item.mpi,
                        val_mpi_cpzl: item.mpi_cpzl,
                        hint: item.code
                    }));*/

                    const seriesData = Object.values(result).map(item => ({
                        x: item.coordinat_x, //x: item.coordinates[0],
                        y: item.coordinat_y, //y: item.coordinates[1],
                        value: item.cpzl,
                        region: item.region_name,
                        val_mpi: item.mpi,
                        val_mpi_cpzl: item.mpi_cpzl.toFixed(2),
                        hint: item.code,
                        region_cd: item.region_cd
                    }));
            
            
            
            const Data1 = Object.values(seriesData);
            console.log(Data1);

            Highcharts.chart('container', {
                chart: {
                    type: 'tilemap',
                    inverted: true,
                    height: '55%'
                },

                accessibility: {
                    description: '',
                    screenReaderSection: {
                        beforeChartFormat:
                        '<h5>{chartTitle}</h5>' +
                        '<div>{chartSubtitle}</div>' +
                        '<div>{chartLongdesc}</div>' +
                        '<div>{viewTableButton}</div>'
                    },
                    point: {
                        valueDescriptionFormat: '{index}. {xDescription}, {point.value}.'
                    }
                },
                credits: {
                    enabled: false
                },
                exporting: false,
                title: {
                    text: 'Тепловая карта по регионам. Доля ЦМП по отношению к ЗЛ в разрезе регионов',
                    style: {
                        fontSize: '1em'
                    }
                },

                subtitle: {
                    text: 'auhtor: Gnidenko V. <br> График построен при помощи библиотек highcharts.com'
                },

                xAxis: {
                    visible: false
                },

                yAxis: {
                    visible: false
                },

                legend: {
                    title: {
                        text: 'Количество застрахованных:'
                    },
                    align: 'right',
                    verticalAlign: 'bottom',
                    floating: true,
                    layout: 'vertical',
                    valueDecimals: 0,
                    //backgroundColor: 'rgba(255,255,255,0.9)',
                    symbolRadius: 0,
                    symbolHeight: 14
                },

                colorAxis: {
                    dataClasses: [{
                            from: 0,
                            to: 1000000,
                            color: '#ECEFF1',
                            name: '< 1M'
                        }, {
                            from: 1000000,
                            to: 4000000,
                            color: '#8bc34a',
                            name: '1M - 4M'
                        }, {
                            from: 4000000,
                            to: 7000000,
                            color: '#afc892',
                            name: '4M - 7M'
                        }, {
                            from: 7000000,
                            to: 10000000,
                            color: '#fcd9a1',
                            name: '7M - 10M'
                        }, {
                            from: 10000000,
                            color: '#f9a825',
                            name: '> 10M'
                        }
                    ]
                },

                /*tooltip: {
                    headerFormat: '',
                    pointFormat: '<b>{point.region}</b> <br> <b>Кол-во застрахованных:</b> {point.value}  <br> <b>Кол-во ЦМП:</b> {point.val_mpi}<br> <b>Доля ЦМП:</b> {point.val_mpi_cpzl}'
                },*/
                /*tooltip: {
                    useHTML: true,
                    formatter: function() {
                      var img = '<img src = "https://grizly.club/uploads/posts/2023-08/1691114049_grizly-club-p-kartinki-logo-bez-fona-60.png" height="82" width="122"/>'
                      return img
                    }
                  },*/
                  tooltip: {
                    //backgroundColor: '#F0FFF0',
                    backgroundColor: {
                        linearGradient: [0, 0, 0, 60],
                        stops: [
                            [0, '#FFFFFF'],
                            [1, '#E0E0E0']
                        ]
                    },
                    //shadow: false,
                    useHTML: true,
                    pointFormatter: function () {
                        // Assuming your data has an 'image' property which contains the image filename
                        var imageFilename = this.region_cd.trim()+'.svg';
                       // return '<b>' + this.region + '</b><br><img src="./logos/' + imageFilename + '" style="width:100px;height:100px;">'+ imageFilename;
                       return '<div style="text-align: center;"><img src="./logos/' + imageFilename + '" style="width:100px;height:100px;"></div><br>'
                       +'<div style="background-color: white; padding: 1em 1.5em; border-radius: 0.5rem; text-decoration: none;"><b>' + this.region + '</b> <br>'
                       +'Кол-во застрахованных: <b>' + numberWithSpaces(this.value)+ '</b>'
                       + '<br>Кол-во ЦМП: <b>' + numberWithSpaces(this.val_mpi)+ '</b>'
                       +'<br>Доля ЦМП: <b>' +this.val_mpi_cpzl+ '</b>'
                       +'</div>'
                       ;
                    }
                    /*formatter: function() {    
                        return `<div style="background: #F0FFF0; padding: 10px;">
                        <img src = "./logos/'" height="100" width="100"/><br>
                        <b>${this.point.region}</b> <br> 
                        <b>Кол-во застрахованных:</b> ${this.point.value} <br> 
                        <b>Кол-во ЦМП:</b> ${this.point.val_mpi}<br> 
                        <b>Доля ЦМП:</b> ${this.point.val_mpi_cpzl} <br> ${this.point.region_cd}
                        </div>
                        `;
                    }*/
                  },
               /* tooltip: {
                formatter: function () {
                    //const photoUrl = photoCatalog[this.point.photoId];
                    var img1 = document.createElement("img");
                    img1.src = 'logos/chart.png';  
                    return `
                      <div style="text-align: center;">
                      <img src='https://grizly.club/uploads/posts/2023-08/1691114049_grizly-club-p-kartinki-logo-bez-fona-60.png' alt="Photo" style="max-width: 100%; max-height: 100px;">
                        <br>
                        Value: {point.value}
                      </div>
                    `;
                  }
                },*/
 
                plotOptions: {
                    series: {
                        dataLabels: {
                            useHTML: true,
                            enabled: true,
                            //format: '{point.hint}<br>{point.val_mpi_cpzl}',
                            formatter: function () {
                                return `
                                  <div style="text-align: center;">
                                    <span>${this.point.hint}</span><br>
                                    <span>${this.point.val_mpi_cpzl}</span>
                                  </div>
                                `;
                              },
                            color: '#2E3033', //'#000000',
                            style: {
                               textOutline: false
                                //,fontWeight: 'normal'
                                //,fontSize: '10px'
                                //, textAlign: 'center'


                            }
                        }
                    }
                },
                series: [{
                        name: 'Регион:',//'Regions',
                        data: seriesData
                    }
                ]

           // }); //********************************************************************* */
       // }) // .then(data => {
        //.catch(error => console.error('Error processing data:', error));
        });
        /*}

        dummyChart()*/
        //Fetch Data from API

        /*async function getDummyData() {
        const apiUrl = "http://localhost:3000/states"

        const response = await fetch(apiUrl)
        const barChatData = await response.json()

        console.log(barChatData)


        const p_code  = barChatData.map((x) => x.col_code )
        const p_region  = barChatData.map((x) => x.col_region )
        const p_category  = barChatData.map((x) => x.col_category )
        const p_x  = barChatData.map((x) => x.col_x )
        const p_y  = barChatData.map((x) => x.col_y )
        const p_value  = barChatData.map((x) => x.col_value )
        console.log(p_code, p_region, p_category, p_x, p_y, p_value)

        reg_code = p_code
        reg_region = p_region
        reg_category = p_category
        reg_x = p_x
        reg_y = p_y
        reg_value = p_value




        }*/

    });
});
