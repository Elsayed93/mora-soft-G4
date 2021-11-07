/**
 * Charts Scripts.
 * Using chart.js Plugin.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        var $charts = $('.charts');

        // we have chart selector?
        if ($charts.length) {

            window.chartColors = {
                red: 'rgb(255, 99, 132)',
                orange: 'rgb(255, 159, 64)',
                yellow: 'rgb(255, 205, 86)',
                green: 'rgb(75, 192, 192)',
                blue: 'rgb(54, 162, 235)',
                purple: 'rgb(153, 102, 255)',
                grey: 'rgb(201, 203, 207)'
            };

            (function(global) {
                var MONTHS = [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December'
                ];

                var COLORS = [
                    '#4dc9f6',
                    '#f67019',
                    '#f53794',
                    '#537bc4',
                    '#acc236',
                    '#166a8f',
                    '#00a950',
                    '#58595b',
                    '#8549ba'
                ];

                var Samples = global.Samples || (global.Samples = {});
                var Color = global.Color;

                Samples.utils = {
                    // Adapted from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
                    srand: function(seed) {
                        this._seed = seed;
                    },

                    rand: function(min, max) {
                        var seed = this._seed;
                        min = min === undefined ? 0 : min;
                        max = max === undefined ? 1 : max;
                        this._seed = (seed * 9301 + 49297) % 233280;
                        return min + (this._seed / 233280) * (max - min);
                    },

                    numbers: function(config) {
                        var cfg = config || {};
                        var min = cfg.min || 0;
                        var max = cfg.max || 1;
                        var from = cfg.from || [];
                        var count = cfg.count || 8;
                        var decimals = cfg.decimals || 8;
                        var continuity = cfg.continuity || 1;
                        var dfactor = Math.pow(10, decimals) || 0;
                        var data = [];
                        var i, value;

                        for (i = 0; i < count; ++i) {
                            value = (from[i] || 0) + this.rand(min, max);
                            if (this.rand() <= continuity) {
                                data.push(Math.round(dfactor * value) / dfactor);
                            } else {
                                data.push(null);
                            }
                        }

                        return data;
                    },

                    labels: function(config) {
                        var cfg = config || {};
                        var min = cfg.min || 0;
                        var max = cfg.max || 100;
                        var count = cfg.count || 8;
                        var step = (max - min) / count;
                        var decimals = cfg.decimals || 8;
                        var dfactor = Math.pow(10, decimals) || 0;
                        var prefix = cfg.prefix || '';
                        var values = [];
                        var i;

                        for (i = min; i < max; i += step) {
                            values.push(prefix + Math.round(dfactor * i) / dfactor);
                        }

                        return values;
                    },

                    months: function(config) {
                        var cfg = config || {};
                        var count = cfg.count || 12;
                        var section = cfg.section;
                        var values = [];
                        var i, value;

                        for (i = 0; i < count; ++i) {
                            value = MONTHS[Math.ceil(i) % 12];
                            values.push(value.substring(0, section));
                        }

                        return values;
                    },

                    color: function(index) {
                        return COLORS[index % COLORS.length];
                    },

                    transparentize: function(color, opacity) {
                        var alpha = opacity === undefined ? 0.5 : 1 - opacity;
                        return Color(color).alpha(alpha).rgbString();
                    }
                };

                // DEPRECATED
                window.randomScalingFactor = function() {
                    return Math.round(Samples.utils.rand(-100, 100));
                };

                // INITIALIZATION

                Samples.utils.srand(Date.now());

            }(this));

            /**
             * Line Chart
             */
            var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var config = {
                type: 'line',
                data: {
                    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                    datasets: [{
                        label: 'My First dataset',
                        backgroundColor: window.chartColors.red,
                        borderColor: window.chartColors.red,
                        data: [
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor()
                        ],
                        fill: false,
                    }, {
                        label: 'My Second dataset',
                        fill: false,
                        backgroundColor: window.chartColors.blue,
                        borderColor: window.chartColors.blue,
                        data: [
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor()
                        ],
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Chart.js Line Chart'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Month'
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Value'
                            }
                        }]
                    }
                }
            };
            document.getElementById('randomizeData').addEventListener('click', function() {
                config.data.datasets.forEach(function(dataset) {
                    dataset.data = dataset.data.map(function() {
                        return randomScalingFactor();
                    });
                });
                window.myLine.update();
            });
            var colorNames = Object.keys(window.chartColors);
            document.getElementById('addDataset').addEventListener('click', function() {
                var colorName = colorNames[config.data.datasets.length % colorNames.length];
                var newColor = window.chartColors[colorName];
                var newDataset = {
                    label: 'Dataset ' + config.data.datasets.length,
                    backgroundColor: newColor,
                    borderColor: newColor,
                    data: [],
                    fill: false
                };
                for (var index = 0; index < config.data.labels.length; ++index) {
                    newDataset.data.push(randomScalingFactor());
                }
                config.data.datasets.push(newDataset);
                window.myLine.update();
            });
            document.getElementById('addData').addEventListener('click', function() {
                if (config.data.datasets.length > 0) {
                    var month = MONTHS[config.data.labels.length % MONTHS.length];
                    config.data.labels.push(month);
                    config.data.datasets.forEach(function(dataset) {
                        dataset.data.push(randomScalingFactor());
                    });
                    window.myLine.update();
                }
            });
            document.getElementById('removeDataset').addEventListener('click', function() {
                config.data.datasets.splice(0, 1);
                window.myLine.update();
            });
            document.getElementById('removeData').addEventListener('click', function() {
                config.data.labels.splice(-1, 1); // remove the label first
                config.data.datasets.forEach(function(dataset) {
                    dataset.data.pop();
                });
                window.myLine.update();
            });

            /**
             * Bar Chart
             */
            var color = Chart.helpers.color;
            var barChartData = {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [{
                    label: 'Dataset 1',
                    backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
                    borderColor: window.chartColors.red,
                    borderWidth: 1,
                    data: [
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor()
                    ]
                }, {
                    label: 'Dataset 2',
                    backgroundColor: color(window.chartColors.blue).alpha(0.5).rgbString(),
                    borderColor: window.chartColors.blue,
                    borderWidth: 1,
                    data: [
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor()
                    ]
                }]
            };
            document.getElementById('randomizeData-bar').addEventListener('click', function() {
                var zero = Math.random() < 0.2 ? true : false;
                barChartData.datasets.forEach(function(dataset) {
                    dataset.data = dataset.data.map(function() {
                        return zero ? 0.0 : randomScalingFactor();
                    });
                });
                window.myBar.update();
            });
            document.getElementById('addDataset-bar').addEventListener('click', function() {
                var colorName = colorNames[barChartData.datasets.length % colorNames.length];
                var dsColor = window.chartColors[colorName];
                var newDataset = {
                    label: 'Dataset ' + (barChartData.datasets.length + 1),
                    backgroundColor: color(dsColor).alpha(0.5).rgbString(),
                    borderColor: dsColor,
                    borderWidth: 1,
                    data: []
                };
                for (var index = 0; index < barChartData.labels.length; ++index) {
                    newDataset.data.push(randomScalingFactor());
                }
                barChartData.datasets.push(newDataset);
                window.myBar.update();
            });
            document.getElementById('addData-bar').addEventListener('click', function() {
                if (barChartData.datasets.length > 0) {
                    var month = MONTHS[barChartData.labels.length % MONTHS.length];
                    barChartData.labels.push(month);
                    for (var index = 0; index < barChartData.datasets.length; ++index) {
                        // window.myBar.addData(randomScalingFactor(), index);
                        barChartData.datasets[index].data.push(randomScalingFactor());
                    }
                    window.myBar.update();
                }
            });
            document.getElementById('removeDataset-bar').addEventListener('click', function() {
                barChartData.datasets.pop();
                window.myBar.update();
            });
            document.getElementById('removeData-bar').addEventListener('click', function() {
                barChartData.labels.splice(-1, 1); // remove the label first
                barChartData.datasets.forEach(function(dataset) {
                    dataset.data.pop();
                });
                window.myBar.update();
            });

            /**
             * Pie Chart
             */
            randomScalingFactor = function() {
                return Math.round(Math.random() * 100);
            };

            var config_pie = {
                type: 'pie',
                data: {
                    datasets: [{
                        data: [
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                        ],
                        backgroundColor: [
                            window.chartColors.red,
                            window.chartColors.orange,
                            window.chartColors.yellow,
                            window.chartColors.green,
                            window.chartColors.blue,
                        ],
                        label: 'Dataset 1'
                    }],
                    labels: [
                        'Red',
                        'Orange',
                        'Yellow',
                        'Green',
                        'Blue'
                    ]
                },
                options: {
                    responsive: true
                }
            };

            document.getElementById('randomizeData-pie').addEventListener('click', function() {
                config_pie.data.datasets.forEach(function(dataset) {
                    dataset.data = dataset.data.map(function() {
                        return randomScalingFactor();
                    });
                });
                window.myPie.update();
            });
            document.getElementById('addDataset-pie').addEventListener('click', function() {
                var newDataset = {
                    backgroundColor: [],
                    data: [],
                    label: 'New dataset ' + config_pie.data.datasets.length,
                };
                for (var index = 0; index < config_pie.data.labels.length; ++index) {
                    newDataset.data.push(randomScalingFactor());
                    var colorName = colorNames[index % colorNames.length];
                    var newColor = window.chartColors[colorName];
                    newDataset.backgroundColor.push(newColor);
                }
                config_pie.data.datasets.push(newDataset);
                window.myPie.update();
            });
            document.getElementById('removeDataset-pie').addEventListener('click', function() {
                config_pie.data.datasets.splice(0, 1);
                window.myPie.update();
            });

            /**
             * Doughnut Chart
             */
            var config_doughnut = {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                        ],
                        backgroundColor: [
                            window.chartColors.red,
                            window.chartColors.orange,
                            window.chartColors.yellow,
                            window.chartColors.green,
                            window.chartColors.blue,
                        ],
                        label: 'Dataset 1'
                    }],
                    labels: [
                        'Red',
                        'Orange',
                        'Yellow',
                        'Green',
                        'Blue'
                    ]
                },
                options: {
                    responsive: true,
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Chart.js Doughnut Chart'
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                }
            };

            document.getElementById('randomizeData-doughnut').addEventListener('click', function() {
                config_doughnut.data.datasets.forEach(function(dataset) {
                    dataset.data = dataset.data.map(function() {
                        return randomScalingFactor();
                    });
                });
                window.myDoughnut.update();
            });
            document.getElementById('addDataset-doughnut').addEventListener('click', function() {
                var newDataset = {
                    backgroundColor: [],
                    data: [],
                    label: 'New dataset ' + config_doughnut.data.datasets.length,
                };
                for (var index = 0; index < config_doughnut.data.labels.length; ++index) {
                    newDataset.data.push(randomScalingFactor());
                    var colorName = colorNames[index % colorNames.length];
                    var newColor = window.chartColors[colorName];
                    newDataset.backgroundColor.push(newColor);
                }
                config_doughnut.data.datasets.push(newDataset);
                window.myDoughnut.update();
            });
            document.getElementById('addData-doughnut').addEventListener('click', function() {
                if (config_doughnut.data.datasets.length > 0) {
                    config_doughnut.data.labels.push('data #' + config_doughnut.data.labels.length);
                    var colorName = colorNames[config_doughnut.data.datasets[0].data.length % colorNames.length];
                    var newColor = window.chartColors[colorName];
                    config_doughnut.data.datasets.forEach(function(dataset) {
                        dataset.data.push(randomScalingFactor());
                        dataset.backgroundColor.push(newColor);
                    });
                    window.myDoughnut.update();
                }
            });
            document.getElementById('removeDataset-doughnut').addEventListener('click', function() {
                config_doughnut.data.datasets.splice(0, 1);
                window.myDoughnut.update();
            });
            document.getElementById('removeData-doughnut').addEventListener('click', function() {
                config_doughnut.data.labels.splice(-1, 1); // remove the label first
                config_doughnut.data.datasets.forEach(function(dataset) {
                    dataset.data.pop();
                    dataset.backgroundColor.pop();
                });
                window.myDoughnut.update();
            });
            document.getElementById('changeCircleSize').addEventListener('click', function() {
                if (window.myDoughnut.options.circumference === Math.PI) {
                    window.myDoughnut.options.circumference = 2 * Math.PI;
                    window.myDoughnut.options.rotation = -Math.PI / 2;
                } else {
                    window.myDoughnut.options.circumference = Math.PI;
                    window.myDoughnut.options.rotation = -Math.PI;
                }
                window.myDoughnut.update();
            });

            /**
             * Load all chart types.
             */
            window.onload = function() {

                var line_chart = document.getElementById('line-chart').getContext('2d');
                window.myLine = new Chart(line_chart, config);

                var bar_chart = document.getElementById('bar-chart').getContext('2d');
                window.myBar = new Chart(bar_chart, {
                    type: 'bar',
                    data: barChartData,
                    options: {
                        responsive: true,
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Chart.js Bar Chart'
                        }
                    }
                });

                var pie_chart = document.getElementById('pie-chart').getContext('2d');
                window.myPie = new Chart(pie_chart, config_pie);

                var doughnut_chart = document.getElementById('doughnut-chart').getContext('2d');
                window.myDoughnut = new Chart(doughnut_chart, config_doughnut);

            };


        } // end check $charts selector

    });

})(jQuery, window, document);