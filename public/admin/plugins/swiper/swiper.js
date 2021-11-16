/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


** Custom Swiper JS

----------------------------------------------*/

$(function() {
    'use strict';

    var swiper_d = new Swiper('.swiper-default');

    var swiper_pg = new Swiper('.swiper-paginate', {
        pagination: {
            el: '.s-pagination2',
            type: 'fraction',
        },
        navigation: {
            nextEl: '.next1',
            prevEl: '.prev1',
        },
    });

    var swiper_pr = new Swiper('.swiper-progress', {
        pagination: {
          el: '.swiper-pagination',
          type: 'progressbar',
        }
    });

    var swiper_ms = new Swiper('.swiper-multi-slide', {
        spaceBetween: 30,
        pagination: {
          el: '.s-pagination3',
          type: 'fraction'
        },
        navigation: {
            nextEl: '.next3',
            prevEl: '.prev3',
        },
        breakpoints: {
          500: {
            slidesPerView: 2
          },
          1200: {
            slidesPerView: 3
          }
        }
    });

    var swiper_mr = new Swiper('.swiper-multi-row', {
        slidesPerColumn: 2,
        spaceBetween: 30,
        pagination: {
          el: '.s-pagination4',
          clickable: true,
          type: 'fraction'
        },
        navigation: {
            nextEl: '.next4',
            prevEl: '.prev4',
        },
        breakpoints: {
          500: {
            slidesPerView: 2
          },
          900: {
            slidesPerView: 3
          },
          1200: {
            slidesPerView: 4
          }
        }
    });

    var swiper_cs = new Swiper('.swiper-centered-slide', {
        spaceBetween: 30,
        navigation: {
            nextEl: '.next5',
            prevEl: '.prev5',
        },
        breakpoints: {
          480: {
            slidesPerView: 2
          },
          768: {
            slidesPerView: 3
          },
          1200: {
            slidesPerView: 4
          },
          1500: {
            slidesPerView: 5
          }
        }
    });

    var swiper_fe = new Swiper('.swiper-fade-effect', {
        effect: 'fade',
        pagination: {
            el: '.s-pagination6',
            type: 'fraction',
        },
        navigation: {
            nextEl: '.next6',
            prevEl: '.prev6',
        },
    });

    var swiper_au = new Swiper('.swiper-autoplay', {
        spaceBetween: 30,
        centeredSlides: true,
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.s-pagination7',
            type: 'fraction',
        },
        navigation: {
            nextEl: '.next7',
            prevEl: '.prev7',
        },
    });


    var galleryThumbs = new Swiper('.gallery-thumbs', {
        spaceBetween: 10,
        slidesPerView: 6,
        freeMode: true,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
    });

    var galleryTop = new Swiper('.gallery-top', {
        spaceBetween: 10,
        effect: 'fade',
        pagination: {
            el: '.s-pagination8',
            type: 'fraction',
        },
        navigation: {
          nextEl: '.next8',
          prevEl: '.prev8',
        },
        thumbs: {
          swiper: galleryThumbs
        }
    });
});