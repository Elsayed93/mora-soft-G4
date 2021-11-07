/**
 * Ratings Scripts.
 * Using jquery-bar-rating jQuery Plugin.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        $('#barrating-1to10').barrating('show', {
            theme: 'bars-1to10'
        });

        $('#barrating-movie').barrating('show', {
            theme: 'bars-movie'
        });

        $('#barrating-movie').barrating('set', 'Mediocre');

        $('#barrating-square').barrating('show', {
            theme: 'bars-square',
            showValues: true,
            showSelectedRating: false
        });

        $('#barrating-pill').barrating('show', {
            theme: 'bars-pill',
            initialRating: 'A',
            showValues: true,
            showSelectedRating: false,
            allowEmpty: true,
            emptyValue: '-- no rating selected --',
            onSelect: function(value, text) {
                alert('Selected rating: ' + value);
            }
        });

        $('#barrating-reversed').barrating('show', {
            theme: 'bars-reversed',
            showSelectedRating: true,
            reverse: true
        });

        $('#barrating-horizontal').barrating('show', {
            theme: 'bars-horizontal',
            reverse: true,
            hoverState: false
        });

        $('#barrating-fontawesome').barrating({
            theme: 'fontawesome-stars',
            showSelectedRating: false
        });

        $('#barrating-css').barrating({
            theme: 'css-stars',
            showSelectedRating: false
        });

        var currentRating = $('#barrating-fontawesome-o').data('current-rating');

        $('.stars-fontawesome-o .current-rating')
            .find('span')
            .html(currentRating);

        $('.stars-fontawesome-o .clear-rating').on('click', function(event) {
            event.preventDefault();

            $('#barrating-fontawesome-o')
                .barrating('clear');
        });

        $('#barrating-fontawesome-o').barrating({
            theme: 'fontawesome-stars-o',
            showSelectedRating: false,
            initialRating: currentRating,
            onSelect: function(value, text) {
                if (!value) {
                    $('#barrating-fontawesome-o')
                        .barrating('clear');
                } else {
                    $('.stars-fontawesome-o .current-rating')
                        .addClass('hidden');

                    $('.stars-fontawesome-o .your-rating')
                        .removeClass('hidden')
                        .find('span')
                        .html(value);
                }
            },
            onClear: function(value, text) {
                $('.stars-fontawesome-o')
                    .find('.current-rating')
                    .removeClass('hidden')
                    .end()
                    .find('.your-rating')
                    .addClass('hidden');
            }
        });

    });

})(jQuery, window, document);