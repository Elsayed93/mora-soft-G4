/**
 * Slider Revolution Scripts.
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
        var $slider_revolution = $site_container.find('#rev_slider_1');
        var sliderLayout = 'auto';

        // update slider layout auto when boxed
        if ($site_container.hasClass('boxed-layout')) {
            sliderLayout = 'auto';
        }

        // we have slider revolution selector?
        if ($slider_revolution.length) {

            /**
             * Initialize the slider based on the Slider's ID.
             */
            var revapi = $slider_revolution.show().revolution({

                disableProgressBar: "on",
                hideThumbsOnMobile: "on",

                // stop slider autoplay
                stopLoop: 'on',
                stopAfterLoops: 0,
                stopAtSlide: 1,

                // options are 'auto', 'fullwidth' or 'fullscreen'
                sliderLayout: sliderLayout, // fullscreen

                // OFFSET SLIDER BY THE HEIGHT OF AN ELEMENT
                fullScreenOffsetContainer: "#header-wrap",

                // Disable Force Full-Width
                fullScreenAlignForce: 'off',

                /* RESPECT ASPECT RATIO */
                autoHeight: 'on',

                /* MIN-HEIGHT */
                minHeight: '500',

                // basic navigation arrows and bullets */
                navigation: {

                    keyboardNavigation: "off",
                    keyboard_direction: "horizontal",
                    mouseScrollNavigation: "off",
                    mouseScrollReverse: "default",
                    onHoverStop: "off",
                    tabs: {
                        style: "hesperiden",
                        enable: true,
                        width: 325,
                        height: 270,
                        min_width: 250,
                        wrapper_padding: 0,
                        wrapper_color: "#ffffff",
                        wrapper_opacity: "1",
                        tmp: '<div class="tp-tab-content"><img src="{{param2}}" class="image is-block"><span class="tp-tab-title">{{title}}</span><span class="tp-tab-date">{{param1}}</span><span class="icon"><i class="ion-ios-arrow-round-forward"></i></span></div>',
                        visibleAmount: 4,
                        hide_onmobile: false,
                        hide_onleave: false,
                        hide_delay: 200,
                        direction: "horizontal",
                        span: false,
                        position: "outer-bottom",
                        space: 0,
                        h_align: "left",
                        v_align: "bottom",
                        h_offset: 0,
                        v_offset: 0
                    }
                },

                // PRELOADER OPTION "2"
                spinner: 'spinner2',

                // Stop Slider out of Viewport
                viewPort: {
                    enable: true,
                    outof: 'wait',
                    visible_area: '80%',
                    presize: true
                },

                parallax: {
                    type: 'mouse+scroll',
                    origo: 'slidercenter',
                    speed: 400,
                    levels: [5, 10, 15, 20, 25, 30, 35, 40,
                        45, 46, 47, 48, 49, 50, 51, 55
                    ],
                    disable_onmobile: 'on'
                },

            });

            // only start the slider once the entire window has loaded
            $(window).on('load', function() {

                revapi.revshowslide(4);

            });

        } // end check slider revolution selector


    });

})(jQuery, window, document);