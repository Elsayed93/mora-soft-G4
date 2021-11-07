/**
 * Progress Bars Scripts.
 * Using ProgressBar.js 1.0.1
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $progress_bar = $('.progressbar');

        /**
         * Default options.
         */
        var default_options = {
            strokeWidth: 1.2,
            trailWidth: 1.2,
            easing: 'easeInOut',
            duration: 1400,
            color: '#f80036',
            trailColor: '#EAEAEA',
            svgStyle: {
                width: '100%',
                height: '100%'
            },
            text: {
                style: {}
            },
            step: function(state, bar) {
                bar.setText(Math.round(bar.value() * 100) + '%');
            }
        };

        // takes jQuery(element) a.k.a. $('element')
        function onScreen(element) {
            // window bottom edge
            var windowBottomEdge = $(window).scrollTop() + $(window).height();

            // element top edge
            var elementTopEdge = element.offset().top;
            var offset = 100;

            // if element is between window's top and bottom edges
            return elementTopEdge + offset <= windowBottomEdge;
        }

        // we have progressbar selector?
        if ($progress_bar.length) {

            $progress_bar.each(function() {

                // get custom options and override default
                var final_options = default_options;
                if ($(this).is('[data-options]') && !$.isEmptyObject($.parseJSON($(this).attr('data-options')))) {
                    final_options = $.extend(default_options, $.parseJSON($(this).attr('data-options')));
                }

                // init bar
                var active_bar;
                if ($(this).hasClass('circle')) {

                    final_options = $.extend(final_options, {
                        text: {
                            autoStyleContainer: false
                        },
                        strokeWidth: 3,
                        trailWidth: 3,
                        step: function(state, circle) {

                            var value = Math.round(circle.value() * 100) + '%';
                            if (value === '0%') {
                                circle.setText('');
                            } else {
                                circle.setText(value);
                            }
                        }
                    });

                    active_bar = new ProgressBar.Circle('.' + $(this).attr('class').replace(/\s+/g, '.'), final_options);

                } else {
                    final_options = $.extend(final_options, {
                        strokeWidth: 1.2,
                        trailWidth: 1.2,
                        text: {
                            style: {}
                        }
                    });
                    active_bar = new ProgressBar.Line('.' + $(this).attr('class').replace(/\s+/g, '.'), final_options);
                }

                // default run bar from 0.0 to 1.0
                active_bar.animate($(this).attr('data-value'));

                // run bar on scroll
                var $_this = $(this);
                $(window).scroll(function(e) {
                    if (onScreen($_this)) {
                        active_bar.animate($_this.attr('data-value'));
                    } else {
                        active_bar.set(0);
                    }
                });

            });

        }

    });

})(jQuery, window, document);