/**
 * Isotope Layout Scripts.
 * Using Isotope jQuery Plugin.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $isotope = $('.isotope');
        var $isotope_columns = $('.isotope .columns');
        var $isotope_filter = $('.isotope .isotope-filter');

        /**
         * Pagination
         */
        var itemsPerPageDefault = 6;
        var itemsPerPage = defineItemsPerPage();
        var currentNumberPages = 1;
        var currentPage = 1;
        var currentFilter = '*';
        var filterAtribute = 'data-filter';
        var pageAtribute = 'data-page';
        var pagerClass = 'pagination is-centered isotope-pager pagination-list is-rounded';
        var itemSelector = '.column';

        // we have isotope selector?
        if ($isotope.length) {

            // default options
            var options = {
                itemSelector: '.column', // recommended option
                transitionDuration: '0.8s',
                percentPosition: true,
            };

            // init Isotope after all images have loaded
            var $isotope_grid = $isotope_columns.imagesLoaded(function() {

                $isotope_grid.isotope(options);

            });

            /**
             * infinite scroll
             */

            if ($isotope.hasClass('infinite-scroll')) {

                // get isotope instance
                var iso = $isotope_grid.data('isotope');

                // init Infinte Scroll
                if ($isotope.hasClass('infinite-load-more')) {
                    $isotope_grid.infiniteScroll({
                        path: 'infinite-scroll-p{{#}}.html',
                        append: '.isotope .columns .column',
                        outlayer: iso,
                        status: '.page-load-status',
                        button: '.view-more-button button',
                        scrollThreshold: false,
                    });
                } else {
                    $isotope_grid.infiniteScroll({
                        path: 'infinite-scroll-p{{#}}.html',
                        append: '.isotope .columns .column',
                        outlayer: iso,
                        status: '.page-load-status',
                    });
                }

                // append items on load
                $isotope_grid.on('load.infiniteScroll', function(event, response, path) {
                    var $items = $(response).find('.isotope .columns .column');
                    // append items after images loaded
                    $items.imagesLoaded(function() {
                        $isotope_grid.append($items);
                        $isotope_grid.isotope('insert', $items);
                    });
                });

            }

            /**
             * pagination
             */

            if ($isotope.hasClass('isotope-pagination')) {

                $isotope_grid.isotope({
                    itemSelector: '.column', // recommended option
                    transitionDuration: '0.8s',
                    percentPosition: true,
                    filter: itemSelector + '[' + pageAtribute + '="' + currentPage + '"]',
                });

                setPagination();
                hidePager();
                pagerActive();

            }

            // filter items on click
            $isotope_filter.on('click', 'li', function() {

                // remove active class from all
                $isotope_filter.find('li').removeClass('active');

                // add active class
                $(this).addClass('active');

                // get filter value
                var filterValue = $(this).attr('data-filter');

                // filter items by this value
                $isotope_grid.isotope({
                    filter: filterValue
                });

                // set filter in hash
                if ($isotope.hasClass('hash-filter')) {
                    location.hash = 'filter=' + encodeURIComponent(filterValue);
                }

                // filter with pagination
                if ($isotope.hasClass('isotope-pagination')) {
                    currentFilter = filterValue;
                    setPagination();
                    goToPage(1);
                    hidePager();
                    pagerActive();
                }

                // disable animation on scroll down or top by AOS plugin
                AOS.init({
                    disable: true,
                });

            });

        } // end check $isotope

        /**
         * Pagination
         */

        function changeFilter(selector) {
            $isotope_grid.isotope({
                filter: selector
            });
        }

        function goToPage(n) {
            currentPage = n;
            var selector = itemSelector;
            selector += (currentFilter != '*') ? '[' + filterAtribute + '="' + currentFilter + '"]' : '';
            selector += '[' + pageAtribute + '="' + currentPage + '"]';
            changeFilter(selector);
        }

        function defineItemsPerPage() {
            var pages = itemsPerPageDefault;
            return pages;
        }

        function setPagination() {

            var SettingsPagesOnItems = function() {

                var itemsLength = $isotope_grid.children(itemSelector).length;

                var pages = Math.ceil(itemsLength / itemsPerPage);
                var item = 1;
                var page = 1;
                var selector = itemSelector;
                selector += (currentFilter != '*') ? '[' + filterAtribute + '="' + currentFilter + '"]' : '';

                $isotope_grid.children(selector).each(function() {
                    if (item > itemsPerPage) {
                        page++;
                        item = 1;
                    }
                    $(this).attr(pageAtribute, page);
                    item++;
                });

                currentNumberPages = page;

            }();

            var CreatePagers = function() {

                var $isotopePager = ($('.' + pagerClass).length === 0) ? $('<div class="' + pagerClass + '"></div>') : $('.' + pagerClass);

                $isotopePager.html('');

                for (var i = 0; i < currentNumberPages; i++) {
                    var $pager = $('<a href="javascript:void(0);" class="pager pagination-link" ' + pageAtribute + '="' + (i + 1) + '"></a>');
                    $pager.html(i + 1);

                    $pager.click(function() {
                        var page = $(this).eq(0).attr(pageAtribute);
                        // disable animation on scroll down or top by AOS plugin
                        AOS.init({
                            disable: true,
                        });
                        goToPage(page);
                    });

                    $pager.appendTo($isotopePager);
                }

                $isotope_grid.after($isotopePager);

            }();

        }

        function hidePager() {
            if ($(".pager").length == 1) {
                $(".isotope-pager").css("display", "none");
            } else {
                $(".isotope-pager").css("display", "block");
            }
        }

        function pagerActive() {
            $('.pager:first').addClass('is-current');
            $('.pager').click(function() {
                var dataPage = $(this).attr("data-page");
                $('.isotope-pager').find('.is-current').removeClass('is-current');
                if (currentPage == dataPage) {
                    $(this).addClass('is-current');
                }
            });
        }

        /**
         * Hash Filter
         */
        function getHashFilter() {
            var hash = location.hash;
            // get filter=filterName
            var matches = location.hash.match(/filter=([^&]+)/i);
            var hashFilter = matches && matches[1];
            return hashFilter && decodeURIComponent(hashFilter);
        }

        var isIsotopeInit = false;

        function onHashchange() {
            var hashFilter = getHashFilter();
            if (!hashFilter && isIsotopeInit) {
                return;
            }
            isIsotopeInit = true;

            // filter isotope
            $isotope_grid.isotope({
                filter: hashFilter
            });

            // set selected class on button
            if (hashFilter) {
                $isotope_filter.find('.active').removeClass('active');
                $isotope_filter.find('[data-filter="' + hashFilter + '"]').addClass('active');
            }

            // disable animation on scroll down or top by AOS plugin
            AOS.init({
                disable: true,
            });

        }

        if ($isotope.hasClass('hash-filter')) {

            $(window).on('hashchange', onHashchange);
            // trigger event handler to init Isotope
            onHashchange();

        }

    });

})(jQuery, window, document);