/**
 * Navigation Sticky Scripts.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $header = $('header');
        var $site_container = $('body');
        var $site_container_rtl = $('body.rtl');
        var prevScrollpos = window.pageYOffset;
        var header_center_overlay_padding = parseInt($header.css('padding-top'), 10);
        var $parallax_mirror = $('.parallax-mirror');
        var header_height = $header.height();
        var header_width = $header.width();

        if (!$site_container.hasClass('header-transparent') && !$site_container.hasClass(' header-transparent-overlay') && !$site_container.hasClass('header-transparent-border')) {
            // replace logo image for white background
            // $header.find('.site-logo img').attr('src', '/assets/images/logo/logo-black2.png');
        }

        // on scroll work
        $(window).scroll(function() {

            var windowTop = $(window).scrollTop();

            // we have sticky header selector?
            if ($site_container.hasClass('header-sticky') && !$site_container.hasClass('header-side-navigation')) {

                // we have show-on-scroll class
                if ($site_container.hasClass('show-on-scroll')) {

                    if ($site_container.hasClass('boxed-layout')) {
                        $header.css('width', header_width + 'px');
                    }

                    if (windowTop !== 0) {

                        // replace logo image for white background
                        if ($site_container.hasClass('header-transparent') || $site_container.hasClass(' header-transparent-overlay') || $site_container.hasClass('header-transparent-border')) {
                            // $header.find('.site-logo img').attr('src', '/assets/images/logo/logo-black2.png');
                        }

                        if (windowTop > $header.height()) {
                            $header.css('position', 'fixed').css('top', 0);
                            if ($header.height() > 59) {
                                $header.addClass('show-on-scroll');
                            }

                        } else {
                            if ($site_container.hasClass('header-center-overlay')) {
                                $header.css('position', '').css('top', -($header.height() + header_center_overlay_padding));
                            } else {
                                $header.css('position', '').css('top', '-100%');
                            }

                        }

                        // fix parallax-background position
                        $parallax_mirror.css('top', -(header_height));

                    } else {

                        // back default logo image for transparent background
                        if ($site_container.hasClass('header-transparent') || $site_container.hasClass(' header-transparent-overlay') || $site_container.hasClass('header-transparent-border')) {
                            // $header.find('.site-logo img').attr('src', '/assets/images/logo/logo2.png');
                        }

                        $header.removeClass('show-on-scroll');
                        if ($site_container.hasClass('header-center-overlay') || $site_container.hasClass('header-transparent') || $site_container.hasClass('header-transparent-overlay')) {
                            $header.css('top', 0);
                        }

                        // fix parallax-background position
                        $parallax_mirror.css('top', 0);

                    }

                } // end check show-on-scroll class

                // we have hide-on-scroll class
                if ($site_container.hasClass('hide-on-scroll')) {

                    if ($site_container.hasClass('boxed-layout')) {
                        $header.css('width', header_width + 'px');
                    }

                    var currentScrollPos = window.pageYOffset;

                    if (currentScrollPos !== 0) {

                        // replace logo image for white background
                        if ($site_container.hasClass('header-transparent') || $site_container.hasClass(' header-transparent-overlay') || $site_container.hasClass('header-transparent-border')) {
                            // $header.find('.site-logo img').attr('src', '/assets/images/logo/logo-black2.png');
                        }

                        if (prevScrollpos > currentScrollPos) {

                            if ($site_container.hasClass('header-topbar')) {
                                $header.css('position', 'fixed').css('top', 0);
                            } else {
                                $header.css('position', 'fixed').css('top', 0);
                            }

                            if ($header.height() > 59) {
                                $header.addClass('hide-on-scroll');
                            }
                            if ($site_container.hasClass('header-menu-background-primary') || $site_container.hasClass('header-menu-background-dark')) {
                                $header.addClass('hide-on-scroll');
                            }

                        } else {
                            if ($site_container.hasClass('header-center-overlay')) {
                                $header.css('position', 'fixed').css('top', -($header.height() + header_center_overlay_padding));
                            } else {
                                $header.css('position', 'fixed').css('top', -($header.height()));
                            }
                        }
                        prevScrollpos = currentScrollPos;

                        // fix parallax-background position
                        $parallax_mirror.css('top', -(header_height));

                    } else {

                        // back default logo image for transparent background
                        if ($site_container.hasClass('header-transparent') || $site_container.hasClass(' header-transparent-overlay') || $site_container.hasClass('header-transparent-border')) {
                            // $header.find('.site-logo img').attr('src', '/assets/images/logo/logo2.png');
                        }

                        $header.css('position', '');
                        $header.removeClass('hide-on-scroll');

                        if ($site_container.hasClass('header-topbar') && $site_container.hasClass('header-transparent')) {
                            $header.css('top', ($('#header-top-wrap').height()));
                        }

                        if ($site_container.hasClass('header-topbar') && $site_container.hasClass('header-transparent-overlay')) {
                            $header.css('top', ($('#header-top-wrap').height()));
                        }

                        // fix parallax-background position
                        $parallax_mirror.css('top', 0);

                    }


                } // end check show-on-scroll class

            } // end check header-sticky class

        }); // end on scroll


    });

})(jQuery, window, document);
