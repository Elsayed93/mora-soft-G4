/**
 * Navigation Scripts.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $nav_menu = $('.main-navigation');
        var $site_container = $('body');
        var $site_container_rtl = $('body.rtl');
        var $nav_menu_dropdown = $('.nav-menu-dropdown');
        var $nav_menu_icons_dropdown = $('.header-menu-icons');
        var $search_form_overlay = $('.search-form-overlay');
        var $header_side_navigation = $('.header-side-navigation');
        var $side_push_menu = $('.side-push-menu');
        var $hamburger_menu = $('.hamburger-menu');
        var $header_hamburger_menu = $('.header-hamburger-menu');
        var $header_hamburger_menu_level = $('.header-hamburger-menu header .level:last-child');
        var active_hamburger_menu = $site_container.hasClass('header-hamburger-menu');
        var active_header_logo_top = $site_container.hasClass('header-logo-top');
        var active_header_menu_top = $site_container.hasClass('header-menu-top');
        var active_header_side_navigation = $site_container.hasClass('header-side-navigation');
        var active_header_side_navigation_mini = $site_container.hasClass('side-mini');
        var active_header_slide_up = $header_hamburger_menu.hasClass('slide-up');
        var active_header_slide_down = $header_hamburger_menu.hasClass('slide-down');
        var $header_main = $('#header-wrap header');
        var $header_container = $('#header-wrap header .site-header-inner');
        var active_header_full_width = $header_container.hasClass('header-fullwidth');
        var $window = $(window);

        // check @rtl
        var html_dir = $('html').attr('dir');
        var is_rtl = false;
        if ($('body').hasClass('rtl') || $('html').hasClass('rtl') || html_dir == 'rtl') {
            is_rtl = true;
        }

        /**
         * Detect window width for responsive nav menu
         */
        function check_width() {

            // check widnow size
            var window_size = $window.width();

            // get html data
            var $header_logo = $('#header-logo').html();

            // insert resposnive menu with hidden state
            if (!active_hamburger_menu && !active_header_logo_top && !active_header_menu_top && !active_header_side_navigation) {

                if (!$header_container.find('.level.top').length) {

                    if ($site_container.hasClass('header-logo-right')) {
                        $header_container.prepend('<div class="level top" style="display: none;"><div class="level-left"><div class="hamburger-menu"><span class="hamburger-menu-icon"></span></div></div><div class="level-right"><div id="header-logo" class="site-logo">' + $header_logo + '</div></div></div>');

                    } else {
                        $header_container.prepend('<div class="level top" style="display: none;"><div class="level-left"><div id="header-logo" class="site-logo">' + $header_logo + '</div></div><div class="level-right"><div class="hamburger-menu"><span class="hamburger-menu-icon"></span></div></div></div>');
                    }

                }

            }

            if (active_header_logo_top) {
                if (!$header_container.find('.level.top .level-right').length) {
                    $header_container.find('.level.top').append('<div class="level-right" style="display: none;"><div class="hamburger-menu"><span class="hamburger-menu-icon"></span></div></div>');
                } else {
                    if ($site_container.hasClass('header-logo-with-icons') && $header_container.find('.level.top .level-right').length < 2) {
                        $header_container.find('.level.top').append('<div class="level-right" style="display: none;"><div class="hamburger-menu"><span class="hamburger-menu-icon"></span></div></div>');
                    }
                }

            }

            if (active_header_menu_top) {
                if (!$header_container.find('.level').last().find('.level-right.num-2').length) {
                    $header_container.find('.level').last().append('<div class="level-right num-2" style="display: none;"><div class="hamburger-menu"><span class="hamburger-menu-icon"></span></div></div>');
                }
                if (!$header_container.find('.level.top').find('.level-right').length) {
                    $header_container.find('.level.top').append('<div class="level-right num-2" style="display: none;"><div class="hamburger-menu"><span class="hamburger-menu-icon"></span></div></div>');
                }
            }

            if (active_header_slide_up || active_header_slide_down) {
                if (!$header_container.find('.level.top').length) {

                    if ($site_container.hasClass('icon-left')) {
                        $header_container.prepend('<div class="level top" style="display: none;"><div class="level-left"><div class="hamburger-menu"><span class="hamburger-menu-icon"></span></div></div><div class="level-right"><div id="header-logo" class="site-logo">' + $header_logo + '</div></div></div>');

                    } else {
                        $header_container.prepend('<div class="level top" style="display: none;"><div class="level-left"><div id="header-logo" class="site-logo">' + $header_logo + '</div></div><div class="level-right"><div class="hamburger-menu"><span class="hamburger-menu-icon"></span></div></div></div>');
                    }

                }
            }

            if (active_header_side_navigation && !active_header_side_navigation_mini) {
                if (!$header_container.find('.level.top').length) {

                    if ($site_container.hasClass('side-right')) {
                        $header_container.prepend('<div class="level top" style="display: none;"><div class="level-left"><div class="hamburger-menu"><span class="hamburger-menu-icon"></span></div></div><div class="level-right"><div id="header-logo" class="site-logo">' + $header_logo + '</div></div></div>');

                    } else {
                        $header_container.prepend('<div class="level top" style="display: none;"><div class="level-left"><div id="header-logo" class="site-logo">' + $header_logo + '</div></div><div class="level-right"><div class="hamburger-menu"><span class="hamburger-menu-icon"></span></div></div></div>');
                    }

                }
            }

            // window size is smaller than 1088px?
            if (window_size < 1088) {

                // add column classes for footer widget
                if ($site_container.hasClass('footer-widgets')) {
                    $site_container.find('#footer-wrap .site-footer-inner .columns .column').each(function() {
                        $(this).addClass('is-6-tablet');
                        if ($(this).hasClass('is-4')) {
                            $(this).removeClass('is-4');
                            $(this).addClass('is-4-desktop');
                        }

                        if ($(this).hasClass('is-3')) {
                            $(this).removeClass('is-3');
                            $(this).addClass('is-3-desktop');
                        }
                    });
                }

                // add responsive class styles
                $site_container.addClass('responsive-layout');
                if (!active_header_side_navigation_mini) {
                    $header_main.addClass('responsive-on-scroll');
                }

                // don't add this options for hamburger menu or side navigation
                if (!active_hamburger_menu && !active_header_side_navigation) {

                    if ($site_container.hasClass('header-logo-right')) {
                        $site_container.addClass('header-hamburger-menu slide-left slide-overlay');
                    } else {
                        $site_container.addClass('header-hamburger-menu slide-right slide-overlay');
                    }

                    $header_container.addClass('header-fullwidth');

                    if ($header_container.find('.level.top').length) {

                        if (active_header_logo_top) {
                            $header_container.find('.level.top').css('display', 'flex');
                            $header_container.find('.level.top .level-right').show();
                            if ($site_container.hasClass('header-logo-with-icons')) {
                                $header_container.find('.level.top .level-left').first().hide();
                            }
                        } else if (active_header_menu_top) {

                            // reverse .level to move logo and menu top
                            var list_level = $header_container.children('.level');
                            if (!$header_container.find('.level').first().find('.level-left .site-logo ').length) {
                                $header_container.append(list_level.get().reverse());
                            }

                            $header_container.find('.level').first().addClass('top');
                            $header_container.find('.level').last().removeClass('top').show();
                            $header_container.find('.level').first().find('.level-left').css('display', 'flex').css('margin', 0);
                            if ($header_container.find('.level').first().find('.level-left').length === 2) {
                                $header_container.find('.level').first().find('.level-left').first().hide();
                            }
                            $header_container.find('.level').first().find('.level-right.num-2').css('display', 'flex');

                            $header_container.find('.logo-text').hide();

                        } else {
                            $header_container.find('.level.top').show();
                        }

                    }

                    if ($site_container.hasClass('header-logo-center') || active_header_logo_top) {
                        $header_container.find('.logo-text').hide();
                    }

                    $header_container.find('.site-logo').css('visibility', 'visible').show();
                    $header_container.find('.hamburger-menu').css('visibility', 'visible').show();
                    $header_container.find('.main-navigation').css('visibility', 'visible').show();
                    $header_container.find('.header-menu-icons').css('visibility', 'visible').show();
                    $header_container.find('.button').css('visibility', 'visible').css('display', 'flex');
                    $header_container.find('.nav-menu-dropdown').css('visibility', 'visible').show();

                    $hamburger_menu = $('.hamburger-menu');
                    $header_hamburger_menu = $('.header-hamburger-menu');
                    $header_hamburger_menu_level = $('.header-hamburger-menu header .level:last-child');

                    if ($site_container.hasClass('header-logo-right')) {
                        $header_hamburger_menu_level.find('.level-right').last().hide();
                    } else if ($site_container.hasClass('header-logo-center-menu-center')) {
                        $header_hamburger_menu_level.find('.site-logo').hide();
                    } else {
                        if (active_header_logo_top) {
                            if ($site_container.hasClass('header-logo-with-icons')) {
                                $header_hamburger_menu_level.find('.level-left').first().show();
                            } else {
                                if ($header_hamburger_menu_level.find('.level-left').length > 1) {
                                    $header_hamburger_menu_level.find('.level-left').first().hide();
                                } else {
                                    $header_hamburger_menu_level.find('.level-left').first().show();
                                }
                            }
                        } else if (active_header_menu_top) {
                            $header_container.find('.level').last().find('.level-left').show();
                        } else {
                            $header_hamburger_menu_level.find('.level-left').last().hide();
                        }
                    }

                } else {
                    $header_container.find('.site-logo').css('visibility', 'visible').show();
                    $header_container.find('.hamburger-menu').css('visibility', 'visible').show();
                    $header_container.find('.main-navigation').css('visibility', 'visible').show();
                    $header_container.find('.header-menu-icons').css('visibility', 'visible').show();
                    $header_container.find('.button').css('visibility', 'visible').css('display', 'flex');
                    $header_container.find('.nav-menu-dropdown').css('visibility', 'visible').show();
                }

                // add this options for humburger menu slide up and down
                if (active_header_slide_up || active_header_slide_down) {

                    $site_container.removeClass('slide-up');
                    $site_container.removeClass('slide-down');

                    if ($site_container.hasClass('icon-left')) {
                        $site_container.addClass('slide-left slide-overlay slide-up-down-left');
                    } else {
                        $site_container.addClass('slide-right slide-overlay slide-up-down');
                    }

                    $header_container.addClass('header-fullwidth');
                    if ($header_container.find('.level.top').length) {
                        $header_container.find('.level.top').show();
                    }

                    $hamburger_menu = $('.hamburger-menu');
                    $header_hamburger_menu = $('.header-hamburger-menu');
                    $header_hamburger_menu_level = $('.header-hamburger-menu header .level:last-child');
                }

                if (active_header_side_navigation && !active_header_side_navigation_mini) {

                    $site_container.removeClass('header-side-navigation');

                    if ($site_container.hasClass('side-right')) {
                        $site_container.addClass('header-hamburger-menu slide-left slide-overlay');
                    } else {
                        $site_container.addClass('header-hamburger-menu slide-right slide-overlay');
                    }

                    $header_container.addClass('header-fullwidth');
                    if ($header_container.find('.level.top').length) {
                        $header_container.find('.level.top').show();
                    }

                    $hamburger_menu = $('.hamburger-menu');
                    $header_hamburger_menu = $('.header-hamburger-menu');
                    $header_hamburger_menu_level = $('.header-hamburger-menu header .level:last-child');

                }

            } else {
                // window size is greater than 1088px?

                // add column classes for footer widget
                if ($site_container.hasClass('footer-widgets')) {
                    $site_container.find('#footer-wrap .site-footer-inner .columns .column').each(function() {
                        $(this).removeClass('is-6-tablet');
                        if ($(this).hasClass('is-4-desktop')) {
                            $(this).removeClass('is-4-desktop');
                            $(this).addClass('is-4');
                        }

                        if ($(this).hasClass('is-3-desktop')) {
                            $(this).removeClass('is-3-desktop');
                            $(this).addClass('is-3');
                        }
                    });
                }

                $site_container.removeClass('responsive-layout');
                if (!active_header_side_navigation_mini) {
                    $header_main.removeClass('responsive-on-scroll');
                }

                // hide sliding menu when resize
                if ($header_hamburger_menu_level.css('margin-right') === '0px' && $header_hamburger_menu_level.css('margin-left') === '0px') {

                    if ($header_hamburger_menu.hasClass('slide-right') || $header_hamburger_menu.hasClass('slide-left')) {
                        $header_hamburger_menu_level.toggleClass('opened');
                        $hamburger_menu.toggleClass('expanded');
                        $header_hamburger_menu.toggleClass('pushed');
                    }
                }

                // don't add this options for hamburger menu or side navigation
                if (!active_hamburger_menu && !active_header_side_navigation) {

                    if ($site_container.hasClass('header-logo-right')) {
                        $header_hamburger_menu_level.find('.level-right').last().show();
                    } else if ($site_container.hasClass('header-logo-center-menu-center')) {
                        $header_hamburger_menu_level.find('.site-logo').show();
                    } else {
                        if (active_header_logo_top) {
                            $header_hamburger_menu_level.find('.level-left').first().css('display', 'flex');
                        } else if (active_header_menu_top) {
                            if ($header_container.find('.level').first().find('.level-left').length === 2) {
                                $header_container.find('.level').first().find('.level-left').first().css('display', 'flex');
                            }
                        } else {
                            $header_hamburger_menu_level.find('.level-left').last().show();
                        }
                    }

                    if ($site_container.hasClass('header-logo-right')) {
                        $site_container.removeClass('header-hamburger-menu slide-left slide-overlay');
                    } else {
                        $site_container.removeClass('header-hamburger-menu slide-right slide-overlay');
                    }

                    if (!active_header_full_width) {
                        $header_container.removeClass('header-fullwidth');
                    }

                    if ($header_container.find('.level.top').length) {
                        if (!active_header_logo_top) {
                            $header_container.find('.level.top').hide();
                        }
                        if (active_header_logo_top) {
                            if ($site_container.hasClass('header-logo-with-icons')) {
                                $header_container.find('.level.top .level-right').last().hide();
                                $header_container.find('.level.top .level-left').first().css('display', 'flex');
                            } else {
                                $header_container.find('.level.top .level-right').hide();
                            }
                        }
                        if (active_header_menu_top) {

                            // reverse .level to move logo and menu down
                            var list_level_reverse = $header_container.children('.level');
                            if (!$header_container.find('.level').last().find('.level-left .site-logo ').length) {
                                $header_container.append(list_level_reverse.get().reverse());
                            }

                            $header_container.find('.level').first().addClass('top').css('display', 'flex');
                            $header_container.find('.level').last().removeClass('top').show();
                            $header_container.find('.level').last().find('.level-left').last().css('display', 'flex').css('margin', '0 auto');
                            $header_container.find('.level').first().find('.level-right.num-2').hide();
                            $header_container.find('.level').last().find('.level-right.num-2').hide();

                            $header_container.find('.logo-text').show();
                        }
                    }

                    if ($site_container.hasClass('header-logo-center') || active_header_logo_top) {
                        $header_container.find('.logo-text').show();
                    }

                    $hamburger_menu = $('.hamburger-menu');
                    $header_hamburger_menu = $('.header-hamburger-menu');
                    $header_hamburger_menu_level = $('.header-hamburger-menu header .level:last-child');

                }

                // add this options for humburger menu slide up and down
                if (active_header_slide_up || active_header_slide_down) {

                    if (active_header_slide_up) {
                        $site_container.addClass('slide-up');
                    }

                    if (active_header_slide_down) {
                        $site_container.addClass('slide-down');
                    }

                    if ($site_container.hasClass('icon-left')) {
                        $site_container.removeClass('slide-left slide-overlay slide-up-down-left');
                    } else {
                        $site_container.removeClass('slide-right slide-overlay slide-up-down');
                    }

                    if (!active_header_full_width) {
                        $header_container.removeClass('header-fullwidth');
                    }
                    if ($header_container.find('.level.top').length) {
                        $header_container.find('.level.top').hide();
                    }

                    $header_container.find('.main-navigation').css('visibility', 'visible').hide();

                    $hamburger_menu = $('.hamburger-menu');
                    $header_hamburger_menu = $('.header-hamburger-menu');
                    $header_hamburger_menu_level = $('.header-hamburger-menu header .level:last-child');
                }

                if (active_header_side_navigation && !active_header_side_navigation_mini) {

                    $site_container.addClass('header-side-navigation');

                    if ($site_container.hasClass('side-right')) {
                        $site_container.removeClass('header-hamburger-menu slide-left slide-overlay');
                    } else {
                        $site_container.removeClass('header-hamburger-menu slide-right slide-overlay');
                    }

                    $header_container.removeClass('header-fullwidth');
                    if ($header_container.find('.level.top').length) {
                        $header_container.find('.level.top').hide();
                    }

                    $hamburger_menu = $('.hamburger-menu');
                    $header_hamburger_menu = $('.header-hamburger-menu');
                    $header_hamburger_menu_level = $('.header-hamburger-menu header .level:last-child');

                }

            }
        }

        // execute on load
        check_width();

        // bind event listener
        $(window).resize(check_width);

        // we have nav menu selector?
        if ($nav_menu.length) {

            /**
             * Show dropdown and dropright icons.
             */

            // checks if main menu li has sub (ul) and adds class for down icon
            $nav_menu.find('> ul > li:has( > ul)').addClass('menu-down-icon');

            // checks if sub menu li has sub-level (ul) and adds class for right icon
            // else show mega menu

            // get main contianer offset left position
            var main_container_offset = $('.container').offset().left;

            // check if menu item is mega menu
            $nav_menu.find('> ul > li').each(function() {

                if ($(this).hasClass('mega-menu') && !$('body').hasClass('overlay-full-width') && !$('body').hasClass('slide-overlay') && !$('body').hasClass('header-side-navigation') && !$('body').hasClass('header-background-primary') && !$('body').hasClass('header-background-dark') && !$('body').hasClass('slide-push')) {

                    var _this = $(this);

                    // make mega menu full width with container
                    if ($('body').hasClass('header-side-navigation')) {

                        // we have niche-templates?
                        if ($(this).hasClass('niche-templates')) {
                            $(this).find('> ul')
                                .addClass('container columns is-3 is-variable is-multiline')
                                .css('margin-top', 0);
                        } else {
                            $(this).find('> ul')
                                .addClass('container columns is-gapless')
                                .css('margin-top', 0);
                        }

                    } else {

                        // we have niche-templates?
                        if ($(this).hasClass('niche-templates')) {
                            $(this).find('> ul')
                                .addClass('container columns is-3 is-variable is-multiline')
                                .css('margin-left', -($(this).offset().left - main_container_offset))
                                .css('margin-top', 0);
                        } else {
                            $(this).find('> ul')
                                .addClass('container columns is-gapless')
                                .css('margin-left', -($(this).offset().left - main_container_offset))
                                .css('margin-top', 0);
                        }

                    }

                    $(this).find('> ul > li').each(function() {
                        $(this).addClass('column');
                        // we have niche-templates?
                        if (_this.hasClass('niche-templates')) {
                            $(this).addClass('is-3');
                        }
                    });

                } else {

                    // remove mega-menu class if exists
                    if ($(this).hasClass('mega-menu')) {
                        $(this).removeClass('mega-menu');
                    }

                    // add right icon for normal dropdown menu
                    $(this).find('> ul li:has( > ul)').addClass('menu-right-icon');

                }

            });

            /**
             * Show normal dropdown sub menus.
             */

            // check on load
            check_dropdown_menu();

        } // end check $nav_menu

        /**
         * Detect header fullwidth for dropdown menu
         */

        // check if header fullwidth
        if ($site_container.hasClass('header-logo-center') || $site_container.hasClass('header-logo-left') || $site_container.hasClass('header-logo-right') || $site_container.hasClass('header-menu-with-buttons') || $site_container.hasClass('header-menu-with-icons') || $site_container.hasClass('slide-up') || $site_container.hasClass('slide-down')) {

            if ($header_container.hasClass('header-fullwidth') && !$site_container.hasClass('menu-center')) {

                $nav_menu.find('> ul > li').each(function() {

                    if ($(this).hasClass('mega-menu')) {

                        $(this).removeClass('mega-menu');
                        $(this).find('> ul')
                            .removeClass('container columns')
                            .css('margin-left', 0)
                            .css('margin-top', 0);
                        // add right icon for normal dropdown menu
                        $(this).find('> ul li:has( > ul)').addClass('menu-right-icon');

                        $(this).find('> ul li').removeClass('column');

                    }

                });

            }

        }

        /**
         * Detect window width for dropdown menu
         */

        function check_dropdown_menu() {

            // check widnow size
            var window_size = $window.width();

            // window size is smaller than 1088px?
            if (window_size < 1088) {

                // disable hover event for click
                $nav_menu.find('ul li').off('mouseenter mouseleave');

                // checks if main menu li has sub (ul) and adds span for down icon
                if (!$nav_menu.find('> ul > li > span').length) {
                    $nav_menu.find('> ul > li:has( > ul)').prepend('<span class="main-parent"></span>');
                }

                // add down icon for normal dropdown menu
                $nav_menu.find('> ul > li').each(function() {
                    if (!$(this).find('> ul > li > span').length) {
                        $(this).find('> ul li:has( > ul)').prepend('<span></span>');
                    }
                });

                // open dropdown menu on click
                $nav_menu.find('ul li > span').unbind().click(
                    function() {

                        if ($(this).hasClass('main-parent')) {
                            $nav_menu.find('ul li ul').fadeOut('fast');
                            $nav_menu.find('ul li > span').removeClass('opened');
                        } else {
                            // i will disable autoclose option which cause issue with more nested.
                            // $nav_menu.find('ul li ul li ul').fadeOut('fast');
                            // $nav_menu.find('ul li ul li > span').removeClass('opened');
                        }

                        if ($(this).closest('li').children('ul').is(':visible')) {
                            $(this).removeClass('opened');
                            $(this).closest('li').children('ul').fadeOut('fast');
                        } else {
                            $(this).addClass('opened');
                            $(this).closest('li').children('ul').slideToggle(400);
                        }
                    }
                );

                // hide dropdown menu when click outside it
                $(document).on('click', function(event) {
                    if (!$(event.target).closest('.main-navigation').length) {
                        if ($nav_menu.find('ul li ul').is(':visible')) {
                            $nav_menu.find('ul li ul').fadeOut('fast');
                            $nav_menu.find('ul li > span').removeClass('opened');
                        }
                    }
                });

            } else {
                // window size is greater than 1088px?

                if (window_size < 1280) {

                    $nav_menu.find('> ul > li').each(function() {

                        if ($(this).hasClass('mega-menu')) {

                            $(this).addClass('old-mega-menu');
                            $(this).removeClass('mega-menu');
                            $(this).find('> ul')
                                .removeClass('container columns')
                                .css('margin-left', 0)
                                .css('margin-top', 0);
                            // add right icon for normal dropdown menu
                            $(this).find('> ul li:has( > ul)').addClass('menu-right-icon');

                            $(this).find('> ul li').removeClass('column');

                            $(this).find('> ul li').hover(

                                function() {
                                    $(this).children('ul').hide();
                                    $(this).children('ul').fadeIn(350);

                                    // detect if dropdown menu would go off screen and reposition it.
                                    // @todo later i will check RTL version
                                    if ($(this).children('ul').length) {

                                        var menu_ul_element = $(this).children('ul');
                                        var menu_ul_offset = menu_ul_element.offset();
                                        var menu_ul_left = menu_ul_offset.left;
                                        var menu_ul_width = menu_ul_element.width();
                                        var site_container_width = $site_container.width();
                                        var site_container_left = $site_container.offset().left;

                                        var is_menu_ul_visible = (menu_ul_left + menu_ul_width <= site_container_width + site_container_left);

                                        if (!is_menu_ul_visible) {
                                            $(this).children('ul').removeClass('open-left');
                                            $(this).children('ul').addClass('open-left');
                                        }

                                    }

                                },
                                function() {
                                    $('ul', this).fadeOut('fast');
                                }

                            );

                        }

                    });

                } else {

                    // get main contianer offset left position
                    var main_container_offset = $('.container').offset().left;

                    $nav_menu.find('> ul > li').each(function() {

                        if ($(this).hasClass('old-mega-menu')) {

                            $(this).addClass('mega-menu');
                            $(this).removeClass('old-mega-menu');
                            $(this).find('> ul')
                                .addClass('container columns')
                                .css('margin-left', -($(this).offset().left - main_container_offset))
                                .css('margin-top', 0);
                            // add right icon for normal dropdown menu
                            $(this).find('> ul li:has( > ul)').removeClass('menu-right-icon');
                            $(this).find('> ul > li').addClass('column');
                            $(this).find('> ul li ul').removeAttr('style class');
                            $(this).find('> ul > li > ul').show();
                            // disable hover event for click
                            $(this).find('> ul li').off('mouseenter mouseleave');

                        }

                    });

                }

                $nav_menu.find('ul li').hover(

                    function() {
                        if ($(this).hasClass('mega-menu')) {
                            $(this).find('> ul').fadeIn(350);
                        } else if ($(this).hasClass('column')) {
                            $(this).find('> ul').show();
                        } else {

                            $(this).children('ul').hide();
                            $(this).children('ul').fadeIn(350);

                            // detect if dropdown menu would go off screen and reposition it.
                            // @todo later i will check RTL version
                            if ($(this).children('ul').length) {

                                var menu_ul_element = $(this).children('ul');
                                var menu_ul_offset = menu_ul_element.offset();
                                var menu_ul_left = menu_ul_offset.left;
                                var menu_ul_width = menu_ul_element.width();
                                var site_container_width = $site_container.width();
                                var site_container_left = $site_container.offset().left;

                                var is_menu_ul_visible = (menu_ul_left + menu_ul_width <= site_container_width + site_container_left);

                                if (!is_menu_ul_visible) {
                                    $(this).children('ul').removeClass('open-left');
                                    $(this).children('ul').addClass('open-left');
                                }

                            }

                        }
                    },
                    function() {
                        if ($(this).hasClass('mega-menu')) {
                            $(this).find('> ul').fadeOut('fast');
                        } else if ($(this).hasClass('column')) {
                            $(this).find('> ul').show();
                        } else {
                            $('ul', this).fadeOut('fast');
                        }
                    }

                );

            }

        }

        // bind event listener
        $(window).resize(check_dropdown_menu);

        // we have nav menu dropdown selector?
        if ($nav_menu_dropdown.length) {

            // show dropdown menu on click
            if ($nav_menu_dropdown.hasClass('on-click')) {

                // hide dropdown menu when click outside it
                $(document).on('click', function(event) {
                    if (!$(event.target).closest('.nav-menu-dropdown').length) {
                        if ($('.nav-menu-dropdown > li > ul').is(':visible')) {
                            $('.nav-menu-dropdown > li > ul').fadeOut('fast');
                        }
                    }
                });

                // show and hide dropdown menu on click
                $nav_menu_dropdown.find('> li').on('click',

                    function() {
                        if ($(this).children('ul').is(':visible')) {
                            $(this).children('ul').hide();
                            $(this).children('ul').fadeOut('fast');
                        } else {
                            $(this).children('ul').hide();
                            $(this).children('ul').fadeIn(350);

                            // detect if dropdown menu would go off screen and reposition it.
                            // @todo later i will check RTL version
                            if ($(this).children('ul').length) {

                                var menu_ul_element = $(this).children('ul');
                                var menu_ul_offset = menu_ul_element.offset();
                                var menu_ul_left = menu_ul_offset.left;
                                var menu_ul_width = menu_ul_element.width();
                                var site_container_width = $site_container.width();
                                var site_container_left = $site_container.offset().left;

                                var is_menu_ul_visible = (menu_ul_left + menu_ul_width <= site_container_width + site_container_left);

                                if (!is_menu_ul_visible) {
                                    $(this).children('ul').removeClass('open-left');
                                    $(this).children('ul').addClass('open-left');
                                }

                            }
                        }
                    }

                );

            } else {

                // show dropdown menu on hover
                $nav_menu_dropdown.find('> li').hover(

                    function() {
                        $(this).children('ul').hide();
                        $(this).children('ul').fadeIn(350);

                        // detect if dropdown menu would go off screen and reposition it.
                        // @todo later i will check RTL version
                        if ($(this).children('ul').length) {

                            var menu_ul_element = $(this).children('ul');
                            var menu_ul_offset = menu_ul_element.offset();
                            var menu_ul_left = menu_ul_offset.left;
                            var menu_ul_width = menu_ul_element.width();
                            var site_container_width = $site_container.width();
                            var site_container_left = $site_container.offset().left;

                            var is_menu_ul_visible = (menu_ul_left + menu_ul_width <= site_container_width + site_container_left);

                            if (!is_menu_ul_visible) {
                                $(this).children('ul').removeClass('open-left');
                                $(this).children('ul').addClass('open-left');
                            }

                        }
                    },
                    function() {
                        $('ul', this).fadeOut('fast');
                    }

                );

            } // end check on-click


        } // end check $nav_menu_dropdown

        // we have nav menu icons selector?
        if ($nav_menu_icons_dropdown.length) {

            // we have child ul dropdown menu?
            if ($nav_menu_icons_dropdown.find('ul').length) {

                // hide dropdown menu when click outside it
                $(document).on('click', function(event) {
                    if (!$(event.target).closest('.header-menu-icons').length) {
                        if ($('.header-menu-icons > li > ul').is(':visible')) {
                            $('.header-menu-icons > li > ul').fadeOut('fast');
                        }
                    }
                    if (!$(event.target).closest('.search-form-overlay input').length) {
                        if (!($('.search-form-overlay input').is(":focus"))) {
                            $search_form_overlay.hide();
                            $search_form_overlay.removeClass('is-active');
                            $search_form_overlay.fadeOut('fast');
                        }
                    }
                });

                // show and hide dropdown menu on click
                $nav_menu_icons_dropdown.find('> li').on('click',

                    function(e) {

                        // get remove product class name
                        var remove_product_class = $(e.target).parent().attr('class');

                        // hide dropdown menu when click on search style-2
                        if ($(this).hasClass('search-style-2')) {
                            $nav_menu_icons_dropdown.find('ul').hide();
                            $nav_menu_icons_dropdown.find('ul').fadeOut('fast');

                            $search_form_overlay.fadeIn(350);
                            $search_form_overlay.addClass('is-active');
                            $search_form_overlay.find('input').focus();
                        }

                        // close modal
                        $search_form_overlay.find('.modal-close').on('click', function(e) {
                            $search_form_overlay.hide();
                            $search_form_overlay.removeClass('is-active');
                            $search_form_overlay.fadeOut('fast');
                        });

                        // if not clicked on remove product?
                        if (remove_product_class !== 'product-remove' && !($('.dropdown-search-form input').is(":focus")) && !$(this).hasClass('search-style-2') && !($(this).find('.dropdown-user-account').is(":visible"))) {

                            if ($(this).children('ul').is(':visible')) {

                                $nav_menu_icons_dropdown.find('ul').hide();
                                $nav_menu_icons_dropdown.find('ul').fadeOut('fast');

                            } else {

                                $nav_menu_icons_dropdown.find('ul').hide();
                                $(this).children('ul').fadeIn(350);

                                // detect if dropdown menu would go off screen and reposition it.
                                // @todo later i will check RTL version
                                if ($(this).children('ul').length) {

                                    var menu_ul_element = $(this).children('ul');
                                    var menu_ul_offset = menu_ul_element.offset();
                                    var menu_ul_left = menu_ul_offset.left;
                                    var menu_ul_width = menu_ul_element.width();
                                    var site_container_width = $site_container.width();
                                    var site_container_left = $site_container.offset().left;

                                    var is_menu_ul_visible = (menu_ul_left + menu_ul_width <= site_container_width + site_container_left);

                                    if (!is_menu_ul_visible) {
                                        $(this).children('ul').removeClass('open-left');
                                        $(this).children('ul').addClass('open-left');
                                    }

                                }

                            }

                        } // end check remove_product_class

                    }

                );

            }

        } // end check $nav_menu_icons_dropdown

        // header side navigation
        var header_side_width = $('header').width() + 1;
        if ($('body').hasClass('header-side-navigation') && $('body').hasClass('side-left')) {

            // push all content to right
            $('.site-header-top').css('margin-left', header_side_width);
            $('.site-header-bottom').css('margin-left', header_side_width);
            $('.site-content-header').css('margin-left', header_side_width);
            $('#content-main-wrap').css('margin-left', header_side_width);
            $('.site-content-footer').css('margin-left', header_side_width);
            $('.site-footer-top').css('margin-left', header_side_width);
            $('.site-footer').css('margin-left', header_side_width);
            $('.site-footer-bottom').css('margin-left', header_side_width);

            // slider revolution
            $('.rev_slider_wrapper').css('max-width', ($('body').width() - header_side_width) + 'px');
            // $('.rev_slider_wrapper').css('margin-left', header_side_width);

        } // end check header-side-navigation class

        if ($('body').hasClass('header-side-navigation') && $('body').hasClass('side-right')) {

            // push all content to left
            $('.site-header-top').css('margin-right', header_side_width);
            $('.site-header-bottom').css('margin-right', header_side_width);
            $('.site-content-header').css('margin-right', header_side_width);
            $('#content-main-wrap').css('margin-right', header_side_width);
            $('.site-content-footer').css('margin-right', header_side_width);
            $('.site-footer-top').css('margin-right', header_side_width);
            $('.site-footer').css('margin-right', header_side_width);
            $('.site-footer-bottom').css('margin-right', header_side_width);

            // slider revolution
            $('.rev_slider_wrapper').css('max-width', ($('body').width() - header_side_width) + 'px');
            // $('.rev_slider_wrapper').css('margin-right', header_side_width);

        } // end check header-side-navigation class

        // header side push menu
        if ($side_push_menu.length) {

            // hide side mini menu when click outside it
            $(document).on('click', function(event) {

                $header_side_navigation.find('.site-header .level').each(function() {

                    if (!$(this).hasClass('top')) {
                        if (!$(event.target).closest('.header-side-navigation .site-header .level').length) {
                            if ($(this).is(':visible')) {
                                $side_push_menu.find('i').attr('class', 'ion-ios-menu');
                                $(this).fadeOut('fast');
                            }
                        }
                    }

                });

            });

            // show and hide side mini menu
            $side_push_menu.on('click',

                function(e) {

                    // we have side mini nav
                    if ($('body').hasClass('header-side-navigation') && $('body').hasClass('side-mini')) {

                        // update side push icons class
                        $side_push_menu.find('i').attr('class', 'ion-ios-close-outline');

                        // show hidden menu
                        $header_side_navigation.find('.site-header .level').each(function() {

                            // get normal level menu
                            if (!$(this).hasClass('top')) {

                                if ($(this).is(':visible')) {

                                    $side_push_menu.find('i').attr('class', 'ion-ios-menu');
                                    $(this).hide();
                                    $(this).fadeOut('fast');

                                } else {

                                    $(this).hide();
                                    $(this).fadeIn(350);

                                }

                            } // end check level not top

                        });

                    }

                }

            );

        } // end check $side_push_menu

        // we have hamburger menu selector?
        if ($hamburger_menu.length) {

            // hide side mini menu when click outside it
            $(document).on('click', function(event) {

                if (!$(event.target).closest('header .level:last-child').length && !$(event.target).closest('.hamburger-menu').length) {
                    if ($header_hamburger_menu_level.css('margin-right') === '0px' && $header_hamburger_menu_level.css('margin-left') === '0px') {

                        if ($header_hamburger_menu.hasClass('slide-right') || $header_hamburger_menu.hasClass('slide-left')) {
                            $header_hamburger_menu_level.toggleClass('opened');
                            $hamburger_menu.toggleClass('expanded');
                            $header_hamburger_menu.toggleClass('pushed');
                        }
                    }
                }

            });

            $hamburger_menu.on('click',
                function(e) {

                    // change hamburger menu icon
                    $(this).toggleClass('expanded');

                    if ($header_hamburger_menu.hasClass('slide-down')) {
                        $nav_menu.css('top', '0');
                    }
                    if ($header_hamburger_menu.hasClass('slide-up')) {
                        $nav_menu.css('bottom', '0');
                    }

                    if ($header_hamburger_menu.hasClass('slide-down') || $header_hamburger_menu.hasClass('slide-up')) {

                        if ($header_hamburger_menu.hasClass('icon-left')) {
                            if ($header_container.hasClass('header-fullwidth')) {
                                if (is_rtl) {
                                    $nav_menu.css('right', $(this).width() + 45);
                                } else {
                                    $nav_menu.css('left', $(this).width() + 45);
                                }

                            } else {
                                if (is_rtl) {
                                    $nav_menu.css('right', $(this).width() + 15);
                                } else {
                                    $nav_menu.css('left', $(this).width() + 15);
                                }
                            }
                        } else {
                            if ($header_container.hasClass('header-fullwidth')) {
                                if (is_rtl) {
                                    $nav_menu.css('left', $(this).width() + 45);
                                } else {
                                    $nav_menu.css('right', $(this).width() + 45);
                                }
                            } else {
                                if (is_rtl) {
                                    $nav_menu.css('left', $(this).width() + 15);
                                } else {
                                    $nav_menu.css('right', $(this).width() + 15);
                                }
                            }
                        }


                        $nav_menu.slideToggle();
                        main_container_offset = $('.container').offset().left;

                        // check if menu item is mega menu
                        $nav_menu.find('> ul > li').each(function() {

                            if ($(this).hasClass('mega-menu')) {

                                $(this).find('> ul')
                                    .addClass('container columns is-gapless')
                                    .css('margin-left', -($(this).offset().left - main_container_offset))
                                    .css('margin-top', 0);

                                $(this).find('> ul > li').each(function() {
                                    $(this).addClass('column');
                                });

                            } else {

                                // add right icon for normal dropdown menu
                                $(this).find('> ul li:has( > ul)').addClass('menu-right-icon');

                            }

                        });

                    } // end check slide-up and slide-down

                    if ($header_hamburger_menu.hasClass('slide-right') || $header_hamburger_menu.hasClass('slide-left')) {

                        if ($header_hamburger_menu.hasClass('slide-overlay')) {
                            $header_hamburger_menu_level.toggleClass('opened');
                        }

                        if ($header_hamburger_menu.hasClass('slide-push')) {
                            $header_hamburger_menu_level.toggleClass('opened');
                            $header_hamburger_menu.toggleClass('pushed');
                        }

                        if ($header_hamburger_menu.hasClass('overlay-full-width')) {

                            // check if menu item is mega menu
                            $nav_menu.find('> ul > li').each(function() {

                                if ($(this).hasClass('mega-menu')) {

                                    $(this).removeClass('mega-menu');

                                }

                            });

                        }

                    }

                });

        }

    });

})(jQuery, window, document);