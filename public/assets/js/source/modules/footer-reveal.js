/**
 * Footer Reveal Scripts.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $site_container = $('body');
        var $site_container_rtl = $('body.rtl');
        var $footer = $site_container.find('#footer-wrap');
        var $footer_bottom = $site_container.find('#footer-bottom-wrap');
        var $main_content = $site_container.find('#content-main-wrap');
        var $content_footer = $site_container.find('#content-footer-wrap');
        var $footer_top = $site_container.find('#footer-top-wrap');

        // we have footer reveal selector?
        if ($site_container.hasClass('footer-reveal')) {

            // push footer to top
            if ($footer.length && $footer_bottom.length) {
                $footer.css('position', 'fixed').css('bottom', $footer_bottom.height());
                $footer_bottom.css('position', 'fixed').css('bottom', 0);
            }

            // add margin bottom to main content for reveal
            if ($footer_top.length) {
                $footer_top.css('margin-bottom', ($footer.height() + $footer_bottom.height() - 1));
            } else if ($content_footer.length) {
                $content_footer.css('margin-bottom', ($footer.height() + $footer_bottom.height() - 1));
            } else {
                $main_content.css('margin-bottom', ($footer.height() + $footer_bottom.height() - 1));
            }


        } // end check footer-reveal


    });

})(jQuery, window, document);