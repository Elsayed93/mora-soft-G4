/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


** Custom Summernote JS

----------------------------------------------*/

$(function () {
    "use strict";

    $(function () {
        var $summerNote = $('[data-trigger="summernote"]');

        if ( $summerNote.length ) {
            $summerNote.summernote({
                placeholder: 'Message',
                height: 300,
                disableResizeEditor: true
            });
        }
        $('.note-statusbar').hide()
    });
}(jQuery));