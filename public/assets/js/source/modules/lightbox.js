/**
 * Lightbox Scripts.
 * Using jquery.magnific-popup jQuery Plugin.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $lightbox = $('.mfp-lightbox');
        var $lightbox_gallery = $('.mfp-lightbox-gallery');

        // default options
        var default_options = {
            closeOnContentClick: true,
            closeBtnInside: false,
            zoom: {
                enabled: true,
                duration: 300,
                easing: 'ease-in-out',
                opener: function(openerElement) {
                    return openerElement.is('img') ? openerElement : openerElement.closest('figure').find('img');
                }
            }
        };

        // we have lightbox selector?
        if ($lightbox.length) {

            $lightbox.each(function() {

                // add Zooming effect only for images
                if ($(this).hasClass('mfp-image')) {
                    $(this).magnificPopup(default_options);
                } else if ($(this).hasClass('popup-with-zoom-anim')) {

                    $(this).magnificPopup({
                        type: 'inline',
                        fixedContentPos: false,
                        fixedBgPos: true,
                        overflowY: 'auto',
                        closeBtnInside: true,
                        preloader: false,
                        midClick: true,
                        removalDelay: 300,
                        mainClass: 'mfp-zoom-in'
                    });

                } else if ($(this).hasClass('popup-with-move-anim')) {

                    $(this).magnificPopup({
                        type: 'inline',
                        fixedContentPos: false,
                        fixedBgPos: true,
                        overflowY: 'auto',
                        closeBtnInside: true,
                        preloader: false,
                        midClick: true,
                        removalDelay: 300,
                        mainClass: 'mfp-slide-bottom'
                    });

                } else if ($(this).hasClass('popup-modal')) {

                    $(this).magnificPopup({
                        type: 'inline',
                        fixedContentPos: false,
                        fixedBgPos: true,
                        overflowY: 'auto',
                        closeBtnInside: true,
                        preloader: false,
                        midClick: true,
                        removalDelay: 300,
                        mainClass: 'mfp-zoom-in',
                        modal: true,
                    });

                    $(document).on('click', '.popup-modal-dismiss', function(e) {
                        e.preventDefault();
                        $.magnificPopup.close();
                    });

                } else {
                    $(this).magnificPopup({
                        closeBtnInside: false,
                    });
                }

            });


        } // end check $lightbox

        // we have lightbox gallery selector?
        if ($lightbox_gallery.length) {
            $lightbox_gallery.each(function() {
                $(this).find('.mfp-lightbox').magnificPopup({
                    closeBtnInside: false,
                    gallery: {
                        enabled: true,
                        tPrev: 'previous',
                        tNext: 'next',
                        tCounter: '%curr% of %total%',
                    },
                    zoom: {
                        enabled: true,
                        duration: 300,
                        easing: 'ease-in-out',
                        opener: function(openerElement) {
                            return openerElement.is('img') ? openerElement : openerElement.closest('figure').find('img');
                        }
                    }
                });
            });
        }

    });

})(jQuery, window, document);