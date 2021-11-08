/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


** Custom Morris Chart JS

----------------------------------------------*/
$(function() {
    'use strict';
    
        new Morris.Line({
            element: "line-chart",
            data: [
                { year: "2010", iphone: 100, samsung: 40, htc: 62 },
                { year: "2011", iphone: 150, samsung: 200, htc: 120 },
                { year: "2012", iphone: 175, samsung: 105, htc: 80 },
                { year: "2013", iphone: 125, samsung: 150, htc: 75 },
                { year: "2014", iphone: 150, samsung: 275, htc: 100 },
                { year: "2015", iphone: 200, samsung: 325, htc: 80 },
                { year: "2016", iphone: 260, samsung: 130, htc: 90 },
            ],
            xkey: "year",
            ykeys: ["iphone", "samsung", "htc"],
            labels: ["iPhone", "Samsung", "HTC"],
            resize: !0,
            smooth: !1,
            pointSize: 3,
            pointStrokeColors: ["#8280FD", "#67CF94", "#FC7383"],
            gridLineColor: "#e3e3e3",
            behaveLikeLine: !0,
            numLines: 6,
            gridtextSize: 14,
            lineWidth: 3,
            hideHover: "auto",
            lineColors: ["#8280FD", "#67CF94", "#FC7383"],
        });
    
        new Morris.Line({
            element: "smooth-line-chart",
            data: [
                { year: "2010", iphone: 100, samsung: 40, htc: 62 },
                { year: "2011", iphone: 150, samsung: 200, htc: 120 },
                { year: "2012", iphone: 200, samsung: 105, htc: 70 },
                { year: "2013", iphone: 125, samsung: 150, htc: 75 },
                { year: "2014", iphone: 150, samsung: 275, htc: 100 },
                { year: "2015", iphone: 200, samsung: 325, htc: 80 },
                { year: "2016", iphone: 260, samsung: 130, htc: 90 },
            ],
            xkey: "year",
            ykeys: ["iphone", "samsung", "htc"],
            labels: ["iPhone", "Samsung", "HTC"],
            resize: !0,
            smooth: !0,
            pointSize: 3,
            pointStrokeColors: ["#00A5A8", "#FF7D4D", "#FF4558"],
            gridLineColor: "#e3e3e3",
            behaveLikeLine: !0,
            numLines: 6,
            gridtextSize: 14,
            lineWidth: 3,
            hideHover: "auto",
            lineColors: ["#00A5A8", "#FF7D4D", "#FF4558"],
        });
        
        new Morris.Area({
            element: "area-chart",
            data: [
                { year: "2010", iphone: 0, samsung: 0 },
                { year: "2011", iphone: 150, samsung: 90 },
                { year: "2012", iphone: 140, samsung: 120 },
                { year: "2013", iphone: 105, samsung: 240 },
                { year: "2014", iphone: 190, samsung: 140 },
                { year: "2015", iphone: 230, samsung: 250 },
                { year: "2016", iphone: 270, samsung: 190 },
            ],
            xkey: "year",
            ykeys: ["iphone", "samsung"],
            labels: ["iPhone", "Samsung"],
            behaveLikeLine: !0,
            ymax: 300,
            resize: !0,
            pointSize: 0,
            pointStrokeColors: ["#BABFC7", "#5175E0"],
            smooth: !1,
            gridLineColor: "#e3e3e3",
            numLines: 6,
            gridtextSize: 14,
            lineWidth: 0,
            fillOpacity: 0.8,
            hideHover: "auto",
            lineColors: ["#BABFC7", "#5175E0"],
        });
    
        new Morris.Area({
            element: "smooth-area-chart",
            data: [
                { year: "2010", iphone: 0, samsung: 0 },
                { year: "2011", iphone: 150, samsung: 90 },
                { year: "2012", iphone: 140, samsung: 120 },
                { year: "2013", iphone: 105, samsung: 240 },
                { year: "2014", iphone: 190, samsung: 140 },
                { year: "2015", iphone: 230, samsung: 250 },
                { year: "2016", iphone: 270, samsung: 190 },
            ],
            xkey: "year",
            ykeys: ["iphone", "samsung"],
            labels: ["iPhone", "Samsung"],
            behaveLikeLine: !0,
            ymax: 300,
            resize: !0,
            pointSize: 0,
            pointStrokeColors: ["#BABFC7", "#5175E0"],
            smooth: !0,
            gridLineColor: "#e3e3e3",
            numLines: 6,
            gridtextSize: 14,
            lineWidth: 0,
            fillOpacity: 0.8,
            hideHover: "auto",
            lineColors: ["#BABFC7", "#5175E0"],
        });
        
        new Morris.Bar({
            element: "bar-chart",
            data: [
                { y: "2016", a: 650, b: 420 },
                { y: "2015", a: 540, b: 380 },
                { y: "2014", a: 480, b: 360 },
                { y: "2013", a: 320, b: 390 },
            ],
            xkey: "y",
            ykeys: ["a", "b"],
            labels: ["Data 1", "Data 2"],
            barGap: 6,
            barSizeRatio: 0.35,
            smooth: !0,
            gridLineColor: "#e3e3e3",
            numLines: 5,
            gridtextSize: 14,
            fillOpacity: 0.4,
            resize: !0,
            barColors: ["#00A5A8", "#FF7D4D"],
        });
        
        var day_data = [{
            "period": "Jan",
            "licensed": 3407,
            "sorned": 660
        }, {
            "period": "Feb",
            "licensed": 3351,
            "sorned": 629
        }, {
            "period": "Mar",
            "licensed": 3269,
            "sorned": 618
        }, {
            "period": "Apr",
            "licensed": 3246,
            "sorned": 661
        }, {
            "period": "May",
            "licensed": 3257,
            "sorned": 667
        }, {
            "period": "June",
            "licensed": 3248,
            "sorned": 627
        }, {
            "period": "July",
            "licensed": 3171,
            "sorned": 660
        }, {
            "period": "Aug",
            "licensed": 3171,
            "sorned": 676
        }, {
            "period": "Sept",
            "licensed": 3201,
            "sorned": 656
        }, {
            "period": "Oct",
            "licensed": 3215,
            "sorned": 622
        }];

        new Morris.Bar({
            element: 'multiple-bar-chart',
            data: day_data,
            xkey: 'period',
            ykeys: ['licensed', 'sorned'],
            labels: ['Licensed', 'SORN'],
            barColors: ['#00A5A8', '#FF7D4D'],
            xLabelAngle: 0
        });
        var nReloads = 0;
    
        function data(offset) {
            var ret = [];
            for (var x = 0; x <= 360; x += 10) {
                var v = (offset + x) % 360;
                ret.push({
                    x: x,
                    y: Math.sin(Math.PI * v / 180).toFixed(4),
                    z: Math.cos(Math.PI * v / 180).toFixed(4)
                });
            }
            return ret;
        }
        
        new Morris.Donut({
            element: "donut-chart",
            data: [
                { label: "Custard", value: 25 },
                { label: "Frosted", value: 40 },
                { label: "Jam", value: 25 },
                { label: "Sugar", value: 10 },
            ],
            resize: !0,
            labelColor: '#fff',
            colors: ["#00A5A8", "#FF7D4D", "#FF4558", "#626E82"],
        });

        new Morris.Donut({
            element: 'multiple-color-donut-chart',
            data: [{
                value: 35,
                label: 'Custard'
            }, {
                value: 25,
                label: 'Frosted'
            }, {
                value: 15,
                label: 'Jam'
            }, {
                value: 15,
                label: 'Sugar'
            }, {
                value: 10,
                label: 'Jelly'
            }, {
                value: 10,
                label: 'Cake'
            }],
            backgroundColor: '#fff',
            labelColor: '#060',
            colors: ['#00A5A8', '#FF7D4D', '#FF4558', '#626E82', '#fc5296', '#7F53AC', '#f1c40f'],
            formatter: function(x) {
                return x + "%"
            }
        });

        var graph = Morris.Line({
            element: 'animated-line-chart',
            data: data(0),
            xkey: 'x',
            ykeys: ['y', 'z'],
            labels: ['data1', 'data2'],
            lineColors: ['#04cad0', '#564ec1'],
            parseTime: false,
            ymin: -1.0,
            ymax: 1.0,
            hideHover: true
        });
    
        function update() {
            nReloads++;
            graph.setData(data(5 * nReloads));
            $('#reloadStatus').text(nReloads + ' reloads');
        }
        setInterval(update, 100);

});