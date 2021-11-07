/**
 * Common Global Scripts.
 */

;
(function($, window, document, undefined) {

    'use strict';

    /**
     * show pageloader on load, so to add pageloader for any page just do that:
     * 1- add this html code between 'body' tag in your page:
     * <div class="pageloader is-active"><span class="title">Loading</span></div>
     * 2- add this class 'active-pageloader' to body tage like that:
     * <body class="active-pageloader">...</body>
     */
    var $pageloader = $('.pageloader');

    if ($('body').hasClass('active-pageloader') && $pageloader.length) {
        $(window).on('load', function() {
            // hide pageloader
            setTimeout(function() {
                $pageloader.removeClass('is-active');
            }, 500);
        });
    }

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $current_year = $('.current-year');
        var $video_back = $('.video-back-vidbacking');
        var $video_back_muted = $('.video-back-vidbacking-muted');
        var $show_pageloader = $('.show-pageloader');
        var $notification = $('.notification');
        var $message = $('.message');
        var $dropdown = $('.dropdown');
        var $show_modal = $('.show-modal');
        var $parallax_background = $('.parallax-background');
        var $vertical_nav_content = $('.docs-content');
        var $back_top_top = $('#back-to-top');
        var $sidebar_fixed = $('.sidebar-fixed');
        var $video_container = $('.video-container');
        var $ajax_contact_form = $('.ajax-contact-form');
        var $overhangـsuccess_message = $('.overhang-message-content.success');
        var $overhangـerror_message = $('.overhang-message-content.error');
        var $body = $('body');
        var ajax_form_data;

        /**
         * Save the date.
         */
        var date = new Date();

        // we have current year selector?
        if ($current_year.length) {

            $current_year.text(date.getFullYear());

        } // end check $current_year

        // sticky fixed sidebar
        if ($sidebar_fixed.length) {
            $sidebar_fixed.stickySidebar({
                topSpacing: 100,
                bottomSpacing: 100,
            });
        }

        // make videos embeds responsive
        if ($video_container.length) {
            fitvids('.video-container');
        }

        /**
         * Vertical Nav Menu.
         */
        if ($vertical_nav_content.length) {

            // sticky fixed navigation
            $('.docs-fixed').stickySidebar({
                topSpacing: 100,
                bottomSpacing: 100,
            });

            // menu links nav to content section
            jQuery(function() {
                var t = $(".docs-fixed-content"),
                    r = $(".docs-fixed ul li"),
                    n = jQuery(window).width();
                n > 768 ? $(window).on("scroll", function() {
                    var n = $(this).scrollTop();
                    t.each(function() {
                        var o = $(this).offset().top - 92,
                            e = o + $(this).outerHeight();
                        n >= o && e >= n && (r.find("a").removeClass("is-active"), t.removeClass("is-active"), $(this).addClass("is-active"), r.find('a[href="#' + $(this).attr("id") + '"]').addClass("is-active"))
                    })
                }) : r.find("a").removeClass("is-active")
            }), $(window).scroll(function() {
                var t = $(".docs-fixed"),
                    r = $(window).scrollTop(),
                    n = jQuery(window).width();
            }), $(document).ready(function() {
                $(".vertical-navigation-content.docs-fixed a").click(function() {
                    return $("html, body").animate({
                        scrollTop: $($(this).attr("href")).offset().top - 90 + "px"
                    }, {
                        duration: 800
                    }), !1
                })
            });

        }

        /**
         * Back To Top.
         */
        if ($back_top_top.length) {

            var scrollTrigger = 100, // px
                backToTop = function() {
                    var scrollTop = $(window).scrollTop();
                    if (scrollTop > scrollTrigger) {
                        $('#back-to-top').addClass('show');
                    } else {
                        $('#back-to-top').removeClass('show');
                    }
                };

            backToTop();

            $(window).on('scroll', function() {
                backToTop();
            });

            $('#back-to-top').on('click', function(e) {
                e.preventDefault();
                $('html,body').animate({
                    scrollTop: 0
                }, 700);
            });

        }

        /**
         * Floating buttons
         */
        $('.floating_buttons').each(function() {
            var $_this = $(this);
            $_this.find('.float').on('click', function() {
                $_this.toggleClass('is-active');
            });
        });

        // hide dropdown menu when click outside it
        $(document).on('click', function(event) {
            if (!$(event.target).closest('.floating_buttons').length && $('.floating_buttons').hasClass('is-active')) {
                $('.floating_buttons').removeClass('is-active');
            }
        });

        $(document).on('click', function(event) {
            if (!$(event.target).closest('.quickview').length && !$(event.target).closest('.show-quickview').length && $('.quickview').hasClass('is-active') && !$(event.target).closest('.floating_buttons').length) {
                $('.quickview').removeClass('is-active');
            }
        });

        /**
         * Video background
         * 
         * Options:
         * 'masked': true,
         * 'mask-opacity': .1,
         * 'youtube-mute-video': false,
         * 'youtube-loop': true
         */
        if ($video_back.length) {
            $video_back.vidbacking({
                'youtube-mute-video': false,
            });
        }

        // muted video
        if ($video_back_muted.length) {
            $video_back_muted.vidbacking();
        }

        // parallax background
        if ($parallax_background.length) {

            $parallax_background.parallax();

        } // end check $current_year

        // notification
        if ($notification.length) {
            $notification.each(function() {
                if ($(this).find('> .delete').length) {
                    $(this).find('> .delete').on('click', function() {
                        $(this).parent().fadeOut();
                    });
                }
            });
        }

        // message
        if ($message.length) {
            $message.each(function() {
                if ($(this).find('.message-header > .delete').length) {
                    $(this).find('.message-header > .delete').on('click', function() {
                        $(this).parent().parent().fadeOut();
                    });
                }
            });
        }

        // dropdown
        if ($dropdown.length) {
            $dropdown.each(function() {
                $(this).on('click', function() {
                    $(this).toggleClass('is-active');
                });
            });

            // hide dropdown menu when click outside it
            $(document).on('click', function(event) {
                if (!$(event.target).closest('.dropdown').length) {
                    $dropdown.each(function() {
                        $(this).removeClass('is-active');
                    });
                }
            });
        }

        // modal
        if ($show_modal.length) {

            $show_modal.each(function() {

                var $_this = $(this);

                if ($_this.find('.modal').length) {

                    $_this.find('.launch-modal').on('click', function() {
                        $_this.find('.modal').addClass('is-active');
                    });

                    // close modal
                    $_this.find('.modal').find('.modal-close').on('click', function(e) {
                        $_this.find('.modal').removeClass('is-active');
                    });
                    $_this.find('.modal').find('.delete').on('click', function(e) {
                        $_this.find('.modal').removeClass('is-active');
                    });

                    // hide modal when click outside it
                    $_this.find('.modal').find('.modal-background').on('click', function(e) {
                        $_this.find('.modal').removeClass('is-active');
                    });

                }


            });

        }

        /**
         * animation on scroll down or top by AOS plugin
         */
        var $slider_revolution = $body.find('.site-header-bottom .slider');
        var $flex_slider = $body.find('.site-header-bottom .flexslider');
        var $window = $(window);

        /**
         * Detect window width
         */
        function check_width() {

            // check widnow size
            var window_size = $window.width();

            // window size is bigger than 768px?
            if (window_size > 768) {

                if ($slider_revolution.length) {

                    AOS.init({
                        duration: 800,
                        offset: 850,
                    });

                } else if ($flex_slider.length) {

                    AOS.init({
                        duration: 800,
                        offset: 0,
                    });

                } else {

                    AOS.init({
                        duration: 800,
                        offset: 0,
                    });

                }

            } else {
                AOS.init({
                    duration: 800,
                    offset: 0,
                });
            }

        }

        // execute on load
        check_width();

        // bind event listener
        $(window).resize(check_width);

        /**
         * usebasin.com Ajax contact form.
         */

        // default notification options
        var default_options = {
            custom: true,
            easing: 'linear',
            speed: 400,
            html: true,
            duration: 10,
            closeConfirm: true,
        };

        // Success function
        function done_func(response) {

            $body.addClass('overhang-push');
            $body.addClass('overhang-success');
            $body.removeClass('overhang-danger');
            $body.overhang(
                $.extend(default_options, {
                    message: $overhangـsuccess_message.html(),
                    callback: function(value) {
                        $body.removeClass('overhang-push');
                        $body.removeClass('overhang-success');
                    }
                })
            );
            $ajax_contact_form.find('input:not([type="submit"]), textarea').val('');

        }

        // fail function
        function fail_func(data) {

            $body.addClass('overhang-push');
            $body.addClass('overhang-danger');
            $body.removeClass('overhang-success');
            $body.overhang(
                $.extend(default_options, {
                    message: $overhangـerror_message.html(),
                    callback: function(value) {
                        $body.removeClass('overhang-push');
                        $body.removeClass('overhang-danger');
                    }
                })
            );

        }

        if ($ajax_contact_form.length) {

            // set up an event listener for the contact form.
            $ajax_contact_form.submit(function(event) {

                // stop the browser from submitting the form.
                event.preventDefault();

                // serialize the form data.
                ajax_form_data = $(this).serialize();

                // send Ajax contact form
                $.ajax({
                        type: 'POST',
                        url: $ajax_contact_form.attr('action'),
                        data: ajax_form_data,
                        dataType: "json"
                    })
                    .done(done_func)
                    .fail(fail_func);

            });

        }

        // Initialize all input of tags type.
        var tagsinput = bulmaTagsinput.attach('[type="tags"]');

        /**
         * quickview
         */

        // Initialize quickview content.
        var quickviews = bulmaQuickview.attach();

        /**
         * steps
         */

        // Initialize quickview content.
        var steps = bulmaSteps.attach();

        /**
         * Pageloader
         */

        // show pageloader per click for just test
        if ($show_pageloader.length) {

            // hide pageloader
            $pageloader.removeClass('is-active');

            $show_pageloader.each(function() {

                var $_this = $(this);

                $_this.find('.button').on('click', function() {
                    $_this.find('.pageloader').addClass('is-active');
                    setTimeout(function() {
                        $pageloader.removeClass('is-active');
                    }, 3500);
                });

            });

        }

    });

})(jQuery, window, document);