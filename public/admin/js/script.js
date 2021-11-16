/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


[Table of Content]

    01: Main Sidebar
    02: Background Image
    03: Collapse
    04: Header Search Box
    05: Changing svg
    06: Checkboxes Selected
    07: To Do List Parent border bottom
    08: Perfect Scrollbar
    09: Progress Bar
    10: Process Bar
    11: Date Time
    12: Email Cc & Bcc
    13: Chat Search Box
    14: Contact List Table Row & Contact box remove & Edit
    15: Contact PopUp Add Avatar
    16: Project Box Background Change
    17: Copy Shareable Link
    18: Share comment box
    19: File Maneger Dropdown Options
    20: Textarea Word Count
    21: Radio Validation
    22: File Upload
    23: Table Contextual Background
    24: Session Timeout Circular Countdown
    25: Drag & Drop
    26: Add Workplace
    27: About Info Edit, Delete & Update Workplace
    28: About skill edit

----------------------------------------------*/


$(function () {
    "use strict";

    /*===================
    01: Main Sidebar
    =====================*/
    /* Parent li add class */
    var body = $("body");
    $('.sidebar .sidebar-body').find('ul li').parents('.sidebar-body ul li').addClass('has-sub-item');


    /* Submenu Opened */
    $('.sidebar .sidebar-body').find(".has-sub-item > a").on("click", function(event){
        event.preventDefault();
        if(!body.hasClass("sidebar-folded") || body.hasClass("open-sidebar-folded")) {
            $(this).parent(".has-sub-item").toggleClass("sub-menu-opened");
            if ($(this).siblings('ul').hasClass('open')) {
                $(this).siblings('ul').removeClass('open').slideUp('200');
            } else {
                $(this).siblings('ul').addClass('open').slideDown('200');
            }
        }
    });

    /* If has class sub-menu-opened */
    function preloadFunc() {
        if( $('.sidebar .sidebar-body').find(".has-sub-item").hasClass("sub-menu-opened")) {
            $('.sidebar .sidebar-body').find(".sub-menu-opened a").siblings("ul").addClass('open').show();    
        }
    }
    window.onpaint = preloadFunc();


    /* Open Sidebar */
    $(".header .header-toogle-menu, .offcanvas-overlay").on("click", function() {
        body.toggleClass("sidebar-open");
        $(".offcanvas-overlay").toggleClass("active");
        //body.find(".sidebar-body .has-sub-item a").siblings('ul').removeClass('open').slideUp('fast');
    });
    

    /* Holded Sidebar on Mouseenter */
    $(window).resize(function() {
        sidebar();
    });

    /* Sidebar function */
    function sidebar() {
        if ($(window).width() > 1023) {
            /* Remove siderbar-open */
            if(body.is('.sidebar-open')) {
                body.removeClass('sidebar-open');
            }

            /* Holded Sidebar on Mouseenter */
            $(".sidebar .sidebar-body").on("mouseenter", function() {
                body.addClass("open-sidebar-folded");
            });

            /* Holded Sidebar on Mouseleave */
            $(".sidebar .sidebar-body").on("mouseleave", function() {
                body.removeClass("open-sidebar-folded");
                if(body.hasClass("sidebar-folded")) {
                    $(".sidebar").find(".sidebar-body .has-sub-item a").siblings('ul').removeClass('open').slideUp(0);
                }
            });

            /* Holded Sidebar */
            $(".sidebar .sidebar-toogle-pin").on("click", function() {
                body.toggleClass("sidebar-folded");
                body.find(".sidebar-body .has-sub-item a").siblings('ul').removeClass('open').slideUp('fast');
            });
        } else {
            /* Remove sidebar-folded & open-sidebar-folded */
            if(body.is('.sidebar-folded, .open-sidebar-folded')) {
                body.removeClass('sidebar-folded open-sidebar-folded');
            }
        }
    }
    sidebar();



    /*========================
    02: Background Image
    ==========================*/
    var $bgImg = $('[data-bg-img]');
    $bgImg.css('background-image', function () {
        return 'url("' + $(this).data('bg-img') + '")';
    }).removeAttr('data-bg-img').addClass('bg-img');

    /*==================================
    03: Collapse
    ====================================*/
    function collapse() {
        $(document.body).on('click', '[data-toggle="collapse"]', function (e) {
            var target = '#' + $(this).data('target');

            $(this).toggleClass('collapsed');
            $(target).slideToggle();
            
            e.preventDefault();
        });
    }
    collapse();

    /*==================================
    04: Header Search Box
    ====================================*/
    $(document).on('click', '.theme-input-group.header-search', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('active');
    });
    $(document).on('click', 'body', function(e) {
        $('.theme-input-group.header-search.active').removeClass('active');
    });

    /*==================================
    05: Changing svg 
    ====================================*/
    jQuery('img.svg').each(function () {
        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        jQuery.get(imgURL, function (data) {
            // Get the SVG tag, ignore the rest
            var $svg = jQuery(data).find('svg');

            // Add replaced image's ID to the new SVG
            if (typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
            if (typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass + ' replaced-svg');
            }

            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            // Check if the viewport is set, else we gonna set it if we can.
            if (!$svg.attr('viewBox') && $svg.attr('height') && $svg.attr('width')) {
                $svg.attr('viewBox', '0 0 ' + $svg.attr('height') + ' ' + $svg.attr('width'));
            }

            // Replace image with new SVG
            $img.replaceWith($svg);

        }, 'xml');
    });

    /*============================================
    06: Checkboxes Selected
    ==============================================*/
    /* Mail Inbox Checkbox */
    let mailListCheckbox = $('.mail-list').find('.mail-list-item input[type=checkbox]');
    if( mailListCheckbox.length ) {
        mailListCheckbox.on('click', function() {
            if($(this).prop("checked") == true){
                $(this).parents().eq(3).addClass("selected");
            } else {
                $(this).parents().eq(3).removeClass("selected")
            }
        });
    }

    // Mail, project & File All Select & UnSelect
    if( $('.mail-header, .project-header, .file-header').find('.custom-checkbox input[type=checkbox]').length ) {
        $('.mail-header, .project-header, .file-header').find('.custom-checkbox input[type=checkbox]').on('click', function() {
            if($(this).prop("checked") == true){
                $('.mail-list').find('.mail-list-item').addClass("selected");
                $('.project-box, .file').find('.custom-checkbox input[type=checkbox]').prop("checked", true);
                mailListCheckbox.prop("checked", true);
            } else {
                $('.mail-list').find('.mail-list-item').removeClass("selected");
                $('.project-box, .file').find('.custom-checkbox input[type=checkbox]').prop("checked", false);
                mailListCheckbox.prop("checked", false);
            }
        });
    }
    
    /* Todo list & Invoice Check box */
    if( $( '.custom-checkbox input[type="checkbox"]' ).length ) {

        $('.custom-checkbox').parents('.checkbox-wrap').siblings('.valid-feedback, .invalid-feedback').show();

        $('.custom-checkbox input[type="checkbox"]').on('click', function(e) {
            e.stopPropagation();

            if($(this).prop("checked") == true){
                $(this).parent(".custom-checkbox").siblings(".todo-text").addClass("line-through");
                $(this).parents().filter('tbody tr').addClass("selected");
                $(this).parents('.checkbox-wrap').siblings('.valid-feedback').show();
                $(this).parents('.checkbox-wrap').siblings('.invalid-feedback').hide();
            } else if($(this).prop("checked") == false) {
                $(this).parent(".custom-checkbox").siblings(".todo-text").removeClass("line-through");
                $(this).parents().filter('tbody tr').removeClass("selected");
                $(this).parents('.checkbox-wrap').siblings('.valid-feedback').hide();
                $(this).parents('.checkbox-wrap').siblings('.invalid-feedback').show();
            }
        });
    }

    //Invoice All Select & UnSelect
    let invoiceTbodyCheckbox = $('.invoice-list-table thead, .invoice-list thead, .contact-list-table thead').find('.custom-checkbox input[type=checkbox]');
    if( invoiceTbodyCheckbox.length ) {
        invoiceTbodyCheckbox.on('click', function() {
            if( $( this ).prop( "checked" ) == true ) {
                $(this).parents().filter('thead').siblings('tbody').find('.custom-checkbox input[type="checkbox"]').prop('checked', true);
                $(this).parents().filter('thead').siblings('tbody').find('tr').addClass('selected');
            } else {
                $(this).parents().filter('thead').siblings('tbody').find('.custom-checkbox input[type="checkbox"]').prop('checked', false);
                $(this).parents().filter('thead').siblings('tbody').find('tr').removeClass('selected');
            }
        });
    }

    /* Project Manager & File Manager Check box */
    let customCheckboxes = $('.project-header, .project-box, .file-header, .file').find('.custom-checkbox');
    if(customCheckboxes.length) {
        customCheckboxes.hide();
        
        customCheckboxes.find('input[type="checkbox"]').change(function(){
            if (customCheckboxes.find('input[type="checkbox"]:checked').length == 0) {
                customCheckboxes.hide();
            } 
        });

        $('.project-box, .file').find('.dropdown-button .select').on('click', function(e) {
            e.preventDefault();
            $('.project-header, .project-box, .file-header, .file').find('.custom-checkbox').show();
            $(this).parents().filter( '.project-box, .file' ).find( '.custom-checkbox input[type="checkbox"]' ).prop('checked', true);
        });

        $('.project-box, .file').find('.dropdown-button .delete').on('click', function(e) {
            e.preventDefault();
            $(this).parents().filter( '[class*="col-"]' ).remove();
        });
    }

    /* Project Manager Copy popup */
    $('.checklist-item .item').on('click', function(e) {
        if($(this).siblings('.custom-checkbox').children('input[type=checkbox]').prop("checked") == false) {
            $(this).siblings('.custom-checkbox').children('input[type=checkbox]').prop('checked', true);
        } else {
            $(this).siblings('.custom-checkbox').children('input[type=checkbox]').prop('checked', false);
        }
    });

    //Projects Share Popup dropdown menu
    $('.dropdown-menu.checkbox > div').on('click', function(e) {
        $(this).siblings('.item-list').children('.custom-checkbox').children('input[type=checkbox]').prop('checked', false);
    })
    
    /*============================================
    07: To Do List Parent border bottom
    ==============================================*/
    let singleRow = $(".single-row");
    if(singleRow.length) {
        singleRow.on("mouseenter", function() {
            $(this).prev(".single-row").addClass("change-border-color");
        });
        singleRow.on("mouseleave", function() {
            $(this).prev(".single-row").removeClass("change-border-color");
        });
    }

    /*============================================
    08: Perfect Scrollbar
    ==============================================*/
    var $scrollBar = $('[data-trigger="scrollbar"]');

    if($scrollBar.length) {
        $scrollBar.each(function () {
            var $ps, $pos;

            $ps = new PerfectScrollbar(this);

            $pos = localStorage.getItem( 'ps.' + this.classList[0] );

            if ( $pos !== null ) {
                $ps.element.scrollTop = $pos;
            }
        });

        $scrollBar.on('ps-scroll-y', function () {
            localStorage.setItem( 'ps.' + this.classList[0], this.scrollTop );
        });
    }

    /*============================================
    09: Progress Bar
    ==============================================*/
    $.fn.bekeyProgressbar = function(options){

        options = $.extend({
            animate     : true,
            animateText : true
        }, options);

        var $this = $(this);
        
        var $progressBar = $this;
        var $progressCount = $progressBar.find('.ProgressBar-percentage--count');
        var $circle = $progressBar.find('.ProgressBar-circle');
        var percentageProgress = $progressBar.attr('data-progress');
        var percentageRemaining = (100 - percentageProgress);
        var percentageText = $progressCount.parent().attr('data-progress');
        
        //Calculate circonférence circle
        var radius = $circle.attr('r');
        var diameter = radius * 2;
        var circumference = Math.round(Math.PI * diameter);

        //Calcule percentage
        var percentage =  circumference * percentageRemaining / 100;

        $circle.css({
            'stroke-dasharray' : circumference,
            'stroke-dashoffset' : percentage,
        });
        
        //Animation progress
        if(options.animate === true){
            $circle.css({
            'stroke-dashoffset' : circumference
            }).animate({
            'stroke-dashoffset' : percentage
            }, 2000 );
        }
        
        //Animation2 text (percentage)
        if(options.animateText == true){
    
            $({ Counter: 0 }).animate(
            { Counter: percentageText },
            { duration: 2000,
                step: function () {
                    $progressCount.html( Math.ceil(this.Counter) + '<span>%</span>');
                }
            });

        } else {
            $progressCount.html( percentageText + '<span>k</span>');
        }
        
    };
    $('.ProgressBar_1').bekeyProgressbar();
    $('.ProgressBar_2').bekeyProgressbar();
    $('.ProgressBar_3').bekeyProgressbar();
    $('.ProgressBar_4').bekeyProgressbar();
    $('.ProgressBar_5').bekeyProgressbar({ animateText : false });
    $('.ProgressBar_6').bekeyProgressbar();
    $('.ProgressBar_7').bekeyProgressbar();
    $('.ProgressBar_8').bekeyProgressbar();
    $('.ProgressBar_9').bekeyProgressbar();
    $('.ProgressBar_10').bekeyProgressbar();
    $('.ProgressBar_11').bekeyProgressbar();
    $('.ProgressBar_12').bekeyProgressbar();
    $('.ProgressBar_13').bekeyProgressbar();
    $('.ProgressBar_14').bekeyProgressbar();
    $('.ProgressBar_15').bekeyProgressbar();
    $('.ProgressBar_16').bekeyProgressbar();
    $('.ProgressBar_17').bekeyProgressbar();
    $('.ProgressBar_18').bekeyProgressbar();
    $('.ProgressBar_19').bekeyProgressbar();
    $('.ProgressBar_20').bekeyProgressbar();
    $('.ProgressBar_21').bekeyProgressbar();
    $('.ProgressBar_22').bekeyProgressbar();
    $('.ProgressBar_23').bekeyProgressbar();

    /*============================================
    10: Process Bar
    ==============================================*/
    var processBarWrapper = $('.process-bar-wrapper');
    if (processBarWrapper.length) {
        function processControl() {
            processBarWrapper.each(function () {
                var processBarOffset = $(this).offset().top - $(window).height(),
                    processTime = '2.25s', 
                    processBarWidth = $(this).children('[data-process-width]').data('process-width');
                
                if ($(window).scrollTop() > processBarOffset) {
                    if (processBarWidth > 100) {
                        $(this).children('.process-bar').css({
                            'width': '100%',
                            'transition': processTime
                        });
                    } else {
                        $(this).children('.process-bar').css({
                            'width': processBarWidth + '%',
                            'transition': processTime
                        });
                    }
                }
            })
        }
        
        processControl();
        
        $(window).on('scroll', function () {
            processControl();
        });
    }

    /*============================================
    11: Date Time
    ==============================================*/
    $(document).ready(function() {
        // Create two variable with the names of the months and days in an array
        var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]; 
        var dayNames= ["Sun,","Mon,","Tue,","Wed,","Thu,","Fri,","Sat,"];
        
        // Create a newDate() object
        var newDate = new Date();
        // Extract the current date from Date object
        newDate.setDate(newDate.getDate());
        // Output the day, date, month and year    
        $('#date').html(dayNames[newDate.getDay()] + " " + newDate.getDate() + ' ' + monthNames[newDate.getMonth()] + ' ' + newDate.getFullYear());

        //Output the date & month for Project Management Add new Card.
        $('.add-card').find('.date-text').html(newDate.getDate() + ' ' + monthNames[newDate.getMonth()]);
            
        setInterval( function() {
            // Create a newDate() object and extract the minutes of the current time on the visitor's
            var minutes = new Date().getMinutes();
            // Add a leading zero to the minutes value
            $("#min").html(( minutes < 10 ? "0" : "" ) + minutes);
        },1000);
            
        setInterval( function() {
            // Create a newDate() object and extract the hours of the current time on the visitor's
            var hours = new Date().getHours();
            // Add a leading zero to the hours value
            $("#hours").html(( hours < 10 ? "0" : "" ) + hours);
        }, 1000);
            
    });

    /*============================================
    12: Email Cc & Bcc
    ==============================================*/
    if($(".cc-bcc .form-group").length) {
        $(".cc-bcc .form-group").hide();
        $(".cc.cc-btn").on('click', function() {
            $(".cc-bcc .cc-form-group").slideDown(200);
        });
        $(".bcc.cc-btn").on('click', function() {
            $(".cc-bcc .bcc-form-group").slideDown(200);
        });

        $(".form-group .close-btn").on('click', function() {
            $(this).parent(".form-group").slideUp(200);
        });
    }

    /*============================================
    13: Chat Search box
    ==============================================*/
    if($('#search-box').length) {
        $('#search-box').hide();
        $('#search-tab').on('click', function() {
            $('#search-box').slideDown(150);
        });
        
        $('.search-box-close').on('click', function(e) {
            e.stopPropagation();
            $('#search-box').slideUp(150);
        });
    }

    /*============================================
    14: Contact List Table Row & Contact box remove & Edit
    ==============================================*/
    $('.contact-list-table .actions').find('.contact-close').on('click', function() {
        $(this).parents().filter('tr').remove();
    });

    $('.contact-box').find('.contact-close').on('click', function(e) {
        e.preventDefault();
        $(this).parents().filter('[class*="col-"]').remove();
    });


    /*============================================
    15: Contact PopUp Add Avatar
    ==============================================*/
    $("#fileUpload, #fileUpload2").on('change', function() {
        if (this.files && this.files[0]) {
            let reader = new FileReader();

            reader.onload = function (e) {
                $('.profile-avatar').attr('src', e.target.result);
            }
    
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Board Members list toggle class
    $( '.board-members-list' ).find('.member-item').on('click', function(e) {
        $(this).toggleClass('active');
    });

    /*============================================
    16: Project Box Background Change
    ==============================================*/
    var allSpans = $('.color-balls span');
    if( allSpans.length ) {
        allSpans.on('click', function() {
            var colorCode = $(this).css('backgroundColor');
            
            $(this).parents().filter('.project-box').css('backgroundColor', colorCode);
        });
    }

    /*============================================
    17: Copy Shareable link
    ==============================================*/
    $('#copy-link-btn').on('click', function(e) {
        e.preventDefault();
        var copyText = $("#get-link");
        copyText.select();
        //copyText.setSelectionRange(0, 99999);
        document.execCommand("copy");
    });

    /*============================================
    18: Share comment box
    ==============================================*/
    $('#projectShareModal, #shareModal').find('.share-actions .link-btn').on('click', function(e) {
        e.preventDefault();
        $(this).toggleClass('soft-pink');
        $(this).children('span').text() == 'Add' ? $(this).children('span').text('Remove') : $(this).children('span').text('Add');
        $(this).parent().siblings('.comment').slideToggle();
    });

    $('#share-dropdown').on('click', function(e) {
        e.stopPropagation();
        $(this).siblings('.dropdown-menu').toggleClass('show').css('top', '60px');
    });

    /*============================================
    19: File Manager Dropdown Options
    ==============================================*/
    $('.file').find('.dropdown-button .share').on('click', function() {
        $('#shareModal').modal('toggle');
    })

    $('.file').find('.dropdown-button .details').on('click', function() {
        $('#fileDetails').modal('toggle');
    });

    $('.file').find('.dropdown-button .detete').on('click', function() {
        $(this).parents('.file').parent('[class^="col-"]').remove();
    });
    
    /*============================================
    20: Textarea Word Count
    ==============================================*/
    $("#word_count").on('keydown', function(e) {
        var words = $.trim(this.value).length ? this.value.match(/\S+/g).length : 0;
        if (words <= 200) {
            $('#display_count').text(words);
            $('#word_left').text(200-words)
        }else{
            if (e.which !== 8) e.preventDefault();
        }
    });

    /*============================================
    21: Radio Validation
    ==============================================*/
    if( $( '.custom-radio input[type="radio"]' ).length ) {

        $('.custom-radio').parents('.radio-wrap').siblings('.valid-feedback, .invalid-feedback').show();

        $('.custom-radio input[type="radio"]').on('click', function(e) {
            e.stopPropagation();

            if($(this).prop("checked") == true){
                $(this).parents('.radio-wrap').siblings('.valid-feedback').show();
                $(this).parents('.radio-wrap').siblings('.invalid-feedback').hide();
            } else if($(this).prop("checked") == false) {
                $(this).parents('.radio-wrap').siblings('.valid-feedback').hide();
                $(this).parents('.radio-wrap').siblings('.invalid-feedback').show();
            }
        });
    }

    /*============================================
    22: File Upload
    ==============================================*/
    $( '.file-input' ).on('change', function() {
        var filename = $(this).val().split('\\').pop();
        $(this).parents('.attach-file').siblings('.file_upload, .file_upload2, .file_upload3').text(filename);
    })

    /*============================================
    23: Table Contextual Background
    ==============================================*/
    $('.table-contextual').find('tr').css('background-color', function() {
        return $(this).data('bg-color')
    });

    /*============================================
    24: Session Timeout Circular Countdown
    ==============================================*/
    if( $('#modalSessionTimeout').length ) {
        window.onload = function() {
            setTimeout(function() {

                const FULL_DASH_ARRAY = 283;
                const WARNING_THRESHOLD = 10;
                const ALERT_THRESHOLD = 5;

                const COLOR_CODES = {
                    info: {
                        color: "c2"
                    },
                    warning: {
                        color: "warn",
                        threshold: WARNING_THRESHOLD
                    },
                    alert: {
                        color: "danger",
                        threshold: ALERT_THRESHOLD
                    }
                };

                const TIME_LIMIT = 20;
                let timePassed = 0;
                let timeLeft = TIME_LIMIT;
                let timerInterval = null;
                let remainingPathColor = COLOR_CODES.info.color;

                document.getElementById("circular").innerHTML = `
                <div class="base-timer">
                    <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <g class="base-timer__circle">
                        <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
                        <path
                            id="base-timer-path-remaining"
                            stroke-dasharray="283"
                            class="base-timer__path-remaining ${remainingPathColor}"
                            d="
                            M 50, 50
                            m -45, 0
                            a 45,45 0 1,0 90,0
                            a 45,45 0 1,0 -90,0
                            "
                        ></path>
                        </g>
                    </svg>
                    <span id="base-timer-label" class="base-timer__label">${ timeLeft }</span>
                    <span class="base-timer__text">Seconds</span>
                </div>
                `;

                startTimer();

                function onTimesUp() {
                    clearInterval(timerInterval);
                }

                function startTimer() {
                    timerInterval = setInterval(() => {
                        timePassed = timePassed += 1;
                        timeLeft = TIME_LIMIT - timePassed;
                        document.getElementById("base-timer-label").innerHTML = timeLeft ;
                        document.querySelector('.redirecting_in').innerHTML = timeLeft;
                        setCircleDasharray();
                        setRemainingPathColor(timeLeft);

                        if (timeLeft === 0) {
                            onTimesUp();
                        }
                    }, 1000);
                }

                function setRemainingPathColor(timeLeft) {
                    const { alert, warning, info } = COLOR_CODES;
                    if (timeLeft <= alert.threshold) {
                        document.getElementById("base-timer-path-remaining").classList.remove(warning.color);
                        document.getElementById("base-timer-path-remaining").classList.add(alert.color);
                    } else if (timeLeft <= warning.threshold) {
                        document.getElementById("base-timer-path-remaining").classList.remove(info.color);
                        document.getElementById("base-timer-path-remaining").classList.add(warning.color);
                    }
                }

                function calculateTimeFraction() {
                    const rawTimeFraction = timeLeft / TIME_LIMIT;
                    return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
                }

                function setCircleDasharray() {
                    const circleDasharray = `${( calculateTimeFraction() * FULL_DASH_ARRAY ).toFixed(0)} 283`;
                    document.getElementById("base-timer-path-remaining").setAttribute("stroke-dasharray", circleDasharray);
                }

                $('#modalSessionTimeout').modal('show');
            }, 2000)
        }
    }

    /*============================================
    25: Drag & Drop
    ==============================================*/
    //Dragable Card
    if($( "#sortable-row" ).length) {
        function dragDrop() {
            $( document ).find( "#sortable-row" ).sortable({
                connectWith: "#sortable-row"
            }).disableSelection();
        }
        dragDrop();
    }

    //Dragable Product List
    if($( "#dragable-product-list" ).length) {
        function dragDrop2() {
            $( document ).find( "#dragable-product-list" ).sortable({
                connectWith: "#dragable-product-list"
            }).disableSelection();
        }
        dragDrop2();
    }

    //Dragable Team
    if($( ".dragable-team" ).length) {
        function dragDrop3() {
            $( document ).find( ".dragable-team" ).sortable({
                connectWith: ".dragable-team"
            }).disableSelection();
        }
        dragDrop3();
    }

    //Clone List
    if($( ".dragable-list" ).length) {
        $('.dragable-btn').each(function () {
            var clone, before,parent;
            $(this).sortable({
                connectWith: $('.dragable-btn').not(this),
                helper: "clone",
                start: function (event, ui) {
                    $(ui.item).show();
                    clone = $(ui.item).clone();
                    before = $(ui.item).prev();
                    parent = $(ui.item).parent();
                },
                stop: function (event, ui) {
                    if (before.length)
                        before.after(clone);
                    else
                        parent.prepend(clone);
                }
            }).disableSelection();
        });
    }

    //Dragable List
    if($( ".dragable-list" ).length) {
        function dragDrop4() {
            $( document ).find( ".dragable-list" ).sortable({
                connectWith: ".dragable-list",
                handle: "svg"
            }).disableSelection();
        }
        dragDrop4();
    }

    /*============================================
    26: Add Workplace
    ==============================================*/
    $('.add-work-form').hide()
    $('.add-workplace').on('click', function() {
        $('.add-work-form').show();
        $(this).hide()
    });

    $('.add-work-form .work-form-close').on('click', function() {
        $('.add-work-form').hide();
        $('.add-workplace').show()
    });

    /*============================================
    27: About Info Edit, Delete & Update Workplace
    ==============================================*/
    $('.work-update-form').hide();
    $('.p_work-list, .p_education-list').find('.edit').on('click', function(e) {
        e.preventDefault();
        getExistingData($(this));

        $(this).parents('.work-content').hide().siblings('.work-update-form').show()
    });

    $('.p_work-list').find('.delete').on('click', function(e) {
        $('#deleteConfirmModal').modal('toggle')
    });

    $('.p_education-list').find('.delete').on('click', function(e) {
        $('#deleteConfirmEducationModal').modal('toggle')
    });

    $('.work-update-form').find('.work-form-close').on('click', function() {
        $(this).parents('.work-update-form').hide().siblings('.work-content').show()
    });

    function getExistingData(current) {
        var name = current.parents('.work-content').find('.company-name').text(),
        position = current.parents('.work-content').find('.position').text(),
        city = current.parents('.work-content').find('.city').text(),
        day = current.parents('.work-content').find('.day').text(),
        month = current.parents('.work-content').find('.month').text(),
        year = current.parents('.work-content').find('.year').text(),
        desc = current.parents('.work-content').find('.desc').text();
        
        name ? current.parents('.work-content').siblings('.work-update-form').find('[name="company"]').val(name) : null;
        position ? current.parents('.work-content').siblings('.work-update-form').find('[name="position"]').val(position) : null;
        city ? current.parents('.work-content').siblings('.work-update-form').find('[name="city"]').val(city) : null;
        day ? current.parents('.work-content').siblings('.work-update-form').find('[name="day"]').val(day) : null;
        month ? current.parents('.work-content').siblings('.work-update-form').find('[name="month"]').val(month) : null;
        year ? current.parents('.work-content').siblings('.work-update-form').find('[name="year"]').val(year) : null;
        desc ? current.parents('.work-content').siblings('.work-update-form').find('[name="description"]').val(desc) : null;
    }

    /*============================================
    28: About skill edit
    ==============================================*/
    $('.edit-skill').find('.form-control').on('keyup', function() {

        var parsent = $(this).val().replace('%', '');

        if(parsent === '') {
            $(this).siblings('.process-bar-wrapper').find('.process-bar').width('0%');
        } else {
            $(this).siblings('.process-bar-wrapper').find('.process-bar').width($(this).val());
        }
    });

}(jQuery));