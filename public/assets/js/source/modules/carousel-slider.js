/**
 * Carousel Slider Scripts.
 * Using OWL Carousel jQuery Plugin.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $slider = $('.owl-carousel');
        var $slider_dots = $('.owl-carousel.dots');
        var $slider_nodots = $('.owl-carousel.no-dots');
        var $slider_navs = $('.owl-carousel.navs');
        var $slider_fullwidth = $('.owl-carousel.scrollbar');

        // check @rtl
        var html_dir = $('html').attr('dir');
        var is_rtl = false;
        if ($('body').hasClass('rtl') || $('html').hasClass('rtl') || html_dir == 'rtl') {
            is_rtl = true;
        }

        /**
         * default options.
         */
        var default_options = {
            rtl: is_rtl,
            items: 1,
            loop: true,
            smartSpeed: 1000,
            autoplay: true,
            autoplayTimeout: 8000,
            autoplaySpeed: 1000,
            autoplayHoverPause: true,
        };

        var nav_default_options = {
            rtl: is_rtl,
            items: 1,
            nav: true,
            dots: false,
            navText: false,
            loop: true,
            smartSpeed: 1000,
            autoplay: true,
            autoplayTimeout: 8000,
            autoplaySpeed: 1000,
            autoplayHoverPause: true,
        };

        var nodots_default_options = {
            rtl: is_rtl,
            dots: false,
            items: 1,
            loop: true,
            smartSpeed: 1000,
            autoplay: true,
            autoplayTimeout: 7000,
            autoplaySpeed: 1000,
            autoplayHoverPause: true,
        };

        // show carousel slider after load page content
        $slider_dots.show();
        $slider_nodots.show();
        $slider_navs.show();
        // $slider_fullwidth.show();

        // we have dots slider selector?
        if ($slider_dots.length) {

            $slider_dots.each(function() {

                // custom items per class
                if ($(this).hasClass('carousel-items-2')) {
                    $(this).owlCarousel({
                        rtl: is_rtl,
                        items: 2,
                        margin: 30,
                        loop: true,
                        smartSpeed: 1000,
                        autoplay: true,
                        autoplayTimeout: 8000,
                        autoplaySpeed: 1000,
                        autoplayHoverPause: true,
                        responsive: {
                            // breakpoint from 0 up
                            0: {
                                items: 1,
                                margin: 0,
                            },
                            // breakpoint from 769 up
                            769: {
                                items: 2,
                                margin: 30,
                            },
                            // breakpoint from 1088 up
                            1088: {
                                items: 2,
                                margin: 30,
                            },
                            // breakpoint from 1280 up
                            1280: {
                                items: 2,
                                margin: 30,
                            }
                        }
                    });
                }

                if ($(this).hasClass('carousel-items-3')) {
                    $(this).owlCarousel({
                        rtl: is_rtl,
                        items: 3,
                        margin: 30,
                        loop: true,
                        smartSpeed: 1000,
                        autoplay: true,
                        autoplayTimeout: 8000,
                        autoplaySpeed: 1000,
                        autoplayHoverPause: true,
                        responsive: {
                            // breakpoint from 0 up
                            0: {
                                items: 1,
                                margin: 0,
                            },
                            // breakpoint from 769 up
                            769: {
                                items: 3,
                                margin: 30,
                            },
                            // breakpoint from 1088 up
                            1088: {
                                items: 3,
                                margin: 30,
                            },
                            // breakpoint from 1280 up
                            1280: {
                                items: 3,
                                margin: 30,
                            }
                        }
                    });
                }

                if ($(this).hasClass('carousel-items-4')) {
                    $(this).owlCarousel({
                        rtl: is_rtl,
                        items: 4,
                        margin: 30,
                        loop: true,
                        smartSpeed: 1000,
                        autoplay: true,
                        autoplayTimeout: 8000,
                        autoplaySpeed: 1000,
                        autoplayHoverPause: true,
                        responsive: {
                            // breakpoint from 0 up
                            0: {
                                items: 1,
                                margin: 0,
                            },
                            // breakpoint from 769 up
                            769: {
                                items: 3,
                                margin: 30,
                            },
                            // breakpoint from 1088 up
                            1088: {
                                items: 3,
                                margin: 30,
                            },
                            // breakpoint from 1280 up
                            1280: {
                                items: 4,
                                margin: 30,
                            }
                        }
                    });
                }

                if ($(this).hasClass('carousel-items-5')) {
                    $(this).owlCarousel({
                        rtl: is_rtl,
                        items: 5,
                        margin: 30,
                        loop: true,
                        smartSpeed: 1000,
                        autoplay: true,
                        autoplayTimeout: 8000,
                        autoplaySpeed: 1000,
                        autoplayHoverPause: true,
                        responsive: {
                            // breakpoint from 0 up
                            0: {
                                items: 1,
                                margin: 0,
                            },
                            // breakpoint from 769 up
                            769: {
                                items: 3,
                                margin: 30,
                            },
                            // breakpoint from 1088 up
                            1088: {
                                items: 3,
                                margin: 30,
                            },
                            // breakpoint from 1280 up
                            1280: {
                                items: 5,
                                margin: 30,
                            }
                        }
                    });
                }

                if ($(this).hasClass('carousel-items-6')) {
                    $(this).owlCarousel({
                        rtl: is_rtl,
                        items: 6,
                        margin: 30,
                        loop: true,
                        smartSpeed: 1000,
                        autoplay: true,
                        autoplayTimeout: 8000,
                        autoplaySpeed: 1000,
                        autoplayHoverPause: true,
                        responsive: {
                            // breakpoint from 0 up
                            0: {
                                items: 1,
                                margin: 0,
                            },
                            // breakpoint from 769 up
                            769: {
                                items: 3,
                                margin: 30,
                            },
                            // breakpoint from 1088 up
                            1088: {
                                items: 3,
                                margin: 30,
                            },
                            // breakpoint from 1280 up
                            1280: {
                                items: 6,
                                margin: 30,
                            }
                        }
                    });
                }

                // default 1 item
                $(this).owlCarousel(default_options);

            });

        } // end check $slider_dots

        // we have navs slider selector?
        if ($slider_navs.length) {

            $slider_navs.each(function() {

                // custom items per class
                if ($(this).hasClass('carousel-items-2')) {

                    if ($(this).hasClass('no-margin')) {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            items: 2,
                            margin: 0,
                            nav: true,
                            dots: false,
                            navText: false,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 8000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 2,
                                },
                            }
                        });
                    } else {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            items: 2,
                            margin: 30,
                            nav: true,
                            dots: false,
                            navText: false,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 8000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                    margin: 0,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 2,
                                    margin: 30,
                                },
                            }
                        });
                    }

                }

                if ($(this).hasClass('carousel-items-3')) {

                    if ($(this).hasClass('no-margin')) {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            items: 3,
                            margin: 0,
                            nav: true,
                            dots: false,
                            navText: false,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 8000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 3,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 3,
                                }
                            }
                        });

                    } else {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            items: 3,
                            margin: 30,
                            nav: true,
                            dots: false,
                            navText: false,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 8000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                    margin: 0,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 3,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 3,
                                }
                            }
                        });
                    }

                }

                if ($(this).hasClass('carousel-items-4')) {

                    if ($(this).hasClass('no-margin')) {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            items: 4,
                            margin: 0,
                            nav: true,
                            dots: false,
                            navText: false,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 8000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 3,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 4,
                                }
                            }
                        });
                    } else {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            items: 4,
                            margin: 30,
                            nav: true,
                            dots: false,
                            navText: false,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 8000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                    margin: 0,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 3,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 4,
                                }
                            }
                        });
                    }

                }

                if ($(this).hasClass('carousel-items-5')) {

                    if ($(this).hasClass('no-margin')) {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            items: 5,
                            margin: 0,
                            nav: true,
                            dots: false,
                            navText: false,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 8000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 3,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 5,
                                }
                            }
                        });
                    } else {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            items: 5,
                            margin: 30,
                            nav: true,
                            dots: false,
                            navText: false,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 8000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                    margin: 0,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 3,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 5,
                                }
                            }
                        });
                    }

                }

                if ($(this).hasClass('carousel-items-6')) {

                    if ($(this).hasClass('no-margin')) {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            items: 6,
                            margin: 0,
                            nav: true,
                            dots: false,
                            navText: false,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 8000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 3,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 6,
                                }
                            }
                        });
                    } else {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            items: 6,
                            margin: 30,
                            nav: true,
                            dots: false,
                            navText: false,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 8000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                    margin: 0,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 3,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 6,
                                }
                            }
                        });
                    }

                }

                // default 1 item
                $(this).owlCarousel(nav_default_options);

            });

        } // end check $slider_navs

        // we have dots slider selector?
        if ($slider_nodots.length) {

            $slider_nodots.each(function() {

                // custom items per class
                if ($(this).hasClass('carousel-items-2')) {

                    if ($(this).hasClass('no-margin')) {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            dots: false,
                            items: 2,
                            margin: 0,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 7000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 2,
                                },
                            }
                        });

                    } else {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            dots: false,
                            items: 2,
                            margin: 30,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 7000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                    margin: 0,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 2,
                                },
                            }
                        });
                    }

                }

                if ($(this).hasClass('carousel-items-3')) {

                    if ($(this).hasClass('no-margin')) {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            dots: false,
                            items: 3,
                            margin: 0,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 7000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 3,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 3,
                                }
                            }
                        });

                    } else {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            dots: false,
                            items: 3,
                            margin: 30,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 7000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                    margin: 0,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 3,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 3,
                                }
                            }
                        });
                    }

                }

                if ($(this).hasClass('carousel-items-4')) {

                    if ($(this).hasClass('no-margin')) {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            dots: false,
                            items: 4,
                            margin: 0,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 7000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 4,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 4,
                                }
                            }
                        });
                    } else {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            dots: false,
                            items: 4,
                            margin: 30,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 7000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                    margin: 0,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 4,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 4,
                                }
                            }
                        });
                    }

                }

                if ($(this).hasClass('carousel-items-5')) {

                    if ($(this).hasClass('no-margin')) {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            dots: false,
                            items: 5,
                            margin: 0,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 7000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 3,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 5,
                                }
                            }
                        });
                    } else {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            dots: false,
                            items: 5,
                            margin: 30,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 7000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                    margin: 0,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 3,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 5,
                                }
                            }
                        });
                    }

                }

                if ($(this).hasClass('carousel-items-6')) {

                    if ($(this).hasClass('no-margin')) {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            dots: false,
                            items: 6,
                            margin: 0,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 7000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 3,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 6,
                                }
                            }
                        });
                    } else {
                        $(this).owlCarousel({
                            rtl: is_rtl,
                            dots: false,
                            items: 6,
                            margin: 30,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 7000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                    margin: 0,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 3,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 3,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 6,
                                }
                            }
                        });
                    }

                }

                // default 1 item
                $(this).owlCarousel(nodots_default_options);

            });

        } // end check $slider_nodots

        /**
         * we have scrollbar slider selector?
         * Note: this scrollbar slider should be last code in the file under other
         * normal carousel options and settings, i already added this code with
         * 'instagram-feed.js' file to solve scrollbar issue, which i injected this code after
         *  instafeed loaded content to the page, so i will disable this code from here.
         */
        // if ($slider_fullwidth.length) {

        //     $slider_fullwidth.each(function() {

        //         $(this).owlCarousel({
        //             stagePadding: 375,
        //             items: 1,
        //             loop: true,
        //             margin: 30,
        //             nav: true,
        //             dots: false,
        //             navText: false,
        //             smartSpeed: 1000,
        //             autoplay: true,
        //             autoplayTimeout: 8000,
        //             autoplaySpeed: 1000,
        //             autoplayHoverPause: true,
        //             scrollbarType: 'scroll', // progress - scroll
        //             responsive: {
        //                 0: {
        //                     items: 1
        //                 },
        //                 600: {
        //                     items: 1,
        //                     stagePadding: 88,
        //                     margin: 13,
        //                 },
        //                 960: {
        //                     items: 1,
        //                     // stagePadding: 100,
        //                     // margin: 13,
        //                 }
        //             }
        //         });

        //     });

        // } // end check $slider_fullwidth

    });

})(jQuery, window, document);