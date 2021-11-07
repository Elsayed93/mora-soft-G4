/**
 * Navigation One Page Scripts.
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
        var $one_page_nav_link = $header.find('.main-navigation ul li a[href*="#"]:not([href="#"])');
        var $global_hash_link = $site_container.find('a[href*="#"]:not([href="#"])');

        // we have header-one-page selector
        if ($site_container.hasClass('header-one-page')) {

            // move to section on click
            $one_page_nav_link.on('click', function() {

                // get header offset height
                var header_offset_height = $header.height();
                if ($site_container.hasClass('hide-on-scroll')) {
                    header_offset_height = 0;
                }

                if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {

                    var target = $(this.hash);
                    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

                    if (target.length) {
                        event.preventDefault();
                        $one_page_nav_link.parent('li').removeClass('active');
                        $(this).parent('li').addClass('active');
                        $('html, body').animate({
                            scrollTop: (target.offset().top - header_offset_height)
                        }, {
                            duration: 1000,
                            progress: function() {
                                // fix section offset top for sticky header
                                if ((header_offset_height - $header.height()) > 0) {
                                    $(this).css('margin-top', (header_offset_height - $header.height()));
                                } else {
                                    $(this).css('margin-top', '');
                                }
                            }
                        });
                        return false;
                    }

                }

            });

            // add and remove active link per section
            $(window).scroll(function() {

                var currentTop = $(window).scrollTop();

                // add and remove active class to links on scoll
                $('section').each(function(index) {

                    var elemTop = $(this).offset().top - ($header.height() + 1);
                    var elemBottom = elemTop + $(this).height();
                    if (currentTop >= elemTop && currentTop <= elemBottom) {
                        var id = $(this).attr('id');
                        var navElem = $('a[href="#' + id + '"]');
                        navElem.parent().addClass('active').siblings().removeClass('active');
                    }

                });

                // active home link when scroll to top
                if (currentTop === 0) {
                    $one_page_nav_link.parent('li').removeClass('active');
                    $one_page_nav_link.parent('li:first-child').addClass('active');
                }

            });

        } // end check header-one-page

        // scroll to id content when click to any hash link

        // move to section on click
        $global_hash_link.on('click', function() {

            // get header offset height
            var header_offset_height = $header.height();
            if ($site_container.hasClass('hide-on-scroll')) {
                header_offset_height = 0;
            }

            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {

                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

                if (target.length) {
                    event.preventDefault();
                    $('html, body').animate({
                        scrollTop: (target.offset().top - header_offset_height)
                    }, {
                        duration: 1000,
                        progress: function() {
                            // fix section offset top for sticky header
                            if ((header_offset_height - $header.height()) > 0) {
                                $(this).css('margin-top', (header_offset_height - $header.height()));
                            } else {
                                $(this).css('margin-top', '');
                            }
                        }
                    });
                    return false;
                }

            }

        });

    });

})(jQuery, window, document);