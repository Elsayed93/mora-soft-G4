/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


** Custom Chart JS

----------------------------------------------*/
$(function() {
    'use strict';

        //Team chart
        var ctx = document.getElementById( "line-chart" );
        var myChart = new Chart( ctx, {
            type: 'line',
            data: {
                labels: [ "2010", "2011", "2012", "2013", "2014", "2015", "2016" ],
                type: 'line',
                defaultFontFamily: '{"PT Sans"}',
                datasets: [ {
                    data: [ 0, 7, 3, 5, 2, 10, 7 ],
                    label: "Expense",
                    backgroundColor: 'rgba(86, 78, 193,.6)',
                    borderColor: 'rgba(86, 78, 193,0.6)',
                    borderWidth: 3.5,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointBorderColor: 'transparent',
                    pointBackgroundColor: 'rgba(86, 78, 193,0.9)',
                        }, ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'index',
                    titleFontSize: 12,
                    titleFontColor: '#000',
                    bodyFontColor: '#000',
                    backgroundColor: '#fff',
                    titleFontFamily: 'PT Sans',
                    bodyFontFamily: 'PT Sans',
                    cornerRadius: 3,
                    intersect: false,
                },
                legend: {
                    display: false,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        fontFamily: 'PT Sans',
                    },
                },
                scales: {
                    xAxes: [ {
                        display: true,
                        gridLines: {
                            display: true,
                            drawBorder: false,
                            color: 'rgb(227, 226, 236,0.4)'
                        },
                        ticks: {
                            fontColor: "#fff",
                        },
                        scaleLabel: {
                            display: false,
                            labelString: 'Month',
                            fontColor: "#fff",
                        }
                            } ],
                    yAxes: [ {
                        display: true,
                        gridLines: {
                            display: true,
                            drawBorder: false,
                            color: 'rgb(227, 226, 236,0.4)'
                        },
                        ticks: {
                            fontColor: "#fff",
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Value',
                            fontColor: "#fff",
                        }
                            } ]
                },
                title: {
                    display: false,
                }
            }
        } );


        //Sales chart
        var ctx = document.getElementById( "area-chart" );
        var myChart = new Chart( ctx, {
            type: 'line',
            data: {
                labels: [ "2010", "2011", "2012", "2013", "2014", "2015", "2016" ],
                type: 'line',
                defaultFontFamily: 'PT Sans',
                datasets: [ {
                    label: "Foods",
                    data: [ 0, 30, 10, 120, 50, 63, 10 ],
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(4, 202, 208,0.75)',
                    borderWidth: 3,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointBorderColor: 'transparent',
                    pointBackgroundColor: 'rgba(4, 202, 208,0.75)',
                        }, {
                    label: "Electronics",
                    data: [ 0, 50, 40, 80, 40, 79, 120 ],
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(86, 78, 193,0.75)',
                    borderWidth: 3,
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointBorderColor: 'transparent',
                    pointBackgroundColor: 'rgba(86, 78, 193,0.75)',
                } ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'index',
                    titleFontSize: 12,
                    titleFontColor: '#000',
                    bodyFontColor: '#000',
                    backgroundColor: '#fff',
                    titleFontFamily: 'PT Sans',
                    bodyFontFamily: 'PT Sans',
                    cornerRadius: 3,
                    intersect: false,
                },
                legend: {
                    display: false,
                    labels: {
                        usePointStyle: true,
                        fontFamily: 'PT Sans',
                    },
                },
                scales: {
                    xAxes: [ {
                        display: true,
                        gridLines: {
                            display: false,
                            drawBorder: false,
                            color: 'rgb(227, 226, 236,0.4)'
                        },
                        ticks: {
                            fontColor: "#fff",

                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Month',
                            fontColor: '#fff'
                        }
                    }],
                    yAxes: [ {
                        display: true,
                        gridLines: {
                            display: true,
                            drawBorder: false,
                            color: 'rgb(227, 226, 236,0.4)'
                        },
                        ticks: {
                            fontColor: "#fff",

                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Value',
                            fontColor: "#fff",
                        }
                            } ]
                },
                title: {
                    display: false,
                    text: 'Normal Legend'
                }
            }
        } );


        //line chart
        var ctx = document.getElementById( "bar-chart" );
        var myChart = new Chart( ctx, {
            type: 'line',
            data: {
                labels: [ "January", "February", "March", "April", "May", "June", "July" ],
                datasets: [
                    {
                        label: "My First dataset",
                        borderColor: "rgba(4, 202, 208,.9)",
                        borderWidth: "1",
                        backgroundColor: "rgba(4, 202, 208,.7)",
                        data: [ 22, 44, 67, 43, 76, 45, 12 ]
                                },
                    {
                        label: "My Second dataset",
                        borderColor: "rgba(86, 78, 193, 0.9)",
                        borderWidth: "1",
                        backgroundColor: "rgba(86, 78, 193, 0.7)",
                        pointHighlightStroke: "rgba(26,179,148,1)",
                        data: [ 16, 32, 18, 26, 42, 33, 44 ]
                                }
                            ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'index',
                    intersect: false
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [ {
                        display: true,
                        gridLines: {
                            display: false,
                            drawBorder: false,
                            color: 'rgb(227, 226, 236,0.4)'
                        },
                        ticks: {
                            fontColor: "#fff",

                        },
                        scaleLabel: {
                            display: false,
                            labelString: 'Month',
                        }
                            } ],
                    yAxes: [ {
                        display: true,
                        gridLines: {
                            display: true,
                            drawBorder: false,
                            color: 'rgb(227, 226, 236,0.4)'
                        },
                        ticks: {
                            fontColor: "#fff",

                        },
                        scaleLabel: {
                            display: false,
                            labelString: 'Value',
                            fontColor: "#fff",
                        }
                            } ]
                },
                title: {
                    display: false,
                    text: 'Normal Legend'
                },
                legend: {
                    labels: {
                        usePointStyle: true,
                        fontFamily: 'PT Sans',
                        fontColor: '#fff'
                    },
                }
            }
        } );


        //bar chart
        var ctx = document.getElementById( "radar-chart" );
        var myChart = new Chart( ctx, {
            type: 'bar',
            data: {
                labels: [ "January", "February", "March", "April", "May", "June", "July" ],
                datasets: [
                    {
                        label: "My First dataset",
                        data: [ 65, 59, 80, 81, 56, 55, 40 ],
                        borderColor: "rgba(86, 78, 193, 0.9)",
                        borderWidth: "0",
                        backgroundColor: "rgba(86, 78, 193, 0.7)"
                                },
                    {
                        label: "My Second dataset",
                        data: [ 28, 48, 40, 19, 86, 27, 90 ],
                        borderColor: "rgba(4, 202, 208,0.9)",
                        borderWidth: "0",
                        backgroundColor: "rgba(4, 202, 208,0.7)"
                                }
                            ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [ {
                        display: true,
                        gridLines: {
                            display: false,
                            drawBorder: false,
                            color: 'rgb(227, 226, 236,0.4)'
                        },
                        ticks: {
                            fontColor: "#fff",
                        },
                        scaleLabel: {
                            display: false,
                            labelString: 'Month',
                            fontColor: "#fff",
                        }
                            } ],
                    yAxes: [ {
                        display: true,
                        gridLines: {
                            display: true,
                            drawBorder: false,
                            color: 'rgb(227, 226, 236,0.4)'
                        },
                        ticks: {
                            fontColor: "#fff",
                        },
                        scaleLabel: {
                            display: false,
                            labelString: 'Value',
                            fontColor: "#fff",
                        }
                    } ]
                },
                legend: {
                    labels: {
                        usePointStyle: true,
                        fontFamily: 'PT Sans',
                        fontColor: '#fff'
                    },
                }
            }
        } );

        //radar chart
        var ctx = document.getElementById( "line-chart2" );
        var myChart = new Chart( ctx, {
            type: 'radar',
            data: {
            labels: [ [ "Eating", "Dinner" ], [ "Drinking", "Water" ], "Sleeping", [ "Designing", "Graphics" ], "Coding", "Cycling", "Running" ],
                datasets: [
                    {
                        label: "My First dataset",
                        data: [ 65, 59, 66, 45, 56, 55, 40 ],
                        borderColor: "rgba(86, 78, 193, 0.6)",
                        borderWidth: "1",
                        backgroundColor: "rgba(86, 78, 193, 0.4)"
                    },
                    {
                        label: "My Second dataset",
                        data: [ 28, 12, 40, 19, 63, 27, 87 ],
                        borderColor: "rgba(255, 202, 208, 0.7",
                        borderWidth: "1",
                        backgroundColor: "rgba(4, 202, 208, 0.8)"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scale: {
                    ticks: {
                        beginAtZero: true,
                    },
                    gridLines: {
                        color: 'white',
                    },
                    pointLabels:{
                        fontColor:"#fff",
                    },
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        fontFamily: 'PT Sans',
                        fontColor: '#fff'
                    },
                }
            }
        } );


        //pie chart
        var ctx = document.getElementById( "pie-chart" );
        var myChart = new Chart( ctx, {
            type: 'pie',
            data: {
                segmentStrokeWidth: 20,
                segmentStrokeColor: "red",
                datasets: [ {
                    data: [ 45, 25, 20, 10 ],
                    backgroundColor: [
                                        "#564ec1",
                                        "#04cad0",
                                        "#ff9900",
                                        "#f5334f"
                                    ],
                    hoverBackgroundColor: [

                                        "#564ec1",
                                        "#04cad0",
                                        "#ff9900",
                                        "#f5334f"
                                    ]

                                } ],
                labels: [
                                "Server 1",
                                "Server 2",
                                "Server 3",
                                "Server 4",
                            ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                elements: {
                    arc: {
                        borderWidth: 0
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        fontFamily: 'PT Sans',
                        fontColor: '#fff'
                    },
                },
            },
        } );

        //doughut chart
        var ctx = document.getElementById( "doughnut-chart" );
        var myChart = new Chart( ctx, {
            type: 'doughnut',
            data: {
                datasets: [ {
                    data: [ 45, 25, 20, 10 ],
                    backgroundColor: [
                                        "#564ec1",
                                        "#04cad0",
                                        "#ff9900",
                                        "#f5334f"
                                    ],
                    hoverBackgroundColor: [
                                        "#564ec1",
                                        "#04cad0",
                                        "#ff9900",
                                        "#f5334f"
                                    ]

                                } ],
                labels: [
                                "Server 1",
                                "Server 2",
                                "Server 3",
                                "Server 4",
                            ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                elements: {
                    arc: {
                        borderWidth: 0
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        fontFamily: 'PT Sans',
                        fontColor: '#fff'
                    },
                }
            }
        } );

        //polar chart
        var ctx = document.getElementById( "polar-chart" );
        var myChart = new Chart( ctx, {
            type: 'polarArea',
            data: {
                datasets: [ {
                    data: [ 15, 18, 9, 6, 19 ],
                    backgroundColor: [
                                        "#564ec1",
                                        "#04cad0",
                                        "#ff9900",
                                        "#f5334f",
                                        "#67e095"
                                    ]

                                } ],
                labels: [
                                "Data1",
                                "Data2",
                                "Data3",
                                "Data4",
                                "Data5"
                            ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scale: {
                    ticks: {
                        beginAtZero: true,
                    },
                    gridLines: {
                        color: 'white',
                    },
                    pointLabels:{
                        fontColor:"#fff",
                    },
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        fontFamily: 'PT Sans',
                        fontColor: '#fff'
                    },
                }
            }
        } );

        // single bar chart
        var ctx = document.getElementById( "single-bar-chart" );
        var myChart = new Chart( ctx, {
            type: 'bar',
            data: {
                labels: [ "Sun", "Mon", "Tu", "Wed", "Th", "Fri", "Sat" ],
                datasets: [
                    {
                        label: "My First dataset",
                        fontColor: "#9493a9",
                        data: [ 40, 55, 75, 81, 56, 55, 40 ],
                        borderColor: "rgba(86, 78, 193, 0.9)",
                        borderWidth: "0",
                        backgroundColor: "rgba(86, 78, 193, 0.8)"
                                }
                            ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        barPercentage: 0.2,
                        ticks: {
                            fontColor: "#fff",
                        },
                        gridLines: {
                            color: 'rgb(227, 226, 236,0.4)'
                        },
                    }],
                    yAxes: [ {
                        ticks: {
                            beginAtZero: true,
                            fontColor: "#fff",
                        },
                        gridLines: {
                            color: 'rgb(227, 226, 236,0.4)'
                        }
                    } ]
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        fontFamily: 'PT Sans',
                        fontColor: '#fff'
                    },
                }
            }
        } );

        /* chartjs (#sales) */
        var myCanvas = document.getElementById("single-bar-chart2");
        myCanvas.height="300";

        var myCanvasContext = myCanvas.getContext("2d");
        var gradientStroke = myCanvasContext.createLinearGradient(0, 0, 0, 380);
        gradientStroke.addColorStop(0, '#564ec1');
        gradientStroke.addColorStop(1, '#564ec1');
        var myChart = new Chart( myCanvas, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                type: 'line',
                datasets: [ {
                    label: 'Return-On-Assets',
                    data: [0, 50, 10, 100, 20, 130, 100, 140, 50],
                    backgroundColor: gradientStroke,
                    borderColor: '#564ec1',
                    pointBackgroundColor:'#fff',
                    pointHoverBackgroundColor:gradientStroke,
                    pointBorderColor :'#564ec1',
                    pointHoverBorderColor :gradientStroke,
                    pointBorderWidth :2,
                    pointRadius :6,
                    pointHoverRadius :2,
                    borderWidth: 2
                }, ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                tooltips: {
                    mode: 'index',
                    titleFontSize: 12,
                    titleFontColor: '#000',
                    bodyFontColor: '#000',
                    backgroundColor: '#fff',
                    cornerRadius: 3,
                    intersect: false,
                },
                legend: {
                    display: false,
                    labels: {
                        usePointStyle: false,
                        fontFamily: 'PT Sans',
                        fontColor: '#fff'
                    },
                },
                scales: {
                    xAxes: [{
                        ticks: {
                            fontColor: "#9493a9",
                        },
                        display: true,
                        gridLines: {
                            display: false,
                            drawBorder: false
                        },
                        scaleLabel: {
                            display: false,
                            labelString: 'Month',
                            fontColor: 'transparent'
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            fontColor: "#9493a9",
                        },
                        display: true,
                        gridLines: {
                            display: false,
                            drawBorder: false
                        },
                        scaleLabel: {
                            display: false,
                            labelString: 'sales',
                            fontColor: 'transparent'
                        }
                    }]
                },
                title: {
                    display: false,
                    text: 'Normal Legend'
                }
            }
        });
        /* chartjs (#sales) closed */

        /* Chart-js (#site-executive) */
        var myCanvas = document.getElementById("single-bar-chart3");
        myCanvas.height = "290";
        var myCanvasContext = myCanvas.getContext("2d");
        var gradientStroke1 = myCanvasContext.createLinearGradient(0, 0, 0, 200);
        gradientStroke1.addColorStop(0, 'transparent');
        gradientStroke1.addColorStop(1, 'transparent');
        var gradientStroke2 = myCanvasContext.createLinearGradient(0, 0, 0, 190);
        gradientStroke2.addColorStop(0, 'transparent');
        gradientStroke2.addColorStop(1, 'transparent');
        var myChart = new Chart(myCanvas, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                type: 'line',
                datasets: [{
                    label: "Users",
                    data: [2, 7, 3, 9, 4, 5, 2, 8, 4, 6, 5, 2, 8, 4, 7, 2, 4, 6, 4, 8, 4, ],
                    backgroundColor: gradientStroke1,
                    borderColor: '#564ec1',
                    pointBackgroundColor: '#fff',
                    pointHoverBackgroundColor: gradientStroke1,
                    pointBorderColor: '#564ec1',
                    pointHoverBorderColor: gradientStroke1,
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 4,
                    labelColor: gradientStroke1,
                    borderWidth: 2,
                }, {
                    label: "Page-views",
                    data: [5, 3, 9, 6, 5, 9, 7, 3, 5, 2, 5, 3, 9, 6, 5, 9, 7, 3, 5, 2, 7, 10],
                    backgroundColor: gradientStroke2,
                    borderColor: '#04cad0',
                    pointBackgroundColor: '#fff',
                    pointHoverBackgroundColor: gradientStroke2,
                    pointBorderColor: '#04cad0',
                    pointHoverBorderColor: gradientStroke2,
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 4,
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: true
                },
                tooltips: {
                    show: true,
                    showContent: true,
                    alwaysShowContent: true,
                    triggerOn: 'mousemove',
                    trigger: 'axis',
                    axisPointer: {
                        label: {
                            show: false,
                        },
                    }
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            color: '#9493a9',
                            zeroLineColor: 'rgb(227, 226, 236,0.4)'
                        },
                        ticks: {
                            fontSize: 12,
                            fontColor: '#9493a9',
                            beginAtZero: true,
                            padding: 0
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            color: 'transparent',
                            zeroLineColor: 'rgb(227, 226, 236,0.4)'
                        },
                        ticks: {
                            fontSize: 12,
                            fontColor: '#9493a9',
                            beginAtZero: false,
                            padding: 0
                        }
                    }]
                },
                title: {
                    display: false,
                },
                elements: {
                    line: {
                        borderWidth: 2
                    },
                    point: {
                        radius: 0,
                        hitRadius: 10,
                        hoverRadius: 4
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        fontFamily: 'PT Sans',
                        fontColor: '#fff'
                    },
                }
            }
        });

});
