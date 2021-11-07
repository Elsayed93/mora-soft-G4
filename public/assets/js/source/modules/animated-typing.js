/**
 * Animated Typing Scripts.
 * Using Typed.js Plugin.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $animated_typing = $('.animated-typing');

        // we have typed selector?
        if ($animated_typing.length) {

            if ($('#typed').length) {
                var typed = new Typed("#typed", {
                    stringsElement: '#typed-strings',
                    typeSpeed: 30,
                    backSpeed: 30,
                    backDelay: 500,
                    startDelay: 1000,
                    loop: true,
                });
            }

            if ($('#typed-intro').length) {
                var typed_intro = new Typed("#typed-intro", {
                    stringsElement: '#typed-strings-intro',
                    typeSpeed: 150,
                    backSpeed: 150,
                    backDelay: 800,
                    startDelay: 800,
                    loop: true,
                });
            }

            if ($('#typed-1').length) {
                var typed_1 = new Typed("#typed-1", {
                    stringsElement: '#typed-strings-1',
                    typeSpeed: 30,
                    backSpeed: 30,
                    backDelay: 500,
                    startDelay: 1000,
                    loop: true,
                    cursorChar: '_',
                    shuffle: true,
                });
            }


            if ($('#typed-2').length) {
                var typed_2 = new Typed("#typed-2", {
                    strings: ['npm install^1000\n`installing components...`^1000\n`Fetching from source...`'],
                    typeSpeed: 40,
                    backSpeed: 20,
                    backDelay: 500,
                    startDelay: 1000,
                    loop: true,
                });
            }

        }

    });

})(jQuery, window, document);