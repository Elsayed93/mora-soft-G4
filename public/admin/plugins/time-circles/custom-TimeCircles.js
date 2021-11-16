/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


** Custom TimeCircle JS

----------------------------------------------*/
$(function() {
    'use strict';

    $("#DateCountdown").TimeCircles({
        animation: "smooth",
        bg_width: 0.9,
        fg_width: 0.03,
        circle_bg_color: "#fff",
        time: {
            Days: { color: "#09D1DE" },
            Hours: { color: "#C491FF" },
            Minutes: { color: "#E580FD" },
            Seconds: { color: "#4F9DF8" }
        }
    });
});