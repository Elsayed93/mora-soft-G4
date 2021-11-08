/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


** Custom Repetar JS

----------------------------------------------*/

$(function() {
    'use strict';

    $(document).ready(function () {
        $(".file-repeater, .contact-repeater, .repeater-default").repeater({
            show: function () {
                $(this).slideDown();
            },
            hide: function (e) {
                confirm("Are you sure you want to delete this element?") && $(this).slideUp(e);
            },
        });
    });
});