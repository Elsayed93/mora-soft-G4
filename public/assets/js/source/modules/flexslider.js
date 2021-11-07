/**
 * Flexslider Scripts.
 * Using jQuery FlexSlider 2
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $slider = $('.flexslider');
        var $slider_thumbnails = $('.flexslider.thumbnails');
        var $slider_intro = $('.flexslider.intro');

        /**
         * default options.
         */
        var intro_options = {
            animation: "slide",
        };

        var thumbnails_options = {
            animation: "slide",
            controlNav: "thumbnails",
        };

        // show slider after load page content
        $slider_thumbnails.show();
        $slider_intro.show();

        // we have default slider selector?
        if ($slider_thumbnails.length) {
            $slider_thumbnails.flexslider(thumbnails_options);
        }

        if ($slider_intro.length) {
            $slider_intro.flexslider(intro_options);
        }

    });

})(jQuery, window, document);