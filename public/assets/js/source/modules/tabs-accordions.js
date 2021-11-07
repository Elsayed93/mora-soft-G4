/**
 * Tabs and Accordions Scripts.
 * Using jquery.beefup - A jQuery Accordion Plugin.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Accordions ===========================
         * Save DOM selectors.
         */
        var $container_class = $('.accordions');
        var $default_class = $('.beefup');
        var $toggle_buttons_class = $('.toggle-buttons');

        /**
         * default options.
         */
        var $default_options = {
            openSingle: true,
            openSpeed: 300,
            closeSpeed: 300
        };

        /**
         * default settings.
         */

        // we have accordions selector?
        if ($container_class.length) {

            // loop throw main containers
            $container_class.each(function() {

                // we have beefup selector?
                if ($default_class.length) {
                    $(this).find($default_class).beefup($default_options);
                }

            });

        }

        // we have toggle buttons selector?
        if ($toggle_buttons_class.length) {

            $toggle_buttons_class.each(function() {

                var $this = $(this);
                var $beefup = $this.find($default_class).beefup($default_options);

                // open all
                $this.find('.toggle-open-all').on('click', function() {
                    $beefup.open();
                });

                // close all
                $this.find('.toggle-close-all').on('click', function() {
                    $beefup.close();
                });

                // open accordion using button
                $this.find('.buttons-group').find('.button').each(function(index) {
                    $(this).on('click', function() {

                        if (!$(this).hasClass('toggle-open-all') && !$(this).hasClass('toggle-close-all')) {

                            $this.find($container_class).find($default_class).each(function(item) {

                                if (index === item) {
                                    $beefup.click($(this));
                                }

                            });

                        }

                    });
                });

            });

        }

        /**
         * Tabs ===========================
         * @source https://codepen.io/0zero4four/pen/PPjZzj
         */

        var TabBlock = {
            s: {
                animLen: 300
            },

            init: function() {
                TabBlock.bindUIActions();
                TabBlock.hideInactive();
            },

            bindUIActions: function() {
                $('.tabs').on('click', 'li', function() {
                    TabBlock.switchTab($(this));
                });
            },

            hideInactive: function() {
                var $tabBlocks = $('.tabs-list');

                $tabBlocks.each(function(i) {
                    var
                        $tabBlock = $($tabBlocks[i]),
                        $panes = $tabBlock.find('.tab-block'),
                        $activeTab = $tabBlock.find('li.is-active');

                    $panes.hide();
                    $($panes[$activeTab.index()]).show();
                });
            },

            switchTab: function($tab) {
                var $context = $tab.closest('.tabs-list');

                if (!$tab.hasClass('is-active')) {
                    $tab.siblings().removeClass('is-active');
                    $tab.addClass('is-active');

                    TabBlock.showPane($tab.index(), $context);
                }
            },

            showPane: function(i, $context) {
                var $panes = $context.find('.tab-block');
                $panes.slideUp(TabBlock.s.animLen);
                $($panes[i]).slideDown(TabBlock.s.animLen);
            }
        };

        // we have tabs selector?
        if ($('.tabs-list').length) {
            TabBlock.init();
        }


    });

})(jQuery, window, document);