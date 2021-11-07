/**
 * Counterup, CountDown Scripts.
 * Using jquery.counterup jQuery Plugin.
 * Using jquery.countdown jQuery Plugin.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $counter = $('.counter');
        var $countdown = $('.countdown-time');

        // check @rtl
        var html_dir = $('html').attr('dir');
        var is_rtl = false;
        if ($('body').hasClass('rtl') || $('html').hasClass('rtl') || html_dir == 'rtl') {
            is_rtl = true;
        }

        // we have counter selector?
        if ($counter.length) {

            $counter.counterUp({
                time: 1000,
                delay: 10,
                beginAt: 1,
            });

        } // end check $counter

        // we have counter selector?
        if ($countdown.length) {

            $countdown.each(function() {
                if (is_rtl) {
                    $(this).countDown({
                        with_separators: false,
                        label_dd: 'أيام',
                        label_hh: 'ساعات',
                        label_mm: 'دقائق',
                        label_ss: 'ثوانى',
                    });
                } else {
                    $(this).countDown({
                        with_separators: false,
                    });
                }

            });

        } // end check $countdown

    });

})(jQuery, window, document);