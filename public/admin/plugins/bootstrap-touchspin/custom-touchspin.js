/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


** Bootstrap Touchspin

----------------------------------------------*/

$(function() {
    'use strict';

    $("input[name='demo0']").TouchSpin();
    $("input[name='demo1']").TouchSpin();
    $("input[name='demo2']").TouchSpin({
        step: 0.5,
        decimals: 2,
    });
    $("input[name='demo3']").TouchSpin({
        min: 30,
        max: 40,
    });
    $("input[name='demo4']").TouchSpin({
        step: 5,
    });
    $("input[name='demo5']").TouchSpin({
        min: -1000000000,
        max: 1000000000,
        stepinterval: 50,
        maxboostedstep: 10000000,
        prefix: '$'
    });
    $("input[name='demo6']").TouchSpin({
        min: 0,
        max: 100,
        step: 0.1,
        decimals: 2,
        boostat: 5,
        maxboostedstep: 10,
        postfix: '%'
    });
    $("input[name='demo7']").TouchSpin({
        prefix: "pre",
        postfix: "post"
    });
    $("input[name='demo_vertical']").TouchSpin({
        verticalbuttons: true,
        verticalupclass: 'glyphicon glyphicon-plus',
        verticaldownclass: 'glyphicon glyphicon-minus'
    });

    $('#demo_vertical').parent('.input-group').addClass('style--two')

});