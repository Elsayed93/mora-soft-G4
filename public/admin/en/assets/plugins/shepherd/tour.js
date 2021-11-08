/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


** Custom Shepherd JS

----------------------------------------------*/

$(function() {
    'use strict';

    $(document).ready(function () {
        e(), $(window).resize(e);
        var t = new Shepherd.Tour({ classes: "shadow-md bg-purple-dark", scrollTo: !0 });
        function e() {
            window.resizeEvt,
                576 < $(window).width()
                    ? $("#tour").on("click", function () {
                          clearTimeout(window.resizeEvt), t.start();
                      })
                    : $("#tour").on("click", function () {
                          clearTimeout(window.resizeEvt),
                              t.cancel(),
                              (window.resizeEvt = setTimeout(function () {
                                  alert("Tour only works for large screens!");
                              }, 250));
                      });
        }
        t.addStep("step-1", {
            text: "Here is Start a Tour Button.",
            attachTo: "#tour bottom",
            buttons: [
                { text: `<img src="../../assets/img/svg/skip.svg" alt="" class="svg"> Skip`, classes: 'text-danger', action: t.complete },
                { text: `Next <img src="../../assets/img/svg/next.svg" alt="" class="svg">`, action: t.next },
            ],
        }),
            t.addStep("step-2", {
                text: "Check Here for Language",
                attachTo: ".main-header-language bottom",
                buttons: [
                    { text: `<img src="../../assets/img/svg/skip.svg" alt="" class="svg"> Skip`, classes: 'text-danger', action: t.complete },
                    { text: `<img src="../../assets/img/svg/prev.svg" alt="" class="svg"> prev`, action: t.back },
                    { text: `Next <img src="../../assets/img/svg/next.svg" alt="" class="svg">`, action: t.next },
                ],
            }),
            t.addStep("step-3", {
                text: "Check your notifications from here.",
                attachTo: ".header-icon.notification-icon bottom",
                buttons: [
                    { text: `<img src="../../assets/img/svg/skip.svg" alt="" class="svg"> Skip`, classes: 'text-danger', action: t.complete },
                    { text: `<img src="../../assets/img/svg/prev.svg" alt="" class="svg"> prev`, action: t.back },
                    { text: `Next <img src="../../assets/img/svg/next.svg" alt="" class="svg">`, action: t.next },
                ],
            }),
            t.addStep("step-4", {
                text: "Check Here for Copyright Author!",
                attachTo: ".footer a bottom",
                buttons: [
                    { text: `<img src="../../assets/img/svg/prev.svg" alt="" class="svg"> prev`, action: t.back },
                    { text: `<img src="../../assets/img/svg/done-check.svg" alt="" class="svg"> Done`, action: t.complete },
                ],
            });
    });
});