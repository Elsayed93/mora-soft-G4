/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


** Custom noUiSlider JS

----------------------------------------------*/

$(function() {
    'use strict';

    $(document).ready(function () {
        var e = document.getElementById("slider-handles");
        noUiSlider.create(e, { start: [4e3, 8e3], range: { min: [2e3], max: [1e4] } });
        var t = document.getElementById("slider-snap");

        noUiSlider.create(t, { start: [0, 500], snap: !0, connect: !0, range: { min: 0, "10%": 50, "20%": 100, "30%": 150, "40%": 500, "50%": 800, max: 1e3 } });

        let tapSlider = document.getElementById("tap");
        noUiSlider.create(tapSlider, { start: 40, behaviour: "tap", connect: "upper", range: { min: 20, max: 80 } });

        var r = document.getElementById("drag");
        noUiSlider.create(r, { start: [40, 60], behaviour: "drag", connect: !0, range: { min: 20, max: 80 } });

        let dragFixedSlider = document.getElementById("drag-fixed");
        noUiSlider.create(dragFixedSlider, { start: [40, 60], behaviour: "drag-fixed", connect: !0, range: { min: 20, max: 80 } });

        let dragTapSlider = document.getElementById("combined");
        noUiSlider.create(dragTapSlider, { start: [40, 60], behaviour: "drag-tap", connect: !0, range: { min: 20, max: 80 } });


        var i = { min: [0], "10%": [5, 5], "50%": [40, 10], max: [100] },
            o = document.getElementById("pips-range");
        noUiSlider.create(o, { range: i, start: 0, pips: { mode: "range", density: 3 } });

        var d = document.getElementById("pips-steps-filter");
        noUiSlider.create(d, {
            range: { min: [0], "10%": [5, 5], "50%": [25, 20], max: [50, 50] },
            start: 0,
            pips: {
                mode: "steps",
                density: 5,
                filter: function (e, t) {
                    return 0 === t ? (e < 50 ? -1 : 0) : e % 50 ? 2 : 1;
                },
                format: wNumb({ decimals: 0, prefix: "$" }),
            },
        });

        for (var v = d.querySelectorAll(".noUi-connect"), y = ["bg-primary", "bg-success", "bg-info", "bg-danger", "bg-warning"], S = 0; S < v.length; S++) v[S].classList.add(y[S]);

        var j = document.getElementById("connect-lower-1");
        noUiSlider.create(j, { start: 30, orientation: "vertical", connect: "lower", range: { min: 0, max: 100 } });

        var k = document.getElementById("connect-lower-2");
        noUiSlider.create(k, { start: 60, orientation: "vertical", connect: "lower", range: { min: 0, max: 100 } });

        var z = document.getElementById("connect-lower-3");
        noUiSlider.create(z, { start: 70, orientation: "vertical", connect: "lower", range: { min: 0, max: 100 } });

        var G = document.getElementById("connect-lower-4");
        noUiSlider.create(G, { start: 40, orientation: "vertical", connect: "lower", range: { min: 0, max: 100 } });

        var K = document.getElementById("connect-lower-5");
        noUiSlider.create(K, { start: 60, orientation: "vertical", connect: "lower", range: { min: 0, max: 100 } });

        var P = document.getElementById("connect-upper-1");
        noUiSlider.create(P, { start: 60, orientation: "vertical", connect: "upper", range: { min: 0, max: 100 } });

        var Q = document.getElementById("connect-upper-2");
        noUiSlider.create(Q, { start: 40, orientation: "vertical", connect: "upper", range: { min: 0, max: 100 } });

        var R = document.getElementById("connect-upper-3");
        noUiSlider.create(R, { start: 30, orientation: "vertical", connect: "upper", range: { min: 0, max: 100 } });

        var V = document.getElementById("connect-upper-4");
        noUiSlider.create(V, { start: 60, orientation: "vertical", connect: "upper", range: { min: 0, max: 100 } });

        var X = document.getElementById("connect-upper-5");
        noUiSlider.create(X, { start: 50, orientation: "vertical", connect: "upper", range: { min: 0, max: 100 } });

        var Z = document.getElementById("slider-tooltips-1");
        noUiSlider.create(Z, { start: [10, 50], orientation: "vertical", tooltips: [!1, wNumb({ decimals: 1 })], range: { min: 0, max: 100 } });

        var _ = document.getElementById("slider-tooltips-2");
        noUiSlider.create(_, { start: [10, 70], orientation: "vertical", tooltips: [!1, wNumb({ decimals: 1 })], range: { min: 0, max: 100 } });

        var ee = document.getElementById("slider-tooltips-3");
        noUiSlider.create(ee, { start: [20, 90], orientation: "vertical", tooltips: [!1, wNumb({ decimals: 1 })], range: { min: 0, max: 100 } });

        var te = document.getElementById("slider-direction-top-bottom-1");
        noUiSlider.create(te, { range: i, start: 30, connect: "lower", orientation: "vertical", pips: { mode: "range", density: 5 } });

        var re = document.getElementById("slider-direction-top-bottom-2");
        noUiSlider.create(re, { range: i, start: 50, connect: "lower", orientation: "vertical", pips: { mode: "range", density: 5 } });

        var ne = document.getElementById("slider-direction-top-bottom-3");
        noUiSlider.create(ne, { range: i, start: 70, connect: "lower", orientation: "vertical", pips: { mode: "range", density: 5 } });

        function le(e) {
            return new Date(e).getTime();
        }

        var me = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            ge = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var ue = new Date(),
            se = new Date();
        se.setMonth(se.getMonth() - 1);

        var ve = document.getElementById("slider-with-date");
        noUiSlider.create(ve, { behaviour: "tap", connect: !0, range: { min: le("2016-06-01") + 864e5, max: le(ue) }, step: 864e5, start: [le(se), le(ue)] });

        var ye = [document.getElementById("event-start"), document.getElementById("event-end")];
        ve.noUiSlider.on("update", function (e, t) {
            var r;
            ye[t].innerHTML =
                ((r = new Date(+e[t])),
                me[r.getDay()] +
                    ", " +
                    r.getDate() +
                    (function (e) {
                        if (3 < e && e < 21) return "th";
                        switch (e % 10) {
                            case 1:
                                return "st";
                            case 2:
                                return "nd";
                            case 3:
                                return "rd";
                            default:
                                return "th";
                        }
                    })(r.getDate()) +
                    " " +
                    ge[r.getMonth()] +
                    " " +
                    r.getFullYear());
        });
        var Se = document.getElementById("slider-select");
        for (S = -20; S <= 40; S++) {
            var pe = document.createElement("option");
            (pe.text = S), (pe.value = S), Se.appendChild(pe);
        }
        var Ee = document.getElementById("slider-with-input");
        noUiSlider.create(Ee, { start: [10, 30], connect: !0, range: { min: -20, max: 40 } });
        var Ue = document.getElementById("slider-input-number");
        Ee.noUiSlider.on("update", function (e, t) {
            var r = e[t];
            t ? (Ue.value = r) : (Se.value = Math.round(r));
        }),
            Se.addEventListener("change", function () {
                Ee.noUiSlider.set([this.value, null]);
            }),
            Ue.addEventListener("change", function () {
                Ee.noUiSlider.set([null, this.value]);
            });
    });
    
});
