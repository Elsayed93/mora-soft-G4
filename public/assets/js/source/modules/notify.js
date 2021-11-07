/**
 * Notify Bars and Alerts Scripts.
 * Using overhang.js Plugin.
 * Using noty.js Plugin.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $body = $('body');
        var $overhang = $('.overhang');
        var $show_overhang = $('.show-overhang');
        var $overhang_top = $('.overhang-top');
        var $overhang_bottom = $('.overhang-bottom');
        var $overhangـmessageـcontent = $('.overhang-message-content');
        var $notify_alert_message = $('.notify-alert-message');
        var $notify_alert = $('.notify-alert');

        /**
         * Notify Bars.
         */

        // default options
        var default_options = {
            custom: true,
            easing: 'linear',
            speed: 400,
            html: true,
            closeConfirm: true,
            primary: '#2231f6',
        };

        // active notify
        // $body.addClass('overhang-push');
        // $body.addClass('overhang-success');
        // $body.overhang(
        //     $.extend(default_options, {
        //         message: $overhangـmessageـcontent.html(),
        //         callback: function(value) {
        //             $body.removeClass('overhang-push');
        //             $body.removeClass('overhang-info');
        //         }
        //     })
        // );

        // show notify bar
        $overhang_top.on('click', function() {
            $body.removeClass('overhang-in-bottom');
            $body.addClass('overhang-push');
            $body.removeClass('overhang-info');
            $body.removeClass('overhang-success');
            $body.removeClass('overhang-warning');
            $body.removeClass('overhang-danger');
            $body.overhang(
                $.extend(default_options, {
                    message: $overhangـmessageـcontent.html(),
                    callback: function(value) {
                        $body.removeClass('overhang-push');
                        $body.removeClass('overhang-info');
                        $body.removeClass('overhang-success');
                        $body.removeClass('overhang-warning');
                        $body.removeClass('overhang-danger');
                    }
                })
            );
        });

        $overhang_bottom.on('click', function() {
            $body.addClass('overhang-in-bottom');
            $body.removeClass('overhang-push');
            $body.removeClass('overhang-info');
            $body.removeClass('overhang-success');
            $body.removeClass('overhang-warning');
            $body.removeClass('overhang-danger');
            $body.overhang(
                $.extend(default_options, {
                    message: $overhangـmessageـcontent.html(),
                    callback: function(value) {
                        $body.removeClass('overhang-push');
                        $body.removeClass('overhang-info');
                        $body.removeClass('overhang-success');
                        $body.removeClass('overhang-warning');
                        $body.removeClass('overhang-danger');
                    }
                })
            );

        });

        $('.button.overhang-info').on('click', function() {
            $body.removeClass('overhang-in-bottom');
            $body.addClass('overhang-push');
            $body.addClass('overhang-info');
            $body.removeClass('overhang-success');
            $body.removeClass('overhang-warning');
            $body.removeClass('overhang-danger');
            $body.overhang(
                $.extend(default_options, {
                    message: $overhangـmessageـcontent.html(),
                    callback: function(value) {
                        $body.removeClass('overhang-push');
                        $body.removeClass('overhang-info');
                    }
                })
            );
        });

        $('.button.overhang-success').on('click', function() {
            $body.removeClass('overhang-in-bottom');
            $body.addClass('overhang-push');
            $body.addClass('overhang-success');
            $body.removeClass('overhang-info');
            $body.removeClass('overhang-warning');
            $body.removeClass('overhang-danger');
            $body.overhang(
                $.extend(default_options, {
                    message: $overhangـmessageـcontent.html(),
                    callback: function(value) {
                        $body.removeClass('overhang-push');
                        $body.removeClass('overhang-success');
                    }
                })
            );
        });

        $('.button.overhang-warning').on('click', function() {
            $body.removeClass('overhang-in-bottom');
            $body.addClass('overhang-push');
            $body.addClass('overhang-warning');
            $body.removeClass('overhang-info');
            $body.removeClass('overhang-success');
            $body.removeClass('overhang-danger');
            $body.overhang(
                $.extend(default_options, {
                    message: $overhangـmessageـcontent.html(),
                    callback: function(value) {
                        $body.removeClass('overhang-push');
                        $body.removeClass('overhang-warning');
                    }
                })
            );
        });

        $('.button.overhang-danger').on('click', function() {
            $body.removeClass('overhang-in-bottom');
            $body.addClass('overhang-push');
            $body.addClass('overhang-danger');
            $body.removeClass('overhang-info');
            $body.removeClass('overhang-success');
            $body.removeClass('overhang-warning');
            $body.overhang(
                $.extend(default_options, {
                    message: $overhangـmessageـcontent.html(),
                    callback: function(value) {
                        $body.removeClass('overhang-push');
                        $body.removeClass('overhang-danger');
                    }
                })
            );
        });

        /**
         * Notify Alerts.
         */

        if ($notify_alert.length) {

            $notify_alert.find('.button').each(function() {
                $(this).on('click', function() {

                    if ($(this).is('[data-options]') && !$.isEmptyObject($.parseJSON($(this).attr('data-options')))) {
                        new Noty(
                            $.extend({
                                text: $notify_alert_message.html(),
                                type: 'success',
                            }, $.parseJSON($(this).attr('data-options')))
                        ).show();
                    } else {
                        new Noty({
                            text: $notify_alert_message.html(),
                            type: 'success',
                        }).show();
                    }

                });
            });

        }

    });

})(jQuery, window, document);