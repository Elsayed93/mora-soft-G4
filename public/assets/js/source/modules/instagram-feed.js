/**
 * Instagram Feed Scripts.
 * Using Instafeed.js Plugin.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $instafeed_default = $('#instafeed');
        var $slider_instafeed = $('.owl-carousel.instafeed');
        var $slider_fullwidth = $('.owl-carousel.scrollbar');
        var $instafeed_sidebar = $('#instafeed-sidebar');
        var $instafeed_footer = $('#instafeed-footer');
        var $instafeed_footer_2 = $('#instafeed-footer-2');
        var $instafeed_content = $('#instafeed-content');
        var $instafeed_content_1 = $('#instafeed-content-1');
        var $instafeed_content_2 = $('#instafeed-content-2');
        var $instafeed_content_3 = $('#instafeed-content-3');
        var $instafeed_content_4 = $('#instafeed-content-4');
        var $instafeed_content_5 = $('#instafeed-content-5');

        // check @rtl
        var html_dir = $('html').attr('dir');
        var is_rtl = false;
        if ($('body').hasClass('rtl') || $('html').hasClass('rtl') || html_dir == 'rtl') {
            is_rtl = true;
        }

        /**
         * Save default settings.
         */
        var userId = '12659728099';
        var accessToken = '12659728099.0a298a0.6478c888209b455ab9740ada547c0a8f';
        var tag_name = 'joo_corporate_cargo'; // change per template
        var default_foundImages = 0;
        var sidebar_foundImages = 0;
        var footer_foundImages = 0;
        var footer_foundImages_2 = 0;
        var content_foundImages = 0;
        var content_foundImages_1 = 0;
        var content_foundImages_2 = 0;
        var content_foundImages_3 = 0;
        var content_foundImages_4 = 0;
        var content_foundImages_5 = 0;

        /** 
         * How to get access token?
         * run this on browser:
         * https://api.instagram.com/oauth/authorize/?client_id=CLIENT_ID&redirect_uri=https://jozoor.com/&response_type=token
         * after that you will get access token
         * or use this tool: https://rudrastyh.com/tools/access-token
         * source: https://www.instagram.com/developer/authentication/
         */

        /**
         * default instafeed
         */
        var default_feed = new Instafeed({
            get: 'user',
            // to get user id go here: 
            // https://api.instagram.com/v1/users/self/?access_token=ACCESS_TOKEN
            // or here: https://smashballoon.com/instagram-feed/find-instagram-user-id/
            userId: userId,
            // clientId: '0a298a05edd74595bce43fff4901f15d',
            // get: 'tagged', // just from my account not public content
            // tagName: 'joo_creative',
            accessToken: accessToken,
            // target: 'instafeed', // html id > default 'instafeed'
            // thumbnail (150x150) - low_resolution (306x306) - standard_resolution (612x612)
            resolution: 'standard_resolution',
            // Maximum number of Images to add. default Max of 60.
            // limit: 60,
            // Sort the images in a set order:
            // none - most-recent (Newest to oldest) - least-recent (Oldest to newest) - most-liked
            // least-liked - most-commented - least-commented - random
            // sortBy: 'none',
            template: '<figure class="instafeed-image"><a href="{{link}}" target="_blank"><img src="{{image}}" /><div class="instafeed-overlay"><div class="instafeed-info"><span><i class="icon-heart"></i> {{likes}}</span> <span><i class="icon-bubbles"></i> {{comments}}</span></div></div></a></figure>',

            // Filter (get username + tagged) then limit number of images:
            // https://github.com/stevenschobert/instafeed.js/issues/97#issuecomment-42217785
            filter: function(image) {
                if (image.tags.indexOf(tag_name) >= 0 && default_foundImages < 20) {
                    default_foundImages = default_foundImages + 1;
                    return true;
                }
                return false;
            },

            // if you need to working with images before added to the page
            success: function(data) {
                default_foundImages = 0;
            },

            // load carousel slider after images have been added to the page
            after: function() {

                // we have instafeed slider selector?
                if ($slider_instafeed.length) {

                    $slider_instafeed.each(function() {

                        $(this).owlCarousel({
                            rtl: is_rtl,
                            items: 5,
                            loop: true,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 8000, // 8000
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            nav: true,
                            dots: false,
                            navText: false,
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
                                    items: 5,
                                }
                            }
                        });

                    });

                } // end check $slider_instafeed

                // show carousel slider after load page content
                $slider_fullwidth.show();

                /**
                 * we have scrollbar slider selector?
                 * Note: this scrollbar slider should be last code in the file under other
                 * normal carousel options and settings, so i injected it here after
                 * instafeed loaded content to the page.
                 */
                if ($slider_fullwidth.length) {

                    $slider_fullwidth.each(function() {

                        $(this).owlCarousel({
                            rtl: is_rtl,
                            stagePadding: 375,
                            items: 1,
                            loop: true,
                            margin: 30,
                            nav: true,
                            dots: false,
                            navText: false,
                            smartSpeed: 1000,
                            autoplay: true,
                            autoplayTimeout: 8000,
                            autoplaySpeed: 1000,
                            autoplayHoverPause: true,
                            scrollbarType: 'scroll', // progress - scroll
                            responsive: {
                                // breakpoint from 0 up
                                0: {
                                    items: 1,
                                    margin: 0,
                                    stagePadding: 0,
                                },
                                // breakpoint from 769 up
                                769: {
                                    items: 1,
                                    margin: 0,
                                    stagePadding: 0,
                                },
                                // breakpoint from 1088 up
                                1088: {
                                    items: 1,
                                    margin: 25,
                                    stagePadding: 160,
                                },
                                // breakpoint from 1280 up
                                1280: {
                                    items: 1,
                                    margin: 30,
                                    stagePadding: 375,
                                }
                            }
                        });

                    });

                } // end check $slider_fullwidth

            }

        });

        // we have instafeed default id selector? run the feed
        if ($instafeed_default.length) {
            default_feed.run();
        } else {

            // show carousel slider after load page content
            $slider_fullwidth.show();

            /**
             * we have scrollbar slider selector?
             * Note: this scrollbar slider should be last code in the file under other
             * normal carousel options and settings, so i injected it here after
             * instafeed loaded content to the page.
             */
            if ($slider_fullwidth.length) {

                $slider_fullwidth.each(function() {

                    $(this).owlCarousel({
                        rtl: is_rtl,
                        stagePadding: 375,
                        items: 1,
                        loop: true,
                        margin: 30,
                        nav: true,
                        dots: false,
                        navText: false,
                        smartSpeed: 1000,
                        autoplay: true,
                        autoplayTimeout: 8000,
                        autoplaySpeed: 1000,
                        autoplayHoverPause: true,
                        scrollbarType: 'scroll', // progress - scroll
                        responsive: {
                            // breakpoint from 0 up
                            0: {
                                items: 1,
                                margin: 0,
                                stagePadding: 0,
                            },
                            // breakpoint from 769 up
                            769: {
                                items: 1,
                                margin: 0,
                                stagePadding: 0,
                            },
                            // breakpoint from 1088 up
                            1088: {
                                items: 1,
                                margin: 25,
                                stagePadding: 160,
                            },
                            // breakpoint from 1280 up
                            1280: {
                                items: 1,
                                margin: 30,
                                stagePadding: 375,
                            }
                        }
                    });

                });

            } // end check $slider_fullwidth

        }

        /**
         * sidebar instafeed
         */
        var sidebar_feed = new Instafeed({
            get: 'user',
            userId: userId,
            accessToken: accessToken,
            target: 'instafeed-sidebar',
            // limit: 6,
            resolution: 'thumbnail',
            template: '<figure class="instafeed-image"><a href="{{link}}" target="_blank"><img src="{{image}}" /><div class="instafeed-overlay"><div class="instafeed-info"><span><i class="icon-heart"></i> {{likes}}</span> <span><i class="icon-bubbles"></i> {{comments}}</span></div></div></a></figure>',
            // Filter (get username + tagged):
            filter: function(image) {
                if (image.tags.indexOf(tag_name) >= 0 && sidebar_foundImages < 6) {
                    sidebar_foundImages = sidebar_foundImages + 1;
                    return true;
                }
                return false;
            },

            // if you need to working with images before added to the page
            success: function(data) {
                sidebar_foundImages = 0;
            },
        });

        // we have instafeed sidebar id selector? run the feed
        if ($instafeed_sidebar.length) {
            sidebar_feed.run();
        }

        /**
         * footer instafeed
         */
        var footer_feed = new Instafeed({
            get: 'user',
            userId: userId,
            accessToken: accessToken,
            target: 'instafeed-footer',
            // limit: 6,
            resolution: 'thumbnail',
            template: '<figure class="instafeed-image"><a href="{{link}}" target="_blank"><img src="{{image}}" /><div class="instafeed-overlay"><div class="instafeed-info"><span><i class="icon-heart"></i> {{likes}}</span> <span><i class="icon-bubbles"></i> {{comments}}</span></div></div></a></figure>',
            // Filter (get username + tagged):
            filter: function(image) {
                if (image.tags.indexOf(tag_name) >= 0 && footer_foundImages < 6) {
                    footer_foundImages = footer_foundImages + 1;
                    return true;
                }
                return false;
            },

            // if you need to working with images before added to the page
            success: function(data) {
                footer_foundImages = 0;
            },
        });

        // we have instafeed footer id selector? run the feed
        if ($instafeed_footer.length) {
            footer_feed.run();
        }

        /**
         * footer 2 instafeed
         */
        var footer_feed_2 = new Instafeed({
            get: 'user',
            userId: userId,
            accessToken: accessToken,
            target: 'instafeed-footer-2',
            // limit: 6,
            resolution: 'thumbnail',
            template: '<figure class="instafeed-image"><a href="{{link}}" target="_blank"><img src="{{image}}" /><div class="instafeed-overlay"><div class="instafeed-info"><span><i class="icon-heart"></i> {{likes}}</span> <span><i class="icon-bubbles"></i> {{comments}}</span></div></div></a></figure>',
            // Filter (get username + tagged):
            filter: function(image) {
                if (image.tags.indexOf(tag_name) >= 0 && footer_foundImages_2 < 6) {
                    footer_foundImages_2 = footer_foundImages_2 + 1;
                    return true;
                }
                return false;
            },

            // if you need to working with images before added to the page
            success: function(data) {
                footer_foundImages_2 = 0;
            },
        });

        // we have instafeed footer id selector? run the feed
        if ($instafeed_footer_2.length) {
            footer_feed_2.run();
        }

        /**
         * content instafeed
         */
        var content_feed = new Instafeed({
            get: 'user',
            userId: userId,
            accessToken: accessToken,
            target: 'instafeed-content',
            // limit: 9,
            resolution: 'standard_resolution',
            template: '<div class="column"><figure class="instafeed-image"><a href="{{link}}" target="_blank"><img src="{{image}}" /><div class="instafeed-overlay"><div class="instafeed-info"><span><i class="icon-heart"></i> {{likes}}</span> <span><i class="icon-bubbles"></i> {{comments}}</span></div></div></a></figure></div>',
            // Filter (get username + tagged):
            filter: function(image) {
                if (image.tags.indexOf(tag_name) >= 0 && content_foundImages < 9) {
                    content_foundImages = content_foundImages + 1;
                    return true;
                }
                return false;
            },

            // if you need to working with images before added to the page
            success: function(data) {
                content_foundImages = 0;
            },
        });

        // we have instafeed content id selector? run the feed
        if ($instafeed_content.length) {
            content_feed.run();
        }

        var content_feed_1 = new Instafeed({
            get: 'user',
            userId: userId,
            accessToken: accessToken,
            target: 'instafeed-content-1',
            // limit: 8,
            resolution: 'standard_resolution',
            template: '<div class="column"><figure class="instafeed-image"><a href="{{link}}" target="_blank"><img src="{{image}}" /><div class="instafeed-overlay"><div class="instafeed-info"><span><i class="icon-heart"></i> {{likes}}</span> <span><i class="icon-bubbles"></i> {{comments}}</span></div></div></a></figure></div>',
            // Filter (get username + tagged):
            filter: function(image) {
                if (image.tags.indexOf(tag_name) >= 0 && content_foundImages_1 < 8) {
                    content_foundImages_1 = content_foundImages_1 + 1;
                    return true;
                }
                return false;
            },

            // if you need to working with images before added to the page
            success: function(data) {
                content_foundImages_1 = 0;
            },
        });

        // we have instafeed content id selector? run the feed
        if ($instafeed_content_1.length) {
            content_feed_1.run();
        }

        var content_feed_2 = new Instafeed({
            get: 'user',
            userId: userId,
            accessToken: accessToken,
            target: 'instafeed-content-2',
            // limit: 9,
            resolution: 'standard_resolution',
            template: '<div class="column"><figure class="instafeed-image"><a href="{{link}}" target="_blank"><img src="{{image}}" /><div class="instafeed-overlay"><div class="instafeed-info"><span><i class="icon-heart"></i> {{likes}}</span> <span><i class="icon-bubbles"></i> {{comments}}</span></div></div></a></figure></div>',
            // Filter (get username + tagged):
            filter: function(image) {
                if (image.tags.indexOf(tag_name) >= 0 && content_foundImages_2 < 9) {
                    content_foundImages_2 = content_foundImages_2 + 1;
                    return true;
                }
                return false;
            },

            // if you need to working with images before added to the page
            success: function(data) {
                content_foundImages_2 = 0;
            },
        });

        // we have instafeed content id selector? run the feed
        if ($instafeed_content_2.length) {
            content_feed_2.run();
        }

        var content_feed_3 = new Instafeed({
            get: 'user',
            userId: userId,
            accessToken: accessToken,
            target: 'instafeed-content-3',
            // limit: 20,
            resolution: 'standard_resolution',
            template: '<div class="column"><figure class="instafeed-image"><a href="{{link}}" target="_blank"><img src="{{image}}" /><div class="instafeed-overlay"><div class="instafeed-info"><span><i class="icon-heart"></i> {{likes}}</span> <span><i class="icon-bubbles"></i> {{comments}}</span></div></div></a></figure></div>',
            // Filter (get username + tagged):
            filter: function(image) {
                if (image.tags.indexOf(tag_name) >= 0 && content_foundImages_3 < 20) {
                    content_foundImages_3 = content_foundImages_3 + 1;
                    return true;
                }
                return false;
            },

            // if you need to working with images before added to the page
            success: function(data) {
                content_foundImages_3 = 0;
            },
        });

        // we have instafeed content id selector? run the feed
        if ($instafeed_content_3.length) {
            content_feed_3.run();
        }

        var content_feed_4 = new Instafeed({
            get: 'user',
            userId: userId,
            accessToken: accessToken,
            target: 'instafeed-content-4',
            // limit: 18,
            resolution: 'standard_resolution',
            template: '<div class="column"><figure class="instafeed-image"><a href="{{link}}" target="_blank"><img src="{{image}}" /><div class="instafeed-overlay"><div class="instafeed-info"><span><i class="icon-heart"></i> {{likes}}</span> <span><i class="icon-bubbles"></i> {{comments}}</span></div></div></a></figure></div>',
            // Filter (get username + tagged):
            filter: function(image) {
                if (image.tags.indexOf(tag_name) >= 0 && content_foundImages_4 < 18) {
                    content_foundImages_4 = content_foundImages_4 + 1;
                    return true;
                }
                return false;
            },

            // if you need to working with images before added to the page
            success: function(data) {
                content_foundImages_4 = 0;
            },
        });

        // we have instafeed content id selector? run the feed
        if ($instafeed_content_4.length) {
            content_feed_4.run();
        }

        var content_feed_5 = new Instafeed({
            get: 'user',
            userId: userId,
            accessToken: accessToken,
            target: 'instafeed-content-5',
            // limit: 20,
            resolution: 'standard_resolution',
            template: '<div class="column"><figure class="instafeed-image"><a href="{{link}}" target="_blank"><img src="{{image}}" /><div class="instafeed-overlay"><div class="instafeed-info"><span><i class="icon-heart"></i> {{likes}}</span> <span><i class="icon-bubbles"></i> {{comments}}</span></div></div></a></figure></div>',
            // Filter (get username + tagged):
            filter: function(image) {
                if (image.tags.indexOf(tag_name) >= 0 && content_foundImages_5 < 20) {
                    content_foundImages_5 = content_foundImages_5 + 1;
                    return true;
                }
                return false;
            },

            // if you need to working with images before added to the page
            success: function(data) {
                content_foundImages_5 = 0;
            },
        });

        // we have instafeed content id selector? run the feed
        if ($instafeed_content_5.length) {
            content_feed_5.run();
        }

    });


})(jQuery, window, document);