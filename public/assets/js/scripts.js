/**
 * Owl Carousel JSON load plugin
 * @author Mahbub Alam <makjoybd@gmail.com>
 * @since 2.0.0
 */

; (function ($, window, document, undefined) {

    "use strict";

    var Instance;

    var o = {};

    var namespace = "scrollbar";
    var handleClass = "owl-scroll-handle";
    var progressBarClass = "owl-scroll-progress";
    var scrollbarClass = "owl-scrollbar";
    var draggingClass = "owl-scroll-handle-dragging";
    var draggedClass = "owl-scroll-handle-dragged";

    var $handle = $("<div>").addClass(handleClass);
    var $progressBar = $("<div>").addClass(progressBarClass);
    var $scrollbar = $("<div>").addClass(scrollbarClass).append($handle);

    var sbStyles = new StyleRestorer($scrollbar[0]);
    var handleStyles = new StyleRestorer($handle[0]);
    var progressStyles = new StyleRestorer($progressBar[0]);

    var sbSize = 0;
    var progressSize = 0;

    var dragInitEvents = 'touchstart.' + namespace + ' mousedown.' + namespace;
    var dragMouseEvents = 'mousemove.' + namespace + ' mouseup.' + namespace;
    var dragTouchEvents = 'touchmove.' + namespace + ' touchend.' + namespace;
    var clickEvent = 'click.' + namespace;

    var interactiveElements = ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA'];

    // Save styles
    var holderProps = ['overflow', 'position'];
    var movableProps = ['position', 'webkitTransform', 'msTransform', 'transform', 'left', 'top', 'width', 'height'];

    var count = 0;
    var visible = 0;
    var ratio = 1;
    var animationSpeed = 0;

    var dragging = {
        released: 1,
        init: 0
    };

    var transform, gpuAcceleration;

    var hPos = {
        start: 0,
        end: 0,
        cur: 0,
        index: 0
    };

    // Math shorthands
    var abs = Math.abs;
    var sqrt = Math.sqrt;
    var pow = Math.pow;
    var round = Math.round;
    var max = Math.max;
    var min = Math.min;

    // Feature detects
    (function () {
        var prefixes = ['', 'Webkit', 'Moz', 'ms', 'O'];
        var el = document.createElement('div');

        function testProp(prop) {
            for (var p = 0, pl = prefixes.length; p < pl; p++) {
                var prefixedProp = prefixes[p] ? prefixes[p] + prop.charAt(0).toUpperCase() + prop.slice(1) : prop;
                if (el.style[prefixedProp] !== null) {
                    return prefixedProp;
                }
            }
        }

        // Global support indicators
        transform = testProp('transform');
        gpuAcceleration = testProp('perspective') ? 'translateZ(0) ' : '';
    }());

    var Scrollbar = function (carousel) {

        this.initialized = false;

        this._core = carousel;

        this.options = {};

        this._handlers = {
            'initialized.owl.carousel refreshed.owl.carousel resized.owl.carousel': $.proxy(function (e) {
                if (e.namespace && this._core.settings.scrollbarType) {
                    initialize.call(this, e);
                }
            }, this),
            "translate.owl.carousel": $.proxy(function (e) {
                if (e.namespace && this._core.settings.scrollbarType) {
                    sync.call(this, e);
                }
            }, this),
            "drag.owl.carousel": $.proxy(function (e) {
                if (e.namespace && this._core.settings.scrollbarType) {
                    dragging.init = 1;
                    sync.call(this, e);
                }
            }, this),
            "dragged.owl.carousel": $.proxy(function (e) {
                if (e.namespace && this._core.settings.scrollbarType) {
                    dragging.init = 0;
                }
            }, this)
        };

        Instance = this._core = carousel;
        this.options = $.extend(Scrollbar.Defaults, this._core.options);
        this._core.$element.on(this._handlers);

        o = this.options;

    };

    Scrollbar.Defaults = {
        scrollbarType: 'scroll',
        scrollDragThreshold: 3,
        scrollbarHandleSize: 10
    };


    function dragInit(event) {
        var isTouch = event.type === 'touchstart';
        var source = event.data.source;

        if (dragging.init || !isTouch && isInteractive(event.target)) {
            return;
        }

        if (!isTouch) {
            stopDefault(event);
        }

        unsetTransitionAnimation();

        dragging.released = 0;
        dragging.init = 0;
        dragging.$source = $(event.target);
        dragging.touch = isTouch;
        dragging.pointer = isTouch ? event.originalEvent.touches[0] : event;
        dragging.initX = dragging.pointer.pageX;
        dragging.initY = dragging.pointer.pageY;
        dragging.path = 0;
        dragging.delta = 0;
        dragging.locked = 0;
        dragging.pathToLock = 0;

        $(document).on(isTouch ? dragTouchEvents : dragMouseEvents, dragHandler);

        $handle.addClass(draggedClass);

    }

    /**
     * Handler for dragging scrollbar handle
     *
     * @param  {Event} event
     *
     * @return {Void}
     */
    function dragHandler(event) {
        dragging.released = event.type === 'mouseup' || event.type === 'touchend';
        dragging.pointer = dragging.touch ? event.originalEvent[dragging.released ? 'changedTouches' : 'touches'][0] : event;
        dragging.pathX = dragging.pointer.pageX - dragging.initX;
        dragging.pathY = dragging.pointer.pageY - dragging.initY;
        dragging.path = sqrt(pow(dragging.pathX, 2) + pow(dragging.pathY, 2));
        dragging.delta = dragging.pathX + hPos.cur;

        var current = 0;

        if (!dragging.released && dragging.path < 1) return;

        // We haven't decided whether this is a drag or not...
        if (!dragging.init) {
            // If the drag path was very short, maybe it's not a drag?
            if (dragging.path < o.scrollDragThreshold) {
                // If the pointer was released, the path will not become longer and it's
                // definitely not a drag. If not released yet, decide on next iteration
                return dragging.released ? dragEnd() : undefined;
            }
            else {
                // If dragging path is sufficiently long we can confidently start a drag
                // if drag is in different direction than scroll, ignore it
                if (abs(dragging.pathX) > abs(dragging.pathY)) {
                    dragging.init = 1;
                } else {
                    return dragEnd();
                }
            }
        }

        stopDefault(event);

        if (!dragging.locked && dragging.path > dragging.pathToLock && dragging.slidee) {
            dragging.locked = 1;
            dragging.$source.on(clickEvent, disableOneEvent);
        }

        if (dragging.released) {
            dragEnd();
        }

        switch (o.scrollbarType) {

            case "scroll":

                current = within(dragging.delta, hPos.start, hPos.end);

                if (transform) {
                    $handle[0].style[transform] = gpuAcceleration + 'translateX' + '(' + current + 'px)';
                } else {
                    $handle[0].style.left = current + 'px';
                }

                break;
            case "progress":

                current = within(dragging.delta, hPos.start, hPos.end);
                $progressBar[0].style.width = current + "px";
                $handle[0].style.left = current + 'px';
                break;
        }

        dragging.current = current;

        var index = round(dragging.current / ratio);

        if (index != hPos.index) {

            hPos.index = index;
            Instance.$element.trigger("to.owl.carousel", [index, animationSpeed, true]);
        }



    }

    /**
     * Stops dragging and cleans up after it.
     *
     * @return {Void}
     */
    function dragEnd() {

        dragging.released = true;
        $(document).off(dragging.touch ? dragTouchEvents : dragMouseEvents, dragHandler);
        $handle.removeClass(draggedClass);

        setTimeout(function () {
            dragging.$source.off(clickEvent, disableOneEvent);
        });

        hPos.cur = dragging.current;

        dragging.init = 0;
    }

    /**
	 * Disables an event it was triggered on and unbinds itself.
	 *
	 * @param  {Event} event
	 *
	 * @return {Void}
	 */
    function disableOneEvent(event) {
        /*jshint validthis:true */
        stopDefault(event, 1);
        $(this).off(event.type, disableOneEvent);
    }

    /**
	 * Make sure that number is within the limits.
	 *
	 * @param {Number} number
	 * @param {Number} min
	 * @param {Number} max
	 *
	 * @return {Number}
	 */
    function within(number, min, max) {
        return number < min ? min : number > max ? max : number;
    }

    /**
	 * Saves element styles for later restoration.
	 *
	 * Example:
	 *   var styles = new StyleRestorer(frame);
	 *   styles.save('position');
	 *   element.style.position = 'absolute';
	 *   styles.restore(); // restores to state before the assignment above
	 *
	 * @param {Element} element
	 */
    function StyleRestorer(element) {
        var self = {};
        self.style = {};
        self.save = function () {
            if (!element || !element.nodeType) return;
            for (var i = 0; i < arguments.length; i++) {
                self.style[arguments[i]] = element.style[arguments[i]];
            }
            return self;
        };
        self.restore = function () {
            if (!element || !element.nodeType) return;
            for (var prop in self.style) {
                if (self.style.hasOwnProperty(prop)) element.style[prop] = self.style[prop];
            }
            return self;
        };
        return self;
    }

    /**
	 * Event preventDefault & stopPropagation helper.
	 *
	 * @param {Event} event     Event object.
	 * @param {Bool}  noBubbles Cancel event bubbling.
	 *
	 * @return {Void}
	 */
    function stopDefault(event, noBubbles) {
        event.preventDefault();
        if (noBubbles) {
            event.stopPropagation();
        }
    }

    /**
     * Check whether element is interactive.
     *
     * @return {Boolean}
     */
    function isInteractive(element) {
        return ~$.inArray(element.nodeName, interactiveElements);
    }

    /**
     * Calculate current position from item index
     * 
     * @param {int} index 
     */
    function calculateCurrentPosition() {

        var position = 0;
        var index = Instance.relative(Instance.current());

        if (index === 0) {
            position = 0;
        }
        else if (index < count - visible) {
            position = (ratio * index);
        }
        else {
            position = sbSize - ratio; // progressSize
        }

        return position;
    }

    /**
     * Calculate current size from item index
     * 
     * @param {int} index 
     */
    function calculateCurrentSize() {

        var size = 0;

        var index = Instance.relative(Instance.current());

        if (index < count - visible) {
            size = ratio * index;
        }
        else {
            size = sbSize;
        }

        return size;
    }

    function setTransitionAnimation() {
        $handle.css({
            "transition": "all " + (animationSpeed / 1000) + "s ease-in-out"
        });
        $progressBar.css({
            "transition": "all " + (animationSpeed / 1000) + "s ease-in-out"
        });
    }

    function unsetTransitionAnimation() {
        $handle.css({
            "transition": ""
        });
        $progressBar.css({
            "transition": ""
        });
    }

    /**
     * Initialize the plugin
     * 
     * injects the scrollbar and sets initial values 
     * and parameters for furture uses in synchronization
     * 
     * @param {Event} event 
     */

    function initialize(event) {

        if (this.initialized) {
            return;
        }

        var $element = this._core.$element;

        $element.append($scrollbar);

        $handle.css({
            cursor: "pointer",
        });

        sbStyles.save.apply(sbStyles, holderProps);

        $handle.on(dragInitEvents, { source: handleClass }, dragInit);

        sbSize = $scrollbar.width();

        count = event.item.count;
        visible = event.page.size;
        ratio = sbSize / (count - visible + 1);
        animationSpeed = this._core.options.smartSpeed;

        hPos.start = 0;
        hPos.cur = 0;

        var handleSize;

        if (o.scrollbarType === "progress") {

            $scrollbar.prepend($progressBar);

            progressSize = calculateCurrentSize(event.item.index);

            handleSize = $handle.width();

            progressStyles.save.apply(handleStyles, movableProps);

            $progressBar.width(progressSize);
        }
        else {
            handleSize = ratio; // 100
            handleStyles.save.apply(handleStyles, movableProps);
            $handle.width(handleSize);
        }

        hPos.end = sbSize - handleSize;

        this.initialized = true;
    }

    /**
     * Synchronize scrollbar on item drag
     * 
     * Dragging the items in the carousel frame, clicking 
     * on the nav buttons or dots fires this function to 
     * synchronize the scrollbar handle porision or size
     * 
     * @param {Event} event 
     */
    function sync(event) {
        if ($handle.length && dragging.init === 0) {

            setTransitionAnimation();

            var current;

            switch (o.scrollbarType) {

                case "scroll":

                    current = calculateCurrentPosition();

                    hPos.cur = current;

                    if (transform) {
                        $handle[0].style[transform] = gpuAcceleration + 'translateX' + '(' + current + 'px)';
                    } else {
                        $handle[0].style.left = current + 'px';
                    }

                    break;
                case "progress":

                    current = calculateCurrentSize();

                    hPos.cur = current;

                    $progressBar[0].style.width = current + "px";
                    $handle[0].style.left = current + 'px';

                    break;
            }
        }

    }

    Scrollbar.prototype.destroy = function () {
        var handler, property;

        for (handler in this._handlers) {
            this._core.$element.off(handler, this._handlers[handler]);
        }
        for (property in Object.getOwnPropertyNames(this)) {
            typeof this[property] != 'function' && (this[property] = null);
        }
    };

    $.fn.owlCarousel.Constructor.Plugins.Scrollbar = Scrollbar;

})(window.Zepto || window.jQuery, window, document);
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
/**
 * Animated Typing Scripts.
 * Using Typed.js Plugin.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $animated_typing = $('.animated-typing');

        // we have typed selector?
        if ($animated_typing.length) {

            if ($('#typed').length) {
                var typed = new Typed("#typed", {
                    stringsElement: '#typed-strings',
                    typeSpeed: 30,
                    backSpeed: 30,
                    backDelay: 500,
                    startDelay: 1000,
                    loop: true,
                });
            }

            if ($('#typed-intro').length) {
                var typed_intro = new Typed("#typed-intro", {
                    stringsElement: '#typed-strings-intro',
                    typeSpeed: 150,
                    backSpeed: 150,
                    backDelay: 800,
                    startDelay: 800,
                    loop: true,
                });
            }

            if ($('#typed-1').length) {
                var typed_1 = new Typed("#typed-1", {
                    stringsElement: '#typed-strings-1',
                    typeSpeed: 30,
                    backSpeed: 30,
                    backDelay: 500,
                    startDelay: 1000,
                    loop: true,
                    cursorChar: '_',
                    shuffle: true,
                });
            }


            if ($('#typed-2').length) {
                var typed_2 = new Typed("#typed-2", {
                    strings: ['npm install^1000\n`installing components...`^1000\n`Fetching from source...`'],
                    typeSpeed: 40,
                    backSpeed: 20,
                    backDelay: 500,
                    startDelay: 1000,
                    loop: true,
                });
            }

        }

    });

})(jQuery, window, document);
/**
 * Calendar Scripts.
 * Using Bulma Calendar extension.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        // Initialize all input of date type.
        var calendars = bulmaCalendar.attach('[type="date"]');

    });

})(jQuery, window, document);
/**
 * Charts Scripts.
 * Using chart.js Plugin.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        var $charts = $('.charts');

        // we have chart selector?
        if ($charts.length) {

            window.chartColors = {
                red: 'rgb(255, 99, 132)',
                orange: 'rgb(255, 159, 64)',
                yellow: 'rgb(255, 205, 86)',
                green: 'rgb(75, 192, 192)',
                blue: 'rgb(54, 162, 235)',
                purple: 'rgb(153, 102, 255)',
                grey: 'rgb(201, 203, 207)'
            };

            (function(global) {
                var MONTHS = [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December'
                ];

                var COLORS = [
                    '#4dc9f6',
                    '#f67019',
                    '#f53794',
                    '#537bc4',
                    '#acc236',
                    '#166a8f',
                    '#00a950',
                    '#58595b',
                    '#8549ba'
                ];

                var Samples = global.Samples || (global.Samples = {});
                var Color = global.Color;

                Samples.utils = {
                    // Adapted from http://indiegamr.com/generate-repeatable-random-numbers-in-js/
                    srand: function(seed) {
                        this._seed = seed;
                    },

                    rand: function(min, max) {
                        var seed = this._seed;
                        min = min === undefined ? 0 : min;
                        max = max === undefined ? 1 : max;
                        this._seed = (seed * 9301 + 49297) % 233280;
                        return min + (this._seed / 233280) * (max - min);
                    },

                    numbers: function(config) {
                        var cfg = config || {};
                        var min = cfg.min || 0;
                        var max = cfg.max || 1;
                        var from = cfg.from || [];
                        var count = cfg.count || 8;
                        var decimals = cfg.decimals || 8;
                        var continuity = cfg.continuity || 1;
                        var dfactor = Math.pow(10, decimals) || 0;
                        var data = [];
                        var i, value;

                        for (i = 0; i < count; ++i) {
                            value = (from[i] || 0) + this.rand(min, max);
                            if (this.rand() <= continuity) {
                                data.push(Math.round(dfactor * value) / dfactor);
                            } else {
                                data.push(null);
                            }
                        }

                        return data;
                    },

                    labels: function(config) {
                        var cfg = config || {};
                        var min = cfg.min || 0;
                        var max = cfg.max || 100;
                        var count = cfg.count || 8;
                        var step = (max - min) / count;
                        var decimals = cfg.decimals || 8;
                        var dfactor = Math.pow(10, decimals) || 0;
                        var prefix = cfg.prefix || '';
                        var values = [];
                        var i;

                        for (i = min; i < max; i += step) {
                            values.push(prefix + Math.round(dfactor * i) / dfactor);
                        }

                        return values;
                    },

                    months: function(config) {
                        var cfg = config || {};
                        var count = cfg.count || 12;
                        var section = cfg.section;
                        var values = [];
                        var i, value;

                        for (i = 0; i < count; ++i) {
                            value = MONTHS[Math.ceil(i) % 12];
                            values.push(value.substring(0, section));
                        }

                        return values;
                    },

                    color: function(index) {
                        return COLORS[index % COLORS.length];
                    },

                    transparentize: function(color, opacity) {
                        var alpha = opacity === undefined ? 0.5 : 1 - opacity;
                        return Color(color).alpha(alpha).rgbString();
                    }
                };

                // DEPRECATED
                window.randomScalingFactor = function() {
                    return Math.round(Samples.utils.rand(-100, 100));
                };

                // INITIALIZATION

                Samples.utils.srand(Date.now());

            }(this));

            /**
             * Line Chart
             */
            var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var config = {
                type: 'line',
                data: {
                    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                    datasets: [{
                        label: 'My First dataset',
                        backgroundColor: window.chartColors.red,
                        borderColor: window.chartColors.red,
                        data: [
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor()
                        ],
                        fill: false,
                    }, {
                        label: 'My Second dataset',
                        fill: false,
                        backgroundColor: window.chartColors.blue,
                        borderColor: window.chartColors.blue,
                        data: [
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor()
                        ],
                    }]
                },
                options: {
                    responsive: true,
                    title: {
                        display: true,
                        text: 'Chart.js Line Chart'
                    },
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Month'
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Value'
                            }
                        }]
                    }
                }
            };
            document.getElementById('randomizeData').addEventListener('click', function() {
                config.data.datasets.forEach(function(dataset) {
                    dataset.data = dataset.data.map(function() {
                        return randomScalingFactor();
                    });
                });
                window.myLine.update();
            });
            var colorNames = Object.keys(window.chartColors);
            document.getElementById('addDataset').addEventListener('click', function() {
                var colorName = colorNames[config.data.datasets.length % colorNames.length];
                var newColor = window.chartColors[colorName];
                var newDataset = {
                    label: 'Dataset ' + config.data.datasets.length,
                    backgroundColor: newColor,
                    borderColor: newColor,
                    data: [],
                    fill: false
                };
                for (var index = 0; index < config.data.labels.length; ++index) {
                    newDataset.data.push(randomScalingFactor());
                }
                config.data.datasets.push(newDataset);
                window.myLine.update();
            });
            document.getElementById('addData').addEventListener('click', function() {
                if (config.data.datasets.length > 0) {
                    var month = MONTHS[config.data.labels.length % MONTHS.length];
                    config.data.labels.push(month);
                    config.data.datasets.forEach(function(dataset) {
                        dataset.data.push(randomScalingFactor());
                    });
                    window.myLine.update();
                }
            });
            document.getElementById('removeDataset').addEventListener('click', function() {
                config.data.datasets.splice(0, 1);
                window.myLine.update();
            });
            document.getElementById('removeData').addEventListener('click', function() {
                config.data.labels.splice(-1, 1); // remove the label first
                config.data.datasets.forEach(function(dataset) {
                    dataset.data.pop();
                });
                window.myLine.update();
            });

            /**
             * Bar Chart
             */
            var color = Chart.helpers.color;
            var barChartData = {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [{
                    label: 'Dataset 1',
                    backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
                    borderColor: window.chartColors.red,
                    borderWidth: 1,
                    data: [
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor()
                    ]
                }, {
                    label: 'Dataset 2',
                    backgroundColor: color(window.chartColors.blue).alpha(0.5).rgbString(),
                    borderColor: window.chartColors.blue,
                    borderWidth: 1,
                    data: [
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor(),
                        randomScalingFactor()
                    ]
                }]
            };
            document.getElementById('randomizeData-bar').addEventListener('click', function() {
                var zero = Math.random() < 0.2 ? true : false;
                barChartData.datasets.forEach(function(dataset) {
                    dataset.data = dataset.data.map(function() {
                        return zero ? 0.0 : randomScalingFactor();
                    });
                });
                window.myBar.update();
            });
            document.getElementById('addDataset-bar').addEventListener('click', function() {
                var colorName = colorNames[barChartData.datasets.length % colorNames.length];
                var dsColor = window.chartColors[colorName];
                var newDataset = {
                    label: 'Dataset ' + (barChartData.datasets.length + 1),
                    backgroundColor: color(dsColor).alpha(0.5).rgbString(),
                    borderColor: dsColor,
                    borderWidth: 1,
                    data: []
                };
                for (var index = 0; index < barChartData.labels.length; ++index) {
                    newDataset.data.push(randomScalingFactor());
                }
                barChartData.datasets.push(newDataset);
                window.myBar.update();
            });
            document.getElementById('addData-bar').addEventListener('click', function() {
                if (barChartData.datasets.length > 0) {
                    var month = MONTHS[barChartData.labels.length % MONTHS.length];
                    barChartData.labels.push(month);
                    for (var index = 0; index < barChartData.datasets.length; ++index) {
                        // window.myBar.addData(randomScalingFactor(), index);
                        barChartData.datasets[index].data.push(randomScalingFactor());
                    }
                    window.myBar.update();
                }
            });
            document.getElementById('removeDataset-bar').addEventListener('click', function() {
                barChartData.datasets.pop();
                window.myBar.update();
            });
            document.getElementById('removeData-bar').addEventListener('click', function() {
                barChartData.labels.splice(-1, 1); // remove the label first
                barChartData.datasets.forEach(function(dataset) {
                    dataset.data.pop();
                });
                window.myBar.update();
            });

            /**
             * Pie Chart
             */
            randomScalingFactor = function() {
                return Math.round(Math.random() * 100);
            };

            var config_pie = {
                type: 'pie',
                data: {
                    datasets: [{
                        data: [
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                        ],
                        backgroundColor: [
                            window.chartColors.red,
                            window.chartColors.orange,
                            window.chartColors.yellow,
                            window.chartColors.green,
                            window.chartColors.blue,
                        ],
                        label: 'Dataset 1'
                    }],
                    labels: [
                        'Red',
                        'Orange',
                        'Yellow',
                        'Green',
                        'Blue'
                    ]
                },
                options: {
                    responsive: true
                }
            };

            document.getElementById('randomizeData-pie').addEventListener('click', function() {
                config_pie.data.datasets.forEach(function(dataset) {
                    dataset.data = dataset.data.map(function() {
                        return randomScalingFactor();
                    });
                });
                window.myPie.update();
            });
            document.getElementById('addDataset-pie').addEventListener('click', function() {
                var newDataset = {
                    backgroundColor: [],
                    data: [],
                    label: 'New dataset ' + config_pie.data.datasets.length,
                };
                for (var index = 0; index < config_pie.data.labels.length; ++index) {
                    newDataset.data.push(randomScalingFactor());
                    var colorName = colorNames[index % colorNames.length];
                    var newColor = window.chartColors[colorName];
                    newDataset.backgroundColor.push(newColor);
                }
                config_pie.data.datasets.push(newDataset);
                window.myPie.update();
            });
            document.getElementById('removeDataset-pie').addEventListener('click', function() {
                config_pie.data.datasets.splice(0, 1);
                window.myPie.update();
            });

            /**
             * Doughnut Chart
             */
            var config_doughnut = {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                            randomScalingFactor(),
                        ],
                        backgroundColor: [
                            window.chartColors.red,
                            window.chartColors.orange,
                            window.chartColors.yellow,
                            window.chartColors.green,
                            window.chartColors.blue,
                        ],
                        label: 'Dataset 1'
                    }],
                    labels: [
                        'Red',
                        'Orange',
                        'Yellow',
                        'Green',
                        'Blue'
                    ]
                },
                options: {
                    responsive: true,
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Chart.js Doughnut Chart'
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                }
            };

            document.getElementById('randomizeData-doughnut').addEventListener('click', function() {
                config_doughnut.data.datasets.forEach(function(dataset) {
                    dataset.data = dataset.data.map(function() {
                        return randomScalingFactor();
                    });
                });
                window.myDoughnut.update();
            });
            document.getElementById('addDataset-doughnut').addEventListener('click', function() {
                var newDataset = {
                    backgroundColor: [],
                    data: [],
                    label: 'New dataset ' + config_doughnut.data.datasets.length,
                };
                for (var index = 0; index < config_doughnut.data.labels.length; ++index) {
                    newDataset.data.push(randomScalingFactor());
                    var colorName = colorNames[index % colorNames.length];
                    var newColor = window.chartColors[colorName];
                    newDataset.backgroundColor.push(newColor);
                }
                config_doughnut.data.datasets.push(newDataset);
                window.myDoughnut.update();
            });
            document.getElementById('addData-doughnut').addEventListener('click', function() {
                if (config_doughnut.data.datasets.length > 0) {
                    config_doughnut.data.labels.push('data #' + config_doughnut.data.labels.length);
                    var colorName = colorNames[config_doughnut.data.datasets[0].data.length % colorNames.length];
                    var newColor = window.chartColors[colorName];
                    config_doughnut.data.datasets.forEach(function(dataset) {
                        dataset.data.push(randomScalingFactor());
                        dataset.backgroundColor.push(newColor);
                    });
                    window.myDoughnut.update();
                }
            });
            document.getElementById('removeDataset-doughnut').addEventListener('click', function() {
                config_doughnut.data.datasets.splice(0, 1);
                window.myDoughnut.update();
            });
            document.getElementById('removeData-doughnut').addEventListener('click', function() {
                config_doughnut.data.labels.splice(-1, 1); // remove the label first
                config_doughnut.data.datasets.forEach(function(dataset) {
                    dataset.data.pop();
                    dataset.backgroundColor.pop();
                });
                window.myDoughnut.update();
            });
            document.getElementById('changeCircleSize').addEventListener('click', function() {
                if (window.myDoughnut.options.circumference === Math.PI) {
                    window.myDoughnut.options.circumference = 2 * Math.PI;
                    window.myDoughnut.options.rotation = -Math.PI / 2;
                } else {
                    window.myDoughnut.options.circumference = Math.PI;
                    window.myDoughnut.options.rotation = -Math.PI;
                }
                window.myDoughnut.update();
            });

            /**
             * Load all chart types.
             */
            window.onload = function() {

                var line_chart = document.getElementById('line-chart').getContext('2d');
                window.myLine = new Chart(line_chart, config);

                var bar_chart = document.getElementById('bar-chart').getContext('2d');
                window.myBar = new Chart(bar_chart, {
                    type: 'bar',
                    data: barChartData,
                    options: {
                        responsive: true,
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Chart.js Bar Chart'
                        }
                    }
                });

                var pie_chart = document.getElementById('pie-chart').getContext('2d');
                window.myPie = new Chart(pie_chart, config_pie);

                var doughnut_chart = document.getElementById('doughnut-chart').getContext('2d');
                window.myDoughnut = new Chart(doughnut_chart, config_doughnut);

            };


        } // end check $charts selector

    });

})(jQuery, window, document);
/**
 * Counterup, CountDown Scripts.
 * Using jquery.counterup jQuery Plugin.
 * Using jquery.countdown jQuery Plugin.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $counter = $('.counter');
        var $countdown = $('.countdown-time');

        // check @rtl
        var html_dir = $('html').attr('dir');
        var is_rtl = false;
        if ($('body').hasClass('rtl') || $('html').hasClass('rtl') || html_dir == 'rtl') {
            is_rtl = true;
        }

        // we have counter selector?
        if ($counter.length) {

            $counter.counterUp({
                time: 1000,
                delay: 10,
                beginAt: 1,
            });

        } // end check $counter

        // we have counter selector?
        if ($countdown.length) {

            $countdown.each(function() {
                if (is_rtl) {
                    $(this).countDown({
                        with_separators: false,
                        label_dd: 'أيام',
                        label_hh: 'ساعات',
                        label_mm: 'دقائق',
                        label_ss: 'ثوانى',
                    });
                } else {
                    $(this).countDown({
                        with_separators: false,
                    });
                }

            });

        } // end check $countdown

    });

})(jQuery, window, document);
/**
 * Flexslider Scripts.
 * Using jQuery FlexSlider 2
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $slider = $('.flexslider');
        var $slider_thumbnails = $('.flexslider.thumbnails');
        var $slider_intro = $('.flexslider.intro');

        /**
         * default options.
         */
        var intro_options = {
            animation: "slide",
        };

        var thumbnails_options = {
            animation: "slide",
            controlNav: "thumbnails",
        };

        // show slider after load page content
        $slider_thumbnails.show();
        $slider_intro.show();

        // we have default slider selector?
        if ($slider_thumbnails.length) {
            $slider_thumbnails.flexslider(thumbnails_options);
        }

        if ($slider_intro.length) {
            $slider_intro.flexslider(intro_options);
        }

    });

})(jQuery, window, document);
/**
 * Footer Reveal Scripts.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $site_container = $('body');
        var $site_container_rtl = $('body.rtl');
        var $footer = $site_container.find('#footer-wrap');
        var $footer_bottom = $site_container.find('#footer-bottom-wrap');
        var $main_content = $site_container.find('#content-main-wrap');
        var $content_footer = $site_container.find('#content-footer-wrap');
        var $footer_top = $site_container.find('#footer-top-wrap');

        // we have footer reveal selector?
        if ($site_container.hasClass('footer-reveal')) {

            // push footer to top
            if ($footer.length && $footer_bottom.length) {
                $footer.css('position', 'fixed').css('bottom', $footer_bottom.height());
                $footer_bottom.css('position', 'fixed').css('bottom', 0);
            }

            // add margin bottom to main content for reveal
            if ($footer_top.length) {
                $footer_top.css('margin-bottom', ($footer.height() + $footer_bottom.height() - 1));
            } else if ($content_footer.length) {
                $content_footer.css('margin-bottom', ($footer.height() + $footer_bottom.height() - 1));
            } else {
                $main_content.css('margin-bottom', ($footer.height() + $footer_bottom.height() - 1));
            }


        } // end check footer-reveal


    });

})(jQuery, window, document);
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
/**
 * Lightbox Scripts.
 * Using jquery.magnific-popup jQuery Plugin.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $lightbox = $('.mfp-lightbox');
        var $lightbox_gallery = $('.mfp-lightbox-gallery');

        // default options
        var default_options = {
            closeOnContentClick: true,
            closeBtnInside: false,
            zoom: {
                enabled: true,
                duration: 300,
                easing: 'ease-in-out',
                opener: function(openerElement) {
                    return openerElement.is('img') ? openerElement : openerElement.closest('figure').find('img');
                }
            }
        };

        // we have lightbox selector?
        if ($lightbox.length) {

            $lightbox.each(function() {

                // add Zooming effect only for images
                if ($(this).hasClass('mfp-image')) {
                    $(this).magnificPopup(default_options);
                } else if ($(this).hasClass('popup-with-zoom-anim')) {

                    $(this).magnificPopup({
                        type: 'inline',
                        fixedContentPos: false,
                        fixedBgPos: true,
                        overflowY: 'auto',
                        closeBtnInside: true,
                        preloader: false,
                        midClick: true,
                        removalDelay: 300,
                        mainClass: 'mfp-zoom-in'
                    });

                } else if ($(this).hasClass('popup-with-move-anim')) {

                    $(this).magnificPopup({
                        type: 'inline',
                        fixedContentPos: false,
                        fixedBgPos: true,
                        overflowY: 'auto',
                        closeBtnInside: true,
                        preloader: false,
                        midClick: true,
                        removalDelay: 300,
                        mainClass: 'mfp-slide-bottom'
                    });

                } else if ($(this).hasClass('popup-modal')) {

                    $(this).magnificPopup({
                        type: 'inline',
                        fixedContentPos: false,
                        fixedBgPos: true,
                        overflowY: 'auto',
                        closeBtnInside: true,
                        preloader: false,
                        midClick: true,
                        removalDelay: 300,
                        mainClass: 'mfp-zoom-in',
                        modal: true,
                    });

                    $(document).on('click', '.popup-modal-dismiss', function(e) {
                        e.preventDefault();
                        $.magnificPopup.close();
                    });

                } else {
                    $(this).magnificPopup({
                        closeBtnInside: false,
                    });
                }

            });


        } // end check $lightbox

        // we have lightbox gallery selector?
        if ($lightbox_gallery.length) {
            $lightbox_gallery.each(function() {
                $(this).find('.mfp-lightbox').magnificPopup({
                    closeBtnInside: false,
                    gallery: {
                        enabled: true,
                        tPrev: 'previous',
                        tNext: 'next',
                        tCounter: '%curr% of %total%',
                    },
                    zoom: {
                        enabled: true,
                        duration: 300,
                        easing: 'ease-in-out',
                        opener: function(openerElement) {
                            return openerElement.is('img') ? openerElement : openerElement.closest('figure').find('img');
                        }
                    }
                });
            });
        }

    });

})(jQuery, window, document);
/**
 * Navigation One Page Scripts.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $header = $('header');
        var $site_container = $('body');
        var $site_container_rtl = $('body.rtl');
        var $one_page_nav_link = $header.find('.main-navigation ul li a[href*="#"]:not([href="#"])');
        var $global_hash_link = $site_container.find('a[href*="#"]:not([href="#"])');

        // we have header-one-page selector
        if ($site_container.hasClass('header-one-page')) {

            // move to section on click
            $one_page_nav_link.on('click', function() {

                // get header offset height
                var header_offset_height = $header.height();
                if ($site_container.hasClass('hide-on-scroll')) {
                    header_offset_height = 0;
                }

                if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {

                    var target = $(this.hash);
                    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

                    if (target.length) {
                        event.preventDefault();
                        $one_page_nav_link.parent('li').removeClass('active');
                        $(this).parent('li').addClass('active');
                        $('html, body').animate({
                            scrollTop: (target.offset().top - header_offset_height)
                        }, {
                            duration: 1000,
                            progress: function() {
                                // fix section offset top for sticky header
                                if ((header_offset_height - $header.height()) > 0) {
                                    $(this).css('margin-top', (header_offset_height - $header.height()));
                                } else {
                                    $(this).css('margin-top', '');
                                }
                            }
                        });
                        return false;
                    }

                }

            });

            // add and remove active link per section
            $(window).scroll(function() {

                var currentTop = $(window).scrollTop();

                // add and remove active class to links on scoll
                $('section').each(function(index) {

                    var elemTop = $(this).offset().top - ($header.height() + 1);
                    var elemBottom = elemTop + $(this).height();
                    if (currentTop >= elemTop && currentTop <= elemBottom) {
                        var id = $(this).attr('id');
                        var navElem = $('a[href="#' + id + '"]');
                        navElem.parent().addClass('active').siblings().removeClass('active');
                    }

                });

                // active home link when scroll to top
                if (currentTop === 0) {
                    $one_page_nav_link.parent('li').removeClass('active');
                    $one_page_nav_link.parent('li:first-child').addClass('active');
                }

            });

        } // end check header-one-page

        // scroll to id content when click to any hash link

        // move to section on click
        $global_hash_link.on('click', function() {

            // get header offset height
            var header_offset_height = $header.height();
            if ($site_container.hasClass('hide-on-scroll')) {
                header_offset_height = 0;
            }

            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {

                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');

                if (target.length) {
                    event.preventDefault();
                    $('html, body').animate({
                        scrollTop: (target.offset().top - header_offset_height)
                    }, {
                        duration: 1000,
                        progress: function() {
                            // fix section offset top for sticky header
                            if ((header_offset_height - $header.height()) > 0) {
                                $(this).css('margin-top', (header_offset_height - $header.height()));
                            } else {
                                $(this).css('margin-top', '');
                            }
                        }
                    });
                    return false;
                }

            }

        });

    });

})(jQuery, window, document);
/**
 * Navigation Sticky Scripts.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $header = $('header');
        var $site_container = $('body');
        var $site_container_rtl = $('body.rtl');
        var prevScrollpos = window.pageYOffset;
        var header_center_overlay_padding = parseInt($header.css('padding-top'), 10);
        var $parallax_mirror = $('.parallax-mirror');
        var header_height = $header.height();
        var header_width = $header.width();

        if (!$site_container.hasClass('header-transparent') && !$site_container.hasClass(' header-transparent-overlay') && !$site_container.hasClass('header-transparent-border')) {
            // replace logo image for white background
            // $header.find('.site-logo img').attr('src', '/assets/images/logo/logo-black2.png');
        }

        // on scroll work
        $(window).scroll(function() {

            var windowTop = $(window).scrollTop();

            // we have sticky header selector?
            if ($site_container.hasClass('header-sticky') && !$site_container.hasClass('header-side-navigation')) {

                // we have show-on-scroll class
                if ($site_container.hasClass('show-on-scroll')) {

                    if ($site_container.hasClass('boxed-layout')) {
                        $header.css('width', header_width + 'px');
                    }

                    if (windowTop !== 0) {

                        // replace logo image for white background
                        if ($site_container.hasClass('header-transparent') || $site_container.hasClass(' header-transparent-overlay') || $site_container.hasClass('header-transparent-border')) {
                            // $header.find('.site-logo img').attr('src', '/assets/images/logo/logo-black2.png');
                        }

                        if (windowTop > $header.height()) {
                            $header.css('position', 'fixed').css('top', 0);
                            if ($header.height() > 59) {
                                $header.addClass('show-on-scroll');
                            }

                        } else {
                            if ($site_container.hasClass('header-center-overlay')) {
                                $header.css('position', '').css('top', -($header.height() + header_center_overlay_padding));
                            } else {
                                $header.css('position', '').css('top', '-100%');
                            }

                        }

                        // fix parallax-background position
                        $parallax_mirror.css('top', -(header_height));

                    } else {

                        // back default logo image for transparent background
                        if ($site_container.hasClass('header-transparent') || $site_container.hasClass(' header-transparent-overlay') || $site_container.hasClass('header-transparent-border')) {
                            // $header.find('.site-logo img').attr('src', '/assets/images/logo/logo2.png');
                        }

                        $header.removeClass('show-on-scroll');
                        if ($site_container.hasClass('header-center-overlay') || $site_container.hasClass('header-transparent') || $site_container.hasClass('header-transparent-overlay')) {
                            $header.css('top', 0);
                        }

                        // fix parallax-background position
                        $parallax_mirror.css('top', 0);

                    }

                } // end check show-on-scroll class

                // we have hide-on-scroll class
                if ($site_container.hasClass('hide-on-scroll')) {

                    if ($site_container.hasClass('boxed-layout')) {
                        $header.css('width', header_width + 'px');
                    }

                    var currentScrollPos = window.pageYOffset;

                    if (currentScrollPos !== 0) {

                        // replace logo image for white background
                        if ($site_container.hasClass('header-transparent') || $site_container.hasClass(' header-transparent-overlay') || $site_container.hasClass('header-transparent-border')) {
                            // $header.find('.site-logo img').attr('src', '/assets/images/logo/logo-black2.png');
                        }

                        if (prevScrollpos > currentScrollPos) {

                            if ($site_container.hasClass('header-topbar')) {
                                $header.css('position', 'fixed').css('top', 0);
                            } else {
                                $header.css('position', 'fixed').css('top', 0);
                            }

                            if ($header.height() > 59) {
                                $header.addClass('hide-on-scroll');
                            }
                            if ($site_container.hasClass('header-menu-background-primary') || $site_container.hasClass('header-menu-background-dark')) {
                                $header.addClass('hide-on-scroll');
                            }

                        } else {
                            if ($site_container.hasClass('header-center-overlay')) {
                                $header.css('position', 'fixed').css('top', -($header.height() + header_center_overlay_padding));
                            } else {
                                $header.css('position', 'fixed').css('top', -($header.height()));
                            }
                        }
                        prevScrollpos = currentScrollPos;

                        // fix parallax-background position
                        $parallax_mirror.css('top', -(header_height));

                    } else {

                        // back default logo image for transparent background
                        if ($site_container.hasClass('header-transparent') || $site_container.hasClass(' header-transparent-overlay') || $site_container.hasClass('header-transparent-border')) {
                            // $header.find('.site-logo img').attr('src', '/assets/images/logo/logo2.png');
                        }

                        $header.css('position', '');
                        $header.removeClass('hide-on-scroll');

                        if ($site_container.hasClass('header-topbar') && $site_container.hasClass('header-transparent')) {
                            $header.css('top', ($('#header-top-wrap').height()));
                        }

                        if ($site_container.hasClass('header-topbar') && $site_container.hasClass('header-transparent-overlay')) {
                            $header.css('top', ($('#header-top-wrap').height()));
                        }

                        // fix parallax-background position
                        $parallax_mirror.css('top', 0);

                    }


                } // end check show-on-scroll class

            } // end check header-sticky class

        }); // end on scroll


    });

})(jQuery, window, document);

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
/**
 * Progress Bars Scripts.
 * Using ProgressBar.js 1.0.1
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $progress_bar = $('.progressbar');

        /**
         * Default options.
         */
        var default_options = {
            strokeWidth: 1.2,
            trailWidth: 1.2,
            easing: 'easeInOut',
            duration: 1400,
            color: '#f80036',
            trailColor: '#EAEAEA',
            svgStyle: {
                width: '100%',
                height: '100%'
            },
            text: {
                style: {}
            },
            step: function(state, bar) {
                bar.setText(Math.round(bar.value() * 100) + '%');
            }
        };

        // takes jQuery(element) a.k.a. $('element')
        function onScreen(element) {
            // window bottom edge
            var windowBottomEdge = $(window).scrollTop() + $(window).height();

            // element top edge
            var elementTopEdge = element.offset().top;
            var offset = 100;

            // if element is between window's top and bottom edges
            return elementTopEdge + offset <= windowBottomEdge;
        }

        // we have progressbar selector?
        if ($progress_bar.length) {

            $progress_bar.each(function() {

                // get custom options and override default
                var final_options = default_options;
                if ($(this).is('[data-options]') && !$.isEmptyObject($.parseJSON($(this).attr('data-options')))) {
                    final_options = $.extend(default_options, $.parseJSON($(this).attr('data-options')));
                }

                // init bar
                var active_bar;
                if ($(this).hasClass('circle')) {

                    final_options = $.extend(final_options, {
                        text: {
                            autoStyleContainer: false
                        },
                        strokeWidth: 3,
                        trailWidth: 3,
                        step: function(state, circle) {

                            var value = Math.round(circle.value() * 100) + '%';
                            if (value === '0%') {
                                circle.setText('');
                            } else {
                                circle.setText(value);
                            }
                        }
                    });

                    active_bar = new ProgressBar.Circle('.' + $(this).attr('class').replace(/\s+/g, '.'), final_options);

                } else {
                    final_options = $.extend(final_options, {
                        strokeWidth: 1.2,
                        trailWidth: 1.2,
                        text: {
                            style: {}
                        }
                    });
                    active_bar = new ProgressBar.Line('.' + $(this).attr('class').replace(/\s+/g, '.'), final_options);
                }

                // default run bar from 0.0 to 1.0
                active_bar.animate($(this).attr('data-value'));

                // run bar on scroll
                var $_this = $(this);
                $(window).scroll(function(e) {
                    if (onScreen($_this)) {
                        active_bar.animate($_this.attr('data-value'));
                    } else {
                        active_bar.set(0);
                    }
                });

            });

        }

    });

})(jQuery, window, document);
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
/**
 * Slider Revolution Scripts.
 */

;
(function($, window, document, undefined) {

    'use strict';

    $(document).ready(function() {

        /**
         * Save DOM selectors.
         */
        var $site_container = $('body');
        var $site_container_rtl = $('body.rtl');
        var $slider_revolution = $site_container.find('#rev_slider_1');
        var sliderLayout = 'auto';

        // update slider layout auto when boxed
        if ($site_container.hasClass('boxed-layout')) {
            sliderLayout = 'auto';
        }

        // we have slider revolution selector?
        if ($slider_revolution.length) {

            /**
             * Initialize the slider based on the Slider's ID.
             */
            var revapi = $slider_revolution.show().revolution({

                disableProgressBar: "on",
                hideThumbsOnMobile: "on",

                // stop slider autoplay
                stopLoop: 'on',
                stopAfterLoops: 0,
                stopAtSlide: 1,

                // options are 'auto', 'fullwidth' or 'fullscreen'
                sliderLayout: sliderLayout, // fullscreen

                // OFFSET SLIDER BY THE HEIGHT OF AN ELEMENT
                fullScreenOffsetContainer: "#header-wrap",

                // Disable Force Full-Width
                fullScreenAlignForce: 'off',

                /* RESPECT ASPECT RATIO */
                autoHeight: 'on',

                /* MIN-HEIGHT */
                minHeight: '500',

                // basic navigation arrows and bullets */
                navigation: {

                    keyboardNavigation: "off",
                    keyboard_direction: "horizontal",
                    mouseScrollNavigation: "off",
                    mouseScrollReverse: "default",
                    onHoverStop: "off",
                    tabs: {
                        style: "hesperiden",
                        enable: true,
                        width: 325,
                        height: 270,
                        min_width: 250,
                        wrapper_padding: 0,
                        wrapper_color: "#ffffff",
                        wrapper_opacity: "1",
                        tmp: '<div class="tp-tab-content"><img src="{{param2}}" class="image is-block"><span class="tp-tab-title">{{title}}</span><span class="tp-tab-date">{{param1}}</span><span class="icon"><i class="ion-ios-arrow-round-forward"></i></span></div>',
                        visibleAmount: 4,
                        hide_onmobile: false,
                        hide_onleave: false,
                        hide_delay: 200,
                        direction: "horizontal",
                        span: false,
                        position: "outer-bottom",
                        space: 0,
                        h_align: "left",
                        v_align: "bottom",
                        h_offset: 0,
                        v_offset: 0
                    }
                },

                // PRELOADER OPTION "2"
                spinner: 'spinner2',

                // Stop Slider out of Viewport
                viewPort: {
                    enable: true,
                    outof: 'wait',
                    visible_area: '80%',
                    presize: true
                },

                parallax: {
                    type: 'mouse+scroll',
                    origo: 'slidercenter',
                    speed: 400,
                    levels: [5, 10, 15, 20, 25, 30, 35, 40,
                        45, 46, 47, 48, 49, 50, 51, 55
                    ],
                    disable_onmobile: 'on'
                },

            });

            // only start the slider once the entire window has loaded
            $(window).on('load', function() {

                revapi.revshowslide(4);

            });

        } // end check slider revolution selector


    });

})(jQuery, window, document);
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
/**************************************************************************
 * jquery.themepunch.revolution.js - jQuery Plugin for Revolution Slider
 * @version: 5.4.8 (10.06.2018)
 * @requires jQuery v1.7 or later (tested on 1.9)
 * @author ThemePunch
**************************************************************************/
!function(jQuery,undefined){"use strict";var version={core:"5.4.8","revolution.extensions.actions.min.js":"2.1.0","revolution.extensions.carousel.min.js":"1.2.1","revolution.extensions.kenburn.min.js":"1.3.1","revolution.extensions.layeranimation.min.js":"3.6.5","revolution.extensions.navigation.min.js":"1.3.5","revolution.extensions.parallax.min.js":"2.2.3","revolution.extensions.slideanims.min.js":"1.8","revolution.extensions.video.min.js":"2.2.2"};jQuery.fn.extend({revolution:function(i){var e={delay:9e3,responsiveLevels:4064,visibilityLevels:[2048,1024,778,480],gridwidth:960,gridheight:500,minHeight:0,autoHeight:"off",sliderType:"standard",sliderLayout:"auto",fullScreenAutoWidth:"off",fullScreenAlignForce:"off",fullScreenOffsetContainer:"",fullScreenOffset:"0",hideCaptionAtLimit:0,hideAllCaptionAtLimit:0,hideSliderAtLimit:0,disableProgressBar:"off",stopAtSlide:-1,stopAfterLoops:-1,shadow:0,dottedOverlay:"none",startDelay:0,lazyType:"smart",spinner:"spinner0",shuffle:"off",viewPort:{enable:!1,outof:"wait",visible_area:"60%",presize:!1},fallbacks:{isJoomla:!1,panZoomDisableOnMobile:"off",simplifyAll:"on",nextSlideOnWindowFocus:"off",disableFocusListener:!0,ignoreHeightChanges:"off",ignoreHeightChangesSize:0,allowHTML5AutoPlayOnAndroid:!0},parallax:{type:"off",levels:[10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85],origo:"enterpoint",speed:400,bgparallax:"off",opacity:"on",disable_onmobile:"off",ddd_shadow:"on",ddd_bgfreeze:"off",ddd_overflow:"visible",ddd_layer_overflow:"visible",ddd_z_correction:65,ddd_path:"mouse"},scrolleffect:{fade:"off",blur:"off",scale:"off",grayscale:"off",maxblur:10,on_layers:"off",on_slidebg:"off",on_static_layers:"off",on_parallax_layers:"off",on_parallax_static_layers:"off",direction:"both",multiplicator:1.35,multiplicator_layers:.5,tilt:30,disable_on_mobile:"on"},carousel:{easing:punchgs.Power3.easeInOut,speed:800,showLayersAllTime:"off",horizontal_align:"center",vertical_align:"center",infinity:"on",space:0,maxVisibleItems:3,stretch:"off",fadeout:"on",maxRotation:0,minScale:0,vary_fade:"off",vary_rotation:"on",vary_scale:"off",border_radius:"0px",padding_top:0,padding_bottom:0},navigation:{keyboardNavigation:"off",keyboard_direction:"horizontal",mouseScrollNavigation:"off",onHoverStop:"on",touch:{touchenabled:"off",touchOnDesktop:"off",swipe_treshold:75,swipe_min_touches:1,drag_block_vertical:!1,swipe_direction:"horizontal"},arrows:{style:"",enable:!1,hide_onmobile:!1,hide_onleave:!0,hide_delay:200,hide_delay_mobile:1200,hide_under:0,hide_over:9999,tmp:"",rtl:!1,left:{h_align:"left",v_align:"center",h_offset:20,v_offset:0,container:"slider"},right:{h_align:"right",v_align:"center",h_offset:20,v_offset:0,container:"slider"}},bullets:{container:"slider",rtl:!1,style:"",enable:!1,hide_onmobile:!1,hide_onleave:!0,hide_delay:200,hide_delay_mobile:1200,hide_under:0,hide_over:9999,direction:"horizontal",h_align:"left",v_align:"center",space:0,h_offset:20,v_offset:0,tmp:'<span class="tp-bullet-image"></span><span class="tp-bullet-title"></span>'},thumbnails:{container:"slider",rtl:!1,style:"",enable:!1,width:100,height:50,min_width:100,wrapper_padding:2,wrapper_color:"#f5f5f5",wrapper_opacity:1,tmp:'<span class="tp-thumb-image"></span><span class="tp-thumb-title"></span>',visibleAmount:5,hide_onmobile:!1,hide_onleave:!0,hide_delay:200,hide_delay_mobile:1200,hide_under:0,hide_over:9999,direction:"horizontal",span:!1,position:"inner",space:2,h_align:"left",v_align:"center",h_offset:20,v_offset:0},tabs:{container:"slider",rtl:!1,style:"",enable:!1,width:100,min_width:100,height:50,wrapper_padding:10,wrapper_color:"#f5f5f5",wrapper_opacity:1,tmp:'<span class="tp-tab-image"></span>',visibleAmount:5,hide_onmobile:!1,hide_onleave:!0,hide_delay:200,hide_delay_mobile:1200,hide_under:0,hide_over:9999,direction:"horizontal",span:!1,space:0,position:"inner",h_align:"left",v_align:"center",h_offset:20,v_offset:0}},extensions:"extensions/",extensions_suffix:".min.js",debugMode:!1};return i=jQuery.extend(!0,{},e,i),this.each(function(){var e=jQuery(this);i.minHeight=i.minHeight!=undefined?parseInt(i.minHeight,0):i.minHeight,i.scrolleffect.on="on"===i.scrolleffect.fade||"on"===i.scrolleffect.scale||"on"===i.scrolleffect.blur||"on"===i.scrolleffect.grayscale,"hero"==i.sliderType&&e.find(">ul>li").each(function(e){0<e&&jQuery(this).remove()}),i.jsFileLocation=i.jsFileLocation||getScriptLocation("themepunch.revolution.min.js"),i.jsFileLocation=i.jsFileLocation+i.extensions,i.scriptsneeded=getNeededScripts(i,e),i.curWinRange=0,i.rtl=!0,i.navigation!=undefined&&i.navigation.touch!=undefined&&(i.navigation.touch.swipe_min_touches=5<i.navigation.touch.swipe_min_touches?1:i.navigation.touch.swipe_min_touches),jQuery(this).on("scriptsloaded",function(){if(i.modulesfailing)return e.html('<div style="margin:auto;line-height:40px;font-size:14px;color:#fff;padding:15px;background:#e74c3c;margin:20px 0px;">!! Error at loading Slider Revolution 5.0 Extrensions.'+i.errorm+"</div>").show(),!1;_R.migration!=undefined&&(i=_R.migration(e,i)),punchgs.force3D=!0,"on"!==i.simplifyAll&&punchgs.TweenLite.lagSmoothing(1e3,16),prepareOptions(e,i),initSlider(e,i)}),e[0].opt=i,waitForScripts(e,i)})},getRSVersion:function(e){if(!0===e)return jQuery("body").data("tp_rs_version");var i=jQuery("body").data("tp_rs_version"),t="";for(var a in t+="---------------------------------------------------------\n",t+="    Currently Loaded Slider Revolution & SR Modules :\n",t+="---------------------------------------------------------\n",i)t+=i[a].alias+": "+i[a].ver+"\n";return t+="---------------------------------------------------------\n"},revremoveslide:function(r){return this.each(function(){var e=jQuery(this),i=e[0].opt;if(!(r<0||r>i.slideamount)&&e!=undefined&&0<e.length&&0<jQuery("body").find("#"+e.attr("id")).length&&i&&0<i.li.length&&(0<r||r<=i.li.length)){var t=jQuery(i.li[r]),a=t.data("index"),n=!1;i.slideamount=i.slideamount-1,i.realslideamount=i.realslideamount-1,removeNavWithLiref(".tp-bullet",a,i),removeNavWithLiref(".tp-tab",a,i),removeNavWithLiref(".tp-thumb",a,i),t.hasClass("active-revslide")&&(n=!0),t.remove(),i.li=removeArray(i.li,r),i.carousel&&i.carousel.slides&&(i.carousel.slides=removeArray(i.carousel.slides,r)),i.thumbs=removeArray(i.thumbs,r),_R.updateNavIndexes&&_R.updateNavIndexes(i),n&&e.revnext(),punchgs.TweenLite.set(i.li,{minWidth:"99%"}),punchgs.TweenLite.set(i.li,{minWidth:"100%"})}})},revaddcallback:function(e){return this.each(function(){this.opt&&(this.opt.callBackArray===undefined&&(this.opt.callBackArray=new Array),this.opt.callBackArray.push(e))})},revgetparallaxproc:function(){return jQuery(this)[0].opt.scrollproc},revdebugmode:function(){return this.each(function(){var e=jQuery(this);e[0].opt.debugMode=!0,containerResized(e,e[0].opt)})},revscroll:function(i){return this.each(function(){var e=jQuery(this);jQuery("body,html").animate({scrollTop:e.offset().top+e.height()-i+"px"},{duration:400})})},revredraw:function(e){return this.each(function(){var e=jQuery(this);containerResized(e,e[0].opt)})},revkill:function(e){var i=this,t=jQuery(this);if(punchgs.TweenLite.killDelayedCallsTo(_R.showHideNavElements),t!=undefined&&0<t.length&&0<jQuery("body").find("#"+t.attr("id")).length){t.data("conthover",1),t.data("conthover-changed",1),t.trigger("revolution.slide.onpause");var a=t.parent().find(".tp-bannertimer"),n=t[0].opt;n.tonpause=!0,t.trigger("stoptimer");var r="resize.revslider-"+t.attr("id");jQuery(window).unbind(r),punchgs.TweenLite.killTweensOf(t.find("*"),!1),punchgs.TweenLite.killTweensOf(t,!1),t.unbind("hover, mouseover, mouseenter,mouseleave, resize");r="resize.revslider-"+t.attr("id");jQuery(window).off(r),t.find("*").each(function(){var e=jQuery(this);e.unbind("on, hover, mouseenter,mouseleave,mouseover, resize,restarttimer, stoptimer"),e.off("on, hover, mouseenter,mouseleave,mouseover, resize"),e.data("mySplitText",null),e.data("ctl",null),e.data("tween")!=undefined&&e.data("tween").kill(),e.data("kenburn")!=undefined&&e.data("kenburn").kill(),e.data("timeline_out")!=undefined&&e.data("timeline_out").kill(),e.data("timeline")!=undefined&&e.data("timeline").kill(),e.remove(),e.empty(),e=null}),punchgs.TweenLite.killTweensOf(t.find("*"),!1),punchgs.TweenLite.killTweensOf(t,!1),a.remove();try{t.closest(".forcefullwidth_wrapper_tp_banner").remove()}catch(e){}try{t.closest(".rev_slider_wrapper").remove()}catch(e){}try{t.remove()}catch(e){}return t.empty(),t.html(),n=t=null,delete i.c,delete i.opt,delete i.container,!0}return!1},revpause:function(){return this.each(function(){var e=jQuery(this);e!=undefined&&0<e.length&&0<jQuery("body").find("#"+e.attr("id")).length&&(e.data("conthover",1),e.data("conthover-changed",1),e.trigger("revolution.slide.onpause"),e[0].opt.tonpause=!0,e.trigger("stoptimer"))})},revresume:function(){return this.each(function(){var e=jQuery(this);e!=undefined&&0<e.length&&0<jQuery("body").find("#"+e.attr("id")).length&&(e.data("conthover",0),e.data("conthover-changed",1),e.trigger("revolution.slide.onresume"),e[0].opt.tonpause=!1,e.trigger("starttimer"))})},revstart:function(){var e=jQuery(this);if(e!=undefined&&0<e.length&&0<jQuery("body").find("#"+e.attr("id")).length&&e[0].opt!==undefined)return e[0].opt.sliderisrunning?(console.log("Slider Is Running Already"),!1):((e[0].opt.c=e)[0].opt.ul=e.find(">ul"),runSlider(e,e[0].opt),!0)},revnext:function(){return this.each(function(){var e=jQuery(this);e!=undefined&&0<e.length&&0<jQuery("body").find("#"+e.attr("id")).length&&_R.callingNewSlide(e,1)})},revprev:function(){return this.each(function(){var e=jQuery(this);e!=undefined&&0<e.length&&0<jQuery("body").find("#"+e.attr("id")).length&&_R.callingNewSlide(e,-1)})},revmaxslide:function(){return jQuery(this).find(".tp-revslider-mainul >li").length},revcurrentslide:function(){var e=jQuery(this);if(e!=undefined&&0<e.length&&0<jQuery("body").find("#"+e.attr("id")).length)return parseInt(e[0].opt.act,0)+1},revlastslide:function(){return jQuery(this).find(".tp-revslider-mainul >li").length},revshowslide:function(i){return this.each(function(){var e=jQuery(this);e!=undefined&&0<e.length&&0<jQuery("body").find("#"+e.attr("id")).length&&_R.callingNewSlide(e,"to"+(i-1))})},revcallslidewithid:function(i){return this.each(function(){var e=jQuery(this);e!=undefined&&0<e.length&&0<jQuery("body").find("#"+e.attr("id")).length&&_R.callingNewSlide(e,i)})}});var _R=jQuery.fn.revolution;jQuery.extend(!0,_R,{getversion:function(){return version},compare_version:function(e){var i=jQuery("body").data("tp_rs_version");return(i=i===undefined?new Object:i).Core===undefined&&(i.Core=new Object,i.Core.alias="Slider Revolution Core",i.Core.name="jquery.themepunch.revolution.min.js",i.Core.ver=_R.getversion().core),"stop"!=e.check&&(_R.getversion().core<e.min_core?(e.check===undefined&&(console.log("%cSlider Revolution Warning (Core:"+_R.getversion().core+")","color:#c0392b;font-weight:bold;"),console.log("%c     Core is older than expected ("+e.min_core+") from "+e.alias,"color:#333"),console.log("%c     Please update Slider Revolution to the latest version.","color:#333"),console.log("%c     It might be required to purge and clear Server/Client side Caches.","color:#333")),e.check="stop"):_R.getversion()[e.name]!=undefined&&e.version<_R.getversion()[e.name]&&(e.check===undefined&&(console.log("%cSlider Revolution Warning (Core:"+_R.getversion().core+")","color:#c0392b;font-weight:bold;"),console.log("%c     "+e.alias+" ("+e.version+") is older than requiered ("+_R.getversion()[e.name]+")","color:#333"),console.log("%c     Please update Slider Revolution to the latest version.","color:#333"),console.log("%c     It might be required to purge and clear Server/Client side Caches.","color:#333")),e.check="stop")),i[e.alias]===undefined&&(i[e.alias]=new Object,i[e.alias].alias=e.alias,i[e.alias].ver=e.version,i[e.alias].name=e.name),jQuery("body").data("tp_rs_version",i),e},currentSlideIndex:function(e){var i=e.c.find(".active-revslide").index();return i=-1==i?0:i},simp:function(e,i,t){var a=Math.abs(e)-Math.floor(Math.abs(e/i))*i;return t?a:e<0?-1*a:a},iOSVersion:function(){var e=!1;return navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/iPad/i)?navigator.userAgent.match(/OS 4_\d like Mac OS X/i)&&(e=!0):e=!1,e},isIE:function(e,i){var t=jQuery('<div style="display:none;"/>').appendTo(jQuery("body"));t.html("\x3c!--[if "+(i||"")+" IE "+(e||"")+"]><a>&nbsp;</a><![endif]--\x3e");var a=t.find("a").length;return t.remove(),a},is_mobile:function(){var e=["android","webos","iphone","ipad","blackberry","Android","webos",,"iPod","iPhone","iPad","Blackberry","BlackBerry"],i=!1;for(var t in e)1<navigator.userAgent.split(e[t]).length&&(i=!0);return i},is_android:function(){var e=["android","Android"],i=!1;for(var t in e)1<navigator.userAgent.split(e[t]).length&&(i=!0);return i},callBackHandling:function(e,t,a){try{e.callBackArray&&jQuery.each(e.callBackArray,function(e,i){i&&i.inmodule&&i.inmodule===t&&i.atposition&&i.atposition===a&&i.callback&&i.callback.call()})}catch(e){console.log("Call Back Failed")}},get_browser:function(){var e,i=navigator.appName,t=navigator.userAgent,a=t.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);return a&&null!=(e=t.match(/version\/([\.\d]+)/i))&&(a[2]=e[1]),(a=a?[a[1],a[2]]:[i,navigator.appVersion,"-?"])[0]},get_browser_version:function(){var e,i=navigator.appName,t=navigator.userAgent,a=t.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);return a&&null!=(e=t.match(/version\/([\.\d]+)/i))&&(a[2]=e[1]),(a=a?[a[1],a[2]]:[i,navigator.appVersion,"-?"])[1]},isSafari11:function(){var e=jQuery.trim(_R.get_browser().toLowerCase());return-1===jQuery.trim(navigator.userAgent.toLowerCase()).search("edge")&&"msie"!==e&&e.match(/safari|chrome/)},getHorizontalOffset:function(e,i){var t=gWiderOut(e,".outer-left"),a=gWiderOut(e,".outer-right");switch(i){case"left":return t;case"right":return a;case"both":return t+a}},callingNewSlide:function(e,i){var t=0<e.find(".next-revslide").length?e.find(".next-revslide").index():0<e.find(".processing-revslide").length?e.find(".processing-revslide").index():e.find(".active-revslide").index(),a=0,n=e[0].opt;e.find(".next-revslide").removeClass("next-revslide"),e.find(".active-revslide").hasClass("tp-invisible-slide")&&(t=n.last_shown_slide),i&&jQuery.isNumeric(i)||i.match(/to/g)?(a=1===i||-1===i?(a=t+i)<0?n.slideamount-1:a>=n.slideamount?0:a:(i=jQuery.isNumeric(i)?i:parseInt(i.split("to")[1],0))<0?0:i>n.slideamount-1?n.slideamount-1:i,e.find(".tp-revslider-slidesli:eq("+a+")").addClass("next-revslide")):i&&e.find(".tp-revslider-slidesli").each(function(){var e=jQuery(this);e.data("index")===i&&e.addClass("next-revslide")}),a=e.find(".next-revslide").index(),e.trigger("revolution.nextslide.waiting"),t===a&&t===n.last_shown_slide||a!==t&&-1!=a?swapSlide(e):e.find(".next-revslide").removeClass("next-revslide")},slotSize:function(e,i){i.slotw=Math.ceil(i.width/i.slots),"fullscreen"==i.sliderLayout?i.sloth=Math.ceil(jQuery(window).height()/i.slots):i.sloth=Math.ceil(i.height/i.slots),"on"==i.autoHeight&&e!==undefined&&""!==e&&(i.sloth=Math.ceil(e.height()/i.slots))},setSize:function(e){var i=(e.top_outer||0)+(e.bottom_outer||0),t=parseInt(e.carousel.padding_top||0,0),a=parseInt(e.carousel.padding_bottom||0,0),n=e.gridheight[e.curWinRange],r=0,o=-1===e.nextSlide||e.nextSlide===undefined?0:e.nextSlide;if(e.paddings=e.paddings===undefined?{top:parseInt(e.c.parent().css("paddingTop"),0)||0,bottom:parseInt(e.c.parent().css("paddingBottom"),0)||0}:e.paddings,e.rowzones&&0<e.rowzones.length)for(var s=0;s<e.rowzones[o].length;s++)r+=e.rowzones[o][s][0].offsetHeight;if(n=(n=n<e.minHeight?e.minHeight:n)<r?r:n,"fullwidth"==e.sliderLayout&&"off"==e.autoHeight&&punchgs.TweenLite.set(e.c,{maxHeight:n+"px"}),e.c.css({marginTop:t,marginBottom:a}),e.width=e.ul.width(),e.height=e.ul.height(),setScale(e),e.height=Math.round(e.gridheight[e.curWinRange]*(e.width/e.gridwidth[e.curWinRange])),e.height>e.gridheight[e.curWinRange]&&"on"!=e.autoHeight&&(e.height=e.gridheight[e.curWinRange]),"fullscreen"==e.sliderLayout||e.infullscreenmode){e.height=e.bw*e.gridheight[e.curWinRange];e.c.parent().width();var l=jQuery(window).height();if(e.fullScreenOffsetContainer!=undefined){try{var d=e.fullScreenOffsetContainer.split(",");d&&jQuery.each(d,function(e,i){l=0<jQuery(i).length?l-jQuery(i).outerHeight(!0):l})}catch(e){}try{1<e.fullScreenOffset.split("%").length&&e.fullScreenOffset!=undefined&&0<e.fullScreenOffset.length?l-=jQuery(window).height()*parseInt(e.fullScreenOffset,0)/100:e.fullScreenOffset!=undefined&&0<e.fullScreenOffset.length&&(l-=parseInt(e.fullScreenOffset,0))}catch(e){}}l=l<e.minHeight?e.minHeight:l,l-=i,e.c.parent().height(l),e.c.closest(".rev_slider_wrapper").height(l),e.c.css({height:"100%"}),e.height=l,e.minHeight!=undefined&&e.height<e.minHeight&&(e.height=e.minHeight),e.height=parseInt(r,0)>parseInt(e.height,0)?r:e.height}else e.minHeight!=undefined&&e.height<e.minHeight&&(e.height=e.minHeight),e.height=parseInt(r,0)>parseInt(e.height,0)?r:e.height,e.c.height(e.height);var c={height:t+a+i+e.height+e.paddings.top+e.paddings.bottom};e.c.closest(".forcefullwidth_wrapper_tp_banner").find(".tp-fullwidth-forcer").css(c),e.c.closest(".rev_slider_wrapper").css(c),setScale(e)},enterInViewPort:function(t){t.waitForCountDown&&(countDown(t.c,t),t.waitForCountDown=!1),t.waitForFirstSlide&&(swapSlide(t.c),t.waitForFirstSlide=!1,setTimeout(function(){t.c.removeClass("tp-waitforfirststart")},500)),"playing"!=t.sliderlaststatus&&t.sliderlaststatus!=undefined||t.c.trigger("starttimer"),t.lastplayedvideos!=undefined&&0<t.lastplayedvideos.length&&jQuery.each(t.lastplayedvideos,function(e,i){_R.playVideo(i,t)})},leaveViewPort:function(t){t.sliderlaststatus=t.sliderstatus,t.c.trigger("stoptimer"),t.playingvideos!=undefined&&0<t.playingvideos.length&&(t.lastplayedvideos=jQuery.extend(!0,[],t.playingvideos),t.playingvideos&&jQuery.each(t.playingvideos,function(e,i){t.leaveViewPortBasedStop=!0,_R.stopVideo&&_R.stopVideo(i,t)}))},unToggleState:function(e){e!=undefined&&0<e.length&&jQuery.each(e,function(e,i){i.removeClass("rs-toggle-content-active")})},toggleState:function(e){e!=undefined&&0<e.length&&jQuery.each(e,function(e,i){i.addClass("rs-toggle-content-active")})},swaptoggleState:function(e){e!=undefined&&0<e.length&&jQuery.each(e,function(e,i){jQuery(i).hasClass("rs-toggle-content-active")?jQuery(i).removeClass("rs-toggle-content-active"):jQuery(i).addClass("rs-toggle-content-active")})},lastToggleState:function(e){var t=0;return e!=undefined&&0<e.length&&jQuery.each(e,function(e,i){t=i.hasClass("rs-toggle-content-active")}),t}});var _ISM=_R.is_mobile(),_ANDROID=_R.is_android(),checkIDS=function(e,i){if(e.anyid=e.anyid===undefined?[]:e.anyid,-1!=jQuery.inArray(i.attr("id"),e.anyid)){var t=i.attr("id")+"_"+Math.round(9999*Math.random());i.attr("id",t)}e.anyid.push(i.attr("id"))},removeArray=function(e,t){var a=[];return jQuery.each(e,function(e,i){e!=t&&a.push(i)}),a},removeNavWithLiref=function(e,i,t){t.c.find(e).each(function(){var e=jQuery(this);e.data("liref")===i&&e.remove()})},lAjax=function(i,t){return!jQuery("body").data(i)&&(t.filesystem?(t.errorm===undefined&&(t.errorm="<br>Local Filesystem Detected !<br>Put this to your header:"),console.warn("Local Filesystem detected !"),t.errorm=t.errorm+'<br>&lt;script type="text/javascript" src="'+t.jsFileLocation+i+t.extensions_suffix+'"&gt;&lt;/script&gt;',console.warn(t.jsFileLocation+i+t.extensions_suffix+" could not be loaded !"),console.warn("Please use a local Server or work online or make sure that you load all needed Libraries manually in your Document."),console.log(" "),!(t.modulesfailing=!0)):(jQuery.ajax({url:t.jsFileLocation+i+t.extensions_suffix+"?version="+version.core,dataType:"script",cache:!0,error:function(e){console.warn("Slider Revolution 5.0 Error !"),console.error("Failure at Loading:"+i+t.extensions_suffix+" on Path:"+t.jsFileLocation),console.info(e)}}),void jQuery("body").data(i,!0)))},getNeededScripts=function(t,e){var i=new Object,a=t.navigation;return i.kenburns=!1,i.parallax=!1,i.carousel=!1,i.navigation=!1,i.videos=!1,i.actions=!1,i.layeranim=!1,i.migration=!1,e.data("version")&&e.data("version").toString().match(/5./gi)?(e.find("img").each(function(){"on"==jQuery(this).data("kenburns")&&(i.kenburns=!0)}),("carousel"==t.sliderType||"on"==a.keyboardNavigation||"on"==a.mouseScrollNavigation||"on"==a.touch.touchenabled||a.arrows.enable||a.bullets.enable||a.thumbnails.enable||a.tabs.enable)&&(i.navigation=!0),e.find(".tp-caption, .tp-static-layer, .rs-background-video-layer").each(function(){var e=jQuery(this);(e.data("ytid")!=undefined||0<e.find("iframe").length&&0<e.find("iframe").attr("src").toLowerCase().indexOf("youtube"))&&(i.videos=!0),(e.data("vimeoid")!=undefined||0<e.find("iframe").length&&0<e.find("iframe").attr("src").toLowerCase().indexOf("vimeo"))&&(i.videos=!0),e.data("actions")!==undefined&&(i.actions=!0),i.layeranim=!0}),e.find("li").each(function(){jQuery(this).data("link")&&jQuery(this).data("link")!=undefined&&(i.layeranim=!0,i.actions=!0)}),!i.videos&&(0<e.find(".rs-background-video-layer").length||0<e.find(".tp-videolayer").length||0<e.find(".tp-audiolayer").length||0<e.find("iframe").length||0<e.find("video").length)&&(i.videos=!0),"carousel"==t.sliderType&&(i.carousel=!0),("off"!==t.parallax.type||t.viewPort.enable||"true"==t.viewPort.enable||"true"===t.scrolleffect.on||t.scrolleffect.on)&&(i.parallax=!0)):(i.kenburns=!0,i.parallax=!0,i.carousel=!1,i.navigation=!0,i.videos=!0,i.actions=!0,i.layeranim=!0,i.migration=!0),"hero"==t.sliderType&&(i.carousel=!1,i.navigation=!1),window.location.href.match(/file:/gi)&&(i.filesystem=!0,t.filesystem=!0),i.videos&&void 0===_R.isVideoPlaying&&lAjax("revolution.extension.video",t),i.carousel&&void 0===_R.prepareCarousel&&lAjax("revolution.extension.carousel",t),i.carousel||void 0!==_R.animateSlide||lAjax("revolution.extension.slideanims",t),i.actions&&void 0===_R.checkActions&&lAjax("revolution.extension.actions",t),i.layeranim&&void 0===_R.handleStaticLayers&&lAjax("revolution.extension.layeranimation",t),i.kenburns&&void 0===_R.stopKenBurn&&lAjax("revolution.extension.kenburn",t),i.navigation&&void 0===_R.createNavigation&&lAjax("revolution.extension.navigation",t),i.migration&&void 0===_R.migration&&lAjax("revolution.extension.migration",t),i.parallax&&void 0===_R.checkForParallax&&lAjax("revolution.extension.parallax",t),t.addons!=undefined&&0<t.addons.length&&jQuery.each(t.addons,function(e,i){"object"==typeof i&&i.fileprefix!=undefined&&lAjax(i.fileprefix,t)}),i},waitForScripts=function(e,i){var t=!0,a=i.scriptsneeded;i.addons!=undefined&&0<i.addons.length&&jQuery.each(i.addons,function(e,i){"object"==typeof i&&i.init!=undefined&&_R[i.init]===undefined&&(t=!1)}),a.filesystem||"undefined"!=typeof punchgs&&t&&(!a.kenburns||a.kenburns&&void 0!==_R.stopKenBurn)&&(!a.navigation||a.navigation&&void 0!==_R.createNavigation)&&(!a.carousel||a.carousel&&void 0!==_R.prepareCarousel)&&(!a.videos||a.videos&&void 0!==_R.resetVideo)&&(!a.actions||a.actions&&void 0!==_R.checkActions)&&(!a.layeranim||a.layeranim&&void 0!==_R.handleStaticLayers)&&(!a.migration||a.migration&&void 0!==_R.migration)&&(!a.parallax||a.parallax&&void 0!==_R.checkForParallax)&&(a.carousel||!a.carousel&&void 0!==_R.animateSlide)?e.trigger("scriptsloaded"):setTimeout(function(){waitForScripts(e,i)},50)},getScriptLocation=function(e){var i=new RegExp("themepunch.revolution.min.js","gi"),t="";return jQuery("script").each(function(){var e=jQuery(this).attr("src");e&&e.match(i)&&(t=e)}),t=(t=(t=t.replace("jquery.themepunch.revolution.min.js","")).replace("jquery.themepunch.revolution.js","")).split("?")[0]},setCurWinRange=function(e,i){var t=9999,a=0,n=0,r=0,o=jQuery(window).width(),s=i&&9999==e.responsiveLevels?e.visibilityLevels:e.responsiveLevels;s&&s.length&&jQuery.each(s,function(e,i){o<i&&(0==a||i<a)&&(r=e,a=t=i),i<o&&a<i&&(a=i,n=e)}),a<t&&(r=n),i?e.forcedWinRange=r:e.curWinRange=r},prepareOptions=function(e,i){i.carousel.maxVisibleItems=i.carousel.maxVisibleItems<1?999:i.carousel.maxVisibleItems,i.carousel.vertical_align="top"===i.carousel.vertical_align?"0%":"bottom"===i.carousel.vertical_align?"100%":"50%"},gWiderOut=function(e,i){var t=0;return e.find(i).each(function(){var e=jQuery(this);!e.hasClass("tp-forcenotvisible")&&t<e.outerWidth()&&(t=e.outerWidth())}),t},initSlider=function(container,opt){if(container==undefined)return!1;container.data("aimg")!=undefined&&("enabled"==container.data("aie8")&&_R.isIE(8)||"enabled"==container.data("amobile")&&_ISM)&&container.html('<img class="tp-slider-alternative-image" src="'+container.data("aimg")+'">'),container.find(">ul").addClass("tp-revslider-mainul"),opt.c=container,opt.ul=container.find(".tp-revslider-mainul"),opt.ul.find(">li").each(function(e){var i=jQuery(this);"on"==i.data("hideslideonmobile")&&_ISM&&i.remove(),(i.data("invisible")||!0===i.data("invisible"))&&(i.addClass("tp-invisible-slide"),i.appendTo(opt.ul))}),opt.addons!=undefined&&0<opt.addons.length&&jQuery.each(opt.addons,function(i,obj){"object"==typeof obj&&obj.init!=undefined&&_R[obj.init](eval(obj.params))}),opt.cid=container.attr("id"),opt.ul.css({visibility:"visible"}),opt.slideamount=opt.ul.find(">li").not(".tp-invisible-slide").length,opt.realslideamount=opt.ul.find(">li").length,opt.slayers=container.find(".tp-static-layers"),opt.slayers.data("index","staticlayers"),1!=opt.waitForInit&&(container[0].opt=opt,runSlider(container,opt))},onFullScreenChange=function(){jQuery("body").data("rs-fullScreenMode",!jQuery("body").data("rs-fullScreenMode")),jQuery("body").data("rs-fullScreenMode")&&setTimeout(function(){jQuery(window).trigger("resize")},200)},runSlider=function(t,x){if(x.sliderisrunning=!0,x.ul.find(">li").each(function(e){jQuery(this).data("originalindex",e)}),x.allli=x.ul.find(">li"),jQuery.each(x.allli,function(e,i){(i=jQuery(i)).data("origindex",i.index())}),x.li=x.ul.find(">li").not(".tp-invisible-slide"),"on"==x.shuffle){var e=new Object,i=x.ul.find(">li:first-child");e.fstransition=i.data("fstransition"),e.fsmasterspeed=i.data("fsmasterspeed"),e.fsslotamount=i.data("fsslotamount");for(var a=0;a<x.slideamount;a++){var n=Math.round(Math.random()*x.slideamount);x.ul.find(">li:eq("+n+")").prependTo(x.ul)}var r=x.ul.find(">li:first-child");r.data("fstransition",e.fstransition),r.data("fsmasterspeed",e.fsmasterspeed),r.data("fsslotamount",e.fsslotamount),x.allli=x.ul.find(">li"),x.li=x.ul.find(">li").not(".tp-invisible-slide")}if(x.inli=x.ul.find(">li.tp-invisible-slide"),x.thumbs=new Array,x.slots=4,x.act=-1,x.firststart=1,x.loadqueue=new Array,x.syncload=0,x.conw=t.width(),x.conh=t.height(),1<x.responsiveLevels.length?x.responsiveLevels[0]=9999:x.responsiveLevels=9999,jQuery.each(x.allli,function(e,i){var t=(i=jQuery(i)).find(".rev-slidebg")||i.find("img").first(),a=0;i.addClass("tp-revslider-slidesli"),i.data("index")===undefined&&i.data("index","rs-"+Math.round(999999*Math.random()));var n=new Object;n.params=new Array,n.id=i.data("index"),n.src=i.data("thumb")!==undefined?i.data("thumb"):t.data("lazyload")!==undefined?t.data("lazyload"):t.attr("src"),i.data("title")!==undefined&&n.params.push({from:RegExp("\\{\\{title\\}\\}","g"),to:i.data("title")}),i.data("description")!==undefined&&n.params.push({from:RegExp("\\{\\{description\\}\\}","g"),to:i.data("description")});for(a=1;a<=10;a++)i.data("param"+a)!==undefined&&n.params.push({from:RegExp("\\{\\{param"+a+"\\}\\}","g"),to:i.data("param"+a)});if(x.thumbs.push(n),i.data("link")!=undefined){var r=i.data("link"),o=i.data("target")||"_self",s="back"===i.data("slideindex")?0:60,l=i.data("linktoslide"),d=l;l!=undefined&&"next"!=l&&"prev"!=l&&x.allli.each(function(){var e=jQuery(this);e.data("origindex")+1==d&&(l=e.data("index"))}),"slide"!=r&&(l="no");var c='<div class="tp-caption slidelink" style="cursor:pointer;width:100%;height:100%;z-index:'+s+';" data-x="center" data-y="center" data-basealign="slide" ',u=' data-frames=\'[{"delay":0,"speed":100,"frame":"0","from":"opacity:0;","to":"o:1;","ease":"Power3.easeInOut"},{"delay":"wait","speed":300,"frame":"999","to":"opacity:0;","ease":"Power3.easeInOut"}]\'';c="no"==l?c+u+" >":c+"data-actions='"+("scroll_under"===l?'[{"event":"click","action":"scrollbelow","offset":"100px","delay":"0"}]':"prev"===l?'[{"event":"click","action":"jumptoslide","slide":"prev","delay":"0.2"}]':"next"===l?'[{"event":"click","action":"jumptoslide","slide":"next","delay":"0.2"}]':'[{"event":"click","action":"jumptoslide","slide":"'+l+'","delay":"0.2"}]')+"'"+u+" >",c+='<a style="width:100%;height:100%;display:block"',c="slide"!=r?c+' target="'+o+'" href="'+r+'"':c,c+='><span style="width:100%;height:100%;display:block"></span></a></div>',i.append(c)}}),x.rle=x.responsiveLevels.length||1,x.gridwidth=cArray(x.gridwidth,x.rle),x.gridheight=cArray(x.gridheight,x.rle),"on"==x.simplifyAll&&(_R.isIE(8)||_R.iOSVersion())&&(t.find(".tp-caption").each(function(){var e=jQuery(this);e.removeClass("customin customout").addClass("fadein fadeout"),e.data("splitin",""),e.data("speed",400)}),x.allli.each(function(){var e=jQuery(this);e.data("transition","fade"),e.data("masterspeed",500),e.data("slotamount",1),(e.find(".rev-slidebg")||e.find(">img").first()).data("kenburns","off")})),x.desktop=!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i),x.autoHeight="fullscreen"==x.sliderLayout?"on":x.autoHeight,"fullwidth"==x.sliderLayout&&"off"==x.autoHeight&&t.css({maxHeight:x.gridheight[x.curWinRange]+"px"}),"auto"!=x.sliderLayout&&0==t.closest(".forcefullwidth_wrapper_tp_banner").length&&("fullscreen"!==x.sliderLayout||"on"!=x.fullScreenAutoWidth)){var o=t.parent(),s=o.css("marginBottom"),l=o.css("marginTop"),d=t.attr("id")+"_forcefullwidth";s=s===undefined?0:s,l=l===undefined?0:l,o.wrap('<div class="forcefullwidth_wrapper_tp_banner" id="'+d+'" style="position:relative;width:100%;height:auto;margin-top:'+l+";margin-bottom:"+s+'"></div>'),t.closest(".forcefullwidth_wrapper_tp_banner").append('<div class="tp-fullwidth-forcer" style="width:100%;height:'+t.height()+'px"></div>'),t.parent().css({marginTop:"0px",marginBottom:"0px"}),t.parent().css({position:"absolute"})}if(x.shadow!==undefined&&0<x.shadow&&(t.parent().addClass("tp-shadow"+x.shadow),t.parent().append('<div class="tp-shadowcover"></div>'),t.parent().find(".tp-shadowcover").css({backgroundColor:t.parent().css("backgroundColor"),backgroundImage:t.parent().css("backgroundImage")})),setCurWinRange(x),setCurWinRange(x,!0),!t.hasClass("revslider-initialised")){t.addClass("revslider-initialised"),t.addClass("tp-simpleresponsive"),t.attr("id")==undefined&&t.attr("id","revslider-"+Math.round(1e3*Math.random()+5)),checkIDS(x,t),x.firefox13=!1,x.ie=!jQuery.support.opacity,x.ie9=9==document.documentMode,x.origcd=x.delay;var c=jQuery.fn.jquery.split("."),u=parseFloat(c[0]),p=parseFloat(c[1]);parseFloat(c[2]||"0");1==u&&p<7&&t.html('<div style="text-align:center; padding:40px 0px; font-size:20px; color:#992222;"> The Current Version of jQuery:'+c+" <br>Please update your jQuery Version to min. 1.7 in Case you wish to use the Revolution Slider Plugin</div>"),1<u&&(x.ie=!1);var j=new Object;j.addedyt=0,j.addedvim=0,j.addedvid=0,x.scrolleffect.on&&(x.scrolleffect.layers=new Array),t.find(".tp-caption, .rs-background-video-layer").each(function(e){var n=jQuery(this),i=n.data(),t=i.autoplayonlyfirsttime,a=i.autoplay,r=(i.videomp4!==undefined||i.videowebm!==undefined||i.videoogv,n.hasClass("tp-audiolayer")),o=i.videoloop,s=!0,l=!1;i.startclasses=n.attr("class"),i.isparallaxlayer=0<=i.startclasses.indexOf("rs-parallax"),n.hasClass("tp-static-layer")&&_R.handleStaticLayers&&(_R.handleStaticLayers(n,x),x.scrolleffect.on&&("on"===x.scrolleffect.on_parallax_static_layers&&i.isparallaxlayer||"on"===x.scrolleffect.on_static_layers&&!i.isparallaxlayer)&&(l=!0),s=!1);var d=n.data("noposteronmobile")||n.data("noPosterOnMobile")||n.data("posteronmobile")||n.data("posterOnMobile")||n.data("posterOnMObile");n.data("noposteronmobile",d);var c=0;if(n.find("iframe").each(function(){punchgs.TweenLite.set(jQuery(this),{autoAlpha:0}),c++}),0<c&&n.data("iframes",!0),n.hasClass("tp-caption")){var u=n.hasClass("slidelink")?"width:100% !important;height:100% !important;":"",p=n.data(),f="",h=p.type,g="row"===h||"column"===h?"relative":"absolute",v="";"row"===h?(n.addClass("rev_row").removeClass("tp-resizeme"),v="rev_row_wrap"):"column"===h?(f=p.verticalalign===undefined?" vertical-align:bottom;":" vertical-align:"+p.verticalalign+";",v="rev_column",n.addClass("rev_column_inner").removeClass("tp-resizeme"),n.data("width","auto"),punchgs.TweenLite.set(n,{width:"auto"})):"group"===h&&n.removeClass("tp-resizeme");var m="",y="";"row"!==h&&"group"!==h&&"column"!==h?(m="display:"+n.css("display")+";",0<n.closest(".rev_column").length?(n.addClass("rev_layer_in_column"),s=!1):0<n.closest(".rev_group").length&&(n.addClass("rev_layer_in_group"),s=!1)):"column"===h&&(s=!1),p.wrapper_class!==undefined&&(v=v+" "+p.wrapper_class),p.wrapper_id!==undefined&&(y='id="'+p.wrapper_id+'"');var w="";n.hasClass("tp-no-events")&&(w=";pointer-events:none"),n.wrap("<div "+y+' class="tp-parallax-wrap '+v+'" style="'+f+" "+u+"position:"+g+";"+m+";visibility:hidden"+w+'"><div class="tp-loop-wrap" style="'+u+"position:"+g+";"+m+';"><div class="tp-mask-wrap" style="'+u+"position:"+g+";"+m+';" ></div></div></div>'),s&&x.scrolleffect.on&&("on"===x.scrolleffect.on_parallax_layers&&i.isparallaxlayer||"on"===x.scrolleffect.on_layers&&!i.isparallaxlayer)&&x.scrolleffect.layers.push(n.parent()),l&&x.scrolleffect.layers.push(n.parent()),"column"===h&&(n.append('<div class="rev_column_bg rev_column_bg_man_sized" style="visibility:hidden"></div>'),n.closest(".tp-parallax-wrap").append('<div class="rev_column_bg rev_column_bg_auto_sized"></div>'));var b=n.closest(".tp-loop-wrap");jQuery.each(["pendulum","rotate","slideloop","pulse","wave"],function(e,i){var t=n.find(".rs-"+i),a=t.data()||"";""!=a&&(b.data(a),b.addClass("rs-"+i),t.children(0).unwrap(),n.data("loopanimation","on"))}),n.attr("id")===undefined&&n.attr("id","layer-"+Math.round(999999999*Math.random())),checkIDS(x,n),punchgs.TweenLite.set(n,{visibility:"hidden"})}var _=n.data("actions");_!==undefined&&_R.checkActions(n,x,_),checkHoverDependencies(n,x),_R.checkVideoApis&&(j=_R.checkVideoApis(n,x,j)),r||1!=t&&"true"!=t&&"1sttime"!=a||"loopandnoslidestop"==o||n.closest("li.tp-revslider-slidesli").addClass("rs-pause-timer-once"),r||1!=a&&"true"!=a&&"on"!=a&&"no1sttime"!=a||"loopandnoslidestop"==o||n.closest("li.tp-revslider-slidesli").addClass("rs-pause-timer-always")}),t[0].addEventListener("mouseenter",function(){t.trigger("tp-mouseenter"),x.overcontainer=!0},{passive:!0}),t[0].addEventListener("mouseover",function(){t.trigger("tp-mouseover"),x.overcontainer=!0},{passive:!0}),t[0].addEventListener("mouseleave",function(){t.trigger("tp-mouseleft"),x.overcontainer=!1},{passive:!0}),t.find(".tp-caption video").each(function(e){var i=jQuery(this);i.removeClass("video-js vjs-default-skin"),i.attr("preload",""),i.css({display:"none"})}),"standard"!==x.sliderType&&(x.lazyType="all"),loadImages(t.find(".tp-static-layers"),x,0,!0),waitForCurrentImages(t.find(".tp-static-layers"),x,function(){t.find(".tp-static-layers img").each(function(){var e=jQuery(this),i=e.data("lazyload")!=undefined?e.data("lazyload"):e.attr("src"),t=getLoadObj(x,i);e.attr("src",t.src)})}),x.rowzones=[],x.allli.each(function(e){var i=jQuery(this);punchgs.TweenLite.set(this,{perspective:6e3}),x.rowzones[e]=[],i.find(".rev_row_zone").each(function(){x.rowzones[e].push(jQuery(this))}),"all"!=x.lazyType&&("smart"!=x.lazyType||0!=e&&1!=e&&e!=x.slideamount&&e!=x.slideamount-1)||(loadImages(i,x,e),waitForCurrentImages(i,x,function(){}))});var f=getUrlVars("#")[0];if(f.length<9&&1<f.split("slide").length){var h=parseInt(f.split("slide")[1],0);h<1&&(h=1),h>x.slideamount&&(h=x.slideamount),x.startWithSlide=h-1}t.append('<div class="tp-loader '+x.spinner+'"><div class="dot1"></div><div class="dot2"></div><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>'),x.loader=t.find(".tp-loader"),0===t.find(".tp-bannertimer").length&&t.append('<div class="tp-bannertimer" style="visibility:hidden"></div>'),t.find(".tp-bannertimer").css({width:"0%"}),x.ul.css({display:"block"}),prepareSlides(t,x),("off"!==x.parallax.type||x.scrolleffect.on)&&_R.checkForParallax&&_R.checkForParallax(t,x),_R.setSize(x),"hero"!==x.sliderType&&_R.createNavigation&&_R.createNavigation(t,x),_R.resizeThumbsTabs&&_R.resizeThumbsTabs&&_R.resizeThumbsTabs(x),contWidthManager(x);var g=x.viewPort;x.inviewport=!1,g!=undefined&&g.enable&&(jQuery.isNumeric(g.visible_area)||-1!==g.visible_area.indexOf("%")&&(g.visible_area=parseInt(g.visible_area)/100),_R.scrollTicker&&_R.scrollTicker(x,t)),"carousel"===x.sliderType&&_R.prepareCarousel&&(punchgs.TweenLite.set(x.ul,{opacity:0}),_R.prepareCarousel(x,new punchgs.TimelineLite,undefined,0),x.onlyPreparedSlide=!0),setTimeout(function(){if(!g.enable||g.enable&&x.inviewport||g.enable&&!x.inviewport&&"wait"==!g.outof)swapSlide(t);else if(x.c.addClass("tp-waitforfirststart"),x.waitForFirstSlide=!0,g.presize){var e=jQuery(x.li[0]);loadImages(e,x,0,!0),waitForCurrentImages(e.find(".tp-layers"),x,function(){_R.animateTheCaptions({slide:e,opt:x,preset:!0})})}_R.manageNavigation&&_R.manageNavigation(x),1<x.slideamount&&(!g.enable||g.enable&&x.inviewport?countDown(t,x):x.waitForCountDown=!0),setTimeout(function(){t.trigger("revolution.slide.onloaded")},100)},x.startDelay),x.startDelay=0,jQuery("body").data("rs-fullScreenMode",!1),window.addEventListener("fullscreenchange",onFullScreenChange,{passive:!0}),window.addEventListener("mozfullscreenchange",onFullScreenChange,{passive:!0}),window.addEventListener("webkitfullscreenchange",onFullScreenChange,{passive:!0});var v="resize.revslider-"+t.attr("id");jQuery(window).on(v,function(){if(t==undefined)return!1;0!=jQuery("body").find(t)&&contWidthManager(x);var e=!1;if("fullscreen"==x.sliderLayout){var i=jQuery(window).height();"mobile"==x.fallbacks.ignoreHeightChanges&&_ISM||"always"==x.fallbacks.ignoreHeightChanges?(x.fallbacks.ignoreHeightChangesSize=x.fallbacks.ignoreHeightChangesSize==undefined?0:x.fallbacks.ignoreHeightChangesSize,e=i!=x.lastwindowheight&&Math.abs(i-x.lastwindowheight)>x.fallbacks.ignoreHeightChangesSize):e=i!=x.lastwindowheight}(t.outerWidth(!0)!=x.width||t.is(":hidden")||e)&&(x.lastwindowheight=jQuery(window).height(),containerResized(t,x))}),hideSliderUnder(t,x),contWidthManager(x),x.fallbacks.disableFocusListener||"true"==x.fallbacks.disableFocusListener||!0===x.fallbacks.disableFocusListener||(t.addClass("rev_redraw_on_blurfocus"),tabBlurringCheck())}},cArray=function(e,i){if(!jQuery.isArray(e)){var t=e;(e=new Array).push(t)}if(e.length<i){t=e[e.length-1];for(var a=0;a<i-e.length+2;a++)e.push(t)}return e},checkHoverDependencies=function(e,n){var i=e.data();("sliderenter"===i.start||i.frames!==undefined&&i.frames[0]!=undefined&&"sliderenter"===i.frames[0].delay)&&(n.layersonhover===undefined&&(n.c.on("tp-mouseenter",function(){n.layersonhover&&jQuery.each(n.layersonhover,function(e,i){var t=i.data("closestli")||i.closest(".tp-revslider-slidesli"),a=i.data("staticli")||i.closest(".tp-static-layers");i.data("closestli")===undefined&&(i.data("closestli",t),i.data("staticli",a)),(0<t.length&&t.hasClass("active-revslide")||t.hasClass("processing-revslide")||0<a.length)&&(i.data("animdirection","in"),_R.playAnimationFrame&&_R.playAnimationFrame({caption:i,opt:n,frame:"frame_0",triggerdirection:"in",triggerframein:"frame_0",triggerframeout:"frame_999"}),i.data("triggerstate","on"))})}),n.c.on("tp-mouseleft",function(){n.layersonhover&&jQuery.each(n.layersonhover,function(e,i){i.data("animdirection","out"),i.data("triggered",!0),i.data("triggerstate","off"),_R.stopVideo&&_R.stopVideo(i,n),_R.playAnimationFrame&&_R.playAnimationFrame({caption:i,opt:n,frame:"frame_999",triggerdirection:"out",triggerframein:"frame_0",triggerframeout:"frame_999"})})}),n.layersonhover=new Array),n.layersonhover.push(e))},contWidthManager=function(e){var i=_R.getHorizontalOffset(e.c,"left");if("auto"==e.sliderLayout||"fullscreen"===e.sliderLayout&&"on"==e.fullScreenAutoWidth)"fullscreen"==e.sliderLayout&&"on"==e.fullScreenAutoWidth?punchgs.TweenLite.set(e.ul,{left:0,width:e.c.width()}):punchgs.TweenLite.set(e.ul,{left:i,width:e.c.width()-_R.getHorizontalOffset(e.c,"both")});else{var t=Math.ceil(e.c.closest(".forcefullwidth_wrapper_tp_banner").offset().left-i);punchgs.TweenLite.set(e.c.parent(),{left:0-t+"px",width:jQuery(window).width()-_R.getHorizontalOffset(e.c,"both")})}e.slayers&&"fullwidth"!=e.sliderLayout&&"fullscreen"!=e.sliderLayout&&punchgs.TweenLite.set(e.slayers,{left:i})},cv=function(e,i){return e===undefined?i:e},hideSliderUnder=function(e,i,t){var a=e.parent();jQuery(window).width()<i.hideSliderAtLimit?(e.trigger("stoptimer"),"none"!=a.css("display")&&a.data("olddisplay",a.css("display")),a.css({display:"none"})):e.is(":hidden")&&t&&(a.data("olddisplay")!=undefined&&"undefined"!=a.data("olddisplay")&&"none"!=a.data("olddisplay")?a.css({display:a.data("olddisplay")}):a.css({display:"block"}),e.trigger("restarttimer"),setTimeout(function(){containerResized(e,i)},150)),_R.hideUnHideNav&&_R.hideUnHideNav(i)},containerResized=function(e,i){if(e.trigger("revolution.slide.beforeredraw"),1==i.infullscreenmode&&(i.minHeight=jQuery(window).height()),setCurWinRange(i),setCurWinRange(i,!0),!_R.resizeThumbsTabs||!0===_R.resizeThumbsTabs(i)){if(hideSliderUnder(e,i,!0),contWidthManager(i),"carousel"==i.sliderType&&_R.prepareCarousel(i,!0),e===undefined)return!1;_R.setSize(i),i.conw=i.c.width(),i.conh=i.infullscreenmode?i.minHeight:i.c.height();var t=e.find(".active-revslide .slotholder"),a=e.find(".processing-revslide .slotholder");removeSlots(e,i,e,2),"standard"===i.sliderType&&(punchgs.TweenLite.set(a.find(".defaultimg"),{opacity:0}),t.find(".defaultimg").css({opacity:1})),"carousel"===i.sliderType&&i.lastconw!=i.conw&&(clearTimeout(i.pcartimer),i.pcartimer=setTimeout(function(){_R.prepareCarousel(i,!0),"carousel"==i.sliderType&&"on"===i.carousel.showLayersAllTime&&jQuery.each(i.li,function(e){_R.animateTheCaptions({slide:jQuery(i.li[e]),opt:i,recall:!0})})},100),i.lastconw=i.conw),_R.manageNavigation&&_R.manageNavigation(i),_R.animateTheCaptions&&0<e.find(".active-revslide").length&&_R.animateTheCaptions({slide:e.find(".active-revslide"),opt:i,recall:!0}),"on"==a.data("kenburns")&&_R.startKenBurn(a,i,a.data("kbtl")!==undefined?a.data("kbtl").progress():0),"on"==t.data("kenburns")&&_R.startKenBurn(t,i,t.data("kbtl")!==undefined?t.data("kbtl").progress():0),_R.animateTheCaptions&&0<e.find(".processing-revslide").length&&_R.animateTheCaptions({slide:e.find(".processing-revslide"),opt:i,recall:!0}),_R.manageNavigation&&_R.manageNavigation(i)}e.trigger("revolution.slide.afterdraw")},setScale=function(e){e.bw=e.width/e.gridwidth[e.curWinRange],e.bh=e.height/e.gridheight[e.curWinRange],e.bh>e.bw?e.bh=e.bw:e.bw=e.bh,(1<e.bh||1<e.bw)&&(e.bw=1,e.bh=1)},prepareSlides=function(e,u){if(e.find(".tp-caption").each(function(){var e=jQuery(this);e.data("transition")!==undefined&&e.addClass(e.data("transition"))}),u.ul.css({overflow:"hidden",width:"100%",height:"100%",maxHeight:e.parent().css("maxHeight")}),"on"==u.autoHeight&&(u.ul.css({overflow:"hidden",width:"100%",height:"100%",maxHeight:"none"}),e.css({maxHeight:"none"}),e.parent().css({maxHeight:"none"})),u.allli.each(function(e){var i=jQuery(this),t=i.data("originalindex");(u.startWithSlide!=undefined&&t==u.startWithSlide||u.startWithSlide===undefined&&0==e)&&i.addClass("next-revslide"),i.css({width:"100%",height:"100%",overflow:"hidden"})}),"carousel"===u.sliderType){u.ul.css({overflow:"visible"}).wrap('<div class="tp-carousel-wrapper" style="width:100%;height:100%;position:absolute;top:0px;left:0px;overflow:hidden;"></div>');var i='<div style="clear:both;display:block;width:100%;height:1px;position:relative;margin-bottom:-1px"></div>';u.c.parent().prepend(i),u.c.parent().append(i),_R.prepareCarousel(u)}e.parent().css({overflow:"visible"}),u.allli.find(">img").each(function(e){var i=jQuery(this),t=i.closest("li"),a=t.find(".rs-background-video-layer");a.addClass("defaultvid").css({zIndex:30}),i.addClass("defaultimg"),"on"==u.fallbacks.panZoomDisableOnMobile&&_ISM&&(i.data("kenburns","off"),i.data("bgfit","cover"));var n=t.data("mediafilter");n="none"===n||n===undefined?"":n,i.wrap('<div class="slotholder" style="position:absolute; top:0px; left:0px; z-index:0;width:100%;height:100%;"></div>'),a.appendTo(t.find(".slotholder"));var r=i.data();i.closest(".slotholder").data(r),0<a.length&&r.bgparallax!=undefined&&(a.data("bgparallax",r.bgparallax),a.data("showcoveronpause","on")),"none"!=u.dottedOverlay&&u.dottedOverlay!=undefined&&i.closest(".slotholder").append('<div class="tp-dottedoverlay '+u.dottedOverlay+'"></div>');var o=i.attr("src");r.src=o,r.bgfit=r.bgfit||"cover",r.bgrepeat=r.bgrepeat||"no-repeat",r.bgposition=r.bgposition||"center center";i.closest(".slotholder");var s=i.data("bgcolor"),l="";l=s!==undefined&&0<=s.indexOf("gradient")?'"background:'+s+';width:100%;height:100%;"':'"background-color:'+s+";background-repeat:"+r.bgrepeat+";background-image:url("+o+");background-size:"+r.bgfit+";background-position:"+r.bgposition+';width:100%;height:100%;"',i.data("mediafilter",n),n="on"===i.data("kenburns")?"":n;var d=jQuery('<div class="tp-bgimg defaultimg '+n+'" data-bgcolor="'+s+'" style='+l+"></div>");i.parent().append(d);var c=document.createComment("Runtime Modification - Img tag is Still Available for SEO Goals in Source - "+i.get(0).outerHTML);i.replaceWith(c),d.data(r),d.attr("src",o),"standard"!==u.sliderType&&"undefined"!==u.sliderType||d.css({opacity:0})}),u.scrolleffect.on&&"on"===u.scrolleffect.on_slidebg&&(u.allslotholder=new Array,u.allli.find(".slotholder").each(function(){jQuery(this).wrap('<div style="display:block;position:absolute;top:0px;left:0px;width:100%;height:100%" class="slotholder_fadeoutwrap"></div>')}),u.allslotholder=u.c.find(".slotholder_fadeoutwrap"))},removeSlots=function(e,i,t,a){i.removePrepare=i.removePrepare+a,t.find(".slot, .slot-circle-wrapper").each(function(){jQuery(this).remove()}),i.transition=0,i.removePrepare=0},cutParams=function(e){var i=e;return e!=undefined&&0<e.length&&(i=e.split("?")[0]),i},relativeRedir=function(e){return location.pathname.replace(/(.*)\/[^/]*/,"$1/"+e)},abstorel=function(e,i){var t=e.split("/"),a=i.split("/");t.pop();for(var n=0;n<a.length;n++)"."!=a[n]&&(".."==a[n]?t.pop():t.push(a[n]));return t.join("/")},imgLoaded=function(l,e,d){e.syncload--,e.loadqueue&&jQuery.each(e.loadqueue,function(e,i){var t=i.src.replace(/\.\.\/\.\.\//gi,""),a=self.location.href,n=document.location.origin,r=a.substring(0,a.length-1)+"/"+t,o=n+"/"+t,s=abstorel(self.location.href,i.src);a=a.substring(0,a.length-1)+t,(cutParams(n+=t)===cutParams(decodeURIComponent(l.src))||cutParams(a)===cutParams(decodeURIComponent(l.src))||cutParams(s)===cutParams(decodeURIComponent(l.src))||cutParams(o)===cutParams(decodeURIComponent(l.src))||cutParams(r)===cutParams(decodeURIComponent(l.src))||cutParams(i.src)===cutParams(decodeURIComponent(l.src))||cutParams(i.src).replace(/^.*\/\/[^\/]+/,"")===cutParams(decodeURIComponent(l.src)).replace(/^.*\/\/[^\/]+/,"")||"file://"===window.location.origin&&cutParams(l.src).match(new RegExp(t)))&&(i.progress=d,i.width=l.width,i.height=l.height)}),progressImageLoad(e)},progressImageLoad=function(a){3!=a.syncload&&a.loadqueue&&jQuery.each(a.loadqueue,function(e,i){if(i.progress.match(/prepared/g)&&a.syncload<=3){if(a.syncload++,"img"==i.type){var t=new Image;t.onload=function(){imgLoaded(this,a,"loaded"),i.error=!1},t.onerror=function(){imgLoaded(this,a,"failed"),i.error=!0},t.src=i.src}else jQuery.get(i.src,function(e){i.innerHTML=(new XMLSerializer).serializeToString(e.documentElement),i.progress="loaded",a.syncload--,progressImageLoad(a)}).fail(function(){i.progress="failed",a.syncload--,progressImageLoad(a)});i.progress="inload"}})},addToLoadQueue=function(t,e,i,a,n){var r=!1;if(e.loadqueue&&jQuery.each(e.loadqueue,function(e,i){i.src===t&&(r=!0)}),!r){var o=new Object;o.src=t,o.starttoload=jQuery.now(),o.type=a||"img",o.prio=i,o.progress="prepared",o.static=n,e.loadqueue.push(o)}},loadImages=function(e,a,n,r){e.find("img,.defaultimg, .tp-svg-layer").each(function(){var e=jQuery(this),i=e.data("lazyload")!==undefined&&"undefined"!==e.data("lazyload")?e.data("lazyload"):e.data("svg_src")!=undefined?e.data("svg_src"):e.attr("src"),t=e.data("svg_src")!=undefined?"svg":"img";e.data("start-to-load",jQuery.now()),addToLoadQueue(i,a,n,t,r)}),progressImageLoad(a)},getLoadObj=function(e,t){var a=new Object;return e.loadqueue&&jQuery.each(e.loadqueue,function(e,i){i.src==t&&(a=i)}),a},waitForCurrentImages=function(o,s,e){var l=!1;o.find("img,.defaultimg, .tp-svg-layer").each(function(){var e=jQuery(this),i=e.data("lazyload")!=undefined?e.data("lazyload"):e.data("svg_src")!=undefined?e.data("svg_src"):e.attr("src"),t=getLoadObj(s,i);if(e.data("loaded")===undefined&&t!==undefined&&t.progress&&t.progress.match(/loaded/g)){if(e.attr("src",t.src),"img"==t.type)if(e.hasClass("defaultimg"))_R.isIE(8)?defimg.attr("src",t.src):-1==t.src.indexOf("images/transparent.png")&&-1==t.src.indexOf("assets/transparent.png")||e.data("bgcolor")===undefined?e.css({backgroundImage:'url("'+t.src+'")'}):e.data("bgcolor")!==undefined&&e.css({background:e.data("bgcolor")}),o.data("owidth",t.width),o.data("oheight",t.height),o.find(".slotholder").data("owidth",t.width),o.find(".slotholder").data("oheight",t.height);else{var a=e.data("ww"),n=e.data("hh");e.data("owidth",t.width),e.data("oheight",t.height),a=a==undefined||"auto"==a||""==a?t.width:a,n=n==undefined||"auto"==n||""==n?t.height:n,!jQuery.isNumeric(a)&&0<a.indexOf("%")&&(n=a),e.data("ww",a),e.data("hh",n)}else"svg"==t.type&&"loaded"==t.progress&&(e.append('<div class="tp-svg-innercontainer"></div>'),e.find(".tp-svg-innercontainer").append(t.innerHTML));e.data("loaded",!0)}if(t&&t.progress&&t.progress.match(/inprogress|inload|prepared/g)&&(!t.error&&jQuery.now()-e.data("start-to-load")<5e3?l=!0:(t.progress="failed",t.reported_img||(t.reported_img=!0,console.warn(i+"  Could not be loaded !")))),1==s.youtubeapineeded&&(!window.YT||YT.Player==undefined)&&(l=!0,5e3<jQuery.now()-s.youtubestarttime&&1!=s.youtubewarning)){s.youtubewarning=!0;var r="YouTube Api Could not be loaded !";"https:"===location.protocol&&(r+=" Please Check and Renew SSL Certificate !"),console.error(r),s.c.append('<div style="position:absolute;top:50%;width:100%;color:#e74c3c;  font-size:16px; text-align:center; padding:15px;background:#000; display:block;"><strong>'+r+"</strong></div>")}if(1==s.vimeoapineeded&&!window.Vimeo&&(l=!0,5e3<jQuery.now()-s.vimeostarttime&&1!=s.vimeowarning)){s.vimeowarning=!0;r="Vimeo Api Could not be loaded !";"https:"===location.protocol&&(r+=" Please Check and Renew SSL Certificate !"),console.error(r),s.c.append('<div style="position:absolute;top:50%;width:100%;color:#e74c3c;  font-size:16px; text-align:center; padding:15px;background:#000; display:block;"><strong>'+r+"</strong></div>")}}),!_ISM&&s.audioqueue&&0<s.audioqueue.length&&jQuery.each(s.audioqueue,function(e,i){i.status&&"prepared"===i.status&&jQuery.now()-i.start<i.waittime&&(l=!0)}),jQuery.each(s.loadqueue,function(e,i){!0!==i.static||"loaded"==i.progress&&"failed"!==i.progress||("failed"==i.progress?i.reported||(i.reported=!0,console.warn("Static Image "+i.src+"  Could not be loaded in time. Error Exists:"+i.error)):!i.error&&jQuery.now()-i.starttoload<5e3?l=!0:i.reported||(i.reported=!0,console.warn("Static Image "+i.src+"  Could not be loaded within 5s! Error Exists:"+i.error)))}),l?punchgs.TweenLite.delayedCall(.18,waitForCurrentImages,[o,s,e]):punchgs.TweenLite.delayedCall(.18,e)},swapSlide=function(e){var i=e[0].opt;if(clearTimeout(i.waitWithSwapSlide),0<e.find(".processing-revslide").length)return i.waitWithSwapSlide=setTimeout(function(){swapSlide(e)},150),!1;var t=e.find(".active-revslide"),a=e.find(".next-revslide"),n=a.find(".defaultimg");if("carousel"!==i.sliderType||i.carousel.fadein||(punchgs.TweenLite.to(i.ul,1,{opacity:1}),i.carousel.fadein=!0),a.index()===t.index()&&!0!==i.onlyPreparedSlide)return a.removeClass("next-revslide"),!1;!0===i.onlyPreparedSlide&&(i.onlyPreparedSlide=!1,jQuery(i.li[0]).addClass("processing-revslide")),a.removeClass("next-revslide").addClass("processing-revslide"),-1===a.index()&&"carousel"===i.sliderType&&(a=jQuery(i.li[0])),a.data("slide_on_focus_amount",a.data("slide_on_focus_amount")+1||1),"on"==i.stopLoop&&a.index()==i.lastslidetoshow-1&&(e.find(".tp-bannertimer").css({visibility:"hidden"}),e.trigger("revolution.slide.onstop"),i.noloopanymore=1),a.index()===i.slideamount-1&&(i.looptogo=i.looptogo-1,i.looptogo<=0&&(i.stopLoop="on")),i.tonpause=!0,e.trigger("stoptimer"),i.cd=0,"off"===i.spinner&&(i.loader!==undefined?i.loader.css({display:"none"}):i.loadertimer=setTimeout(function(){i.loader!==undefined&&i.loader.css({display:"block"})},50)),loadImages(a,i,1),_R.preLoadAudio&&_R.preLoadAudio(a,i,1),waitForCurrentImages(a,i,function(){a.find(".rs-background-video-layer").each(function(){var e=jQuery(this);e.hasClass("HasListener")||(e.data("bgvideo",1),_R.manageVideoLayer&&_R.manageVideoLayer(e,i)),0==e.find(".rs-fullvideo-cover").length&&e.append('<div class="rs-fullvideo-cover"></div>')}),swapSlideProgress(n,e)})},swapSlideProgress=function(e,i){var t=i.find(".active-revslide"),a=i.find(".processing-revslide"),n=t.find(".slotholder"),r=a.find(".slotholder"),o=i[0].opt;o.tonpause=!1,o.cd=0,clearTimeout(o.loadertimer),o.loader!==undefined&&o.loader.css({display:"none"}),_R.setSize(o),_R.slotSize(e,o),_R.manageNavigation&&_R.manageNavigation(o);var s={};s.nextslide=a,s.currentslide=t,i.trigger("revolution.slide.onbeforeswap",s),o.transition=1,o.videoplaying=!1,a.data("delay")!=undefined?(o.cd=0,o.delay=a.data("delay")):o.delay=o.origcd,"true"==a.data("ssop")||!0===a.data("ssop")?o.ssop=!0:o.ssop=!1,i.trigger("nulltimer");var l=t.index(),d=a.index();o.sdir=d<l?1:0,"arrow"==o.sc_indicator&&(0==l&&d==o.slideamount-1&&(o.sdir=1),l==o.slideamount-1&&0==d&&(o.sdir=0)),o.lsdir=o.lsdir===undefined?o.sdir:o.lsdir,o.dirc=o.lsdir!=o.sdir,o.lsdir=o.sdir,t.index()!=a.index()&&1!=o.firststart&&_R.removeTheCaptions&&_R.removeTheCaptions(t,o),a.hasClass("rs-pause-timer-once")||a.hasClass("rs-pause-timer-always")?o.videoplaying=!0:i.trigger("restarttimer"),a.removeClass("rs-pause-timer-once");var c;if(o.currentSlide=t.index(),o.nextSlide=a.index(),"carousel"==o.sliderType)c=new punchgs.TimelineLite,_R.prepareCarousel(o,c),letItFree(i,r,n,a,t,c),o.transition=0,o.firststart=0;else{(c=new punchgs.TimelineLite({onComplete:function(){letItFree(i,r,n,a,t,c)}})).add(punchgs.TweenLite.set(r.find(".defaultimg"),{opacity:0})),c.pause(),_R.animateTheCaptions&&_R.animateTheCaptions({slide:a,opt:o,preset:!0}),1==o.firststart&&(punchgs.TweenLite.set(t,{autoAlpha:0}),o.firststart=0),punchgs.TweenLite.set(t,{zIndex:18}),punchgs.TweenLite.set(a,{autoAlpha:0,zIndex:20}),"prepared"==a.data("differentissplayed")&&(a.data("differentissplayed","done"),a.data("transition",a.data("savedtransition")),a.data("slotamount",a.data("savedslotamount")),a.data("masterspeed",a.data("savedmasterspeed"))),a.data("fstransition")!=undefined&&"done"!=a.data("differentissplayed")&&(a.data("savedtransition",a.data("transition")),a.data("savedslotamount",a.data("slotamount")),a.data("savedmasterspeed",a.data("masterspeed")),a.data("transition",a.data("fstransition")),a.data("slotamount",a.data("fsslotamount")),a.data("masterspeed",a.data("fsmasterspeed")),a.data("differentissplayed","prepared")),a.data("transition")==undefined&&a.data("transition","random"),0;var u=a.data("transition")!==undefined?a.data("transition").split(","):"fade",p=a.data("nexttransid")==undefined?-1:a.data("nexttransid");"on"==a.data("randomtransition")?p=Math.round(Math.random()*u.length):p+=1,p==u.length&&(p=0),a.data("nexttransid",p);var f=u[p];o.ie&&("boxfade"==f&&(f="boxslide"),"slotfade-vertical"==f&&(f="slotzoom-vertical"),"slotfade-horizontal"==f&&(f="slotzoom-horizontal")),_R.isIE(8)&&(f=11),c=_R.animateSlide(0,f,i,a,t,r,n,c),"on"==r.data("kenburns")&&(_R.startKenBurn(r,o),c.add(punchgs.TweenLite.set(r,{autoAlpha:0}))),c.pause()}_R.scrollHandling&&(_R.scrollHandling(o,!0,0),c.eventCallback("onUpdate",function(){_R.scrollHandling(o,!0,0)})),"off"!=o.parallax.type&&o.parallax.firstgo==undefined&&_R.scrollHandling&&(o.parallax.firstgo=!0,o.lastscrolltop=-999,_R.scrollHandling(o,!0,0),setTimeout(function(){o.lastscrolltop=-999,_R.scrollHandling(o,!0,0)},210),setTimeout(function(){o.lastscrolltop=-999,_R.scrollHandling(o,!0,0)},420)),_R.animateTheCaptions?"carousel"===o.sliderType&&"on"===o.carousel.showLayersAllTime?(jQuery.each(o.li,function(e){o.carousel.allLayersStarted?_R.animateTheCaptions({slide:jQuery(o.li[e]),opt:o,recall:!0}):o.li[e]===a?_R.animateTheCaptions({slide:jQuery(o.li[e]),maintimeline:c,opt:o,startslideanimat:0}):_R.animateTheCaptions({slide:jQuery(o.li[e]),opt:o,startslideanimat:0})}),o.carousel.allLayersStarted=!0):_R.animateTheCaptions({slide:a,opt:o,maintimeline:c,startslideanimat:0}):c!=undefined&&setTimeout(function(){c.resume()},30),punchgs.TweenLite.to(a,.001,{autoAlpha:1})},letItFree=function(e,i,t,a,n,r){var o=e[0].opt;"carousel"===o.sliderType||(o.removePrepare=0,punchgs.TweenLite.to(i.find(".defaultimg"),.001,{zIndex:20,autoAlpha:1,onComplete:function(){removeSlots(e,o,a,1)}}),a.index()!=n.index()&&punchgs.TweenLite.to(n,.2,{zIndex:18,autoAlpha:0,onComplete:function(){removeSlots(e,o,n,1)}})),e.find(".active-revslide").removeClass("active-revslide"),e.find(".processing-revslide").removeClass("processing-revslide").addClass("active-revslide"),o.act=a.index(),o.c.attr("data-slideactive",e.find(".active-revslide").data("index")),"scroll"!=o.parallax.type&&"scroll+mouse"!=o.parallax.type&&"mouse+scroll"!=o.parallax.type||(o.lastscrolltop=-999,_R.scrollHandling(o)),r.clear(),t.data("kbtl")!=undefined&&(t.data("kbtl").reverse(),t.data("kbtl").timeScale(25)),"on"==i.data("kenburns")&&(i.data("kbtl")!=undefined?(i.data("kbtl").timeScale(1),i.data("kbtl").play()):_R.startKenBurn(i,o)),a.find(".rs-background-video-layer").each(function(e){if(_ISM&&!o.fallbacks.allowHTML5AutoPlayOnAndroid)return!1;var i=jQuery(this);_R.resetVideo(i,o,!1,!0),punchgs.TweenLite.fromTo(i,1,{autoAlpha:0},{autoAlpha:1,ease:punchgs.Power3.easeInOut,delay:.2,onComplete:function(){_R.animcompleted&&_R.animcompleted(i,o)}})}),n.find(".rs-background-video-layer").each(function(e){if(_ISM)return!1;var i=jQuery(this);_R.stopVideo&&(_R.resetVideo(i,o),_R.stopVideo(i,o)),punchgs.TweenLite.to(i,1,{autoAlpha:0,ease:punchgs.Power3.easeInOut,delay:.2})});var s={};if(s.slideIndex=a.index()+1,s.slideLIIndex=a.index(),s.slide=a,s.currentslide=a,s.prevslide=n,o.last_shown_slide=n.index(),e.trigger("revolution.slide.onchange",s),e.trigger("revolution.slide.onafterswap",s),o.startWithSlide!==undefined&&"done"!==o.startWithSlide&&"carousel"===o.sliderType){for(var l=o.startWithSlide,d=0;d<=o.li.length-1;d++){jQuery(o.li[d]).data("originalindex")===o.startWithSlide&&(l=d)}0!==l&&_R.callingNewSlide(o.c,l),o.startWithSlide="done"}o.duringslidechange=!1;var c=n.data("slide_on_focus_amount"),u=n.data("hideafterloop");0!=u&&u<=c&&o.c.revremoveslide(n.index());var p=-1===o.nextSlide||o.nextSlide===undefined?0:o.nextSlide;o.rowzones!=undefined&&(p=p>o.rowzones.length?o.rowzones.length:p),o.rowzones!=undefined&&0<o.rowzones.length&&o.rowzones[p]!=undefined&&0<=p&&p<=o.rowzones.length&&0<o.rowzones[p].length&&_R.setSize(o)},removeAllListeners=function(e,i){e.children().each(function(){try{jQuery(this).die("click")}catch(e){}try{jQuery(this).die("mouseenter")}catch(e){}try{jQuery(this).die("mouseleave")}catch(e){}try{jQuery(this).unbind("hover")}catch(e){}});try{e.die("click","mouseenter","mouseleave")}catch(e){}clearInterval(i.cdint),e=null},countDown=function(e,i){i.cd=0,i.loop=0,i.stopAfterLoops!=undefined&&-1<i.stopAfterLoops?i.looptogo=i.stopAfterLoops:i.looptogo=9999999,i.stopAtSlide!=undefined&&-1<i.stopAtSlide?i.lastslidetoshow=i.stopAtSlide:i.lastslidetoshow=999,i.stopLoop="off",0==i.looptogo&&(i.stopLoop="on");var t=e.find(".tp-bannertimer");e.on("stoptimer",function(){var e=jQuery(this).find(".tp-bannertimer");e[0].tween.pause(),"on"==i.disableProgressBar&&e.css({visibility:"hidden"}),i.sliderstatus="paused",_R.unToggleState(i.slidertoggledby)}),e.on("starttimer",function(){i.forcepause_viatoggle||(1!=i.conthover&&1!=i.videoplaying&&i.width>i.hideSliderAtLimit&&1!=i.tonpause&&1!=i.overnav&&1!=i.ssop&&(1===i.noloopanymore||i.viewPort.enable&&!i.inviewport||(t.css({visibility:"visible"}),t[0].tween.resume(),i.sliderstatus="playing")),"on"==i.disableProgressBar&&t.css({visibility:"hidden"}),_R.toggleState(i.slidertoggledby))}),e.on("restarttimer",function(){if(!i.forcepause_viatoggle){var e=jQuery(this).find(".tp-bannertimer");if(i.mouseoncontainer&&"on"==i.navigation.onHoverStop&&!_ISM)return!1;1===i.noloopanymore||i.viewPort.enable&&!i.inviewport||1==i.ssop||(e.css({visibility:"visible"}),e[0].tween.kill(),e[0].tween=punchgs.TweenLite.fromTo(e,i.delay/1e3,{width:"0%"},{force3D:"auto",width:"100%",ease:punchgs.Linear.easeNone,onComplete:a,delay:1}),i.sliderstatus="playing"),"on"==i.disableProgressBar&&e.css({visibility:"hidden"}),_R.toggleState(i.slidertoggledby)}}),e.on("nulltimer",function(){t[0].tween.kill(),t[0].tween=punchgs.TweenLite.fromTo(t,i.delay/1e3,{width:"0%"},{force3D:"auto",width:"100%",ease:punchgs.Linear.easeNone,onComplete:a,delay:1}),t[0].tween.pause(0),"on"==i.disableProgressBar&&t.css({visibility:"hidden"}),i.sliderstatus="paused"});var a=function(){0==jQuery("body").find(e).length&&(removeAllListeners(e,i),clearInterval(i.cdint)),e.trigger("revolution.slide.slideatend"),1==e.data("conthover-changed")&&(i.conthover=e.data("conthover"),e.data("conthover-changed",0)),_R.callingNewSlide(e,1)};t[0].tween=punchgs.TweenLite.fromTo(t,i.delay/1e3,{width:"0%"},{force3D:"auto",width:"100%",ease:punchgs.Linear.easeNone,onComplete:a,delay:1}),1<i.slideamount&&(0!=i.stopAfterLoops||1!=i.stopAtSlide)?e.trigger("starttimer"):(i.noloopanymore=1,e.trigger("nulltimer")),e.on("tp-mouseenter",function(){i.mouseoncontainer=!0,"on"!=i.navigation.onHoverStop||_ISM||(e.trigger("stoptimer"),e.trigger("revolution.slide.onpause"))}),e.on("tp-mouseleft",function(){i.mouseoncontainer=!1,1!=e.data("conthover")&&"on"==i.navigation.onHoverStop&&(1==i.viewPort.enable&&i.inviewport||0==i.viewPort.enable)&&(e.trigger("revolution.slide.onresume"),e.trigger("starttimer"))})},vis=function(){var i,t,e={hidden:"visibilitychange",webkitHidden:"webkitvisibilitychange",mozHidden:"mozvisibilitychange",msHidden:"msvisibilitychange"};for(i in e)if(i in document){t=e[i];break}return function(e){return e&&document.addEventListener(t,e,{pasive:!0}),!document[i]}}(),restartOnFocus=function(){jQuery(".rev_redraw_on_blurfocus").each(function(){var e=jQuery(this)[0].opt;if(e==undefined||e.c==undefined||0===e.c.length)return!1;1!=e.windowfocused&&(e.windowfocused=!0,punchgs.TweenLite.delayedCall(.3,function(){"on"==e.fallbacks.nextSlideOnWindowFocus&&e.c.revnext(),e.c.revredraw(),"playing"==e.lastsliderstatus&&e.c.revresume()}))})},lastStatBlur=function(){jQuery(".rev_redraw_on_blurfocus").each(function(){var e=jQuery(this)[0].opt;e.windowfocused=!1,e.lastsliderstatus=e.sliderstatus,e.c.revpause();var i=e.c.find(".active-revslide .slotholder"),t=e.c.find(".processing-revslide .slotholder");"on"==t.data("kenburns")&&_R.stopKenBurn(t,e),"on"==i.data("kenburns")&&_R.stopKenBurn(i,e)})},tabBlurringCheck=function(){var e=document.documentMode===undefined,i=window.chrome;1!==jQuery("body").data("revslider_focus_blur_listener")&&(jQuery("body").data("revslider_focus_blur_listener",1),e&&!i?jQuery(window).on("focusin",function(){restartOnFocus()}).on("focusout",function(){lastStatBlur()}):window.addEventListener?(window.addEventListener("focus",function(e){restartOnFocus()},{capture:!1,passive:!0}),window.addEventListener("blur",function(e){lastStatBlur()},{capture:!1,passive:!0})):(window.attachEvent("focus",function(e){restartOnFocus()}),window.attachEvent("blur",function(e){lastStatBlur()})))},getUrlVars=function(e){for(var i,t=[],a=window.location.href.slice(window.location.href.indexOf(e)+1).split("_"),n=0;n<a.length;n++)a[n]=a[n].replace("%3D","="),i=a[n].split("="),t.push(i[0]),t[i[0]]=i[1];return t}}(jQuery);
/********************************************
	-	THEMEPUNCH TOOLS Ver. 1.0     -
	 Last Update of Tools 08.03.2018
*********************************************/


/*
* @fileOverview TouchSwipe - jQuery Plugin
* @version 1.6.9
*
* @author Matt Bryson http://www.github.com/mattbryson
* @see https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
* @see http://labs.skinkers.com/touchSwipe/
* @see http://plugins.jquery.com/project/touchSwipe
*
* Copyright (c) 2010 Matt Bryson
* Dual licensed under the MIT or GPL Version 2 licenses.
*
*/



(function(a){if(typeof define==="function"&&define.amd&&define.amd.jQuery){define(["jquery"],a)}else{a(jQuery)}}(function(f){var y="1.6.9",p="left",o="right",e="up",x="down",c="in",A="out",m="none",s="auto",l="swipe",t="pinch",B="tap",j="doubletap",b="longtap",z="hold",E="horizontal",u="vertical",i="all",r=10,g="start",k="move",h="end",q="cancel",a="ontouchstart" in window,v=window.navigator.msPointerEnabled&&!window.navigator.pointerEnabled,d=window.navigator.pointerEnabled||window.navigator.msPointerEnabled,C="TouchSwipe";var n={fingers:1,threshold:75,cancelThreshold:null,pinchThreshold:20,maxTimeThreshold:null,fingerReleaseThreshold:250,longTapThreshold:500,doubleTapThreshold:200,swipe:null,swipeLeft:null,swipeRight:null,swipeUp:null,swipeDown:null,swipeStatus:null,pinchIn:null,pinchOut:null,pinchStatus:null,click:null,tap:null,doubleTap:null,longTap:null,hold:null,triggerOnTouchEnd:true,triggerOnTouchLeave:false,allowPageScroll:"auto",fallbackToMouseEvents:true,excludedElements:"label, button, input, select, textarea, a, .noSwipe",preventDefaultEvents:true};f.fn.swipetp=function(H){var G=f(this),F=G.data(C);if(F&&typeof H==="string"){if(F[H]){return F[H].apply(this,Array.prototype.slice.call(arguments,1))}else{f.error("Method "+H+" does not exist on jQuery.swipetp")}}else{if(!F&&(typeof H==="object"||!H)){return w.apply(this,arguments)}}return G};f.fn.swipetp.version=y;f.fn.swipetp.defaults=n;f.fn.swipetp.phases={PHASE_START:g,PHASE_MOVE:k,PHASE_END:h,PHASE_CANCEL:q};f.fn.swipetp.directions={LEFT:p,RIGHT:o,UP:e,DOWN:x,IN:c,OUT:A};f.fn.swipetp.pageScroll={NONE:m,HORIZONTAL:E,VERTICAL:u,AUTO:s};f.fn.swipetp.fingers={ONE:1,TWO:2,THREE:3,ALL:i};function w(F){if(F&&(F.allowPageScroll===undefined&&(F.swipe!==undefined||F.swipeStatus!==undefined))){F.allowPageScroll=m}if(F.click!==undefined&&F.tap===undefined){F.tap=F.click}if(!F){F={}}F=f.extend({},f.fn.swipetp.defaults,F);return this.each(function(){var H=f(this);var G=H.data(C);if(!G){G=new D(this,F);H.data(C,G)}})}function D(a5,aw){var aA=(a||d||!aw.fallbackToMouseEvents),K=aA?(d?(v?"MSPointerDown":"pointerdown"):"touchstart"):"mousedown",az=aA?(d?(v?"MSPointerMove":"pointermove"):"touchmove"):"mousemove",V=aA?(d?(v?"MSPointerUp":"pointerup"):"touchend"):"mouseup",T=aA?null:"mouseleave",aE=(d?(v?"MSPointerCancel":"pointercancel"):"touchcancel");var ah=0,aQ=null,ac=0,a2=0,a0=0,H=1,ar=0,aK=0,N=null;var aS=f(a5);var aa="start";var X=0;var aR=null;var U=0,a3=0,a6=0,ae=0,O=0;var aX=null,ag=null;try{aS.bind(K,aO);aS.bind(aE,ba)}catch(al){f.error("events not supported "+K+","+aE+" on jQuery.swipetp")}this.enable=function(){aS.bind(K,aO);aS.bind(aE,ba);return aS};this.disable=function(){aL();return aS};this.destroy=function(){aL();aS.data(C,null);aS=null};this.option=function(bd,bc){if(aw[bd]!==undefined){if(bc===undefined){return aw[bd]}else{aw[bd]=bc}}else{f.error("Option "+bd+" does not exist on jQuery.swipetp.options")}return null};function aO(be){if(aC()){return}if(f(be.target).closest(aw.excludedElements,aS).length>0){return}var bf=be.originalEvent?be.originalEvent:be;var bd,bg=bf.touches,bc=bg?bg[0]:bf;aa=g;if(bg){X=bg.length}else{be.preventDefault()}ah=0;aQ=null;aK=null;ac=0;a2=0;a0=0;H=1;ar=0;aR=ak();N=ab();S();if(!bg||(X===aw.fingers||aw.fingers===i)||aY()){aj(0,bc);U=au();if(X==2){aj(1,bg[1]);a2=a0=av(aR[0].start,aR[1].start)}if(aw.swipeStatus||aw.pinchStatus){bd=P(bf,aa)}}else{bd=false}if(bd===false){aa=q;P(bf,aa);return bd}else{if(aw.hold){ag=setTimeout(f.proxy(function(){aS.trigger("hold",[bf.target]);if(aw.hold){bd=aw.hold.call(aS,bf,bf.target)}},this),aw.longTapThreshold)}ap(true)}return null}function a4(bf){var bi=bf.originalEvent?bf.originalEvent:bf;if(aa===h||aa===q||an()){return}var be,bj=bi.touches,bd=bj?bj[0]:bi;var bg=aI(bd);a3=au();if(bj){X=bj.length}if(aw.hold){clearTimeout(ag)}aa=k;if(X==2){if(a2==0){aj(1,bj[1]);a2=a0=av(aR[0].start,aR[1].start)}else{aI(bj[1]);a0=av(aR[0].end,aR[1].end);aK=at(aR[0].end,aR[1].end)}H=a8(a2,a0);ar=Math.abs(a2-a0)}if((X===aw.fingers||aw.fingers===i)||!bj||aY()){aQ=aM(bg.start,bg.end);am(bf,aQ);ah=aT(bg.start,bg.end);ac=aN();aJ(aQ,ah);if(aw.swipeStatus||aw.pinchStatus){be=P(bi,aa)}if(!aw.triggerOnTouchEnd||aw.triggerOnTouchLeave){var bc=true;if(aw.triggerOnTouchLeave){var bh=aZ(this);bc=F(bg.end,bh)}if(!aw.triggerOnTouchEnd&&bc){aa=aD(k)}else{if(aw.triggerOnTouchLeave&&!bc){aa=aD(h)}}if(aa==q||aa==h){P(bi,aa)}}}else{aa=q;P(bi,aa)}if(be===false){aa=q;P(bi,aa)}}function M(bc){var bd=bc.originalEvent?bc.originalEvent:bc,be=bd.touches;if(be){if(be.length){G();return true}}if(an()){X=ae}a3=au();ac=aN();if(bb()||!ao()){aa=q;P(bd,aa)}else{if(aw.triggerOnTouchEnd||(aw.triggerOnTouchEnd==false&&aa===k)){bc.preventDefault();aa=h;P(bd,aa)}else{if(!aw.triggerOnTouchEnd&&a7()){aa=h;aG(bd,aa,B)}else{if(aa===k){aa=q;P(bd,aa)}}}}ap(false);return null}function ba(){X=0;a3=0;U=0;a2=0;a0=0;H=1;S();ap(false)}function L(bc){var bd=bc.originalEvent?bc.originalEvent:bc;if(aw.triggerOnTouchLeave){aa=aD(h);P(bd,aa)}}function aL(){aS.unbind(K,aO);aS.unbind(aE,ba);aS.unbind(az,a4);aS.unbind(V,M);if(T){aS.unbind(T,L)}ap(false)}function aD(bg){var bf=bg;var be=aB();var bd=ao();var bc=bb();if(!be||bc){bf=q}else{if(bd&&bg==k&&(!aw.triggerOnTouchEnd||aw.triggerOnTouchLeave)){bf=h}else{if(!bd&&bg==h&&aw.triggerOnTouchLeave){bf=q}}}return bf}function P(be,bc){var bd,bf=be.touches;if((J()||W())||(Q()||aY())){if(J()||W()){bd=aG(be,bc,l)}if((Q()||aY())&&bd!==false){bd=aG(be,bc,t)}}else{if(aH()&&bd!==false){bd=aG(be,bc,j)}else{if(aq()&&bd!==false){bd=aG(be,bc,b)}else{if(ai()&&bd!==false){bd=aG(be,bc,B)}}}}if(bc===q){ba(be)}if(bc===h){if(bf){if(!bf.length){ba(be)}}else{ba(be)}}return bd}function aG(bf,bc,be){var bd;if(be==l){aS.trigger("swipeStatus",[bc,aQ||null,ah||0,ac||0,X,aR]);if(aw.swipeStatus){bd=aw.swipeStatus.call(aS,bf,bc,aQ||null,ah||0,ac||0,X,aR);if(bd===false){return false}}if(bc==h&&aW()){aS.trigger("swipe",[aQ,ah,ac,X,aR]);if(aw.swipe){bd=aw.swipe.call(aS,bf,aQ,ah,ac,X,aR);if(bd===false){return false}}switch(aQ){case p:aS.trigger("swipeLeft",[aQ,ah,ac,X,aR]);if(aw.swipeLeft){bd=aw.swipeLeft.call(aS,bf,aQ,ah,ac,X,aR)}break;case o:aS.trigger("swipeRight",[aQ,ah,ac,X,aR]);if(aw.swipeRight){bd=aw.swipeRight.call(aS,bf,aQ,ah,ac,X,aR)}break;case e:aS.trigger("swipeUp",[aQ,ah,ac,X,aR]);if(aw.swipeUp){bd=aw.swipeUp.call(aS,bf,aQ,ah,ac,X,aR)}break;case x:aS.trigger("swipeDown",[aQ,ah,ac,X,aR]);if(aw.swipeDown){bd=aw.swipeDown.call(aS,bf,aQ,ah,ac,X,aR)}break}}}if(be==t){aS.trigger("pinchStatus",[bc,aK||null,ar||0,ac||0,X,H,aR]);if(aw.pinchStatus){bd=aw.pinchStatus.call(aS,bf,bc,aK||null,ar||0,ac||0,X,H,aR);if(bd===false){return false}}if(bc==h&&a9()){switch(aK){case c:aS.trigger("pinchIn",[aK||null,ar||0,ac||0,X,H,aR]);if(aw.pinchIn){bd=aw.pinchIn.call(aS,bf,aK||null,ar||0,ac||0,X,H,aR)}break;case A:aS.trigger("pinchOut",[aK||null,ar||0,ac||0,X,H,aR]);if(aw.pinchOut){bd=aw.pinchOut.call(aS,bf,aK||null,ar||0,ac||0,X,H,aR)}break}}}if(be==B){if(bc===q||bc===h){clearTimeout(aX);clearTimeout(ag);if(Z()&&!I()){O=au();aX=setTimeout(f.proxy(function(){O=null;aS.trigger("tap",[bf.target]);if(aw.tap){bd=aw.tap.call(aS,bf,bf.target)}},this),aw.doubleTapThreshold)}else{O=null;aS.trigger("tap",[bf.target]);if(aw.tap){bd=aw.tap.call(aS,bf,bf.target)}}}}else{if(be==j){if(bc===q||bc===h){clearTimeout(aX);O=null;aS.trigger("doubletap",[bf.target]);if(aw.doubleTap){bd=aw.doubleTap.call(aS,bf,bf.target)}}}else{if(be==b){if(bc===q||bc===h){clearTimeout(aX);O=null;aS.trigger("longtap",[bf.target]);if(aw.longTap){bd=aw.longTap.call(aS,bf,bf.target)}}}}}return bd}function ao(){var bc=true;if(aw.threshold!==null){bc=ah>=aw.threshold}return bc}function bb(){var bc=false;if(aw.cancelThreshold!==null&&aQ!==null){bc=(aU(aQ)-ah)>=aw.cancelThreshold}return bc}function af(){if(aw.pinchThreshold!==null){return ar>=aw.pinchThreshold}return true}function aB(){var bc;if(aw.maxTimeThreshold){if(ac>=aw.maxTimeThreshold){bc=false}else{bc=true}}else{bc=true}return bc}function am(bc,bd){if(aw.preventDefaultEvents===false){return}if(aw.allowPageScroll===m){bc.preventDefault()}else{var be=aw.allowPageScroll===s;switch(bd){case p:if((aw.swipeLeft&&be)||(!be&&aw.allowPageScroll!=E)){bc.preventDefault()}break;case o:if((aw.swipeRight&&be)||(!be&&aw.allowPageScroll!=E)){bc.preventDefault()}break;case e:if((aw.swipeUp&&be)||(!be&&aw.allowPageScroll!=u)){bc.preventDefault()}break;case x:if((aw.swipeDown&&be)||(!be&&aw.allowPageScroll!=u)){bc.preventDefault()}break}}}function a9(){var bd=aP();var bc=Y();var be=af();return bd&&bc&&be}function aY(){return !!(aw.pinchStatus||aw.pinchIn||aw.pinchOut)}function Q(){return !!(a9()&&aY())}function aW(){var bf=aB();var bh=ao();var be=aP();var bc=Y();var bd=bb();var bg=!bd&&bc&&be&&bh&&bf;return bg}function W(){return !!(aw.swipe||aw.swipeStatus||aw.swipeLeft||aw.swipeRight||aw.swipeUp||aw.swipeDown)}function J(){return !!(aW()&&W())}function aP(){return((X===aw.fingers||aw.fingers===i)||!a)}function Y(){return aR[0].end.x!==0}function a7(){return !!(aw.tap)}function Z(){return !!(aw.doubleTap)}function aV(){return !!(aw.longTap)}function R(){if(O==null){return false}var bc=au();return(Z()&&((bc-O)<=aw.doubleTapThreshold))}function I(){return R()}function ay(){return((X===1||!a)&&(isNaN(ah)||ah<aw.threshold))}function a1(){return((ac>aw.longTapThreshold)&&(ah<r))}function ai(){return !!(ay()&&a7())}function aH(){return !!(R()&&Z())}function aq(){return !!(a1()&&aV())}function G(){a6=au();ae=event.touches.length+1}function S(){a6=0;ae=0}function an(){var bc=false;if(a6){var bd=au()-a6;if(bd<=aw.fingerReleaseThreshold){bc=true}}return bc}function aC(){return !!(aS.data(C+"_intouch")===true)}function ap(bc){if(bc===true){aS.bind(az,a4);aS.bind(V,M);if(T){aS.bind(T,L)}}else{aS.unbind(az,a4,false);aS.unbind(V,M,false);if(T){aS.unbind(T,L,false)}}aS.data(C+"_intouch",bc===true)}function aj(bd,bc){var be=bc.identifier!==undefined?bc.identifier:0;aR[bd].identifier=be;aR[bd].start.x=aR[bd].end.x=bc.pageX||bc.clientX;aR[bd].start.y=aR[bd].end.y=bc.pageY||bc.clientY;return aR[bd]}function aI(bc){var be=bc.identifier!==undefined?bc.identifier:0;var bd=ad(be);bd.end.x=bc.pageX||bc.clientX;bd.end.y=bc.pageY||bc.clientY;return bd}function ad(bd){for(var bc=0;bc<aR.length;bc++){if(aR[bc].identifier==bd){return aR[bc]}}}function ak(){var bc=[];for(var bd=0;bd<=5;bd++){bc.push({start:{x:0,y:0},end:{x:0,y:0},identifier:0})}return bc}function aJ(bc,bd){bd=Math.max(bd,aU(bc));N[bc].distance=bd}function aU(bc){if(N[bc]){return N[bc].distance}return undefined}function ab(){var bc={};bc[p]=ax(p);bc[o]=ax(o);bc[e]=ax(e);bc[x]=ax(x);return bc}function ax(bc){return{direction:bc,distance:0}}function aN(){return a3-U}function av(bf,be){var bd=Math.abs(bf.x-be.x);var bc=Math.abs(bf.y-be.y);return Math.round(Math.sqrt(bd*bd+bc*bc))}function a8(bc,bd){var be=(bd/bc)*1;return be.toFixed(2)}function at(){if(H<1){return A}else{return c}}function aT(bd,bc){return Math.round(Math.sqrt(Math.pow(bc.x-bd.x,2)+Math.pow(bc.y-bd.y,2)))}function aF(bf,bd){var bc=bf.x-bd.x;var bh=bd.y-bf.y;var be=Math.atan2(bh,bc);var bg=Math.round(be*180/Math.PI);if(bg<0){bg=360-Math.abs(bg)}return bg}function aM(bd,bc){var be=aF(bd,bc);if((be<=45)&&(be>=0)){return p}else{if((be<=360)&&(be>=315)){return p}else{if((be>=135)&&(be<=225)){return o}else{if((be>45)&&(be<135)){return x}else{return e}}}}}function au(){var bc=new Date();return bc.getTime()}function aZ(bc){bc=f(bc);var be=bc.offset();var bd={left:be.left,right:be.left+bc.outerWidth(),top:be.top,bottom:be.top+bc.outerHeight()};return bd}function F(bc,bd){return(bc.x>bd.left&&bc.x<bd.right&&bc.y>bd.top&&bc.y<bd.bottom)}}}));

if(typeof(console) === 'undefined') {
    var console = {};
    console.log = console.error = console.info = console.debug = console.warn = console.trace = console.dir = console.dirxml = console.group = console.groupEnd = console.time = console.timeEnd = console.assert = console.profile = console.groupCollapsed = function() {};
}

if (window.tplogs==true)
	try {
		console.groupCollapsed("ThemePunch GreenSocks Logs");
	} catch(e) { }


var oldgs = window.GreenSockGlobals;
	oldgs_queue = window._gsQueue;
	
var punchgs = window.GreenSockGlobals = {};

if (window.tplogs==true)
	try {
		console.info("Build GreenSock SandBox for ThemePunch Plugins");
		console.info("GreenSock TweenLite Engine Initalised by ThemePunch Plugin");
	} catch(e) {}


/* TWEEN LITE */
/*!
 * VERSION: 1.19.1
 * DATE: 2017-01-17
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2017, GreenSock. All rights reserved.
 * This work is subject to the terms at http://greensock.com/standard-license or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
!function(a,b){"use strict";var c={},d=a.document,e=a.GreenSockGlobals=a.GreenSockGlobals||a;if(!e.TweenLite){var f,g,h,i,j,k=function(a){var b,c=a.split("."),d=e;for(b=0;b<c.length;b++)d[c[b]]=d=d[c[b]]||{};return d},l=k("com.greensock"),m=1e-10,n=function(a){var b,c=[],d=a.length;for(b=0;b!==d;c.push(a[b++]));return c},o=function(){},p=function(){var a=Object.prototype.toString,b=a.call([]);return function(c){return null!=c&&(c instanceof Array||"object"==typeof c&&!!c.push&&a.call(c)===b)}}(),q={},r=function(d,f,g,h){this.sc=q[d]?q[d].sc:[],q[d]=this,this.gsClass=null,this.func=g;var i=[];this.check=function(j){for(var l,m,n,o,p,s=f.length,t=s;--s>-1;)(l=q[f[s]]||new r(f[s],[])).gsClass?(i[s]=l.gsClass,t--):j&&l.sc.push(this);if(0===t&&g){if(m=("com.greensock."+d).split("."),n=m.pop(),o=k(m.join("."))[n]=this.gsClass=g.apply(g,i),h)if(e[n]=c[n]=o,p="undefined"!=typeof module&&module.exports,!p&&"function"==typeof define&&define.amd)define((a.GreenSockAMDPath?a.GreenSockAMDPath+"/":"")+d.split(".").pop(),[],function(){return o});else if(p)if(d===b){module.exports=c[b]=o;for(s in c)o[s]=c[s]}else c[b]&&(c[b][n]=o);for(s=0;s<this.sc.length;s++)this.sc[s].check()}},this.check(!0)},s=a._gsDefine=function(a,b,c,d){return new r(a,b,c,d)},t=l._class=function(a,b,c){return b=b||function(){},s(a,[],function(){return b},c),b};s.globals=e;var u=[0,0,1,1],v=t("easing.Ease",function(a,b,c,d){this._func=a,this._type=c||0,this._power=d||0,this._params=b?u.concat(b):u},!0),w=v.map={},x=v.register=function(a,b,c,d){for(var e,f,g,h,i=b.split(","),j=i.length,k=(c||"easeIn,easeOut,easeInOut").split(",");--j>-1;)for(f=i[j],e=d?t("easing."+f,null,!0):l.easing[f]||{},g=k.length;--g>-1;)h=k[g],w[f+"."+h]=w[h+f]=e[h]=a.getRatio?a:a[h]||new a};for(h=v.prototype,h._calcEnd=!1,h.getRatio=function(a){if(this._func)return this._params[0]=a,this._func.apply(null,this._params);var b=this._type,c=this._power,d=1===b?1-a:2===b?a:.5>a?2*a:2*(1-a);return 1===c?d*=d:2===c?d*=d*d:3===c?d*=d*d*d:4===c&&(d*=d*d*d*d),1===b?1-d:2===b?d:.5>a?d/2:1-d/2},f=["Linear","Quad","Cubic","Quart","Quint,Strong"],g=f.length;--g>-1;)h=f[g]+",Power"+g,x(new v(null,null,1,g),h,"easeOut",!0),x(new v(null,null,2,g),h,"easeIn"+(0===g?",easeNone":"")),x(new v(null,null,3,g),h,"easeInOut");w.linear=l.easing.Linear.easeIn,w.swing=l.easing.Quad.easeInOut;var y=t("events.EventDispatcher",function(a){this._listeners={},this._eventTarget=a||this});h=y.prototype,h.addEventListener=function(a,b,c,d,e){e=e||0;var f,g,h=this._listeners[a],k=0;for(this!==i||j||i.wake(),null==h&&(this._listeners[a]=h=[]),g=h.length;--g>-1;)f=h[g],f.c===b&&f.s===c?h.splice(g,1):0===k&&f.pr<e&&(k=g+1);h.splice(k,0,{c:b,s:c,up:d,pr:e})},h.removeEventListener=function(a,b){var c,d=this._listeners[a];if(d)for(c=d.length;--c>-1;)if(d[c].c===b)return void d.splice(c,1)},h.dispatchEvent=function(a){var b,c,d,e=this._listeners[a];if(e)for(b=e.length,b>1&&(e=e.slice(0)),c=this._eventTarget;--b>-1;)d=e[b],d&&(d.up?d.c.call(d.s||c,{type:a,target:c}):d.c.call(d.s||c))};var z=a.requestAnimationFrame,A=a.cancelAnimationFrame,B=Date.now||function(){return(new Date).getTime()},C=B();for(f=["ms","moz","webkit","o"],g=f.length;--g>-1&&!z;)z=a[f[g]+"RequestAnimationFrame"],A=a[f[g]+"CancelAnimationFrame"]||a[f[g]+"CancelRequestAnimationFrame"];t("Ticker",function(a,b){var c,e,f,g,h,k=this,l=B(),n=b!==!1&&z?"auto":!1,p=500,q=33,r="tick",s=function(a){var b,d,i=B()-C;i>p&&(l+=i-q),C+=i,k.time=(C-l)/1e3,b=k.time-h,(!c||b>0||a===!0)&&(k.frame++,h+=b+(b>=g?.004:g-b),d=!0),a!==!0&&(f=e(s)),d&&k.dispatchEvent(r)};y.call(k),k.time=k.frame=0,k.tick=function(){s(!0)},k.lagSmoothing=function(a,b){p=a||1/m,q=Math.min(b,p,0)},k.sleep=function(){null!=f&&(n&&A?A(f):clearTimeout(f),e=o,f=null,k===i&&(j=!1))},k.wake=function(a){null!==f?k.sleep():a?l+=-C+(C=B()):k.frame>10&&(C=B()-p+5),e=0===c?o:n&&z?z:function(a){return setTimeout(a,1e3*(h-k.time)+1|0)},k===i&&(j=!0),s(2)},k.fps=function(a){return arguments.length?(c=a,g=1/(c||60),h=this.time+g,void k.wake()):c},k.useRAF=function(a){return arguments.length?(k.sleep(),n=a,void k.fps(c)):n},k.fps(a),setTimeout(function(){"auto"===n&&k.frame<5&&"hidden"!==d.visibilityState&&k.useRAF(!1)},1500)}),h=l.Ticker.prototype=new l.events.EventDispatcher,h.constructor=l.Ticker;var D=t("core.Animation",function(a,b){if(this.vars=b=b||{},this._duration=this._totalDuration=a||0,this._delay=Number(b.delay)||0,this._timeScale=1,this._active=b.immediateRender===!0,this.data=b.data,this._reversed=b.reversed===!0,W){j||i.wake();var c=this.vars.useFrames?V:W;c.add(this,c._time),this.vars.paused&&this.paused(!0)}});i=D.ticker=new l.Ticker,h=D.prototype,h._dirty=h._gc=h._initted=h._paused=!1,h._totalTime=h._time=0,h._rawPrevTime=-1,h._next=h._last=h._onUpdate=h._timeline=h.timeline=null,h._paused=!1;var E=function(){j&&B()-C>2e3&&i.wake(),setTimeout(E,2e3)};E(),h.play=function(a,b){return null!=a&&this.seek(a,b),this.reversed(!1).paused(!1)},h.pause=function(a,b){return null!=a&&this.seek(a,b),this.paused(!0)},h.resume=function(a,b){return null!=a&&this.seek(a,b),this.paused(!1)},h.seek=function(a,b){return this.totalTime(Number(a),b!==!1)},h.restart=function(a,b){return this.reversed(!1).paused(!1).totalTime(a?-this._delay:0,b!==!1,!0)},h.reverse=function(a,b){return null!=a&&this.seek(a||this.totalDuration(),b),this.reversed(!0).paused(!1)},h.render=function(a,b,c){},h.invalidate=function(){return this._time=this._totalTime=0,this._initted=this._gc=!1,this._rawPrevTime=-1,(this._gc||!this.timeline)&&this._enabled(!0),this},h.isActive=function(){var a,b=this._timeline,c=this._startTime;return!b||!this._gc&&!this._paused&&b.isActive()&&(a=b.rawTime(!0))>=c&&a<c+this.totalDuration()/this._timeScale},h._enabled=function(a,b){return j||i.wake(),this._gc=!a,this._active=this.isActive(),b!==!0&&(a&&!this.timeline?this._timeline.add(this,this._startTime-this._delay):!a&&this.timeline&&this._timeline._remove(this,!0)),!1},h._kill=function(a,b){return this._enabled(!1,!1)},h.kill=function(a,b){return this._kill(a,b),this},h._uncache=function(a){for(var b=a?this:this.timeline;b;)b._dirty=!0,b=b.timeline;return this},h._swapSelfInParams=function(a){for(var b=a.length,c=a.concat();--b>-1;)"{self}"===a[b]&&(c[b]=this);return c},h._callback=function(a){var b=this.vars,c=b[a],d=b[a+"Params"],e=b[a+"Scope"]||b.callbackScope||this,f=d?d.length:0;switch(f){case 0:c.call(e);break;case 1:c.call(e,d[0]);break;case 2:c.call(e,d[0],d[1]);break;default:c.apply(e,d)}},h.eventCallback=function(a,b,c,d){if("on"===(a||"").substr(0,2)){var e=this.vars;if(1===arguments.length)return e[a];null==b?delete e[a]:(e[a]=b,e[a+"Params"]=p(c)&&-1!==c.join("").indexOf("{self}")?this._swapSelfInParams(c):c,e[a+"Scope"]=d),"onUpdate"===a&&(this._onUpdate=b)}return this},h.delay=function(a){return arguments.length?(this._timeline.smoothChildTiming&&this.startTime(this._startTime+a-this._delay),this._delay=a,this):this._delay},h.duration=function(a){return arguments.length?(this._duration=this._totalDuration=a,this._uncache(!0),this._timeline.smoothChildTiming&&this._time>0&&this._time<this._duration&&0!==a&&this.totalTime(this._totalTime*(a/this._duration),!0),this):(this._dirty=!1,this._duration)},h.totalDuration=function(a){return this._dirty=!1,arguments.length?this.duration(a):this._totalDuration},h.time=function(a,b){return arguments.length?(this._dirty&&this.totalDuration(),this.totalTime(a>this._duration?this._duration:a,b)):this._time},h.totalTime=function(a,b,c){if(j||i.wake(),!arguments.length)return this._totalTime;if(this._timeline){if(0>a&&!c&&(a+=this.totalDuration()),this._timeline.smoothChildTiming){this._dirty&&this.totalDuration();var d=this._totalDuration,e=this._timeline;if(a>d&&!c&&(a=d),this._startTime=(this._paused?this._pauseTime:e._time)-(this._reversed?d-a:a)/this._timeScale,e._dirty||this._uncache(!1),e._timeline)for(;e._timeline;)e._timeline._time!==(e._startTime+e._totalTime)/e._timeScale&&e.totalTime(e._totalTime,!0),e=e._timeline}this._gc&&this._enabled(!0,!1),(this._totalTime!==a||0===this._duration)&&(J.length&&Y(),this.render(a,b,!1),J.length&&Y())}return this},h.progress=h.totalProgress=function(a,b){var c=this.duration();return arguments.length?this.totalTime(c*a,b):c?this._time/c:this.ratio},h.startTime=function(a){return arguments.length?(a!==this._startTime&&(this._startTime=a,this.timeline&&this.timeline._sortChildren&&this.timeline.add(this,a-this._delay)),this):this._startTime},h.endTime=function(a){return this._startTime+(0!=a?this.totalDuration():this.duration())/this._timeScale},h.timeScale=function(a){if(!arguments.length)return this._timeScale;if(a=a||m,this._timeline&&this._timeline.smoothChildTiming){var b=this._pauseTime,c=b||0===b?b:this._timeline.totalTime();this._startTime=c-(c-this._startTime)*this._timeScale/a}return this._timeScale=a,this._uncache(!1)},h.reversed=function(a){return arguments.length?(a!=this._reversed&&(this._reversed=a,this.totalTime(this._timeline&&!this._timeline.smoothChildTiming?this.totalDuration()-this._totalTime:this._totalTime,!0)),this):this._reversed},h.paused=function(a){if(!arguments.length)return this._paused;var b,c,d=this._timeline;return a!=this._paused&&d&&(j||a||i.wake(),b=d.rawTime(),c=b-this._pauseTime,!a&&d.smoothChildTiming&&(this._startTime+=c,this._uncache(!1)),this._pauseTime=a?b:null,this._paused=a,this._active=this.isActive(),!a&&0!==c&&this._initted&&this.duration()&&(b=d.smoothChildTiming?this._totalTime:(b-this._startTime)/this._timeScale,this.render(b,b===this._totalTime,!0))),this._gc&&!a&&this._enabled(!0,!1),this};var F=t("core.SimpleTimeline",function(a){D.call(this,0,a),this.autoRemoveChildren=this.smoothChildTiming=!0});h=F.prototype=new D,h.constructor=F,h.kill()._gc=!1,h._first=h._last=h._recent=null,h._sortChildren=!1,h.add=h.insert=function(a,b,c,d){var e,f;if(a._startTime=Number(b||0)+a._delay,a._paused&&this!==a._timeline&&(a._pauseTime=a._startTime+(this.rawTime()-a._startTime)/a._timeScale),a.timeline&&a.timeline._remove(a,!0),a.timeline=a._timeline=this,a._gc&&a._enabled(!0,!0),e=this._last,this._sortChildren)for(f=a._startTime;e&&e._startTime>f;)e=e._prev;return e?(a._next=e._next,e._next=a):(a._next=this._first,this._first=a),a._next?a._next._prev=a:this._last=a,a._prev=e,this._recent=a,this._timeline&&this._uncache(!0),this},h._remove=function(a,b){return a.timeline===this&&(b||a._enabled(!1,!0),a._prev?a._prev._next=a._next:this._first===a&&(this._first=a._next),a._next?a._next._prev=a._prev:this._last===a&&(this._last=a._prev),a._next=a._prev=a.timeline=null,a===this._recent&&(this._recent=this._last),this._timeline&&this._uncache(!0)),this},h.render=function(a,b,c){var d,e=this._first;for(this._totalTime=this._time=this._rawPrevTime=a;e;)d=e._next,(e._active||a>=e._startTime&&!e._paused)&&(e._reversed?e.render((e._dirty?e.totalDuration():e._totalDuration)-(a-e._startTime)*e._timeScale,b,c):e.render((a-e._startTime)*e._timeScale,b,c)),e=d},h.rawTime=function(){return j||i.wake(),this._totalTime};var G=t("TweenLite",function(b,c,d){if(D.call(this,c,d),this.render=G.prototype.render,null==b)throw"Cannot tween a null target.";this.target=b="string"!=typeof b?b:G.selector(b)||b;var e,f,g,h=b.jquery||b.length&&b!==a&&b[0]&&(b[0]===a||b[0].nodeType&&b[0].style&&!b.nodeType),i=this.vars.overwrite;if(this._overwrite=i=null==i?U[G.defaultOverwrite]:"number"==typeof i?i>>0:U[i],(h||b instanceof Array||b.push&&p(b))&&"number"!=typeof b[0])for(this._targets=g=n(b),this._propLookup=[],this._siblings=[],e=0;e<g.length;e++)f=g[e],f?"string"!=typeof f?f.length&&f!==a&&f[0]&&(f[0]===a||f[0].nodeType&&f[0].style&&!f.nodeType)?(g.splice(e--,1),this._targets=g=g.concat(n(f))):(this._siblings[e]=Z(f,this,!1),1===i&&this._siblings[e].length>1&&_(f,this,null,1,this._siblings[e])):(f=g[e--]=G.selector(f),"string"==typeof f&&g.splice(e+1,1)):g.splice(e--,1);else this._propLookup={},this._siblings=Z(b,this,!1),1===i&&this._siblings.length>1&&_(b,this,null,1,this._siblings);(this.vars.immediateRender||0===c&&0===this._delay&&this.vars.immediateRender!==!1)&&(this._time=-m,this.render(Math.min(0,-this._delay)))},!0),H=function(b){return b&&b.length&&b!==a&&b[0]&&(b[0]===a||b[0].nodeType&&b[0].style&&!b.nodeType)},I=function(a,b){var c,d={};for(c in a)T[c]||c in b&&"transform"!==c&&"x"!==c&&"y"!==c&&"width"!==c&&"height"!==c&&"className"!==c&&"border"!==c||!(!Q[c]||Q[c]&&Q[c]._autoCSS)||(d[c]=a[c],delete a[c]);a.css=d};h=G.prototype=new D,h.constructor=G,h.kill()._gc=!1,h.ratio=0,h._firstPT=h._targets=h._overwrittenProps=h._startAt=null,h._notifyPluginsOfEnabled=h._lazy=!1,G.version="1.19.1",G.defaultEase=h._ease=new v(null,null,1,1),G.defaultOverwrite="auto",G.ticker=i,G.autoSleep=120,G.lagSmoothing=function(a,b){i.lagSmoothing(a,b)},G.selector=a.$||a.jQuery||function(b){var c=a.$||a.jQuery;return c?(G.selector=c,c(b)):"undefined"==typeof d?b:d.querySelectorAll?d.querySelectorAll(b):d.getElementById("#"===b.charAt(0)?b.substr(1):b)};var J=[],K={},L=/(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi,M=function(a){for(var b,c=this._firstPT,d=1e-6;c;)b=c.blob?1===a?this.end:a?this.join(""):this.start:c.c*a+c.s,c.m?b=c.m(b,this._target||c.t):d>b&&b>-d&&!c.blob&&(b=0),c.f?c.fp?c.t[c.p](c.fp,b):c.t[c.p](b):c.t[c.p]=b,c=c._next},N=function(a,b,c,d){var e,f,g,h,i,j,k,l=[],m=0,n="",o=0;for(l.start=a,l.end=b,a=l[0]=a+"",b=l[1]=b+"",c&&(c(l),a=l[0],b=l[1]),l.length=0,e=a.match(L)||[],f=b.match(L)||[],d&&(d._next=null,d.blob=1,l._firstPT=l._applyPT=d),i=f.length,h=0;i>h;h++)k=f[h],j=b.substr(m,b.indexOf(k,m)-m),n+=j||!h?j:",",m+=j.length,o?o=(o+1)%5:"rgba("===j.substr(-5)&&(o=1),k===e[h]||e.length<=h?n+=k:(n&&(l.push(n),n=""),g=parseFloat(e[h]),l.push(g),l._firstPT={_next:l._firstPT,t:l,p:l.length-1,s:g,c:("="===k.charAt(1)?parseInt(k.charAt(0)+"1",10)*parseFloat(k.substr(2)):parseFloat(k)-g)||0,f:0,m:o&&4>o?Math.round:0}),m+=k.length;return n+=b.substr(m),n&&l.push(n),l.setRatio=M,l},O=function(a,b,c,d,e,f,g,h,i){"function"==typeof d&&(d=d(i||0,a));var j,k=typeof a[b],l="function"!==k?"":b.indexOf("set")||"function"!=typeof a["get"+b.substr(3)]?b:"get"+b.substr(3),m="get"!==c?c:l?g?a[l](g):a[l]():a[b],n="string"==typeof d&&"="===d.charAt(1),o={t:a,p:b,s:m,f:"function"===k,pg:0,n:e||b,m:f?"function"==typeof f?f:Math.round:0,pr:0,c:n?parseInt(d.charAt(0)+"1",10)*parseFloat(d.substr(2)):parseFloat(d)-m||0};return("number"!=typeof m||"number"!=typeof d&&!n)&&(g||isNaN(m)||!n&&isNaN(d)||"boolean"==typeof m||"boolean"==typeof d?(o.fp=g,j=N(m,n?o.s+o.c:d,h||G.defaultStringFilter,o),o={t:j,p:"setRatio",s:0,c:1,f:2,pg:0,n:e||b,pr:0,m:0}):(o.s=parseFloat(m),n||(o.c=parseFloat(d)-o.s||0))),o.c?((o._next=this._firstPT)&&(o._next._prev=o),this._firstPT=o,o):void 0},P=G._internals={isArray:p,isSelector:H,lazyTweens:J,blobDif:N},Q=G._plugins={},R=P.tweenLookup={},S=0,T=P.reservedProps={ease:1,delay:1,overwrite:1,onComplete:1,onCompleteParams:1,onCompleteScope:1,useFrames:1,runBackwards:1,startAt:1,onUpdate:1,onUpdateParams:1,onUpdateScope:1,onStart:1,onStartParams:1,onStartScope:1,onReverseComplete:1,onReverseCompleteParams:1,onReverseCompleteScope:1,onRepeat:1,onRepeatParams:1,onRepeatScope:1,easeParams:1,yoyo:1,immediateRender:1,repeat:1,repeatDelay:1,data:1,paused:1,reversed:1,autoCSS:1,lazy:1,onOverwrite:1,callbackScope:1,stringFilter:1,id:1},U={none:0,all:1,auto:2,concurrent:3,allOnStart:4,preexisting:5,"true":1,"false":0},V=D._rootFramesTimeline=new F,W=D._rootTimeline=new F,X=30,Y=P.lazyRender=function(){var a,b=J.length;for(K={};--b>-1;)a=J[b],a&&a._lazy!==!1&&(a.render(a._lazy[0],a._lazy[1],!0),a._lazy=!1);J.length=0};W._startTime=i.time,V._startTime=i.frame,W._active=V._active=!0,setTimeout(Y,1),D._updateRoot=G.render=function(){var a,b,c;if(J.length&&Y(),W.render((i.time-W._startTime)*W._timeScale,!1,!1),V.render((i.frame-V._startTime)*V._timeScale,!1,!1),J.length&&Y(),i.frame>=X){X=i.frame+(parseInt(G.autoSleep,10)||120);for(c in R){for(b=R[c].tweens,a=b.length;--a>-1;)b[a]._gc&&b.splice(a,1);0===b.length&&delete R[c]}if(c=W._first,(!c||c._paused)&&G.autoSleep&&!V._first&&1===i._listeners.tick.length){for(;c&&c._paused;)c=c._next;c||i.sleep()}}},i.addEventListener("tick",D._updateRoot);var Z=function(a,b,c){var d,e,f=a._gsTweenID;if(R[f||(a._gsTweenID=f="t"+S++)]||(R[f]={target:a,tweens:[]}),b&&(d=R[f].tweens,d[e=d.length]=b,c))for(;--e>-1;)d[e]===b&&d.splice(e,1);return R[f].tweens},$=function(a,b,c,d){var e,f,g=a.vars.onOverwrite;return g&&(e=g(a,b,c,d)),g=G.onOverwrite,g&&(f=g(a,b,c,d)),e!==!1&&f!==!1},_=function(a,b,c,d,e){var f,g,h,i;if(1===d||d>=4){for(i=e.length,f=0;i>f;f++)if((h=e[f])!==b)h._gc||h._kill(null,a,b)&&(g=!0);else if(5===d)break;return g}var j,k=b._startTime+m,l=[],n=0,o=0===b._duration;for(f=e.length;--f>-1;)(h=e[f])===b||h._gc||h._paused||(h._timeline!==b._timeline?(j=j||aa(b,0,o),0===aa(h,j,o)&&(l[n++]=h)):h._startTime<=k&&h._startTime+h.totalDuration()/h._timeScale>k&&((o||!h._initted)&&k-h._startTime<=2e-10||(l[n++]=h)));for(f=n;--f>-1;)if(h=l[f],2===d&&h._kill(c,a,b)&&(g=!0),2!==d||!h._firstPT&&h._initted){if(2!==d&&!$(h,b))continue;h._enabled(!1,!1)&&(g=!0)}return g},aa=function(a,b,c){for(var d=a._timeline,e=d._timeScale,f=a._startTime;d._timeline;){if(f+=d._startTime,e*=d._timeScale,d._paused)return-100;d=d._timeline}return f/=e,f>b?f-b:c&&f===b||!a._initted&&2*m>f-b?m:(f+=a.totalDuration()/a._timeScale/e)>b+m?0:f-b-m};h._init=function(){var a,b,c,d,e,f,g=this.vars,h=this._overwrittenProps,i=this._duration,j=!!g.immediateRender,k=g.ease;if(g.startAt){this._startAt&&(this._startAt.render(-1,!0),this._startAt.kill()),e={};for(d in g.startAt)e[d]=g.startAt[d];if(e.overwrite=!1,e.immediateRender=!0,e.lazy=j&&g.lazy!==!1,e.startAt=e.delay=null,this._startAt=G.to(this.target,0,e),j)if(this._time>0)this._startAt=null;else if(0!==i)return}else if(g.runBackwards&&0!==i)if(this._startAt)this._startAt.render(-1,!0),this._startAt.kill(),this._startAt=null;else{0!==this._time&&(j=!1),c={};for(d in g)T[d]&&"autoCSS"!==d||(c[d]=g[d]);if(c.overwrite=0,c.data="isFromStart",c.lazy=j&&g.lazy!==!1,c.immediateRender=j,this._startAt=G.to(this.target,0,c),j){if(0===this._time)return}else this._startAt._init(),this._startAt._enabled(!1),this.vars.immediateRender&&(this._startAt=null)}if(this._ease=k=k?k instanceof v?k:"function"==typeof k?new v(k,g.easeParams):w[k]||G.defaultEase:G.defaultEase,g.easeParams instanceof Array&&k.config&&(this._ease=k.config.apply(k,g.easeParams)),this._easeType=this._ease._type,this._easePower=this._ease._power,this._firstPT=null,this._targets)for(f=this._targets.length,a=0;f>a;a++)this._initProps(this._targets[a],this._propLookup[a]={},this._siblings[a],h?h[a]:null,a)&&(b=!0);else b=this._initProps(this.target,this._propLookup,this._siblings,h,0);if(b&&G._onPluginEvent("_onInitAllProps",this),h&&(this._firstPT||"function"!=typeof this.target&&this._enabled(!1,!1)),g.runBackwards)for(c=this._firstPT;c;)c.s+=c.c,c.c=-c.c,c=c._next;this._onUpdate=g.onUpdate,this._initted=!0},h._initProps=function(b,c,d,e,f){var g,h,i,j,k,l;if(null==b)return!1;K[b._gsTweenID]&&Y(),this.vars.css||b.style&&b!==a&&b.nodeType&&Q.css&&this.vars.autoCSS!==!1&&I(this.vars,b);for(g in this.vars)if(l=this.vars[g],T[g])l&&(l instanceof Array||l.push&&p(l))&&-1!==l.join("").indexOf("{self}")&&(this.vars[g]=l=this._swapSelfInParams(l,this));else if(Q[g]&&(j=new Q[g])._onInitTween(b,this.vars[g],this,f)){for(this._firstPT=k={_next:this._firstPT,t:j,p:"setRatio",s:0,c:1,f:1,n:g,pg:1,pr:j._priority,m:0},h=j._overwriteProps.length;--h>-1;)c[j._overwriteProps[h]]=this._firstPT;(j._priority||j._onInitAllProps)&&(i=!0),(j._onDisable||j._onEnable)&&(this._notifyPluginsOfEnabled=!0),k._next&&(k._next._prev=k)}else c[g]=O.call(this,b,g,"get",l,g,0,null,this.vars.stringFilter,f);return e&&this._kill(e,b)?this._initProps(b,c,d,e,f):this._overwrite>1&&this._firstPT&&d.length>1&&_(b,this,c,this._overwrite,d)?(this._kill(c,b),this._initProps(b,c,d,e,f)):(this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration)&&(K[b._gsTweenID]=!0),i)},h.render=function(a,b,c){var d,e,f,g,h=this._time,i=this._duration,j=this._rawPrevTime;if(a>=i-1e-7&&a>=0)this._totalTime=this._time=i,this.ratio=this._ease._calcEnd?this._ease.getRatio(1):1,this._reversed||(d=!0,e="onComplete",c=c||this._timeline.autoRemoveChildren),0===i&&(this._initted||!this.vars.lazy||c)&&(this._startTime===this._timeline._duration&&(a=0),(0>j||0>=a&&a>=-1e-7||j===m&&"isPause"!==this.data)&&j!==a&&(c=!0,j>m&&(e="onReverseComplete")),this._rawPrevTime=g=!b||a||j===a?a:m);else if(1e-7>a)this._totalTime=this._time=0,this.ratio=this._ease._calcEnd?this._ease.getRatio(0):0,(0!==h||0===i&&j>0)&&(e="onReverseComplete",d=this._reversed),0>a&&(this._active=!1,0===i&&(this._initted||!this.vars.lazy||c)&&(j>=0&&(j!==m||"isPause"!==this.data)&&(c=!0),this._rawPrevTime=g=!b||a||j===a?a:m)),this._initted||(c=!0);else if(this._totalTime=this._time=a,this._easeType){var k=a/i,l=this._easeType,n=this._easePower;(1===l||3===l&&k>=.5)&&(k=1-k),3===l&&(k*=2),1===n?k*=k:2===n?k*=k*k:3===n?k*=k*k*k:4===n&&(k*=k*k*k*k),1===l?this.ratio=1-k:2===l?this.ratio=k:.5>a/i?this.ratio=k/2:this.ratio=1-k/2}else this.ratio=this._ease.getRatio(a/i);if(this._time!==h||c){if(!this._initted){if(this._init(),!this._initted||this._gc)return;if(!c&&this._firstPT&&(this.vars.lazy!==!1&&this._duration||this.vars.lazy&&!this._duration))return this._time=this._totalTime=h,this._rawPrevTime=j,J.push(this),void(this._lazy=[a,b]);this._time&&!d?this.ratio=this._ease.getRatio(this._time/i):d&&this._ease._calcEnd&&(this.ratio=this._ease.getRatio(0===this._time?0:1))}for(this._lazy!==!1&&(this._lazy=!1),this._active||!this._paused&&this._time!==h&&a>=0&&(this._active=!0),0===h&&(this._startAt&&(a>=0?this._startAt.render(a,b,c):e||(e="_dummyGS")),this.vars.onStart&&(0!==this._time||0===i)&&(b||this._callback("onStart"))),f=this._firstPT;f;)f.f?f.t[f.p](f.c*this.ratio+f.s):f.t[f.p]=f.c*this.ratio+f.s,f=f._next;this._onUpdate&&(0>a&&this._startAt&&a!==-1e-4&&this._startAt.render(a,b,c),b||(this._time!==h||d||c)&&this._callback("onUpdate")),e&&(!this._gc||c)&&(0>a&&this._startAt&&!this._onUpdate&&a!==-1e-4&&this._startAt.render(a,b,c),d&&(this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!b&&this.vars[e]&&this._callback(e),0===i&&this._rawPrevTime===m&&g!==m&&(this._rawPrevTime=0))}},h._kill=function(a,b,c){if("all"===a&&(a=null),null==a&&(null==b||b===this.target))return this._lazy=!1,this._enabled(!1,!1);b="string"!=typeof b?b||this._targets||this.target:G.selector(b)||b;var d,e,f,g,h,i,j,k,l,m=c&&this._time&&c._startTime===this._startTime&&this._timeline===c._timeline;if((p(b)||H(b))&&"number"!=typeof b[0])for(d=b.length;--d>-1;)this._kill(a,b[d],c)&&(i=!0);else{if(this._targets){for(d=this._targets.length;--d>-1;)if(b===this._targets[d]){h=this._propLookup[d]||{},this._overwrittenProps=this._overwrittenProps||[],e=this._overwrittenProps[d]=a?this._overwrittenProps[d]||{}:"all";break}}else{if(b!==this.target)return!1;h=this._propLookup,e=this._overwrittenProps=a?this._overwrittenProps||{}:"all"}if(h){if(j=a||h,k=a!==e&&"all"!==e&&a!==h&&("object"!=typeof a||!a._tempKill),c&&(G.onOverwrite||this.vars.onOverwrite)){for(f in j)h[f]&&(l||(l=[]),l.push(f));if((l||!a)&&!$(this,c,b,l))return!1}for(f in j)(g=h[f])&&(m&&(g.f?g.t[g.p](g.s):g.t[g.p]=g.s,i=!0),g.pg&&g.t._kill(j)&&(i=!0),g.pg&&0!==g.t._overwriteProps.length||(g._prev?g._prev._next=g._next:g===this._firstPT&&(this._firstPT=g._next),g._next&&(g._next._prev=g._prev),g._next=g._prev=null),delete h[f]),k&&(e[f]=1);!this._firstPT&&this._initted&&this._enabled(!1,!1)}}return i},h.invalidate=function(){return this._notifyPluginsOfEnabled&&G._onPluginEvent("_onDisable",this),this._firstPT=this._overwrittenProps=this._startAt=this._onUpdate=null,this._notifyPluginsOfEnabled=this._active=this._lazy=!1,this._propLookup=this._targets?{}:[],D.prototype.invalidate.call(this),this.vars.immediateRender&&(this._time=-m,this.render(Math.min(0,-this._delay))),this},h._enabled=function(a,b){if(j||i.wake(),a&&this._gc){var c,d=this._targets;if(d)for(c=d.length;--c>-1;)this._siblings[c]=Z(d[c],this,!0);else this._siblings=Z(this.target,this,!0)}return D.prototype._enabled.call(this,a,b),this._notifyPluginsOfEnabled&&this._firstPT?G._onPluginEvent(a?"_onEnable":"_onDisable",this):!1},G.to=function(a,b,c){return new G(a,b,c)},G.from=function(a,b,c){return c.runBackwards=!0,c.immediateRender=0!=c.immediateRender,new G(a,b,c)},G.fromTo=function(a,b,c,d){return d.startAt=c,d.immediateRender=0!=d.immediateRender&&0!=c.immediateRender,new G(a,b,d)},G.delayedCall=function(a,b,c,d,e){return new G(b,0,{delay:a,onComplete:b,onCompleteParams:c,callbackScope:d,onReverseComplete:b,onReverseCompleteParams:c,immediateRender:!1,lazy:!1,useFrames:e,overwrite:0})},G.set=function(a,b){return new G(a,0,b)},G.getTweensOf=function(a,b){if(null==a)return[];a="string"!=typeof a?a:G.selector(a)||a;var c,d,e,f;if((p(a)||H(a))&&"number"!=typeof a[0]){for(c=a.length,d=[];--c>-1;)d=d.concat(G.getTweensOf(a[c],b));for(c=d.length;--c>-1;)for(f=d[c],e=c;--e>-1;)f===d[e]&&d.splice(c,1)}else for(d=Z(a).concat(),c=d.length;--c>-1;)(d[c]._gc||b&&!d[c].isActive())&&d.splice(c,1);return d},G.killTweensOf=G.killDelayedCallsTo=function(a,b,c){"object"==typeof b&&(c=b,b=!1);for(var d=G.getTweensOf(a,b),e=d.length;--e>-1;)d[e]._kill(c,a)};var ba=t("plugins.TweenPlugin",function(a,b){this._overwriteProps=(a||"").split(","),this._propName=this._overwriteProps[0],this._priority=b||0,this._super=ba.prototype},!0);if(h=ba.prototype,ba.version="1.19.0",ba.API=2,h._firstPT=null,h._addTween=O,h.setRatio=M,h._kill=function(a){var b,c=this._overwriteProps,d=this._firstPT;if(null!=a[this._propName])this._overwriteProps=[];else for(b=c.length;--b>-1;)null!=a[c[b]]&&c.splice(b,1);for(;d;)null!=a[d.n]&&(d._next&&(d._next._prev=d._prev),d._prev?(d._prev._next=d._next,d._prev=null):this._firstPT===d&&(this._firstPT=d._next)),d=d._next;return!1},h._mod=h._roundProps=function(a){for(var b,c=this._firstPT;c;)b=a[this._propName]||null!=c.n&&a[c.n.split(this._propName+"_").join("")],b&&"function"==typeof b&&(2===c.f?c.t._applyPT.m=b:c.m=b),c=c._next},G._onPluginEvent=function(a,b){var c,d,e,f,g,h=b._firstPT;if("_onInitAllProps"===a){for(;h;){for(g=h._next,d=e;d&&d.pr>h.pr;)d=d._next;(h._prev=d?d._prev:f)?h._prev._next=h:e=h,(h._next=d)?d._prev=h:f=h,h=g}h=b._firstPT=e}for(;h;)h.pg&&"function"==typeof h.t[a]&&h.t[a]()&&(c=!0),h=h._next;return c},ba.activate=function(a){for(var b=a.length;--b>-1;)a[b].API===ba.API&&(Q[(new a[b])._propName]=a[b]);return!0},s.plugin=function(a){if(!(a&&a.propName&&a.init&&a.API))throw"illegal plugin definition.";var b,c=a.propName,d=a.priority||0,e=a.overwriteProps,f={init:"_onInitTween",set:"setRatio",kill:"_kill",round:"_mod",mod:"_mod",initAll:"_onInitAllProps"},g=t("plugins."+c.charAt(0).toUpperCase()+c.substr(1)+"Plugin",function(){ba.call(this,c,d),this._overwriteProps=e||[]},a.global===!0),h=g.prototype=new ba(c);h.constructor=g,g.API=a.API;for(b in f)"function"==typeof a[b]&&(h[f[b]]=a[b]);return g.version=a.version,ba.activate([g]),g},f=a._gsQueue){for(g=0;g<f.length;g++)f[g]();for(h in q)q[h].func||a.console.log("GSAP encountered missing dependency: "+h)}j=!1}}("undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window,"TweenLite");
/* TIME LINE LITE */
/*!
 * VERSION: 1.17.0
 * DATE: 2015-05-27
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2015, GreenSock. All rights reserved.
 * This work is subject to the terms at http://greensock.com/standard-license or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window;(_gsScope._gsQueue||(_gsScope._gsQueue=[])).push(function(){"use strict";_gsScope._gsDefine("TimelineLite",["core.Animation","core.SimpleTimeline","TweenLite"],function(t,e,i){var s=function(t){e.call(this,t),this._labels={},this.autoRemoveChildren=this.vars.autoRemoveChildren===!0,this.smoothChildTiming=this.vars.smoothChildTiming===!0,this._sortChildren=!0,this._onUpdate=this.vars.onUpdate;var i,s,r=this.vars;for(s in r)i=r[s],h(i)&&-1!==i.join("").indexOf("{self}")&&(r[s]=this._swapSelfInParams(i));h(r.tweens)&&this.add(r.tweens,0,r.align,r.stagger)},r=1e-10,n=i._internals,a=s._internals={},o=n.isSelector,h=n.isArray,l=n.lazyTweens,_=n.lazyRender,u=[],f=_gsScope._gsDefine.globals,c=function(t){var e,i={};for(e in t)i[e]=t[e];return i},p=a.pauseCallback=function(t,e,i,s){var n,a=t._timeline,o=a._totalTime,h=t._startTime,l=0>t._rawPrevTime||0===t._rawPrevTime&&a._reversed,_=l?0:r,f=l?r:0;if(e||!this._forcingPlayhead){for(a.pause(h),n=t._prev;n&&n._startTime===h;)n._rawPrevTime=f,n=n._prev;for(n=t._next;n&&n._startTime===h;)n._rawPrevTime=_,n=n._next;e&&e.apply(s||a.vars.callbackScope||a,i||u),(this._forcingPlayhead||!a._paused)&&a.seek(o)}},m=function(t){var e,i=[],s=t.length;for(e=0;e!==s;i.push(t[e++]));return i},d=s.prototype=new e;return s.version="1.17.0",d.constructor=s,d.kill()._gc=d._forcingPlayhead=!1,d.to=function(t,e,s,r){var n=s.repeat&&f.TweenMax||i;return e?this.add(new n(t,e,s),r):this.set(t,s,r)},d.from=function(t,e,s,r){return this.add((s.repeat&&f.TweenMax||i).from(t,e,s),r)},d.fromTo=function(t,e,s,r,n){var a=r.repeat&&f.TweenMax||i;return e?this.add(a.fromTo(t,e,s,r),n):this.set(t,r,n)},d.staggerTo=function(t,e,r,n,a,h,l,_){var u,f=new s({onComplete:h,onCompleteParams:l,callbackScope:_,smoothChildTiming:this.smoothChildTiming});for("string"==typeof t&&(t=i.selector(t)||t),t=t||[],o(t)&&(t=m(t)),n=n||0,0>n&&(t=m(t),t.reverse(),n*=-1),u=0;t.length>u;u++)r.startAt&&(r.startAt=c(r.startAt)),f.to(t[u],e,c(r),u*n);return this.add(f,a)},d.staggerFrom=function(t,e,i,s,r,n,a,o){return i.immediateRender=0!=i.immediateRender,i.runBackwards=!0,this.staggerTo(t,e,i,s,r,n,a,o)},d.staggerFromTo=function(t,e,i,s,r,n,a,o,h){return s.startAt=i,s.immediateRender=0!=s.immediateRender&&0!=i.immediateRender,this.staggerTo(t,e,s,r,n,a,o,h)},d.call=function(t,e,s,r){return this.add(i.delayedCall(0,t,e,s),r)},d.set=function(t,e,s){return s=this._parseTimeOrLabel(s,0,!0),null==e.immediateRender&&(e.immediateRender=s===this._time&&!this._paused),this.add(new i(t,0,e),s)},s.exportRoot=function(t,e){t=t||{},null==t.smoothChildTiming&&(t.smoothChildTiming=!0);var r,n,a=new s(t),o=a._timeline;for(null==e&&(e=!0),o._remove(a,!0),a._startTime=0,a._rawPrevTime=a._time=a._totalTime=o._time,r=o._first;r;)n=r._next,e&&r instanceof i&&r.target===r.vars.onComplete||a.add(r,r._startTime-r._delay),r=n;return o.add(a,0),a},d.add=function(r,n,a,o){var l,_,u,f,c,p;if("number"!=typeof n&&(n=this._parseTimeOrLabel(n,0,!0,r)),!(r instanceof t)){if(r instanceof Array||r&&r.push&&h(r)){for(a=a||"normal",o=o||0,l=n,_=r.length,u=0;_>u;u++)h(f=r[u])&&(f=new s({tweens:f})),this.add(f,l),"string"!=typeof f&&"function"!=typeof f&&("sequence"===a?l=f._startTime+f.totalDuration()/f._timeScale:"start"===a&&(f._startTime-=f.delay())),l+=o;return this._uncache(!0)}if("string"==typeof r)return this.addLabel(r,n);if("function"!=typeof r)throw"Cannot add "+r+" into the timeline; it is not a tween, timeline, function, or string.";r=i.delayedCall(0,r)}if(e.prototype.add.call(this,r,n),(this._gc||this._time===this._duration)&&!this._paused&&this._duration<this.duration())for(c=this,p=c.rawTime()>r._startTime;c._timeline;)p&&c._timeline.smoothChildTiming?c.totalTime(c._totalTime,!0):c._gc&&c._enabled(!0,!1),c=c._timeline;return this},d.remove=function(e){if(e instanceof t)return this._remove(e,!1);if(e instanceof Array||e&&e.push&&h(e)){for(var i=e.length;--i>-1;)this.remove(e[i]);return this}return"string"==typeof e?this.removeLabel(e):this.kill(null,e)},d._remove=function(t,i){e.prototype._remove.call(this,t,i);var s=this._last;return s?this._time>s._startTime+s._totalDuration/s._timeScale&&(this._time=this.duration(),this._totalTime=this._totalDuration):this._time=this._totalTime=this._duration=this._totalDuration=0,this},d.append=function(t,e){return this.add(t,this._parseTimeOrLabel(null,e,!0,t))},d.insert=d.insertMultiple=function(t,e,i,s){return this.add(t,e||0,i,s)},d.appendMultiple=function(t,e,i,s){return this.add(t,this._parseTimeOrLabel(null,e,!0,t),i,s)},d.addLabel=function(t,e){return this._labels[t]=this._parseTimeOrLabel(e),this},d.addPause=function(t,e,s,r){var n=i.delayedCall(0,p,["{self}",e,s,r],this);return n.data="isPause",this.add(n,t)},d.removeLabel=function(t){return delete this._labels[t],this},d.getLabelTime=function(t){return null!=this._labels[t]?this._labels[t]:-1},d._parseTimeOrLabel=function(e,i,s,r){var n;if(r instanceof t&&r.timeline===this)this.remove(r);else if(r&&(r instanceof Array||r.push&&h(r)))for(n=r.length;--n>-1;)r[n]instanceof t&&r[n].timeline===this&&this.remove(r[n]);if("string"==typeof i)return this._parseTimeOrLabel(i,s&&"number"==typeof e&&null==this._labels[i]?e-this.duration():0,s);if(i=i||0,"string"!=typeof e||!isNaN(e)&&null==this._labels[e])null==e&&(e=this.duration());else{if(n=e.indexOf("="),-1===n)return null==this._labels[e]?s?this._labels[e]=this.duration()+i:i:this._labels[e]+i;i=parseInt(e.charAt(n-1)+"1",10)*Number(e.substr(n+1)),e=n>1?this._parseTimeOrLabel(e.substr(0,n-1),0,s):this.duration()}return Number(e)+i},d.seek=function(t,e){return this.totalTime("number"==typeof t?t:this._parseTimeOrLabel(t),e!==!1)},d.stop=function(){return this.paused(!0)},d.gotoAndPlay=function(t,e){return this.play(t,e)},d.gotoAndStop=function(t,e){return this.pause(t,e)},d.render=function(t,e,i){this._gc&&this._enabled(!0,!1);var s,n,a,o,h,u=this._dirty?this.totalDuration():this._totalDuration,f=this._time,c=this._startTime,p=this._timeScale,m=this._paused;if(t>=u)this._totalTime=this._time=u,this._reversed||this._hasPausedChild()||(n=!0,o="onComplete",h=!!this._timeline.autoRemoveChildren,0===this._duration&&(0===t||0>this._rawPrevTime||this._rawPrevTime===r)&&this._rawPrevTime!==t&&this._first&&(h=!0,this._rawPrevTime>r&&(o="onReverseComplete"))),this._rawPrevTime=this._duration||!e||t||this._rawPrevTime===t?t:r,t=u+1e-4;else if(1e-7>t)if(this._totalTime=this._time=0,(0!==f||0===this._duration&&this._rawPrevTime!==r&&(this._rawPrevTime>0||0>t&&this._rawPrevTime>=0))&&(o="onReverseComplete",n=this._reversed),0>t)this._active=!1,this._timeline.autoRemoveChildren&&this._reversed?(h=n=!0,o="onReverseComplete"):this._rawPrevTime>=0&&this._first&&(h=!0),this._rawPrevTime=t;else{if(this._rawPrevTime=this._duration||!e||t||this._rawPrevTime===t?t:r,0===t&&n)for(s=this._first;s&&0===s._startTime;)s._duration||(n=!1),s=s._next;t=0,this._initted||(h=!0)}else this._totalTime=this._time=this._rawPrevTime=t;if(this._time!==f&&this._first||i||h){if(this._initted||(this._initted=!0),this._active||!this._paused&&this._time!==f&&t>0&&(this._active=!0),0===f&&this.vars.onStart&&0!==this._time&&(e||this._callback("onStart")),this._time>=f)for(s=this._first;s&&(a=s._next,!this._paused||m);)(s._active||s._startTime<=this._time&&!s._paused&&!s._gc)&&(s._reversed?s.render((s._dirty?s.totalDuration():s._totalDuration)-(t-s._startTime)*s._timeScale,e,i):s.render((t-s._startTime)*s._timeScale,e,i)),s=a;else for(s=this._last;s&&(a=s._prev,!this._paused||m);)(s._active||f>=s._startTime&&!s._paused&&!s._gc)&&(s._reversed?s.render((s._dirty?s.totalDuration():s._totalDuration)-(t-s._startTime)*s._timeScale,e,i):s.render((t-s._startTime)*s._timeScale,e,i)),s=a;this._onUpdate&&(e||(l.length&&_(),this._callback("onUpdate"))),o&&(this._gc||(c===this._startTime||p!==this._timeScale)&&(0===this._time||u>=this.totalDuration())&&(n&&(l.length&&_(),this._timeline.autoRemoveChildren&&this._enabled(!1,!1),this._active=!1),!e&&this.vars[o]&&this._callback(o)))}},d._hasPausedChild=function(){for(var t=this._first;t;){if(t._paused||t instanceof s&&t._hasPausedChild())return!0;t=t._next}return!1},d.getChildren=function(t,e,s,r){r=r||-9999999999;for(var n=[],a=this._first,o=0;a;)r>a._startTime||(a instanceof i?e!==!1&&(n[o++]=a):(s!==!1&&(n[o++]=a),t!==!1&&(n=n.concat(a.getChildren(!0,e,s)),o=n.length))),a=a._next;return n},d.getTweensOf=function(t,e){var s,r,n=this._gc,a=[],o=0;for(n&&this._enabled(!0,!0),s=i.getTweensOf(t),r=s.length;--r>-1;)(s[r].timeline===this||e&&this._contains(s[r]))&&(a[o++]=s[r]);return n&&this._enabled(!1,!0),a},d.recent=function(){return this._recent},d._contains=function(t){for(var e=t.timeline;e;){if(e===this)return!0;e=e.timeline}return!1},d.shiftChildren=function(t,e,i){i=i||0;for(var s,r=this._first,n=this._labels;r;)r._startTime>=i&&(r._startTime+=t),r=r._next;if(e)for(s in n)n[s]>=i&&(n[s]+=t);return this._uncache(!0)},d._kill=function(t,e){if(!t&&!e)return this._enabled(!1,!1);for(var i=e?this.getTweensOf(e):this.getChildren(!0,!0,!1),s=i.length,r=!1;--s>-1;)i[s]._kill(t,e)&&(r=!0);return r},d.clear=function(t){var e=this.getChildren(!1,!0,!0),i=e.length;for(this._time=this._totalTime=0;--i>-1;)e[i]._enabled(!1,!1);return t!==!1&&(this._labels={}),this._uncache(!0)},d.invalidate=function(){for(var e=this._first;e;)e.invalidate(),e=e._next;return t.prototype.invalidate.call(this)},d._enabled=function(t,i){if(t===this._gc)for(var s=this._first;s;)s._enabled(t,!0),s=s._next;return e.prototype._enabled.call(this,t,i)},d.totalTime=function(){this._forcingPlayhead=!0;var e=t.prototype.totalTime.apply(this,arguments);return this._forcingPlayhead=!1,e},d.duration=function(t){return arguments.length?(0!==this.duration()&&0!==t&&this.timeScale(this._duration/t),this):(this._dirty&&this.totalDuration(),this._duration)},d.totalDuration=function(t){if(!arguments.length){if(this._dirty){for(var e,i,s=0,r=this._last,n=999999999999;r;)e=r._prev,r._dirty&&r.totalDuration(),r._startTime>n&&this._sortChildren&&!r._paused?this.add(r,r._startTime-r._delay):n=r._startTime,0>r._startTime&&!r._paused&&(s-=r._startTime,this._timeline.smoothChildTiming&&(this._startTime+=r._startTime/this._timeScale),this.shiftChildren(-r._startTime,!1,-9999999999),n=0),i=r._startTime+r._totalDuration/r._timeScale,i>s&&(s=i),r=e;this._duration=this._totalDuration=s,this._dirty=!1}return this._totalDuration}return 0!==this.totalDuration()&&0!==t&&this.timeScale(this._totalDuration/t),this},d.paused=function(e){if(!e)for(var i=this._first,s=this._time;i;)i._startTime===s&&"isPause"===i.data&&(i._rawPrevTime=0),i=i._next;return t.prototype.paused.apply(this,arguments)},d.usesFrames=function(){for(var e=this._timeline;e._timeline;)e=e._timeline;return e===t._rootFramesTimeline},d.rawTime=function(){return this._paused?this._totalTime:(this._timeline.rawTime()-this._startTime)*this._timeScale},s},!0)}),_gsScope._gsDefine&&_gsScope._gsQueue.pop()(),function(t){"use strict";var e=function(){return(_gsScope.GreenSockGlobals||_gsScope)[t]};"function"==typeof define&&define.amd?define(["TweenLite"],e):"undefined"!=typeof module&&module.exports&&(require("./TweenLite.js"),module.exports=e())}("TimelineLite");


/* EASING PLUGIN*/
/*!
 * VERSION: 1.15.5
 * DATE: 2016-07-08
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2016, GreenSock. All rights reserved.
 * This work is subject to the terms at http://greensock.com/standard-license or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 **/
var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window;(_gsScope._gsQueue||(_gsScope._gsQueue=[])).push(function(){"use strict";_gsScope._gsDefine("easing.Back",["easing.Ease"],function(a){var b,c,d,e=_gsScope.GreenSockGlobals||_gsScope,f=e.com.greensock,g=2*Math.PI,h=Math.PI/2,i=f._class,j=function(b,c){var d=i("easing."+b,function(){},!0),e=d.prototype=new a;return e.constructor=d,e.getRatio=c,d},k=a.register||function(){},l=function(a,b,c,d,e){var f=i("easing."+a,{easeOut:new b,easeIn:new c,easeInOut:new d},!0);return k(f,a),f},m=function(a,b,c){this.t=a,this.v=b,c&&(this.next=c,c.prev=this,this.c=c.v-b,this.gap=c.t-a)},n=function(b,c){var d=i("easing."+b,function(a){this._p1=a||0===a?a:1.70158,this._p2=1.525*this._p1},!0),e=d.prototype=new a;return e.constructor=d,e.getRatio=c,e.config=function(a){return new d(a)},d},o=l("Back",n("BackOut",function(a){return(a-=1)*a*((this._p1+1)*a+this._p1)+1}),n("BackIn",function(a){return a*a*((this._p1+1)*a-this._p1)}),n("BackInOut",function(a){return(a*=2)<1?.5*a*a*((this._p2+1)*a-this._p2):.5*((a-=2)*a*((this._p2+1)*a+this._p2)+2)})),p=i("easing.SlowMo",function(a,b,c){b=b||0===b?b:.7,null==a?a=.7:a>1&&(a=1),this._p=1!==a?b:0,this._p1=(1-a)/2,this._p2=a,this._p3=this._p1+this._p2,this._calcEnd=c===!0},!0),q=p.prototype=new a;return q.constructor=p,q.getRatio=function(a){var b=a+(.5-a)*this._p;return a<this._p1?this._calcEnd?1-(a=1-a/this._p1)*a:b-(a=1-a/this._p1)*a*a*a*b:a>this._p3?this._calcEnd?1-(a=(a-this._p3)/this._p1)*a:b+(a-b)*(a=(a-this._p3)/this._p1)*a*a*a:this._calcEnd?1:b},p.ease=new p(.7,.7),q.config=p.config=function(a,b,c){return new p(a,b,c)},b=i("easing.SteppedEase",function(a){a=a||1,this._p1=1/a,this._p2=a+1},!0),q=b.prototype=new a,q.constructor=b,q.getRatio=function(a){return 0>a?a=0:a>=1&&(a=.999999999),(this._p2*a>>0)*this._p1},q.config=b.config=function(a){return new b(a)},c=i("easing.RoughEase",function(b){b=b||{};for(var c,d,e,f,g,h,i=b.taper||"none",j=[],k=0,l=0|(b.points||20),n=l,o=b.randomize!==!1,p=b.clamp===!0,q=b.template instanceof a?b.template:null,r="number"==typeof b.strength?.4*b.strength:.4;--n>-1;)c=o?Math.random():1/l*n,d=q?q.getRatio(c):c,"none"===i?e=r:"out"===i?(f=1-c,e=f*f*r):"in"===i?e=c*c*r:.5>c?(f=2*c,e=f*f*.5*r):(f=2*(1-c),e=f*f*.5*r),o?d+=Math.random()*e-.5*e:n%2?d+=.5*e:d-=.5*e,p&&(d>1?d=1:0>d&&(d=0)),j[k++]={x:c,y:d};for(j.sort(function(a,b){return a.x-b.x}),h=new m(1,1,null),n=l;--n>-1;)g=j[n],h=new m(g.x,g.y,h);this._prev=new m(0,0,0!==h.t?h:h.next)},!0),q=c.prototype=new a,q.constructor=c,q.getRatio=function(a){var b=this._prev;if(a>b.t){for(;b.next&&a>=b.t;)b=b.next;b=b.prev}else for(;b.prev&&a<=b.t;)b=b.prev;return this._prev=b,b.v+(a-b.t)/b.gap*b.c},q.config=function(a){return new c(a)},c.ease=new c,l("Bounce",j("BounceOut",function(a){return 1/2.75>a?7.5625*a*a:2/2.75>a?7.5625*(a-=1.5/2.75)*a+.75:2.5/2.75>a?7.5625*(a-=2.25/2.75)*a+.9375:7.5625*(a-=2.625/2.75)*a+.984375}),j("BounceIn",function(a){return(a=1-a)<1/2.75?1-7.5625*a*a:2/2.75>a?1-(7.5625*(a-=1.5/2.75)*a+.75):2.5/2.75>a?1-(7.5625*(a-=2.25/2.75)*a+.9375):1-(7.5625*(a-=2.625/2.75)*a+.984375)}),j("BounceInOut",function(a){var b=.5>a;return a=b?1-2*a:2*a-1,a=1/2.75>a?7.5625*a*a:2/2.75>a?7.5625*(a-=1.5/2.75)*a+.75:2.5/2.75>a?7.5625*(a-=2.25/2.75)*a+.9375:7.5625*(a-=2.625/2.75)*a+.984375,b?.5*(1-a):.5*a+.5})),l("Circ",j("CircOut",function(a){return Math.sqrt(1-(a-=1)*a)}),j("CircIn",function(a){return-(Math.sqrt(1-a*a)-1)}),j("CircInOut",function(a){return(a*=2)<1?-.5*(Math.sqrt(1-a*a)-1):.5*(Math.sqrt(1-(a-=2)*a)+1)})),d=function(b,c,d){var e=i("easing."+b,function(a,b){this._p1=a>=1?a:1,this._p2=(b||d)/(1>a?a:1),this._p3=this._p2/g*(Math.asin(1/this._p1)||0),this._p2=g/this._p2},!0),f=e.prototype=new a;return f.constructor=e,f.getRatio=c,f.config=function(a,b){return new e(a,b)},e},l("Elastic",d("ElasticOut",function(a){return this._p1*Math.pow(2,-10*a)*Math.sin((a-this._p3)*this._p2)+1},.3),d("ElasticIn",function(a){return-(this._p1*Math.pow(2,10*(a-=1))*Math.sin((a-this._p3)*this._p2))},.3),d("ElasticInOut",function(a){return(a*=2)<1?-.5*(this._p1*Math.pow(2,10*(a-=1))*Math.sin((a-this._p3)*this._p2)):this._p1*Math.pow(2,-10*(a-=1))*Math.sin((a-this._p3)*this._p2)*.5+1},.45)),l("Expo",j("ExpoOut",function(a){return 1-Math.pow(2,-10*a)}),j("ExpoIn",function(a){return Math.pow(2,10*(a-1))-.001}),j("ExpoInOut",function(a){return(a*=2)<1?.5*Math.pow(2,10*(a-1)):.5*(2-Math.pow(2,-10*(a-1)))})),l("Sine",j("SineOut",function(a){return Math.sin(a*h)}),j("SineIn",function(a){return-Math.cos(a*h)+1}),j("SineInOut",function(a){return-.5*(Math.cos(Math.PI*a)-1)})),i("easing.EaseLookup",{find:function(b){return a.map[b]}},!0),k(e.SlowMo,"SlowMo","ease,"),k(c,"RoughEase","ease,"),k(b,"SteppedEase","ease,"),o},!0)}),_gsScope._gsDefine&&_gsScope._gsQueue.pop()(),function(){"use strict";var a=function(){return _gsScope.GreenSockGlobals||_gsScope};"function"==typeof define&&define.amd?define(["TweenLite"],a):"undefined"!=typeof module&&module.exports&&(require("../TweenLite.js"),module.exports=a())}();


/* CSS PLUGIN */
/*!
 * VERSION: 1.19.1
 * DATE: 2017-01-17
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2017, GreenSock. All rights reserved.
 * This work is subject to the terms at http://greensock.com/standard-license or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window;(_gsScope._gsQueue||(_gsScope._gsQueue=[])).push(function(){"use strict";_gsScope._gsDefine("plugins.CSSPlugin",["plugins.TweenPlugin","TweenLite"],function(a,b){var c,d,e,f,g=function(){a.call(this,"css"),this._overwriteProps.length=0,this.setRatio=g.prototype.setRatio},h=_gsScope._gsDefine.globals,i={},j=g.prototype=new a("css");j.constructor=g,g.version="1.19.1",g.API=2,g.defaultTransformPerspective=0,g.defaultSkewType="compensated",g.defaultSmoothOrigin=!0,j="px",g.suffixMap={top:j,right:j,bottom:j,left:j,width:j,height:j,fontSize:j,padding:j,margin:j,perspective:j,lineHeight:""};var k,l,m,n,o,p,q,r,s=/(?:\-|\.|\b)(\d|\.|e\-)+/g,t=/(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,u=/(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi,v=/(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g,w=/(?:\d|\-|\+|=|#|\.)*/g,x=/opacity *= *([^)]*)/i,y=/opacity:([^;]*)/i,z=/alpha\(opacity *=.+?\)/i,A=/^(rgb|hsl)/,B=/([A-Z])/g,C=/-([a-z])/gi,D=/(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi,E=function(a,b){return b.toUpperCase()},F=/(?:Left|Right|Width)/i,G=/(M11|M12|M21|M22)=[\d\-\.e]+/gi,H=/progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,I=/,(?=[^\)]*(?:\(|$))/gi,J=/[\s,\(]/i,K=Math.PI/180,L=180/Math.PI,M={},N={style:{}},O=_gsScope.document||{createElement:function(){return N}},P=function(a,b){return O.createElementNS?O.createElementNS(b||"http://www.w3.org/1999/xhtml",a):O.createElement(a)},Q=P("div"),R=P("img"),S=g._internals={_specialProps:i},T=(_gsScope.navigator||{}).userAgent||"",U=function(){var a=T.indexOf("Android"),b=P("a");return m=-1!==T.indexOf("Safari")&&-1===T.indexOf("Chrome")&&(-1===a||parseFloat(T.substr(a+8,2))>3),o=m&&parseFloat(T.substr(T.indexOf("Version/")+8,2))<6,n=-1!==T.indexOf("Firefox"),(/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(T)||/Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(T))&&(p=parseFloat(RegExp.$1)),b?(b.style.cssText="top:1px;opacity:.55;",/^0.55/.test(b.style.opacity)):!1}(),V=function(a){return x.test("string"==typeof a?a:(a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?parseFloat(RegExp.$1)/100:1},W=function(a){_gsScope.console&&console.log(a)},X="",Y="",Z=function(a,b){b=b||Q;var c,d,e=b.style;if(void 0!==e[a])return a;for(a=a.charAt(0).toUpperCase()+a.substr(1),c=["O","Moz","ms","Ms","Webkit"],d=5;--d>-1&&void 0===e[c[d]+a];);return d>=0?(Y=3===d?"ms":c[d],X="-"+Y.toLowerCase()+"-",Y+a):null},$=O.defaultView?O.defaultView.getComputedStyle:function(){},_=g.getStyle=function(a,b,c,d,e){var f;return U||"opacity"!==b?(!d&&a.style[b]?f=a.style[b]:(c=c||$(a))?f=c[b]||c.getPropertyValue(b)||c.getPropertyValue(b.replace(B,"-$1").toLowerCase()):a.currentStyle&&(f=a.currentStyle[b]),null==e||f&&"none"!==f&&"auto"!==f&&"auto auto"!==f?f:e):V(a)},aa=S.convertToPixels=function(a,c,d,e,f){if("px"===e||!e)return d;if("auto"===e||!d)return 0;var h,i,j,k=F.test(c),l=a,m=Q.style,n=0>d,o=1===d;if(n&&(d=-d),o&&(d*=100),"%"===e&&-1!==c.indexOf("border"))h=d/100*(k?a.clientWidth:a.clientHeight);else{if(m.cssText="border:0 solid red;position:"+_(a,"position")+";line-height:0;","%"!==e&&l.appendChild&&"v"!==e.charAt(0)&&"rem"!==e)m[k?"borderLeftWidth":"borderTopWidth"]=d+e;else{if(l=a.parentNode||O.body,i=l._gsCache,j=b.ticker.frame,i&&k&&i.time===j)return i.width*d/100;m[k?"width":"height"]=d+e}l.appendChild(Q),h=parseFloat(Q[k?"offsetWidth":"offsetHeight"]),l.removeChild(Q),k&&"%"===e&&g.cacheWidths!==!1&&(i=l._gsCache=l._gsCache||{},i.time=j,i.width=h/d*100),0!==h||f||(h=aa(a,c,d,e,!0))}return o&&(h/=100),n?-h:h},ba=S.calculateOffset=function(a,b,c){if("absolute"!==_(a,"position",c))return 0;var d="left"===b?"Left":"Top",e=_(a,"margin"+d,c);return a["offset"+d]-(aa(a,b,parseFloat(e),e.replace(w,""))||0)},ca=function(a,b){var c,d,e,f={};if(b=b||$(a,null))if(c=b.length)for(;--c>-1;)e=b[c],(-1===e.indexOf("-transform")||Da===e)&&(f[e.replace(C,E)]=b.getPropertyValue(e));else for(c in b)(-1===c.indexOf("Transform")||Ca===c)&&(f[c]=b[c]);else if(b=a.currentStyle||a.style)for(c in b)"string"==typeof c&&void 0===f[c]&&(f[c.replace(C,E)]=b[c]);return U||(f.opacity=V(a)),d=Ra(a,b,!1),f.rotation=d.rotation,f.skewX=d.skewX,f.scaleX=d.scaleX,f.scaleY=d.scaleY,f.x=d.x,f.y=d.y,Fa&&(f.z=d.z,f.rotationX=d.rotationX,f.rotationY=d.rotationY,f.scaleZ=d.scaleZ),f.filters&&delete f.filters,f},da=function(a,b,c,d,e){var f,g,h,i={},j=a.style;for(g in c)"cssText"!==g&&"length"!==g&&isNaN(g)&&(b[g]!==(f=c[g])||e&&e[g])&&-1===g.indexOf("Origin")&&("number"==typeof f||"string"==typeof f)&&(i[g]="auto"!==f||"left"!==g&&"top"!==g?""!==f&&"auto"!==f&&"none"!==f||"string"!=typeof b[g]||""===b[g].replace(v,"")?f:0:ba(a,g),void 0!==j[g]&&(h=new sa(j,g,j[g],h)));if(d)for(g in d)"className"!==g&&(i[g]=d[g]);return{difs:i,firstMPT:h}},ea={width:["Left","Right"],height:["Top","Bottom"]},fa=["marginLeft","marginRight","marginTop","marginBottom"],ga=function(a,b,c){if("svg"===(a.nodeName+"").toLowerCase())return(c||$(a))[b]||0;if(a.getCTM&&Oa(a))return a.getBBox()[b]||0;var d=parseFloat("width"===b?a.offsetWidth:a.offsetHeight),e=ea[b],f=e.length;for(c=c||$(a,null);--f>-1;)d-=parseFloat(_(a,"padding"+e[f],c,!0))||0,d-=parseFloat(_(a,"border"+e[f]+"Width",c,!0))||0;return d},ha=function(a,b){if("contain"===a||"auto"===a||"auto auto"===a)return a+" ";(null==a||""===a)&&(a="0 0");var c,d=a.split(" "),e=-1!==a.indexOf("left")?"0%":-1!==a.indexOf("right")?"100%":d[0],f=-1!==a.indexOf("top")?"0%":-1!==a.indexOf("bottom")?"100%":d[1];if(d.length>3&&!b){for(d=a.split(", ").join(",").split(","),a=[],c=0;c<d.length;c++)a.push(ha(d[c]));return a.join(",")}return null==f?f="center"===e?"50%":"0":"center"===f&&(f="50%"),("center"===e||isNaN(parseFloat(e))&&-1===(e+"").indexOf("="))&&(e="50%"),a=e+" "+f+(d.length>2?" "+d[2]:""),b&&(b.oxp=-1!==e.indexOf("%"),b.oyp=-1!==f.indexOf("%"),b.oxr="="===e.charAt(1),b.oyr="="===f.charAt(1),b.ox=parseFloat(e.replace(v,"")),b.oy=parseFloat(f.replace(v,"")),b.v=a),b||a},ia=function(a,b){return"function"==typeof a&&(a=a(r,q)),"string"==typeof a&&"="===a.charAt(1)?parseInt(a.charAt(0)+"1",10)*parseFloat(a.substr(2)):parseFloat(a)-parseFloat(b)||0},ja=function(a,b){return"function"==typeof a&&(a=a(r,q)),null==a?b:"string"==typeof a&&"="===a.charAt(1)?parseInt(a.charAt(0)+"1",10)*parseFloat(a.substr(2))+b:parseFloat(a)||0},ka=function(a,b,c,d){var e,f,g,h,i,j=1e-6;return"function"==typeof a&&(a=a(r,q)),null==a?h=b:"number"==typeof a?h=a:(e=360,f=a.split("_"),i="="===a.charAt(1),g=(i?parseInt(a.charAt(0)+"1",10)*parseFloat(f[0].substr(2)):parseFloat(f[0]))*(-1===a.indexOf("rad")?1:L)-(i?0:b),f.length&&(d&&(d[c]=b+g),-1!==a.indexOf("short")&&(g%=e,g!==g%(e/2)&&(g=0>g?g+e:g-e)),-1!==a.indexOf("_cw")&&0>g?g=(g+9999999999*e)%e-(g/e|0)*e:-1!==a.indexOf("ccw")&&g>0&&(g=(g-9999999999*e)%e-(g/e|0)*e)),h=b+g),j>h&&h>-j&&(h=0),h},la={aqua:[0,255,255],lime:[0,255,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,255],navy:[0,0,128],white:[255,255,255],fuchsia:[255,0,255],olive:[128,128,0],yellow:[255,255,0],orange:[255,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[255,0,0],pink:[255,192,203],cyan:[0,255,255],transparent:[255,255,255,0]},ma=function(a,b,c){return a=0>a?a+1:a>1?a-1:a,255*(1>6*a?b+(c-b)*a*6:.5>a?c:2>3*a?b+(c-b)*(2/3-a)*6:b)+.5|0},na=g.parseColor=function(a,b){var c,d,e,f,g,h,i,j,k,l,m;if(a)if("number"==typeof a)c=[a>>16,a>>8&255,255&a];else{if(","===a.charAt(a.length-1)&&(a=a.substr(0,a.length-1)),la[a])c=la[a];else if("#"===a.charAt(0))4===a.length&&(d=a.charAt(1),e=a.charAt(2),f=a.charAt(3),a="#"+d+d+e+e+f+f),a=parseInt(a.substr(1),16),c=[a>>16,a>>8&255,255&a];else if("hsl"===a.substr(0,3))if(c=m=a.match(s),b){if(-1!==a.indexOf("="))return a.match(t)}else g=Number(c[0])%360/360,h=Number(c[1])/100,i=Number(c[2])/100,e=.5>=i?i*(h+1):i+h-i*h,d=2*i-e,c.length>3&&(c[3]=Number(a[3])),c[0]=ma(g+1/3,d,e),c[1]=ma(g,d,e),c[2]=ma(g-1/3,d,e);else c=a.match(s)||la.transparent;c[0]=Number(c[0]),c[1]=Number(c[1]),c[2]=Number(c[2]),c.length>3&&(c[3]=Number(c[3]))}else c=la.black;return b&&!m&&(d=c[0]/255,e=c[1]/255,f=c[2]/255,j=Math.max(d,e,f),k=Math.min(d,e,f),i=(j+k)/2,j===k?g=h=0:(l=j-k,h=i>.5?l/(2-j-k):l/(j+k),g=j===d?(e-f)/l+(f>e?6:0):j===e?(f-d)/l+2:(d-e)/l+4,g*=60),c[0]=g+.5|0,c[1]=100*h+.5|0,c[2]=100*i+.5|0),c},oa=function(a,b){var c,d,e,f=a.match(pa)||[],g=0,h=f.length?"":a;for(c=0;c<f.length;c++)d=f[c],e=a.substr(g,a.indexOf(d,g)-g),g+=e.length+d.length,d=na(d,b),3===d.length&&d.push(1),h+=e+(b?"hsla("+d[0]+","+d[1]+"%,"+d[2]+"%,"+d[3]:"rgba("+d.join(","))+")";return h+a.substr(g)},pa="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3}){1,2}\\b";for(j in la)pa+="|"+j+"\\b";pa=new RegExp(pa+")","gi"),g.colorStringFilter=function(a){var b,c=a[0]+a[1];pa.test(c)&&(b=-1!==c.indexOf("hsl(")||-1!==c.indexOf("hsla("),a[0]=oa(a[0],b),a[1]=oa(a[1],b)),pa.lastIndex=0},b.defaultStringFilter||(b.defaultStringFilter=g.colorStringFilter);var qa=function(a,b,c,d){if(null==a)return function(a){return a};var e,f=b?(a.match(pa)||[""])[0]:"",g=a.split(f).join("").match(u)||[],h=a.substr(0,a.indexOf(g[0])),i=")"===a.charAt(a.length-1)?")":"",j=-1!==a.indexOf(" ")?" ":",",k=g.length,l=k>0?g[0].replace(s,""):"";return k?e=b?function(a){var b,m,n,o;if("number"==typeof a)a+=l;else if(d&&I.test(a)){for(o=a.replace(I,"|").split("|"),n=0;n<o.length;n++)o[n]=e(o[n]);return o.join(",")}if(b=(a.match(pa)||[f])[0],m=a.split(b).join("").match(u)||[],n=m.length,k>n--)for(;++n<k;)m[n]=c?m[(n-1)/2|0]:g[n];return h+m.join(j)+j+b+i+(-1!==a.indexOf("inset")?" inset":"")}:function(a){var b,f,m;if("number"==typeof a)a+=l;else if(d&&I.test(a)){for(f=a.replace(I,"|").split("|"),m=0;m<f.length;m++)f[m]=e(f[m]);return f.join(",")}if(b=a.match(u)||[],m=b.length,k>m--)for(;++m<k;)b[m]=c?b[(m-1)/2|0]:g[m];return h+b.join(j)+i}:function(a){return a}},ra=function(a){return a=a.split(","),function(b,c,d,e,f,g,h){var i,j=(c+"").split(" ");for(h={},i=0;4>i;i++)h[a[i]]=j[i]=j[i]||j[(i-1)/2>>0];return e.parse(b,h,f,g)}},sa=(S._setPluginRatio=function(a){this.plugin.setRatio(a);for(var b,c,d,e,f,g=this.data,h=g.proxy,i=g.firstMPT,j=1e-6;i;)b=h[i.v],i.r?b=Math.round(b):j>b&&b>-j&&(b=0),i.t[i.p]=b,i=i._next;if(g.autoRotate&&(g.autoRotate.rotation=g.mod?g.mod(h.rotation,this.t):h.rotation),1===a||0===a)for(i=g.firstMPT,f=1===a?"e":"b";i;){if(c=i.t,c.type){if(1===c.type){for(e=c.xs0+c.s+c.xs1,d=1;d<c.l;d++)e+=c["xn"+d]+c["xs"+(d+1)];c[f]=e}}else c[f]=c.s+c.xs0;i=i._next}},function(a,b,c,d,e){this.t=a,this.p=b,this.v=c,this.r=e,d&&(d._prev=this,this._next=d)}),ta=(S._parseToProxy=function(a,b,c,d,e,f){var g,h,i,j,k,l=d,m={},n={},o=c._transform,p=M;for(c._transform=null,M=b,d=k=c.parse(a,b,d,e),M=p,f&&(c._transform=o,l&&(l._prev=null,l._prev&&(l._prev._next=null)));d&&d!==l;){if(d.type<=1&&(h=d.p,n[h]=d.s+d.c,m[h]=d.s,f||(j=new sa(d,"s",h,j,d.r),d.c=0),1===d.type))for(g=d.l;--g>0;)i="xn"+g,h=d.p+"_"+i,n[h]=d.data[i],m[h]=d[i],f||(j=new sa(d,i,h,j,d.rxp[i]));d=d._next}return{proxy:m,end:n,firstMPT:j,pt:k}},S.CSSPropTween=function(a,b,d,e,g,h,i,j,k,l,m){this.t=a,this.p=b,this.s=d,this.c=e,this.n=i||b,a instanceof ta||f.push(this.n),this.r=j,this.type=h||0,k&&(this.pr=k,c=!0),this.b=void 0===l?d:l,this.e=void 0===m?d+e:m,g&&(this._next=g,g._prev=this)}),ua=function(a,b,c,d,e,f){var g=new ta(a,b,c,d-c,e,-1,f);return g.b=c,g.e=g.xs0=d,g},va=g.parseComplex=function(a,b,c,d,e,f,h,i,j,l){c=c||f||"","function"==typeof d&&(d=d(r,q)),h=new ta(a,b,0,0,h,l?2:1,null,!1,i,c,d),d+="",e&&pa.test(d+c)&&(d=[c,d],g.colorStringFilter(d),c=d[0],d=d[1]);var m,n,o,p,u,v,w,x,y,z,A,B,C,D=c.split(", ").join(",").split(" "),E=d.split(", ").join(",").split(" "),F=D.length,G=k!==!1;for((-1!==d.indexOf(",")||-1!==c.indexOf(","))&&(D=D.join(" ").replace(I,", ").split(" "),E=E.join(" ").replace(I,", ").split(" "),F=D.length),F!==E.length&&(D=(f||"").split(" "),F=D.length),h.plugin=j,h.setRatio=l,pa.lastIndex=0,m=0;F>m;m++)if(p=D[m],u=E[m],x=parseFloat(p),x||0===x)h.appendXtra("",x,ia(u,x),u.replace(t,""),G&&-1!==u.indexOf("px"),!0);else if(e&&pa.test(p))B=u.indexOf(")")+1,B=")"+(B?u.substr(B):""),C=-1!==u.indexOf("hsl")&&U,p=na(p,C),u=na(u,C),y=p.length+u.length>6,y&&!U&&0===u[3]?(h["xs"+h.l]+=h.l?" transparent":"transparent",h.e=h.e.split(E[m]).join("transparent")):(U||(y=!1),C?h.appendXtra(y?"hsla(":"hsl(",p[0],ia(u[0],p[0]),",",!1,!0).appendXtra("",p[1],ia(u[1],p[1]),"%,",!1).appendXtra("",p[2],ia(u[2],p[2]),y?"%,":"%"+B,!1):h.appendXtra(y?"rgba(":"rgb(",p[0],u[0]-p[0],",",!0,!0).appendXtra("",p[1],u[1]-p[1],",",!0).appendXtra("",p[2],u[2]-p[2],y?",":B,!0),y&&(p=p.length<4?1:p[3],h.appendXtra("",p,(u.length<4?1:u[3])-p,B,!1))),pa.lastIndex=0;else if(v=p.match(s)){if(w=u.match(t),!w||w.length!==v.length)return h;for(o=0,n=0;n<v.length;n++)A=v[n],z=p.indexOf(A,o),h.appendXtra(p.substr(o,z-o),Number(A),ia(w[n],A),"",G&&"px"===p.substr(z+A.length,2),0===n),o=z+A.length;h["xs"+h.l]+=p.substr(o)}else h["xs"+h.l]+=h.l||h["xs"+h.l]?" "+u:u;if(-1!==d.indexOf("=")&&h.data){for(B=h.xs0+h.data.s,m=1;m<h.l;m++)B+=h["xs"+m]+h.data["xn"+m];h.e=B+h["xs"+m]}return h.l||(h.type=-1,h.xs0=h.e),h.xfirst||h},wa=9;for(j=ta.prototype,j.l=j.pr=0;--wa>0;)j["xn"+wa]=0,j["xs"+wa]="";j.xs0="",j._next=j._prev=j.xfirst=j.data=j.plugin=j.setRatio=j.rxp=null,j.appendXtra=function(a,b,c,d,e,f){var g=this,h=g.l;return g["xs"+h]+=f&&(h||g["xs"+h])?" "+a:a||"",c||0===h||g.plugin?(g.l++,g.type=g.setRatio?2:1,g["xs"+g.l]=d||"",h>0?(g.data["xn"+h]=b+c,g.rxp["xn"+h]=e,g["xn"+h]=b,g.plugin||(g.xfirst=new ta(g,"xn"+h,b,c,g.xfirst||g,0,g.n,e,g.pr),g.xfirst.xs0=0),g):(g.data={s:b+c},g.rxp={},g.s=b,g.c=c,g.r=e,g)):(g["xs"+h]+=b+(d||""),g)};var xa=function(a,b){b=b||{},this.p=b.prefix?Z(a)||a:a,i[a]=i[this.p]=this,this.format=b.formatter||qa(b.defaultValue,b.color,b.collapsible,b.multi),b.parser&&(this.parse=b.parser),this.clrs=b.color,this.multi=b.multi,this.keyword=b.keyword,this.dflt=b.defaultValue,this.pr=b.priority||0},ya=S._registerComplexSpecialProp=function(a,b,c){"object"!=typeof b&&(b={parser:c});var d,e,f=a.split(","),g=b.defaultValue;for(c=c||[g],d=0;d<f.length;d++)b.prefix=0===d&&b.prefix,b.defaultValue=c[d]||g,e=new xa(f[d],b)},za=S._registerPluginProp=function(a){if(!i[a]){var b=a.charAt(0).toUpperCase()+a.substr(1)+"Plugin";ya(a,{parser:function(a,c,d,e,f,g,j){var k=h.com.greensock.plugins[b];return k?(k._cssRegister(),i[d].parse(a,c,d,e,f,g,j)):(W("Error: "+b+" js file not loaded."),f)}})}};j=xa.prototype,j.parseComplex=function(a,b,c,d,e,f){var g,h,i,j,k,l,m=this.keyword;if(this.multi&&(I.test(c)||I.test(b)?(h=b.replace(I,"|").split("|"),i=c.replace(I,"|").split("|")):m&&(h=[b],i=[c])),i){for(j=i.length>h.length?i.length:h.length,g=0;j>g;g++)b=h[g]=h[g]||this.dflt,c=i[g]=i[g]||this.dflt,m&&(k=b.indexOf(m),l=c.indexOf(m),k!==l&&(-1===l?h[g]=h[g].split(m).join(""):-1===k&&(h[g]+=" "+m)));b=h.join(", "),c=i.join(", ")}return va(a,this.p,b,c,this.clrs,this.dflt,d,this.pr,e,f)},j.parse=function(a,b,c,d,f,g,h){return this.parseComplex(a.style,this.format(_(a,this.p,e,!1,this.dflt)),this.format(b),f,g)},g.registerSpecialProp=function(a,b,c){ya(a,{parser:function(a,d,e,f,g,h,i){var j=new ta(a,e,0,0,g,2,e,!1,c);return j.plugin=h,j.setRatio=b(a,d,f._tween,e),j},priority:c})},g.useSVGTransformAttr=!0;var Aa,Ba="scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent".split(","),Ca=Z("transform"),Da=X+"transform",Ea=Z("transformOrigin"),Fa=null!==Z("perspective"),Ga=S.Transform=function(){this.perspective=parseFloat(g.defaultTransformPerspective)||0,this.force3D=g.defaultForce3D!==!1&&Fa?g.defaultForce3D||"auto":!1},Ha=_gsScope.SVGElement,Ia=function(a,b,c){var d,e=O.createElementNS("http://www.w3.org/2000/svg",a),f=/([a-z])([A-Z])/g;for(d in c)e.setAttributeNS(null,d.replace(f,"$1-$2").toLowerCase(),c[d]);return b.appendChild(e),e},Ja=O.documentElement||{},Ka=function(){var a,b,c,d=p||/Android/i.test(T)&&!_gsScope.chrome;return O.createElementNS&&!d&&(a=Ia("svg",Ja),b=Ia("rect",a,{width:100,height:50,x:100}),c=b.getBoundingClientRect().width,b.style[Ea]="50% 50%",b.style[Ca]="scaleX(0.5)",d=c===b.getBoundingClientRect().width&&!(n&&Fa),Ja.removeChild(a)),d}(),La=function(a,b,c,d,e,f){var h,i,j,k,l,m,n,o,p,q,r,s,t,u,v=a._gsTransform,w=Qa(a,!0);v&&(t=v.xOrigin,u=v.yOrigin),(!d||(h=d.split(" ")).length<2)&&(n=a.getBBox(),0===n.x&&0===n.y&&n.width+n.height===0&&(n={x:parseFloat(a.hasAttribute("x")?a.getAttribute("x"):a.hasAttribute("cx")?a.getAttribute("cx"):0)||0,y:parseFloat(a.hasAttribute("y")?a.getAttribute("y"):a.hasAttribute("cy")?a.getAttribute("cy"):0)||0,width:0,height:0}),b=ha(b).split(" "),h=[(-1!==b[0].indexOf("%")?parseFloat(b[0])/100*n.width:parseFloat(b[0]))+n.x,(-1!==b[1].indexOf("%")?parseFloat(b[1])/100*n.height:parseFloat(b[1]))+n.y]),c.xOrigin=k=parseFloat(h[0]),c.yOrigin=l=parseFloat(h[1]),d&&w!==Pa&&(m=w[0],n=w[1],o=w[2],p=w[3],q=w[4],r=w[5],s=m*p-n*o,s&&(i=k*(p/s)+l*(-o/s)+(o*r-p*q)/s,j=k*(-n/s)+l*(m/s)-(m*r-n*q)/s,k=c.xOrigin=h[0]=i,l=c.yOrigin=h[1]=j)),v&&(f&&(c.xOffset=v.xOffset,c.yOffset=v.yOffset,v=c),e||e!==!1&&g.defaultSmoothOrigin!==!1?(i=k-t,j=l-u,v.xOffset+=i*w[0]+j*w[2]-i,v.yOffset+=i*w[1]+j*w[3]-j):v.xOffset=v.yOffset=0),f||a.setAttribute("data-svg-origin",h.join(" "))},Ma=function(a){var b,c=P("svg",this.ownerSVGElement.getAttribute("xmlns")||"http://www.w3.org/2000/svg"),d=this.parentNode,e=this.nextSibling,f=this.style.cssText;if(Ja.appendChild(c),c.appendChild(this),this.style.display="block",a)try{b=this.getBBox(),this._originalGetBBox=this.getBBox,this.getBBox=Ma}catch(g){}else this._originalGetBBox&&(b=this._originalGetBBox());return e?d.insertBefore(this,e):d.appendChild(this),Ja.removeChild(c),this.style.cssText=f,b},Na=function(a){try{return a.getBBox()}catch(b){return Ma.call(a,!0)}},Oa=function(a){return!(!(Ha&&a.getCTM&&Na(a))||a.parentNode&&!a.ownerSVGElement)},Pa=[1,0,0,1,0,0],Qa=function(a,b){var c,d,e,f,g,h,i=a._gsTransform||new Ga,j=1e5,k=a.style;if(Ca?d=_(a,Da,null,!0):a.currentStyle&&(d=a.currentStyle.filter.match(G),d=d&&4===d.length?[d[0].substr(4),Number(d[2].substr(4)),Number(d[1].substr(4)),d[3].substr(4),i.x||0,i.y||0].join(","):""),c=!d||"none"===d||"matrix(1, 0, 0, 1, 0, 0)"===d,c&&Ca&&((h="none"===$(a).display)||!a.parentNode)&&(h&&(f=k.display,k.display="block"),a.parentNode||(g=1,Ja.appendChild(a)),d=_(a,Da,null,!0),c=!d||"none"===d||"matrix(1, 0, 0, 1, 0, 0)"===d,f?k.display=f:h&&Va(k,"display"),g&&Ja.removeChild(a)),(i.svg||a.getCTM&&Oa(a))&&(c&&-1!==(k[Ca]+"").indexOf("matrix")&&(d=k[Ca],c=0),e=a.getAttribute("transform"),c&&e&&(-1!==e.indexOf("matrix")?(d=e,c=0):-1!==e.indexOf("translate")&&(d="matrix(1,0,0,1,"+e.match(/(?:\-|\b)[\d\-\.e]+\b/gi).join(",")+")",c=0))),c)return Pa;for(e=(d||"").match(s)||[],wa=e.length;--wa>-1;)f=Number(e[wa]),e[wa]=(g=f-(f|=0))?(g*j+(0>g?-.5:.5)|0)/j+f:f;return b&&e.length>6?[e[0],e[1],e[4],e[5],e[12],e[13]]:e},Ra=S.getTransform=function(a,c,d,e){if(a._gsTransform&&d&&!e)return a._gsTransform;var f,h,i,j,k,l,m=d?a._gsTransform||new Ga:new Ga,n=m.scaleX<0,o=2e-5,p=1e5,q=Fa?parseFloat(_(a,Ea,c,!1,"0 0 0").split(" ")[2])||m.zOrigin||0:0,r=parseFloat(g.defaultTransformPerspective)||0;if(m.svg=!(!a.getCTM||!Oa(a)),m.svg&&(La(a,_(a,Ea,c,!1,"50% 50%")+"",m,a.getAttribute("data-svg-origin")),Aa=g.useSVGTransformAttr||Ka),f=Qa(a),f!==Pa){if(16===f.length){var s,t,u,v,w,x=f[0],y=f[1],z=f[2],A=f[3],B=f[4],C=f[5],D=f[6],E=f[7],F=f[8],G=f[9],H=f[10],I=f[12],J=f[13],K=f[14],M=f[11],N=Math.atan2(D,H);m.zOrigin&&(K=-m.zOrigin,I=F*K-f[12],J=G*K-f[13],K=H*K+m.zOrigin-f[14]),m.rotationX=N*L,N&&(v=Math.cos(-N),w=Math.sin(-N),s=B*v+F*w,t=C*v+G*w,u=D*v+H*w,F=B*-w+F*v,G=C*-w+G*v,H=D*-w+H*v,M=E*-w+M*v,B=s,C=t,D=u),N=Math.atan2(-z,H),m.rotationY=N*L,N&&(v=Math.cos(-N),w=Math.sin(-N),s=x*v-F*w,t=y*v-G*w,u=z*v-H*w,G=y*w+G*v,H=z*w+H*v,M=A*w+M*v,x=s,y=t,z=u),N=Math.atan2(y,x),m.rotation=N*L,N&&(v=Math.cos(-N),w=Math.sin(-N),x=x*v+B*w,t=y*v+C*w,C=y*-w+C*v,D=z*-w+D*v,y=t),m.rotationX&&Math.abs(m.rotationX)+Math.abs(m.rotation)>359.9&&(m.rotationX=m.rotation=0,m.rotationY=180-m.rotationY),m.scaleX=(Math.sqrt(x*x+y*y)*p+.5|0)/p,m.scaleY=(Math.sqrt(C*C+G*G)*p+.5|0)/p,m.scaleZ=(Math.sqrt(D*D+H*H)*p+.5|0)/p,m.rotationX||m.rotationY?m.skewX=0:(m.skewX=B||C?Math.atan2(B,C)*L+m.rotation:m.skewX||0,Math.abs(m.skewX)>90&&Math.abs(m.skewX)<270&&(n?(m.scaleX*=-1,m.skewX+=m.rotation<=0?180:-180,m.rotation+=m.rotation<=0?180:-180):(m.scaleY*=-1,m.skewX+=m.skewX<=0?180:-180))),m.perspective=M?1/(0>M?-M:M):0,m.x=I,m.y=J,m.z=K,m.svg&&(m.x-=m.xOrigin-(m.xOrigin*x-m.yOrigin*B),m.y-=m.yOrigin-(m.yOrigin*y-m.xOrigin*C))}else if(!Fa||e||!f.length||m.x!==f[4]||m.y!==f[5]||!m.rotationX&&!m.rotationY){var O=f.length>=6,P=O?f[0]:1,Q=f[1]||0,R=f[2]||0,S=O?f[3]:1;m.x=f[4]||0,m.y=f[5]||0,i=Math.sqrt(P*P+Q*Q),j=Math.sqrt(S*S+R*R),k=P||Q?Math.atan2(Q,P)*L:m.rotation||0,l=R||S?Math.atan2(R,S)*L+k:m.skewX||0,Math.abs(l)>90&&Math.abs(l)<270&&(n?(i*=-1,l+=0>=k?180:-180,k+=0>=k?180:-180):(j*=-1,l+=0>=l?180:-180)),m.scaleX=i,m.scaleY=j,m.rotation=k,m.skewX=l,Fa&&(m.rotationX=m.rotationY=m.z=0,m.perspective=r,m.scaleZ=1),m.svg&&(m.x-=m.xOrigin-(m.xOrigin*P+m.yOrigin*R),m.y-=m.yOrigin-(m.xOrigin*Q+m.yOrigin*S))}m.zOrigin=q;for(h in m)m[h]<o&&m[h]>-o&&(m[h]=0)}return d&&(a._gsTransform=m,m.svg&&(Aa&&a.style[Ca]?b.delayedCall(.001,function(){Va(a.style,Ca)}):!Aa&&a.getAttribute("transform")&&b.delayedCall(.001,function(){a.removeAttribute("transform")}))),m},Sa=function(a){var b,c,d=this.data,e=-d.rotation*K,f=e+d.skewX*K,g=1e5,h=(Math.cos(e)*d.scaleX*g|0)/g,i=(Math.sin(e)*d.scaleX*g|0)/g,j=(Math.sin(f)*-d.scaleY*g|0)/g,k=(Math.cos(f)*d.scaleY*g|0)/g,l=this.t.style,m=this.t.currentStyle;if(m){c=i,i=-j,j=-c,b=m.filter,l.filter="";var n,o,q=this.t.offsetWidth,r=this.t.offsetHeight,s="absolute"!==m.position,t="progid:DXImageTransform.Microsoft.Matrix(M11="+h+", M12="+i+", M21="+j+", M22="+k,u=d.x+q*d.xPercent/100,v=d.y+r*d.yPercent/100;if(null!=d.ox&&(n=(d.oxp?q*d.ox*.01:d.ox)-q/2,o=(d.oyp?r*d.oy*.01:d.oy)-r/2,u+=n-(n*h+o*i),v+=o-(n*j+o*k)),s?(n=q/2,o=r/2,t+=", Dx="+(n-(n*h+o*i)+u)+", Dy="+(o-(n*j+o*k)+v)+")"):t+=", sizingMethod='auto expand')",-1!==b.indexOf("DXImageTransform.Microsoft.Matrix(")?l.filter=b.replace(H,t):l.filter=t+" "+b,(0===a||1===a)&&1===h&&0===i&&0===j&&1===k&&(s&&-1===t.indexOf("Dx=0, Dy=0")||x.test(b)&&100!==parseFloat(RegExp.$1)||-1===b.indexOf(b.indexOf("Alpha"))&&l.removeAttribute("filter")),!s){var y,z,A,B=8>p?1:-1;for(n=d.ieOffsetX||0,o=d.ieOffsetY||0,d.ieOffsetX=Math.round((q-((0>h?-h:h)*q+(0>i?-i:i)*r))/2+u),d.ieOffsetY=Math.round((r-((0>k?-k:k)*r+(0>j?-j:j)*q))/2+v),wa=0;4>wa;wa++)z=fa[wa],y=m[z],c=-1!==y.indexOf("px")?parseFloat(y):aa(this.t,z,parseFloat(y),y.replace(w,""))||0,A=c!==d[z]?2>wa?-d.ieOffsetX:-d.ieOffsetY:2>wa?n-d.ieOffsetX:o-d.ieOffsetY,l[z]=(d[z]=Math.round(c-A*(0===wa||2===wa?1:B)))+"px"}}},Ta=S.set3DTransformRatio=S.setTransformRatio=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,o,p,q,r,s,t,u,v,w,x,y,z=this.data,A=this.t.style,B=z.rotation,C=z.rotationX,D=z.rotationY,E=z.scaleX,F=z.scaleY,G=z.scaleZ,H=z.x,I=z.y,J=z.z,L=z.svg,M=z.perspective,N=z.force3D,O=z.skewY,P=z.skewX;if(O&&(P+=O,B+=O),((1===a||0===a)&&"auto"===N&&(this.tween._totalTime===this.tween._totalDuration||!this.tween._totalTime)||!N)&&!J&&!M&&!D&&!C&&1===G||Aa&&L||!Fa)return void(B||P||L?(B*=K,x=P*K,y=1e5,c=Math.cos(B)*E,f=Math.sin(B)*E,d=Math.sin(B-x)*-F,g=Math.cos(B-x)*F,x&&"simple"===z.skewType&&(b=Math.tan(x-O*K),b=Math.sqrt(1+b*b),d*=b,g*=b,O&&(b=Math.tan(O*K),b=Math.sqrt(1+b*b),c*=b,f*=b)),L&&(H+=z.xOrigin-(z.xOrigin*c+z.yOrigin*d)+z.xOffset,I+=z.yOrigin-(z.xOrigin*f+z.yOrigin*g)+z.yOffset,Aa&&(z.xPercent||z.yPercent)&&(q=this.t.getBBox(),H+=.01*z.xPercent*q.width,I+=.01*z.yPercent*q.height),q=1e-6,q>H&&H>-q&&(H=0),q>I&&I>-q&&(I=0)),u=(c*y|0)/y+","+(f*y|0)/y+","+(d*y|0)/y+","+(g*y|0)/y+","+H+","+I+")",L&&Aa?this.t.setAttribute("transform","matrix("+u):A[Ca]=(z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) matrix(":"matrix(")+u):A[Ca]=(z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) matrix(":"matrix(")+E+",0,0,"+F+","+H+","+I+")");if(n&&(q=1e-4,q>E&&E>-q&&(E=G=2e-5),q>F&&F>-q&&(F=G=2e-5),!M||z.z||z.rotationX||z.rotationY||(M=0)),B||P)B*=K,r=c=Math.cos(B),s=f=Math.sin(B),P&&(B-=P*K,r=Math.cos(B),s=Math.sin(B),"simple"===z.skewType&&(b=Math.tan((P-O)*K),b=Math.sqrt(1+b*b),r*=b,s*=b,z.skewY&&(b=Math.tan(O*K),b=Math.sqrt(1+b*b),c*=b,f*=b))),d=-s,g=r;else{if(!(D||C||1!==G||M||L))return void(A[Ca]=(z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) translate3d(":"translate3d(")+H+"px,"+I+"px,"+J+"px)"+(1!==E||1!==F?" scale("+E+","+F+")":""));c=g=1,d=f=0}k=1,e=h=i=j=l=m=0,o=M?-1/M:0,p=z.zOrigin,q=1e-6,v=",",w="0",B=D*K,B&&(r=Math.cos(B),s=Math.sin(B),i=-s,l=o*-s,e=c*s,h=f*s,k=r,o*=r,c*=r,f*=r),B=C*K,B&&(r=Math.cos(B),s=Math.sin(B),b=d*r+e*s,t=g*r+h*s,j=k*s,m=o*s,e=d*-s+e*r,h=g*-s+h*r,k*=r,o*=r,d=b,g=t),1!==G&&(e*=G,h*=G,k*=G,o*=G),1!==F&&(d*=F,g*=F,j*=F,m*=F),1!==E&&(c*=E,f*=E,i*=E,l*=E),(p||L)&&(p&&(H+=e*-p,I+=h*-p,J+=k*-p+p),L&&(H+=z.xOrigin-(z.xOrigin*c+z.yOrigin*d)+z.xOffset,I+=z.yOrigin-(z.xOrigin*f+z.yOrigin*g)+z.yOffset),q>H&&H>-q&&(H=w),q>I&&I>-q&&(I=w),q>J&&J>-q&&(J=0)),u=z.xPercent||z.yPercent?"translate("+z.xPercent+"%,"+z.yPercent+"%) matrix3d(":"matrix3d(",u+=(q>c&&c>-q?w:c)+v+(q>f&&f>-q?w:f)+v+(q>i&&i>-q?w:i),u+=v+(q>l&&l>-q?w:l)+v+(q>d&&d>-q?w:d)+v+(q>g&&g>-q?w:g),C||D||1!==G?(u+=v+(q>j&&j>-q?w:j)+v+(q>m&&m>-q?w:m)+v+(q>e&&e>-q?w:e),u+=v+(q>h&&h>-q?w:h)+v+(q>k&&k>-q?w:k)+v+(q>o&&o>-q?w:o)+v):u+=",0,0,0,0,1,0,",u+=H+v+I+v+J+v+(M?1+-J/M:1)+")",A[Ca]=u};j=Ga.prototype,j.x=j.y=j.z=j.skewX=j.skewY=j.rotation=j.rotationX=j.rotationY=j.zOrigin=j.xPercent=j.yPercent=j.xOffset=j.yOffset=0,j.scaleX=j.scaleY=j.scaleZ=1,ya("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,svgOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent,smoothOrigin",{parser:function(a,b,c,d,f,h,i){if(d._lastParsedTransform===i)return f;d._lastParsedTransform=i;var j,k=i.scale&&"function"==typeof i.scale?i.scale:0;"function"==typeof i[c]&&(j=i[c],i[c]=b),k&&(i.scale=k(r,a));var l,m,n,o,p,s,t,u,v,w=a._gsTransform,x=a.style,y=1e-6,z=Ba.length,A=i,B={},C="transformOrigin",D=Ra(a,e,!0,A.parseTransform),E=A.transform&&("function"==typeof A.transform?A.transform(r,q):A.transform);if(d._transform=D,E&&"string"==typeof E&&Ca)m=Q.style,m[Ca]=E,m.display="block",m.position="absolute",O.body.appendChild(Q),l=Ra(Q,null,!1),D.svg&&(s=D.xOrigin,t=D.yOrigin,l.x-=D.xOffset,l.y-=D.yOffset,(A.transformOrigin||A.svgOrigin)&&(E={},La(a,ha(A.transformOrigin),E,A.svgOrigin,A.smoothOrigin,!0),s=E.xOrigin,t=E.yOrigin,l.x-=E.xOffset-D.xOffset,l.y-=E.yOffset-D.yOffset),(s||t)&&(u=Qa(Q,!0),l.x-=s-(s*u[0]+t*u[2]),l.y-=t-(s*u[1]+t*u[3]))),O.body.removeChild(Q),l.perspective||(l.perspective=D.perspective),null!=A.xPercent&&(l.xPercent=ja(A.xPercent,D.xPercent)),null!=A.yPercent&&(l.yPercent=ja(A.yPercent,D.yPercent));else if("object"==typeof A){if(l={scaleX:ja(null!=A.scaleX?A.scaleX:A.scale,D.scaleX),scaleY:ja(null!=A.scaleY?A.scaleY:A.scale,D.scaleY),scaleZ:ja(A.scaleZ,D.scaleZ),x:ja(A.x,D.x),y:ja(A.y,D.y),z:ja(A.z,D.z),xPercent:ja(A.xPercent,D.xPercent),yPercent:ja(A.yPercent,D.yPercent),perspective:ja(A.transformPerspective,D.perspective)},p=A.directionalRotation,null!=p)if("object"==typeof p)for(m in p)A[m]=p[m];else A.rotation=p;"string"==typeof A.x&&-1!==A.x.indexOf("%")&&(l.x=0,l.xPercent=ja(A.x,D.xPercent)),"string"==typeof A.y&&-1!==A.y.indexOf("%")&&(l.y=0,l.yPercent=ja(A.y,D.yPercent)),l.rotation=ka("rotation"in A?A.rotation:"shortRotation"in A?A.shortRotation+"_short":"rotationZ"in A?A.rotationZ:D.rotation,D.rotation,"rotation",B),Fa&&(l.rotationX=ka("rotationX"in A?A.rotationX:"shortRotationX"in A?A.shortRotationX+"_short":D.rotationX||0,D.rotationX,"rotationX",B),l.rotationY=ka("rotationY"in A?A.rotationY:"shortRotationY"in A?A.shortRotationY+"_short":D.rotationY||0,D.rotationY,"rotationY",B)),l.skewX=ka(A.skewX,D.skewX),l.skewY=ka(A.skewY,D.skewY)}for(Fa&&null!=A.force3D&&(D.force3D=A.force3D,o=!0),D.skewType=A.skewType||D.skewType||g.defaultSkewType,n=D.force3D||D.z||D.rotationX||D.rotationY||l.z||l.rotationX||l.rotationY||l.perspective,n||null==A.scale||(l.scaleZ=1);--z>-1;)v=Ba[z],E=l[v]-D[v],(E>y||-y>E||null!=A[v]||null!=M[v])&&(o=!0,f=new ta(D,v,D[v],E,f),v in B&&(f.e=B[v]),f.xs0=0,f.plugin=h,d._overwriteProps.push(f.n));return E=A.transformOrigin,D.svg&&(E||A.svgOrigin)&&(s=D.xOffset,t=D.yOffset,La(a,ha(E),l,A.svgOrigin,A.smoothOrigin),f=ua(D,"xOrigin",(w?D:l).xOrigin,l.xOrigin,f,C),f=ua(D,"yOrigin",(w?D:l).yOrigin,l.yOrigin,f,C),(s!==D.xOffset||t!==D.yOffset)&&(f=ua(D,"xOffset",w?s:D.xOffset,D.xOffset,f,C),f=ua(D,"yOffset",w?t:D.yOffset,D.yOffset,f,C)),E="0px 0px"),(E||Fa&&n&&D.zOrigin)&&(Ca?(o=!0,v=Ea,E=(E||_(a,v,e,!1,"50% 50%"))+"",f=new ta(x,v,0,0,f,-1,C),f.b=x[v],f.plugin=h,Fa?(m=D.zOrigin,E=E.split(" "),D.zOrigin=(E.length>2&&(0===m||"0px"!==E[2])?parseFloat(E[2]):m)||0,f.xs0=f.e=E[0]+" "+(E[1]||"50%")+" 0px",f=new ta(D,"zOrigin",0,0,f,-1,f.n),f.b=m,f.xs0=f.e=D.zOrigin):f.xs0=f.e=E):ha(E+"",D)),o&&(d._transformType=D.svg&&Aa||!n&&3!==this._transformType?2:3),j&&(i[c]=j),k&&(i.scale=k),f},prefix:!0}),ya("boxShadow",{defaultValue:"0px 0px 0px 0px #999",prefix:!0,color:!0,multi:!0,keyword:"inset"}),ya("borderRadius",{defaultValue:"0px",parser:function(a,b,c,f,g,h){b=this.format(b);var i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y=["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],z=a.style;for(q=parseFloat(a.offsetWidth),r=parseFloat(a.offsetHeight),i=b.split(" "),j=0;j<y.length;j++)this.p.indexOf("border")&&(y[j]=Z(y[j])),m=l=_(a,y[j],e,!1,"0px"),-1!==m.indexOf(" ")&&(l=m.split(" "),m=l[0],l=l[1]),n=k=i[j],o=parseFloat(m),t=m.substr((o+"").length),u="="===n.charAt(1),u?(p=parseInt(n.charAt(0)+"1",10),n=n.substr(2),p*=parseFloat(n),s=n.substr((p+"").length-(0>p?1:0))||""):(p=parseFloat(n),s=n.substr((p+"").length)),""===s&&(s=d[c]||t),s!==t&&(v=aa(a,"borderLeft",o,t),w=aa(a,"borderTop",o,t),"%"===s?(m=v/q*100+"%",l=w/r*100+"%"):"em"===s?(x=aa(a,"borderLeft",1,"em"),m=v/x+"em",l=w/x+"em"):(m=v+"px",l=w+"px"),u&&(n=parseFloat(m)+p+s,k=parseFloat(l)+p+s)),g=va(z,y[j],m+" "+l,n+" "+k,!1,"0px",g);return g},prefix:!0,formatter:qa("0px 0px 0px 0px",!1,!0)}),ya("borderBottomLeftRadius,borderBottomRightRadius,borderTopLeftRadius,borderTopRightRadius",{defaultValue:"0px",parser:function(a,b,c,d,f,g){return va(a.style,c,this.format(_(a,c,e,!1,"0px 0px")),this.format(b),!1,"0px",f)},prefix:!0,formatter:qa("0px 0px",!1,!0)}),ya("backgroundPosition",{defaultValue:"0 0",parser:function(a,b,c,d,f,g){var h,i,j,k,l,m,n="background-position",o=e||$(a,null),q=this.format((o?p?o.getPropertyValue(n+"-x")+" "+o.getPropertyValue(n+"-y"):o.getPropertyValue(n):a.currentStyle.backgroundPositionX+" "+a.currentStyle.backgroundPositionY)||"0 0"),r=this.format(b);if(-1!==q.indexOf("%")!=(-1!==r.indexOf("%"))&&r.split(",").length<2&&(m=_(a,"backgroundImage").replace(D,""),m&&"none"!==m)){for(h=q.split(" "),i=r.split(" "),R.setAttribute("src",m),j=2;--j>-1;)q=h[j],k=-1!==q.indexOf("%"),k!==(-1!==i[j].indexOf("%"))&&(l=0===j?a.offsetWidth-R.width:a.offsetHeight-R.height,h[j]=k?parseFloat(q)/100*l+"px":parseFloat(q)/l*100+"%");q=h.join(" ")}return this.parseComplex(a.style,q,r,f,g)},formatter:ha}),ya("backgroundSize",{defaultValue:"0 0",formatter:function(a){return a+="",ha(-1===a.indexOf(" ")?a+" "+a:a)}}),ya("perspective",{defaultValue:"0px",prefix:!0}),ya("perspectiveOrigin",{defaultValue:"50% 50%",prefix:!0}),ya("transformStyle",{prefix:!0}),ya("backfaceVisibility",{prefix:!0}),ya("userSelect",{prefix:!0}),ya("margin",{parser:ra("marginTop,marginRight,marginBottom,marginLeft")}),ya("padding",{parser:ra("paddingTop,paddingRight,paddingBottom,paddingLeft")}),ya("clip",{defaultValue:"rect(0px,0px,0px,0px)",parser:function(a,b,c,d,f,g){var h,i,j;return 9>p?(i=a.currentStyle,j=8>p?" ":",",h="rect("+i.clipTop+j+i.clipRight+j+i.clipBottom+j+i.clipLeft+")",
b=this.format(b).split(",").join(j)):(h=this.format(_(a,this.p,e,!1,this.dflt)),b=this.format(b)),this.parseComplex(a.style,h,b,f,g)}}),ya("textShadow",{defaultValue:"0px 0px 0px #999",color:!0,multi:!0}),ya("autoRound,strictUnits",{parser:function(a,b,c,d,e){return e}}),ya("border",{defaultValue:"0px solid #000",parser:function(a,b,c,d,f,g){var h=_(a,"borderTopWidth",e,!1,"0px"),i=this.format(b).split(" "),j=i[0].replace(w,"");return"px"!==j&&(h=parseFloat(h)/aa(a,"borderTopWidth",1,j)+j),this.parseComplex(a.style,this.format(h+" "+_(a,"borderTopStyle",e,!1,"solid")+" "+_(a,"borderTopColor",e,!1,"#000")),i.join(" "),f,g)},color:!0,formatter:function(a){var b=a.split(" ");return b[0]+" "+(b[1]||"solid")+" "+(a.match(pa)||["#000"])[0]}}),ya("borderWidth",{parser:ra("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")}),ya("float,cssFloat,styleFloat",{parser:function(a,b,c,d,e,f){var g=a.style,h="cssFloat"in g?"cssFloat":"styleFloat";return new ta(g,h,0,0,e,-1,c,!1,0,g[h],b)}});var Ua=function(a){var b,c=this.t,d=c.filter||_(this.data,"filter")||"",e=this.s+this.c*a|0;100===e&&(-1===d.indexOf("atrix(")&&-1===d.indexOf("radient(")&&-1===d.indexOf("oader(")?(c.removeAttribute("filter"),b=!_(this.data,"filter")):(c.filter=d.replace(z,""),b=!0)),b||(this.xn1&&(c.filter=d=d||"alpha(opacity="+e+")"),-1===d.indexOf("pacity")?0===e&&this.xn1||(c.filter=d+" alpha(opacity="+e+")"):c.filter=d.replace(x,"opacity="+e))};ya("opacity,alpha,autoAlpha",{defaultValue:"1",parser:function(a,b,c,d,f,g){var h=parseFloat(_(a,"opacity",e,!1,"1")),i=a.style,j="autoAlpha"===c;return"string"==typeof b&&"="===b.charAt(1)&&(b=("-"===b.charAt(0)?-1:1)*parseFloat(b.substr(2))+h),j&&1===h&&"hidden"===_(a,"visibility",e)&&0!==b&&(h=0),U?f=new ta(i,"opacity",h,b-h,f):(f=new ta(i,"opacity",100*h,100*(b-h),f),f.xn1=j?1:0,i.zoom=1,f.type=2,f.b="alpha(opacity="+f.s+")",f.e="alpha(opacity="+(f.s+f.c)+")",f.data=a,f.plugin=g,f.setRatio=Ua),j&&(f=new ta(i,"visibility",0,0,f,-1,null,!1,0,0!==h?"inherit":"hidden",0===b?"hidden":"inherit"),f.xs0="inherit",d._overwriteProps.push(f.n),d._overwriteProps.push(c)),f}});var Va=function(a,b){b&&(a.removeProperty?(("ms"===b.substr(0,2)||"webkit"===b.substr(0,6))&&(b="-"+b),a.removeProperty(b.replace(B,"-$1").toLowerCase())):a.removeAttribute(b))},Wa=function(a){if(this.t._gsClassPT=this,1===a||0===a){this.t.setAttribute("class",0===a?this.b:this.e);for(var b=this.data,c=this.t.style;b;)b.v?c[b.p]=b.v:Va(c,b.p),b=b._next;1===a&&this.t._gsClassPT===this&&(this.t._gsClassPT=null)}else this.t.getAttribute("class")!==this.e&&this.t.setAttribute("class",this.e)};ya("className",{parser:function(a,b,d,f,g,h,i){var j,k,l,m,n,o=a.getAttribute("class")||"",p=a.style.cssText;if(g=f._classNamePT=new ta(a,d,0,0,g,2),g.setRatio=Wa,g.pr=-11,c=!0,g.b=o,k=ca(a,e),l=a._gsClassPT){for(m={},n=l.data;n;)m[n.p]=1,n=n._next;l.setRatio(1)}return a._gsClassPT=g,g.e="="!==b.charAt(1)?b:o.replace(new RegExp("(?:\\s|^)"+b.substr(2)+"(?![\\w-])"),"")+("+"===b.charAt(0)?" "+b.substr(2):""),a.setAttribute("class",g.e),j=da(a,k,ca(a),i,m),a.setAttribute("class",o),g.data=j.firstMPT,a.style.cssText=p,g=g.xfirst=f.parse(a,j.difs,g,h)}});var Xa=function(a){if((1===a||0===a)&&this.data._totalTime===this.data._totalDuration&&"isFromStart"!==this.data.data){var b,c,d,e,f,g=this.t.style,h=i.transform.parse;if("all"===this.e)g.cssText="",e=!0;else for(b=this.e.split(" ").join("").split(","),d=b.length;--d>-1;)c=b[d],i[c]&&(i[c].parse===h?e=!0:c="transformOrigin"===c?Ea:i[c].p),Va(g,c);e&&(Va(g,Ca),f=this.t._gsTransform,f&&(f.svg&&(this.t.removeAttribute("data-svg-origin"),this.t.removeAttribute("transform")),delete this.t._gsTransform))}};for(ya("clearProps",{parser:function(a,b,d,e,f){return f=new ta(a,d,0,0,f,2),f.setRatio=Xa,f.e=b,f.pr=-10,f.data=e._tween,c=!0,f}}),j="bezier,throwProps,physicsProps,physics2D".split(","),wa=j.length;wa--;)za(j[wa]);j=g.prototype,j._firstPT=j._lastParsedTransform=j._transform=null,j._onInitTween=function(a,b,h,j){if(!a.nodeType)return!1;this._target=q=a,this._tween=h,this._vars=b,r=j,k=b.autoRound,c=!1,d=b.suffixMap||g.suffixMap,e=$(a,""),f=this._overwriteProps;var n,p,s,t,u,v,w,x,z,A=a.style;if(l&&""===A.zIndex&&(n=_(a,"zIndex",e),("auto"===n||""===n)&&this._addLazySet(A,"zIndex",0)),"string"==typeof b&&(t=A.cssText,n=ca(a,e),A.cssText=t+";"+b,n=da(a,n,ca(a)).difs,!U&&y.test(b)&&(n.opacity=parseFloat(RegExp.$1)),b=n,A.cssText=t),b.className?this._firstPT=p=i.className.parse(a,b.className,"className",this,null,null,b):this._firstPT=p=this.parse(a,b,null),this._transformType){for(z=3===this._transformType,Ca?m&&(l=!0,""===A.zIndex&&(w=_(a,"zIndex",e),("auto"===w||""===w)&&this._addLazySet(A,"zIndex",0)),o&&this._addLazySet(A,"WebkitBackfaceVisibility",this._vars.WebkitBackfaceVisibility||(z?"visible":"hidden"))):A.zoom=1,s=p;s&&s._next;)s=s._next;x=new ta(a,"transform",0,0,null,2),this._linkCSSP(x,null,s),x.setRatio=Ca?Ta:Sa,x.data=this._transform||Ra(a,e,!0),x.tween=h,x.pr=-1,f.pop()}if(c){for(;p;){for(v=p._next,s=t;s&&s.pr>p.pr;)s=s._next;(p._prev=s?s._prev:u)?p._prev._next=p:t=p,(p._next=s)?s._prev=p:u=p,p=v}this._firstPT=t}return!0},j.parse=function(a,b,c,f){var g,h,j,l,m,n,o,p,s,t,u=a.style;for(g in b)n=b[g],"function"==typeof n&&(n=n(r,q)),h=i[g],h?c=h.parse(a,n,g,this,c,f,b):(m=_(a,g,e)+"",s="string"==typeof n,"color"===g||"fill"===g||"stroke"===g||-1!==g.indexOf("Color")||s&&A.test(n)?(s||(n=na(n),n=(n.length>3?"rgba(":"rgb(")+n.join(",")+")"),c=va(u,g,m,n,!0,"transparent",c,0,f)):s&&J.test(n)?c=va(u,g,m,n,!0,null,c,0,f):(j=parseFloat(m),o=j||0===j?m.substr((j+"").length):"",(""===m||"auto"===m)&&("width"===g||"height"===g?(j=ga(a,g,e),o="px"):"left"===g||"top"===g?(j=ba(a,g,e),o="px"):(j="opacity"!==g?0:1,o="")),t=s&&"="===n.charAt(1),t?(l=parseInt(n.charAt(0)+"1",10),n=n.substr(2),l*=parseFloat(n),p=n.replace(w,"")):(l=parseFloat(n),p=s?n.replace(w,""):""),""===p&&(p=g in d?d[g]:o),n=l||0===l?(t?l+j:l)+p:b[g],o!==p&&""!==p&&(l||0===l)&&j&&(j=aa(a,g,j,o),"%"===p?(j/=aa(a,g,100,"%")/100,b.strictUnits!==!0&&(m=j+"%")):"em"===p||"rem"===p||"vw"===p||"vh"===p?j/=aa(a,g,1,p):"px"!==p&&(l=aa(a,g,l,p),p="px"),t&&(l||0===l)&&(n=l+j+p)),t&&(l+=j),!j&&0!==j||!l&&0!==l?void 0!==u[g]&&(n||n+""!="NaN"&&null!=n)?(c=new ta(u,g,l||j||0,0,c,-1,g,!1,0,m,n),c.xs0="none"!==n||"display"!==g&&-1===g.indexOf("Style")?n:m):W("invalid "+g+" tween value: "+b[g]):(c=new ta(u,g,j,l-j,c,0,g,k!==!1&&("px"===p||"zIndex"===g),0,m,n),c.xs0=p))),f&&c&&!c.plugin&&(c.plugin=f);return c},j.setRatio=function(a){var b,c,d,e=this._firstPT,f=1e-6;if(1!==a||this._tween._time!==this._tween._duration&&0!==this._tween._time)if(a||this._tween._time!==this._tween._duration&&0!==this._tween._time||this._tween._rawPrevTime===-1e-6)for(;e;){if(b=e.c*a+e.s,e.r?b=Math.round(b):f>b&&b>-f&&(b=0),e.type)if(1===e.type)if(d=e.l,2===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2;else if(3===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2+e.xn2+e.xs3;else if(4===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2+e.xn2+e.xs3+e.xn3+e.xs4;else if(5===d)e.t[e.p]=e.xs0+b+e.xs1+e.xn1+e.xs2+e.xn2+e.xs3+e.xn3+e.xs4+e.xn4+e.xs5;else{for(c=e.xs0+b+e.xs1,d=1;d<e.l;d++)c+=e["xn"+d]+e["xs"+(d+1)];e.t[e.p]=c}else-1===e.type?e.t[e.p]=e.xs0:e.setRatio&&e.setRatio(a);else e.t[e.p]=b+e.xs0;e=e._next}else for(;e;)2!==e.type?e.t[e.p]=e.b:e.setRatio(a),e=e._next;else for(;e;){if(2!==e.type)if(e.r&&-1!==e.type)if(b=Math.round(e.s+e.c),e.type){if(1===e.type){for(d=e.l,c=e.xs0+b+e.xs1,d=1;d<e.l;d++)c+=e["xn"+d]+e["xs"+(d+1)];e.t[e.p]=c}}else e.t[e.p]=b+e.xs0;else e.t[e.p]=e.e;else e.setRatio(a);e=e._next}},j._enableTransforms=function(a){this._transform=this._transform||Ra(this._target,e,!0),this._transformType=this._transform.svg&&Aa||!a&&3!==this._transformType?2:3};var Ya=function(a){this.t[this.p]=this.e,this.data._linkCSSP(this,this._next,null,!0)};j._addLazySet=function(a,b,c){var d=this._firstPT=new ta(a,b,0,0,this._firstPT,2);d.e=c,d.setRatio=Ya,d.data=this},j._linkCSSP=function(a,b,c,d){return a&&(b&&(b._prev=a),a._next&&(a._next._prev=a._prev),a._prev?a._prev._next=a._next:this._firstPT===a&&(this._firstPT=a._next,d=!0),c?c._next=a:d||null!==this._firstPT||(this._firstPT=a),a._next=b,a._prev=c),a},j._mod=function(a){for(var b=this._firstPT;b;)"function"==typeof a[b.p]&&a[b.p]===Math.round&&(b.r=1),b=b._next},j._kill=function(b){var c,d,e,f=b;if(b.autoAlpha||b.alpha){f={};for(d in b)f[d]=b[d];f.opacity=1,f.autoAlpha&&(f.visibility=1)}for(b.className&&(c=this._classNamePT)&&(e=c.xfirst,e&&e._prev?this._linkCSSP(e._prev,c._next,e._prev._prev):e===this._firstPT&&(this._firstPT=c._next),c._next&&this._linkCSSP(c._next,c._next._next,e._prev),this._classNamePT=null),c=this._firstPT;c;)c.plugin&&c.plugin!==d&&c.plugin._kill&&(c.plugin._kill(b),d=c.plugin),c=c._next;return a.prototype._kill.call(this,f)};var Za=function(a,b,c){var d,e,f,g;if(a.slice)for(e=a.length;--e>-1;)Za(a[e],b,c);else for(d=a.childNodes,e=d.length;--e>-1;)f=d[e],g=f.type,f.style&&(b.push(ca(f)),c&&c.push(f)),1!==g&&9!==g&&11!==g||!f.childNodes.length||Za(f,b,c)};return g.cascadeTo=function(a,c,d){var e,f,g,h,i=b.to(a,c,d),j=[i],k=[],l=[],m=[],n=b._internals.reservedProps;for(a=i._targets||i.target,Za(a,k,m),i.render(c,!0,!0),Za(a,l),i.render(0,!0,!0),i._enabled(!0),e=m.length;--e>-1;)if(f=da(m[e],k[e],l[e]),f.firstMPT){f=f.difs;for(g in d)n[g]&&(f[g]=d[g]);h={};for(g in f)h[g]=k[e][g];j.push(b.fromTo(m[e],c,h,f))}return j},a.activate([g]),g},!0)}),_gsScope._gsDefine&&_gsScope._gsQueue.pop()(),function(a){"use strict";var b=function(){return(_gsScope.GreenSockGlobals||_gsScope)[a]};"function"==typeof define&&define.amd?define(["TweenLite"],b):"undefined"!=typeof module&&module.exports&&(require("../TweenLite.js"),module.exports=b())}("CSSPlugin");


/* SPLIT TEXT UTIL */
/*!
 * VERSION: 0.5.6
 * DATE: 2017-01-17
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * @license Copyright (c) 2008-2017, GreenSock. All rights reserved.
 * SplitText is a Club GreenSock membership benefit; You must have a valid membership to use
 * this code without violating the terms of use. Visit http://greensock.com/club/ to sign up or get more details.
 * This work is subject to the software agreement that was issued with your membership.
 * 
 * @author: Jack Doyle, jack@greensock.com
 */
var _gsScope="undefined"!=typeof module&&module.exports&&"undefined"!=typeof global?global:this||window;!function(a){"use strict";var b=a.GreenSockGlobals||a,c=function(a){var c,d=a.split("."),e=b;for(c=0;c<d.length;c++)e[d[c]]=e=e[d[c]]||{};return e},d=c("com.greensock.utils"),e=function(a){var b=a.nodeType,c="";if(1===b||9===b||11===b){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===b||4===b)return a.nodeValue;return c},f=document,g=f.defaultView?f.defaultView.getComputedStyle:function(){},h=/([A-Z])/g,i=function(a,b,c,d){var e;return(c=c||g(a,null))?(a=c.getPropertyValue(b.replace(h,"-$1").toLowerCase()),e=a||c.length?a:c[b]):a.currentStyle&&(c=a.currentStyle,e=c[b]),d?e:parseInt(e,10)||0},j=function(a){return a.length&&a[0]&&(a[0].nodeType&&a[0].style&&!a.nodeType||a[0].length&&a[0][0])?!0:!1},k=function(a){var b,c,d,e=[],f=a.length;for(b=0;f>b;b++)if(c=a[b],j(c))for(d=c.length,d=0;d<c.length;d++)e.push(c[d]);else e.push(c);return e},l=/(?:\r|\n|\t\t)/g,m=/(?:\s\s+)/g,n=55296,o=56319,p=56320,q=127462,r=127487,s=127995,t=127999,u=function(a){return(a.charCodeAt(0)-n<<10)+(a.charCodeAt(1)-p)+65536},v=f.all&&!f.addEventListener,w=" style='position:relative;display:inline-block;"+(v?"*display:inline;*zoom:1;'":"'"),x=function(a,b){a=a||"";var c=-1!==a.indexOf("++"),d=1;return c&&(a=a.split("++").join("")),function(){return"<"+b+w+(a?" class='"+a+(c?d++:"")+"'>":">")}},y=d.SplitText=b.SplitText=function(a,b){if("string"==typeof a&&(a=y.selector(a)),!a)throw"cannot split a null element.";this.elements=j(a)?k(a):[a],this.chars=[],this.words=[],this.lines=[],this._originals=[],this.vars=b||{},this.split(b)},z=function(a,b,c){var d=a.nodeType;if(1===d||9===d||11===d)for(a=a.firstChild;a;a=a.nextSibling)z(a,b,c);else(3===d||4===d)&&(a.nodeValue=a.nodeValue.split(b).join(c))},A=function(a,b){for(var c=b.length;--c>-1;)a.push(b[c])},B=function(a){var b,c=[],d=a.length;for(b=0;b!==d;c.push(a[b++]));return c},C=function(a,b,c){for(var d;a&&a!==b;){if(d=a._next||a.nextSibling)return d.textContent.charAt(0)===c;a=a.parentNode||a._parent}return!1},D=function(a){var b,c,d=B(a.childNodes),e=d.length;for(b=0;e>b;b++)c=d[b],c._isSplit?D(c):(b&&3===c.previousSibling.nodeType?c.previousSibling.nodeValue+=3===c.nodeType?c.nodeValue:c.firstChild.nodeValue:3!==c.nodeType&&a.insertBefore(c.firstChild,c),a.removeChild(c))},E=function(a,b,c,d,e,h,j){var k,l,m,n,o,p,q,r,s,t,u,v,w=g(a),x=i(a,"paddingLeft",w),y=-999,B=i(a,"borderBottomWidth",w)+i(a,"borderTopWidth",w),E=i(a,"borderLeftWidth",w)+i(a,"borderRightWidth",w),F=i(a,"paddingTop",w)+i(a,"paddingBottom",w),G=i(a,"paddingLeft",w)+i(a,"paddingRight",w),H=.2*i(a,"fontSize"),I=i(a,"textAlign",w,!0),J=[],K=[],L=[],M=b.wordDelimiter||" ",N=b.span?"span":"div",O=b.type||b.split||"chars,words,lines",P=e&&-1!==O.indexOf("lines")?[]:null,Q=-1!==O.indexOf("words"),R=-1!==O.indexOf("chars"),S="absolute"===b.position||b.absolute===!0,T=b.linesClass,U=-1!==(T||"").indexOf("++"),V=[];for(P&&1===a.children.length&&a.children[0]._isSplit&&(a=a.children[0]),U&&(T=T.split("++").join("")),l=a.getElementsByTagName("*"),m=l.length,o=[],k=0;m>k;k++)o[k]=l[k];if(P||S)for(k=0;m>k;k++)n=o[k],p=n.parentNode===a,(p||S||R&&!Q)&&(v=n.offsetTop,P&&p&&Math.abs(v-y)>H&&"BR"!==n.nodeName&&(q=[],P.push(q),y=v),S&&(n._x=n.offsetLeft,n._y=v,n._w=n.offsetWidth,n._h=n.offsetHeight),P&&((n._isSplit&&p||!R&&p||Q&&p||!Q&&n.parentNode.parentNode===a&&!n.parentNode._isSplit)&&(q.push(n),n._x-=x,C(n,a,M)&&(n._wordEnd=!0)),"BR"===n.nodeName&&n.nextSibling&&"BR"===n.nextSibling.nodeName&&P.push([])));for(k=0;m>k;k++)n=o[k],p=n.parentNode===a,"BR"!==n.nodeName?(S&&(s=n.style,Q||p||(n._x+=n.parentNode._x,n._y+=n.parentNode._y),s.left=n._x+"px",s.top=n._y+"px",s.position="absolute",s.display="block",s.width=n._w+1+"px",s.height=n._h+"px"),!Q&&R?n._isSplit?(n._next=n.nextSibling,n.parentNode.appendChild(n)):n.parentNode._isSplit?(n._parent=n.parentNode,!n.previousSibling&&n.firstChild&&(n.firstChild._isFirst=!0),n.nextSibling&&" "===n.nextSibling.textContent&&!n.nextSibling.nextSibling&&V.push(n.nextSibling),n._next=n.nextSibling&&n.nextSibling._isFirst?null:n.nextSibling,n.parentNode.removeChild(n),o.splice(k--,1),m--):p||(v=!n.nextSibling&&C(n.parentNode,a,M),n.parentNode._parent&&n.parentNode._parent.appendChild(n),v&&n.parentNode.appendChild(f.createTextNode(" ")),b.span&&(n.style.display="inline"),J.push(n)):n.parentNode._isSplit&&!n._isSplit&&""!==n.innerHTML?K.push(n):R&&!n._isSplit&&(b.span&&(n.style.display="inline"),J.push(n))):P||S?(n.parentNode&&n.parentNode.removeChild(n),o.splice(k--,1),m--):Q||a.appendChild(n);for(k=V.length;--k>-1;)V[k].parentNode.removeChild(V[k]);if(P){for(S&&(t=f.createElement(N),a.appendChild(t),u=t.offsetWidth+"px",v=t.offsetParent===a?0:a.offsetLeft,a.removeChild(t)),s=a.style.cssText,a.style.cssText="display:none;";a.firstChild;)a.removeChild(a.firstChild);for(r=" "===M&&(!S||!Q&&!R),k=0;k<P.length;k++){for(q=P[k],t=f.createElement(N),t.style.cssText="display:block;text-align:"+I+";position:"+(S?"absolute;":"relative;"),T&&(t.className=T+(U?k+1:"")),L.push(t),m=q.length,l=0;m>l;l++)"BR"!==q[l].nodeName&&(n=q[l],t.appendChild(n),r&&n._wordEnd&&t.appendChild(f.createTextNode(" ")),S&&(0===l&&(t.style.top=n._y+"px",t.style.left=x+v+"px"),n.style.top="0px",v&&(n.style.left=n._x-v+"px")));0===m?t.innerHTML="&nbsp;":Q||R||(D(t),z(t,String.fromCharCode(160)," ")),S&&(t.style.width=u,t.style.height=n._h+"px"),a.appendChild(t)}a.style.cssText=s}S&&(j>a.clientHeight&&(a.style.height=j-F+"px",a.clientHeight<j&&(a.style.height=j+B+"px")),h>a.clientWidth&&(a.style.width=h-G+"px",a.clientWidth<h&&(a.style.width=h+E+"px"))),A(c,J),A(d,K),A(e,L)},F=function(a,b,c,d){var g,h,i,j,k,p,v,w,x,y=b.span?"span":"div",A=b.type||b.split||"chars,words,lines",B=(-1!==A.indexOf("words"),-1!==A.indexOf("chars")),C="absolute"===b.position||b.absolute===!0,D=b.wordDelimiter||" ",E=" "!==D?"":C?"&#173; ":" ",F=b.span?"</span>":"</div>",G=!0,H=f.createElement("div"),I=a.parentNode;for(I.insertBefore(H,a),H.textContent=a.nodeValue,I.removeChild(a),a=H,g=e(a),v=-1!==g.indexOf("<"),b.reduceWhiteSpace!==!1&&(g=g.replace(m," ").replace(l,"")),v&&(g=g.split("<").join("{{LT}}")),k=g.length,h=(" "===g.charAt(0)?E:"")+c(),i=0;k>i;i++)if(p=g.charAt(i),p===D&&g.charAt(i-1)!==D&&i){for(h+=G?F:"",G=!1;g.charAt(i+1)===D;)h+=E,i++;i===k-1?h+=E:")"!==g.charAt(i+1)&&(h+=E+c(),G=!0)}else"{"===p&&"{{LT}}"===g.substr(i,6)?(h+=B?d()+"{{LT}}</"+y+">":"{{LT}}",i+=5):p.charCodeAt(0)>=n&&p.charCodeAt(0)<=o||g.charCodeAt(i+1)>=65024&&g.charCodeAt(i+1)<=65039?(w=u(g.substr(i,2)),x=u(g.substr(i+2,2)),j=w>=q&&r>=w&&x>=q&&r>=x||x>=s&&t>=x?4:2,h+=B&&" "!==p?d()+g.substr(i,j)+"</"+y+">":g.substr(i,j),i+=j-1):h+=B&&" "!==p?d()+p+"</"+y+">":p;a.outerHTML=h+(G?F:""),v&&z(I,"{{LT}}","<")},G=function(a,b,c,d){var e,f,g=B(a.childNodes),h=g.length,j="absolute"===b.position||b.absolute===!0;if(3!==a.nodeType||h>1){for(b.absolute=!1,e=0;h>e;e++)f=g[e],(3!==f.nodeType||/\S+/.test(f.nodeValue))&&(j&&3!==f.nodeType&&"inline"===i(f,"display",null,!0)&&(f.style.display="inline-block",f.style.position="relative"),f._isSplit=!0,G(f,b,c,d));return b.absolute=j,void(a._isSplit=!0)}F(a,b,c,d)},H=y.prototype;H.split=function(a){this.isSplit&&this.revert(),this.vars=a=a||this.vars,this._originals.length=this.chars.length=this.words.length=this.lines.length=0;for(var b,c,d,e=this.elements.length,f=a.span?"span":"div",g=("absolute"===a.position||a.absolute===!0,x(a.wordsClass,f)),h=x(a.charsClass,f);--e>-1;)d=this.elements[e],this._originals[e]=d.innerHTML,b=d.clientHeight,c=d.clientWidth,G(d,a,g,h),E(d,a,this.chars,this.words,this.lines,c,b);return this.chars.reverse(),this.words.reverse(),this.lines.reverse(),this.isSplit=!0,this},H.revert=function(){if(!this._originals)throw"revert() call wasn't scoped properly.";for(var a=this._originals.length;--a>-1;)this.elements[a].innerHTML=this._originals[a];return this.chars=[],this.words=[],this.lines=[],this.isSplit=!1,this},y.selector=a.$||a.jQuery||function(b){var c=a.$||a.jQuery;return c?(y.selector=c,c(b)):"undefined"==typeof document?b:document.querySelectorAll?document.querySelectorAll(b):document.getElementById("#"===b.charAt(0)?b.substr(1):b)},y.version="0.5.6"}(_gsScope),function(a){"use strict";var b=function(){return(_gsScope.GreenSockGlobals||_gsScope)[a]};"function"==typeof define&&define.amd?define([],b):"undefined"!=typeof module&&module.exports&&(module.exports=b())}("SplitText");


try{
	window.GreenSockGlobals = null;
	window._gsQueue = null;
	window._gsDefine = null;

	delete(window.GreenSockGlobals);
	delete(window._gsQueue);
	delete(window._gsDefine);	
   } catch(e) {}

try{
	window.GreenSockGlobals = oldgs;
	window._gsQueue = oldgs_queue;
	} catch(e) {}

if (window.tplogs==true)
	try {
		console.groupEnd();
	} catch(e) {}

(function(e,t){
		e.waitForImages={hasImageProperties:["backgroundImage","listStyleImage","borderImage","borderCornerImage"]};e.expr[":"].uncached=function(t){var n=document.createElement("img");n.src=t.src;return e(t).is('img[src!=""]')&&!n.complete};e.fn.waitForImages=function(t,n,r){if(e.isPlainObject(arguments[0])){n=t.each;r=t.waitForAll;t=t.finished}t=t||e.noop;n=n||e.noop;r=!!r;if(!e.isFunction(t)||!e.isFunction(n)){throw new TypeError("An invalid callback was supplied.")}return this.each(function(){var i=e(this),s=[];if(r){var o=e.waitForImages.hasImageProperties||[],u=/url\((['"]?)(.*?)\1\)/g;i.find("*").each(function(){var t=e(this);if(t.is("img:uncached")){s.push({src:t.attr("src"),element:t[0]})}e.each(o,function(e,n){var r=t.css(n);if(!r){return true}var i;while(i=u.exec(r)){s.push({src:i[2],element:t[0]})}})})}else{i.find("img:uncached").each(function(){s.push({src:this.src,element:this})})}var f=s.length,l=0;if(f==0){t.call(i[0])}e.each(s,function(r,s){var o=new Image;e(o).bind("load error",function(e){l++;n.call(s.element,l,f,e.type=="load");if(l==f){t.call(i[0]);return false}});o.src=s.src})})};		
})(jQuery);

/********************************************
 * REVOLUTION 5.4.6.4 EXTENSION - ACTIONS
 * @version: 2.1.0 (22.11.2017)
 * @requires jquery.themepunch.revolution.js
 * @author ThemePunch
*********************************************/

!function($){"use strict";function getScrollRoot(){var e,t=document.documentElement,o=document.body,a=(void 0!==window.pageYOffset?window.pageYOffset:null)||o.scrollTop||t.scrollTop;return t.scrollTop=o.scrollTop=a+(a>0)?-1:1,e=t.scrollTop!==a?t:o,e.scrollTop=a,e}var _R=jQuery.fn.revolution,_ISM=_R.is_mobile(),extension={alias:"Actions Min JS",name:"revolution.extensions.actions.min.js",min_core:"5.4.5",version:"2.1.0"};jQuery.extend(!0,_R,{checkActions:function(e,t,o){if("stop"===_R.compare_version(extension).check)return!1;checkActions_intern(e,t,o)}});var checkActions_intern=function(e,t,o){o&&jQuery.each(o,function(o,a){a.delay=parseInt(a.delay,0)/1e3,e.addClass("tp-withaction"),t.fullscreen_esclistener||"exitfullscreen"!=a.action&&"togglefullscreen"!=a.action||(jQuery(document).keyup(function(t){27==t.keyCode&&jQuery("#rs-go-fullscreen").length>0&&e.trigger(a.event)}),t.fullscreen_esclistener=!0);var r="backgroundvideo"==a.layer?jQuery(".rs-background-video-layer"):"firstvideo"==a.layer?jQuery(".tp-revslider-slidesli").find(".tp-videolayer"):jQuery("#"+a.layer);switch(-1!=jQuery.inArray(a.action,["toggleslider","toggle_mute_video","toggle_global_mute_video","togglefullscreen"])&&e.data("togglelisteners",!0),a.action){case"togglevideo":jQuery.each(r,function(t,o){var a=(o=jQuery(o)).data("videotoggledby");void 0==a&&(a=new Array),a.push(e),o.data("videotoggledby",a)});break;case"togglelayer":jQuery.each(r,function(t,o){var r=(o=jQuery(o)).data("layertoggledby");void 0==r&&(r=new Array),r.push(e),o.data("layertoggledby",r),o.data("triggered_startstatus",a.layerstatus)});break;case"toggle_mute_video":case"toggle_global_mute_video":jQuery.each(r,function(t,o){var a=(o=jQuery(o)).data("videomutetoggledby");void 0==a&&(a=new Array),a.push(e),o.data("videomutetoggledby",a)});break;case"toggleslider":void 0==t.slidertoggledby&&(t.slidertoggledby=new Array),t.slidertoggledby.push(e);break;case"togglefullscreen":void 0==t.fullscreentoggledby&&(t.fullscreentoggledby=new Array),t.fullscreentoggledby.push(e)}switch(e.on(a.event,function(){if("click"===a.event&&e.hasClass("tp-temporarydisabled"))return!1;var o="backgroundvideo"==a.layer?jQuery(".active-revslide .slotholder .rs-background-video-layer"):"firstvideo"==a.layer?jQuery(".active-revslide .tp-videolayer").first():jQuery("#"+a.layer);if("stoplayer"==a.action||"togglelayer"==a.action||"startlayer"==a.action){if(o.length>0){var r=o.data();void 0!==r.clicked_time_stamp&&(new Date).getTime()-r.clicked_time_stamp>150&&(clearTimeout(r.triggerdelayIn),clearTimeout(r.triggerdelayOut)),r.clicked_time_stamp=(new Date).getTime(),"startlayer"==a.action||"togglelayer"==a.action&&"in"!=o.data("animdirection")?(r.animdirection="in",r.triggerstate="on",_R.toggleState(r.layertoggledby),_R.playAnimationFrame&&(clearTimeout(r.triggerdelayIn),r.triggerdelayIn=setTimeout(function(){_R.playAnimationFrame({caption:o,opt:t,frame:"frame_0",triggerdirection:"in",triggerframein:"frame_0",triggerframeout:"frame_999"})},1e3*a.delay))):("stoplayer"==a.action||"togglelayer"==a.action&&"out"!=o.data("animdirection"))&&(r.animdirection="out",r.triggered=!0,r.triggerstate="off",_R.stopVideo&&_R.stopVideo(o,t),_R.unToggleState(r.layertoggledby),_R.endMoveCaption&&(clearTimeout(r.triggerdelayOut),r.triggerdelayOut=setTimeout(function(){_R.playAnimationFrame({caption:o,opt:t,frame:"frame_999",triggerdirection:"out",triggerframein:"frame_0",triggerframeout:"frame_999"})},1e3*a.delay)))}}else!_ISM||"playvideo"!=a.action&&"stopvideo"!=a.action&&"togglevideo"!=a.action&&"mutevideo"!=a.action&&"unmutevideo"!=a.action&&"toggle_mute_video"!=a.action&&"toggle_global_mute_video"!=a.action?(a.delay="NaN"===a.delay||NaN===a.delay?0:a.delay,_R.isSafari11()?actionSwitches(o,t,a,e):punchgs.TweenLite.delayedCall(a.delay,function(){actionSwitches(o,t,a,e)},[o,t,a,e])):actionSwitches(o,t,a,e)}),a.action){case"togglelayer":case"startlayer":case"playlayer":case"stoplayer":var l=(r=jQuery("#"+a.layer)).data();r.length>0&&void 0!==l&&(void 0!==l.frames&&"bytrigger"!=l.frames[0].delay||void 0===l.frames&&"bytrigger"!==l.start)&&(l.triggerstate="on")}})},actionSwitches=function(tnc,opt,a,_nc){switch(a.action){case"scrollbelow":a.speed=void 0!==a.speed?a.speed:400,a.ease=void 0!==a.ease?a.ease:punchgs.Power2.easeOut,_nc.addClass("tp-scrollbelowslider"),_nc.data("scrolloffset",a.offset),_nc.data("scrolldelay",a.delay),_nc.data("scrollspeed",a.speed),_nc.data("scrollease",a.ease);var off=getOffContH(opt.fullScreenOffsetContainer)||0,aof=parseInt(a.offset,0)||0;off=off-aof||0,opt.scrollRoot=jQuery(document);var sobj={_y:opt.scrollRoot.scrollTop()};punchgs.TweenLite.to(sobj,a.speed/1e3,{_y:opt.c.offset().top+jQuery(opt.li[0]).height()-off,ease:a.ease,onUpdate:function(){opt.scrollRoot.scrollTop(sobj._y)}});break;case"callback":eval(a.callback);break;case"jumptoslide":switch(a.slide.toLowerCase()){case"+1":case"next":opt.sc_indicator="arrow",_R.callingNewSlide(opt.c,1);break;case"previous":case"prev":case"-1":opt.sc_indicator="arrow",_R.callingNewSlide(opt.c,-1);break;default:var ts=jQuery.isNumeric(a.slide)?parseInt(a.slide,0):a.slide;_R.callingNewSlide(opt.c,ts)}break;case"simplelink":window.open(a.url,a.target);break;case"toggleslider":opt.noloopanymore=0,"playing"==opt.sliderstatus?(opt.c.revpause(),opt.forcepause_viatoggle=!0,_R.unToggleState(opt.slidertoggledby)):(opt.forcepause_viatoggle=!1,opt.c.revresume(),_R.toggleState(opt.slidertoggledby));break;case"pauseslider":opt.c.revpause(),_R.unToggleState(opt.slidertoggledby);break;case"playslider":opt.noloopanymore=0,opt.c.revresume(),_R.toggleState(opt.slidertoggledby);break;case"playvideo":tnc.length>0&&_R.playVideo(tnc,opt);break;case"stopvideo":tnc.length>0&&_R.stopVideo&&_R.stopVideo(tnc,opt);break;case"togglevideo":tnc.length>0&&(_R.isVideoPlaying(tnc,opt)?_R.stopVideo&&_R.stopVideo(tnc,opt):_R.playVideo(tnc,opt));break;case"mutevideo":tnc.length>0&&_R.muteVideo(tnc,opt);break;case"unmutevideo":tnc.length>0&&_R.unMuteVideo&&_R.unMuteVideo(tnc,opt);break;case"toggle_mute_video":tnc.length>0&&(_R.isVideoMuted(tnc,opt)?_R.unMuteVideo(tnc,opt):_R.muteVideo&&_R.muteVideo(tnc,opt)),_nc.toggleClass("rs-toggle-content-active");break;case"toggle_global_mute_video":!0===opt.globalmute?(opt.globalmute=!1,void 0!=opt.playingvideos&&opt.playingvideos.length>0&&jQuery.each(opt.playingvideos,function(e,t){_R.unMuteVideo&&_R.unMuteVideo(t,opt)})):(opt.globalmute=!0,void 0!=opt.playingvideos&&opt.playingvideos.length>0&&jQuery.each(opt.playingvideos,function(e,t){_R.muteVideo&&_R.muteVideo(t,opt)})),_nc.toggleClass("rs-toggle-content-active");break;case"simulateclick":tnc.length>0&&tnc.click();break;case"toggleclass":tnc.length>0&&(tnc.hasClass(a.classname)?tnc.removeClass(a.classname):tnc.addClass(a.classname));break;case"gofullscreen":case"exitfullscreen":case"togglefullscreen":if(jQuery(".rs-go-fullscreen").length>0&&("togglefullscreen"==a.action||"exitfullscreen"==a.action)){jQuery(".rs-go-fullscreen").removeClass("rs-go-fullscreen");var gf=opt.c.closest(".forcefullwidth_wrapper_tp_banner").length>0?opt.c.closest(".forcefullwidth_wrapper_tp_banner"):opt.c.closest(".rev_slider_wrapper");opt.minHeight=opt.oldminheight,opt.infullscreenmode=!1,opt.c.revredraw(),jQuery(window).trigger("resize"),_R.unToggleState(opt.fullscreentoggledby)}else if(0==jQuery(".rs-go-fullscreen").length&&("togglefullscreen"==a.action||"gofullscreen"==a.action)){var gf=opt.c.closest(".forcefullwidth_wrapper_tp_banner").length>0?opt.c.closest(".forcefullwidth_wrapper_tp_banner"):opt.c.closest(".rev_slider_wrapper");gf.addClass("rs-go-fullscreen"),opt.oldminheight=opt.minHeight,opt.minHeight=jQuery(window).height(),opt.infullscreenmode=!0,opt.c.revredraw(),jQuery(window).trigger("resize"),_R.toggleState(opt.fullscreentoggledby)}break;default:var obj={};obj.event=a,obj.layer=_nc,opt.c.trigger("layeraction",[obj])}},getOffContH=function(e){if(void 0==e)return 0;if(e.split(",").length>1){var t=e.split(","),o=0;return t&&jQuery.each(t,function(e,t){jQuery(t).length>0&&(o+=jQuery(t).outerHeight(!0))}),o}return jQuery(e).height()}}(jQuery);
/********************************************
 * REVOLUTION 5.4 EXTENSION - CAROUSEL
 * @version: 1.2.1 (18.11.2016)
 * @requires jquery.themepunch.revolution.js
 * @author ThemePunch
*********************************************/
!function(a){"use strict";var b=jQuery.fn.revolution,c={alias:"Carousel Min JS",name:"revolution.extensions.carousel.min.js",min_core:"5.3.0",version:"1.2.1"};jQuery.extend(!0,b,{prepareCarousel:function(a,d,h,i){return"stop"!==b.compare_version(c).check&&(h=a.carousel.lastdirection=f(h,a.carousel.lastdirection),e(a),a.carousel.slide_offset_target=j(a),void(void 0!==i?g(a,h,!1,0):void 0==d?b.carouselToEvalPosition(a,h):g(a,h,!1)))},carouselToEvalPosition:function(a,c){var d=a.carousel;c=d.lastdirection=f(c,d.lastdirection);var e="center"===d.horizontal_align?(d.wrapwidth/2-d.slide_width/2-d.slide_globaloffset)/d.slide_width:(0-d.slide_globaloffset)/d.slide_width,h=b.simp(e,a.slideamount,!1),i=h-Math.floor(h),j=0,k=-1*(Math.ceil(h)-h),l=-1*(Math.floor(h)-h);j=i>=.3&&"left"===c||i>=.7&&"right"===c?k:i<.3&&"left"===c||i<.7&&"right"===c?l:j,j="off"===d.infinity?h<0?h:e>a.slideamount-1?e-(a.slideamount-1):j:j,d.slide_offset_target=j*d.slide_width,0!==Math.abs(d.slide_offset_target)?g(a,c,!0):b.organiseCarousel(a,c)},organiseCarousel:function(a,b,c,d){b=void 0===b||"down"==b||"up"==b||null===b||jQuery.isEmptyObject(b)?"left":b;for(var e=a.carousel,f=new Array,g=e.slides.length,i=("right"===e.horizontal_align?a.width:0,0);i<g;i++){var j=i*e.slide_width+e.slide_offset;"on"===e.infinity&&(j=j>e.wrapwidth-e.inneroffset&&"right"==b?e.slide_offset-(e.slides.length-i)*e.slide_width:j,j=j<0-e.inneroffset-e.slide_width&&"left"==b?j+e.maxwidth:j),f[i]=j}var k=999;e.slides&&jQuery.each(e.slides,function(d,h){var i=f[d];"on"===e.infinity&&(i=i>e.wrapwidth-e.inneroffset&&"left"===b?f[0]-(g-d)*e.slide_width:i,i=i<0-e.inneroffset-e.slide_width?"left"==b?i+e.maxwidth:"right"===b?f[g-1]+(d+1)*e.slide_width:i:i);var j=new Object;j.left=i+e.inneroffset;var l="center"===e.horizontal_align?(Math.abs(e.wrapwidth/2)-(j.left+e.slide_width/2))/e.slide_width:(e.inneroffset-j.left)/e.slide_width,n="center"===e.horizontal_align?2:1;if((c&&Math.abs(l)<k||0===l)&&(k=Math.abs(l),e.focused=d),j.width=e.slide_width,j.x=0,j.transformPerspective=1200,j.transformOrigin="50% "+e.vertical_align,"on"===e.fadeout)if("on"===e.vary_fade)j.autoAlpha=1-Math.abs(1/Math.ceil(e.maxVisibleItems/n)*l);else switch(e.horizontal_align){case"center":j.autoAlpha=Math.abs(l)<Math.ceil(e.maxVisibleItems/n-1)?1:1-(Math.abs(l)-Math.floor(Math.abs(l)));break;case"left":j.autoAlpha=l<1&&l>0?1-l:Math.abs(l)>e.maxVisibleItems-1?1-(Math.abs(l)-(e.maxVisibleItems-1)):1;break;case"right":j.autoAlpha=l>-1&&l<0?1-Math.abs(l):l>e.maxVisibleItems-1?1-(Math.abs(l)-(e.maxVisibleItems-1)):1}else j.autoAlpha=Math.abs(l)<Math.ceil(e.maxVisibleItems/n)?1:0;if(void 0!==e.minScale&&e.minScale>0)if("on"===e.vary_scale){j.scale=1-Math.abs(e.minScale/100/Math.ceil(e.maxVisibleItems/n)*l);var o=(e.slide_width-e.slide_width*j.scale)*Math.abs(l)}else{j.scale=l>=1||l<=-1?1-e.minScale/100:(100-e.minScale*Math.abs(l))/100;var o=(e.slide_width-e.slide_width*(1-e.minScale/100))*Math.abs(l)}void 0!==e.maxRotation&&0!=Math.abs(e.maxRotation)&&("on"===e.vary_rotation?(j.rotationY=Math.abs(e.maxRotation)-Math.abs((1-Math.abs(1/Math.ceil(e.maxVisibleItems/n)*l))*e.maxRotation),j.autoAlpha=Math.abs(j.rotationY)>90?0:j.autoAlpha):j.rotationY=l>=1||l<=-1?e.maxRotation:Math.abs(l)*e.maxRotation,j.rotationY=l<0?j.rotationY*-1:j.rotationY),j.x=-1*e.space*l,j.left=Math.floor(j.left),j.x=Math.floor(j.x),void 0!==j.scale?l<0?j.x-o:j.x+o:j.x,j.zIndex=Math.round(100-Math.abs(5*l)),j.transformStyle="3D"!=a.parallax.type&&"3d"!=a.parallax.type?"flat":"preserve-3d",punchgs.TweenLite.set(h,j)}),d&&(a.c.find(".next-revslide").removeClass("next-revslide"),jQuery(e.slides[e.focused]).addClass("next-revslide"),a.c.trigger("revolution.nextslide.waiting"));e.wrapwidth/2-e.slide_offset,e.maxwidth+e.slide_offset-e.wrapwidth/2}});var d=function(a){var b=a.carousel;b.infbackup=b.infinity,b.maxVisiblebackup=b.maxVisibleItems,b.slide_globaloffset="none",b.slide_offset=0,b.wrap=a.c.find(".tp-carousel-wrapper"),b.slides=a.c.find(".tp-revslider-slidesli"),0!==b.maxRotation&&("3D"!=a.parallax.type&&"3d"!=a.parallax.type?punchgs.TweenLite.set(b.wrap,{perspective:1200,transformStyle:"flat"}):punchgs.TweenLite.set(b.wrap,{perspective:1600,transformStyle:"preserve-3d"})),void 0!==b.border_radius&&parseInt(b.border_radius,0)>0&&punchgs.TweenLite.set(a.c.find(".tp-revslider-slidesli"),{borderRadius:b.border_radius})},e=function(a){void 0===a.bw&&b.setSize(a);var c=a.carousel,e=b.getHorizontalOffset(a.c,"left"),f=b.getHorizontalOffset(a.c,"right");void 0===c.wrap&&d(a),c.slide_width="on"!==c.stretch?a.gridwidth[a.curWinRange]*a.bw:a.c.width(),c.maxwidth=a.slideamount*c.slide_width,c.maxVisiblebackup>c.slides.length+1&&(c.maxVisibleItems=c.slides.length+2),c.wrapwidth=c.maxVisibleItems*c.slide_width+(c.maxVisibleItems-1)*c.space,c.wrapwidth="auto"!=a.sliderLayout?c.wrapwidth>a.c.closest(".tp-simpleresponsive").width()?a.c.closest(".tp-simpleresponsive").width():c.wrapwidth:c.wrapwidth>a.ul.width()?a.ul.width():c.wrapwidth,c.infinity=c.wrapwidth>=c.maxwidth?"off":c.infbackup,c.wrapoffset="center"===c.horizontal_align?(a.c.width()-f-e-c.wrapwidth)/2:0,c.wrapoffset="auto"!=a.sliderLayout&&a.outernav?0:c.wrapoffset<e?e:c.wrapoffset;var g="hidden";"3D"!=a.parallax.type&&"3d"!=a.parallax.type||(g="visible"),"right"===c.horizontal_align?punchgs.TweenLite.set(c.wrap,{left:"auto",right:c.wrapoffset+"px",width:c.wrapwidth,overflow:g}):punchgs.TweenLite.set(c.wrap,{right:"auto",left:c.wrapoffset+"px",width:c.wrapwidth,overflow:g}),c.inneroffset="right"===c.horizontal_align?c.wrapwidth-c.slide_width:0,c.realoffset=Math.abs(c.wrap.position().left),c.windhalf=jQuery(window).width()/2},f=function(a,b){return null===a||jQuery.isEmptyObject(a)?b:void 0===a?"right":a},g=function(a,c,d,e){var g=a.carousel;c=g.lastdirection=f(c,g.lastdirection);var h=new Object,i=d?punchgs.Power2.easeOut:g.easing;h.from=0,h.to=g.slide_offset_target,e=void 0===e?g.speed/1e3:e,e=d?.4:e,void 0!==g.positionanim&&g.positionanim.pause(),g.positionanim=punchgs.TweenLite.to(h,e,{from:h.to,onUpdate:function(){g.slide_offset=g.slide_globaloffset+h.from,g.slide_offset=b.simp(g.slide_offset,g.maxwidth),b.organiseCarousel(a,c,!1,!1)},onComplete:function(){g.slide_globaloffset="off"===g.infinity?g.slide_globaloffset+g.slide_offset_target:b.simp(g.slide_globaloffset+g.slide_offset_target,g.maxwidth),g.slide_offset=b.simp(g.slide_offset,g.maxwidth),b.organiseCarousel(a,c,!1,!0);var e=jQuery(a.li[g.focused]);a.c.find(".next-revslide").removeClass("next-revslide"),d&&b.callingNewSlide(a.c,e.data("index"))},ease:i})},h=function(a,b){return Math.abs(a)>Math.abs(b)?a>0?a-Math.abs(Math.floor(a/b)*b):a+Math.abs(Math.floor(a/b)*b):a},i=function(a,b,c){var c,c,d=b-a,e=b-c-a;return d=h(d,c),e=h(e,c),Math.abs(d)>Math.abs(e)?e:d},j=function(a){var c=0,d=a.carousel;if(void 0!==d.positionanim&&d.positionanim.kill(),"none"==d.slide_globaloffset)d.slide_globaloffset=c="center"===d.horizontal_align?d.wrapwidth/2-d.slide_width/2:0;else{d.slide_globaloffset=d.slide_offset,d.slide_offset=0;var e=a.c.find(".processing-revslide").index(),f="center"===d.horizontal_align?(d.wrapwidth/2-d.slide_width/2-d.slide_globaloffset)/d.slide_width:(0-d.slide_globaloffset)/d.slide_width;f=b.simp(f,a.slideamount,!1),e=e>=0?e:a.c.find(".active-revslide").index(),e=e>=0?e:0,c="off"===d.infinity?f-e:-i(f,e,a.slideamount),c*=d.slide_width}return c}}(jQuery);
/********************************************
 * REVOLUTION 5.4.6.5 EXTENSION - KEN BURN
 * @version: 1.3.1 (15.05.2017)
 * @requires jquery.themepunch.revolution.js
 * @author ThemePunch
*********************************************/
!function(a){"use strict";var b=jQuery.fn.revolution,c={alias:"KenBurns Min JS",name:"revolution.extensions.kenburn.min.js",min_core:"5.4",version:"1.3.1"};jQuery.extend(!0,b,{stopKenBurn:function(a){if("stop"===b.compare_version(c).check)return!1;void 0!=a.data("kbtl")&&a.data("kbtl").pause()},startKenBurn:function(a,d,e){if("stop"===b.compare_version(c).check)return!1;var f=a.data(),g=a.find(".defaultimg"),h=g.data("lazyload")||g.data("src"),j=(f.owidth,f.oheight,"carousel"===d.sliderType?d.carousel.slide_width:d.ul.width()),k=d.ul.height();if(a.data("kbtl")&&a.data("kbtl").kill(),e=e||0,0==a.find(".tp-kbimg").length){var m=g.data("mediafilter");m=void 0===m?"":m,a.append('<div class="tp-kbimg-wrap '+m+'" style="z-index:2;width:100%;height:100%;top:0px;left:0px;position:absolute;"><img class="tp-kbimg" src="'+h+'" style="position:absolute;" width="'+f.owidth+'" height="'+f.oheight+'"></div>'),a.data("kenburn",a.find(".tp-kbimg"))}var n=function(a,b,c,d,e,f,g){var h=a*c,i=b*c,j=Math.abs(d-h),k=Math.abs(e-i),l=new Object;return l.l=(0-f)*j,l.r=l.l+h,l.t=(0-g)*k,l.b=l.t+i,l.h=f,l.v=g,l},o=function(a,b,c,d,e){var f=a.bgposition.split(" ")||"center center",g="center"==f[0]?"50%":"left"==f[0]||"left"==f[1]?"0%":"right"==f[0]||"right"==f[1]?"100%":f[0],h="center"==f[1]?"50%":"top"==f[0]||"top"==f[1]?"0%":"bottom"==f[0]||"bottom"==f[1]?"100%":f[1];g=parseInt(g,0)/100||0,h=parseInt(h,0)/100||0;var i=new Object;return i.start=n(e.start.width,e.start.height,e.start.scale,b,c,g,h),i.end=n(e.start.width,e.start.height,e.end.scale,b,c,g,h),i},p=function(a,b,c){var d=c.scalestart/100,e=c.scaleend/100,f=void 0!=c.offsetstart?c.offsetstart.split(" ")||[0,0]:[0,0],g=void 0!=c.offsetend?c.offsetend.split(" ")||[0,0]:[0,0];c.bgposition="center center"==c.bgposition?"50% 50%":c.bgposition;var h=new Object,i=a*d,k=(c.owidth,c.oheight,a*e);c.owidth,c.oheight;if(h.start=new Object,h.starto=new Object,h.end=new Object,h.endo=new Object,h.start.width=a,h.start.height=h.start.width/c.owidth*c.oheight,h.start.height<b){var m=b/h.start.height;h.start.height=b,h.start.width=h.start.width*m}h.start.transformOrigin=c.bgposition,h.start.scale=d,h.end.scale=e,c.rotatestart=0===c.rotatestart?.01:c.rotatestart,h.start.rotation=c.rotatestart+"deg",h.end.rotation=c.rotateend+"deg";var n=o(c,a,b,f,h);f[0]=parseFloat(f[0])+n.start.l,g[0]=parseFloat(g[0])+n.end.l,f[1]=parseFloat(f[1])+n.start.t,g[1]=parseFloat(g[1])+n.end.t;var p=n.start.r-n.start.l,q=n.start.b-n.start.t,r=n.end.r-n.end.l,s=n.end.b-n.end.t;return f[0]=f[0]>0?0:p+f[0]<a?a-p:f[0],g[0]=g[0]>0?0:r+g[0]<a?a-r:g[0],f[1]=f[1]>0?0:q+f[1]<b?b-q:f[1],g[1]=g[1]>0?0:s+g[1]<b?b-s:g[1],h.starto.x=f[0]+"px",h.starto.y=f[1]+"px",h.endo.x=g[0]+"px",h.endo.y=g[1]+"px",h.end.ease=h.endo.ease=c.ease,h.end.force3D=h.endo.force3D=!0,h};void 0!=a.data("kbtl")&&(a.data("kbtl").kill(),a.removeData("kbtl"));var q=a.data("kenburn"),r=q.parent(),s=p(j,k,f),t=new punchgs.TimelineLite;if(t.pause(),s.start.transformOrigin="0% 0%",s.starto.transformOrigin="0% 0%",t.add(punchgs.TweenLite.fromTo(q,f.duration/1e3,s.start,s.end),0),t.add(punchgs.TweenLite.fromTo(r,f.duration/1e3,s.starto,s.endo),0),void 0!==f.blurstart&&void 0!==f.blurend&&(0!==f.blurstart||0!==f.blurend)){var u={a:f.blurstart},v={a:f.blurend,ease:s.endo.ease},w=new punchgs.TweenLite(u,f.duration/1e3,v);w.eventCallback("onUpdate",function(a){punchgs.TweenLite.set(a,{filter:"blur("+u.a+"px)",webkitFilter:"blur("+u.a+"px)"})},[r]),t.add(w,0)}t.progress(e),t.play(),a.data("kbtl",t)}})}(jQuery);
/************************************************
 * REVOLUTION 5.4.6.5 EXTENSION - LAYER ANIMATION
 * @version: 3.6.5 (10.06.2018)
 * @requires jquery.themepunch.revolution.js
 * @author ThemePunch
************************************************/
!function(e){"use strict";var A=jQuery.fn.revolution,l=(A.is_mobile(),A.is_android(),{alias:"LayerAnimation Min JS",name:"revolution.extensions.layeranimation.min.js",min_core:"5.4.6.4",version:"3.6.5"});jQuery.extend(!0,A,{updateMarkup:function(e,t){var i=jQuery(e).data();if(void 0!==i.start&&!i.frames_added&&void 0===i.frames){var a=new Array,n=F(B(),i.transform_in,void 0,!1),r=F(B(),i.transform_out,void 0,!1),o=F(B(),i.transform_hover,void 0,!1);jQuery.isNumeric(i.end)&&jQuery.isNumeric(i.start)&&jQuery.isNumeric(n.speed)&&(i.end=parseInt(i.end,0)-(parseInt(i.start,0)+parseFloat(n.speed,0))),a.push({frame:"0",delay:i.start,from:i.transform_in,to:i.transform_idle,split:i.splitin,speed:n.speed,ease:n.anim.ease,mask:i.mask_in,splitdelay:i.elementdelay}),a.push({frame:"5",delay:i.end,to:i.transform_out,split:i.splitout,speed:r.speed,ease:r.anim.ease,mask:i.mask_out,splitdelay:i.elementdelay}),i.transform_hover&&a.push({frame:"hover",to:i.transform_hover,style:i.style_hover,speed:o.speed,ease:o.anim.ease,splitdelay:i.elementdelay}),i.frames=a}if(!i.frames_added){if(i.inframeindex=0,i.outframeindex=-1,i.hoverframeindex=-1,void 0!==i.frames)for(var s=0;s<i.frames.length;s++)void 0!==i.frames[s].sfx_effect&&0<=i.frames[s].sfx_effect.indexOf("block")&&(0===s?(i.frames[s].from="o:0",i.frames[s].to="o:1"):i.frames[s].to="o:0",i._sfx="block"),void 0===i.frames[0].from&&(i.frames[0].from="o:inherit"),0===i.frames[0].delay&&(i.frames[0].delay=20),"hover"===i.frames[s].frame?i.hoverframeindex=s:"frame_999"!==i.frames[s].frame&&"frame_out"!==i.frames[s].frame&&"last"!==i.frames[s].frame&&"end"!==i.frames[s].frame||(i.outframeindex=s),void 0!==i.frames[s].split&&i.frames[s].split.match(/chars|words|lines/g)&&(i.splittext=!0);i.outframeindex=-1===i.outframeindex?-1===i.hoverframeindex?i.frames.length-1:i.frames.length-2:i.outframeindex,i.frames_added=!0}},animcompleted:function(e,t){var i=e.data(),a=i.videotype,n=i.autoplay,r=i.autoplayonlyfirsttime;null!=a&&"none"!=a&&(1==n||"true"==n||"on"==n||"1sttime"==n||r?(("carousel"!==t.sliderType||"carousel"===t.sliderType&&"on"===t.carousel.showLayersAllTime&&e.closest("li").hasClass("active-revslide")||"carousel"===t.sliderType&&"on"!==t.carousel.showLayersAllTime&&e.closest("li").hasClass("active-revslide"))&&A.playVideo(e,t),A.toggleState(e.data("videotoggledby")),(r||"1sttime"==n)&&(i.autoplayonlyfirsttime=!1,i.autoplay="off")):("no1sttime"==n&&(i.datasetautoplay="on"),A.unToggleState(e.data("videotoggledby"))))},handleStaticLayers:function(e,t){var i=parseInt(e.data("startslide"),0),a=parseInt(e.data("endslide"),0);i<0&&(i=0),a<0&&(a=t.realslideamount),0===i&&a===t.realslideamount-1&&(a=t.realslideamount+1),e.data("startslide",i),e.data("endslide",a)},animateTheCaptions:function(e){if("stop"===A.compare_version(l).check)return!1;var p=e.opt,t=e.slide,n=e.recall,i=e.maintimeline,r=e.preset,o=e.startslideanimat,s="carousel"===p.sliderType?0:p.width/2-p.gridwidth[p.curWinRange]*p.bw/2,a=t.data("index");if(p.layers=p.layers||new Object,p.layers[a]=p.layers[a]||t.find(".tp-caption"),p.layers.static=p.layers.static||p.c.find(".tp-static-layers").find(".tp-caption"),void 0===p.timelines&&A.createTimelineStructure(p),p.conh=p.c.height(),p.conw=p.c.width(),p.ulw=p.ul.width(),p.ulh=p.ul.height(),p.debugMode){t.addClass("indebugmode"),t.find(".helpgrid").remove(),p.c.find(".hglayerinfo").remove(),t.append('<div class="helpgrid" style="width:'+p.gridwidth[p.curWinRange]*p.bw+"px;height:"+p.gridheight[p.curWinRange]*p.bw+'px;"></div>');var d=t.find(".helpgrid");d.append('<div class="hginfo">Zoom:'+Math.round(100*p.bw)+"% &nbsp;&nbsp;&nbsp; Device Level:"+p.curWinRange+"&nbsp;&nbsp;&nbsp; Grid Preset:"+p.gridwidth[p.curWinRange]+"x"+p.gridheight[p.curWinRange]+"</div>"),p.c.append('<div class="hglayerinfo"></div>'),d.append('<div class="tlhg"></div>')}void 0!==a&&p.layers[a]&&jQuery.each(p.layers[a],function(e,t){var i=jQuery(this);A.updateMarkup(this,p),A.prepareSingleCaption({caption:i,opt:p,offsetx:s,offsety:0,index:e,recall:n,preset:r}),r&&0!==o||A.buildFullTimeLine({caption:i,opt:p,offsetx:s,offsety:0,index:e,recall:n,preset:r,regenerate:0===o}),n&&"carousel"===p.sliderType&&"on"===p.carousel.showLayersAllTime&&A.animcompleted(i,p)}),p.layers.static&&jQuery.each(p.layers.static,function(e,t){var i=jQuery(this),a=i.data();!0!==a.hoveredstatus&&!0!==a.inhoveroutanimation?(A.updateMarkup(this,p),A.prepareSingleCaption({caption:i,opt:p,offsetx:s,offsety:0,index:e,recall:n,preset:r}),r&&0!==o||!0===a.veryfirstststic||(A.buildFullTimeLine({caption:i,opt:p,offsetx:s,offsety:0,index:e,recall:n,preset:r,regenerate:0===o}),a.veryfirstststic=!0),n&&"carousel"===p.sliderType&&"on"===p.carousel.showLayersAllTime&&A.animcompleted(i,p)):A.prepareSingleCaption({caption:i,opt:p,offsetx:s,offsety:0,index:e,recall:n,preset:r})});var g=-1===p.nextSlide||void 0===p.nextSlide?0:p.nextSlide;void 0!==p.rowzones&&(g=g>p.rowzones.length?p.rowzones.length:g),null!=p.rowzones&&0<p.rowzones.length&&null!=p.rowzones[g]&&0<=g&&g<=p.rowzones.length&&0<p.rowzones[g].length&&A.setSize(p),r||void 0!==o&&(void 0!==a&&jQuery.each(p.timelines[a].layers,function(e,t){var i=t.layer.data();"none"!==t.wrapper&&void 0!==t.wrapper||("keep"==t.triggerstate&&"on"===i.triggerstate?A.playAnimationFrame({caption:t.layer,opt:p,frame:"frame_0",triggerdirection:"in",triggerframein:"frame_0",triggerframeout:"frame_999"}):t.timeline.restart())}),p.timelines.staticlayers&&jQuery.each(p.timelines.staticlayers.layers,function(e,t){var i=t.layer.data(),a=g>=t.firstslide&&g<=t.lastslide,n=g<t.firstslide||g>t.lastslide,r=t.timeline.getLabelTime("slide_"+t.firstslide),o=t.timeline.getLabelTime("slide_"+t.lastslide),s=i.static_layer_timeline_time,d="in"===i.animdirection||"out"!==i.animdirection&&void 0,l="bytrigger"===i.frames[0].delay,m=(i.frames[i.frames.length-1].delay,i.triggered_startstatus),c=i.lasttriggerstate;!0!==i.hoveredstatus&&1!=i.inhoveroutanimation&&(void 0!==s&&d&&("keep"==c?(A.playAnimationFrame({caption:t.layer,opt:p,frame:"frame_0",triggerdirection:"in",triggerframein:"frame_0",triggerframeout:"frame_999"}),i.triggeredtimeline.time(s)):!0!==i.hoveredstatus&&t.timeline.time(s)),"reset"===c&&"hidden"===m&&(t.timeline.time(0),i.animdirection="out"),a?d?g===t.lastslide&&(t.timeline.play(o),i.animdirection="in"):(l||"in"===i.animdirection||t.timeline.play(r),("visible"==m&&"keep"!==c||"keep"===c&&!0===d||"visible"==m&&void 0===d)&&(t.timeline.play(r+.01),i.animdirection="in")):n&&d&&t.timeline.play("frame_999"))})),null!=i&&setTimeout(function(){i.resume()},30)},prepareSingleCaption:function(e){var t=e.caption,i=t.data(),a=e.opt,n=e.recall,r=e.recall,o=(e.preset,jQuery("body").hasClass("rtl"));if(i._pw=void 0===i._pw?t.closest(".tp-parallax-wrap"):i._pw,i._lw=void 0===i._lw?t.closest(".tp-loop-wrap"):i._lw,i._mw=void 0===i._mw?t.closest(".tp-mask-wrap"):i._mw,i._responsive=i.responsive||"on",i._respoffset=i.responsive_offset||"on",i._ba=i.basealign||"grid",i._gw="grid"===i._ba?a.width:a.ulw,i._gh="grid"===i._ba?a.height:a.ulh,i._lig=void 0===i._lig?t.hasClass("rev_layer_in_group")?t.closest(".rev_group"):t.hasClass("rev_layer_in_column")?t.closest(".rev_column_inner"):t.hasClass("rev_column_inner")?t.closest(".rev_row"):"none":i._lig,i._column=void 0===i._column?t.hasClass("rev_column_inner")?t.closest(".rev_column"):"none":i._column,i._row=void 0===i._row?t.hasClass("rev_column_inner")?t.closest(".rev_row"):"none":i._row,i._ingroup=void 0===i._ingroup?!(t.hasClass("rev_group")||!t.closest(".rev_group")):i._ingroup,i._isgroup=void 0===i._isgroup?!!t.hasClass("rev_group"):i._isgroup,i._nctype=i.type||"none",i._cbgc_auto=void 0===i._cbgc_auto?"column"===i._nctype&&i._pw.find(".rev_column_bg_auto_sized"):i._cbgc_auto,i._cbgc_man=void 0===i._cbgc_man?"column"===i._nctype&&i._pw.find(".rev_column_bg_man_sized"):i._cbgc_man,i._slideid=i._slideid||t.closest(".tp-revslider-slidesli").data("index"),i._id=void 0===i._id?t.data("id")||t.attr("id"):i._id,i._slidelink=void 0===i._slidelink?void 0!==t.hasClass("slidelink")&&t.hasClass("slidelink"):i._slidelink,void 0===i._li&&(t.hasClass("tp-static-layer")?(i._isstatic=!0,i._li=t.closest(".tp-static-layers"),i._slideid="staticlayers"):i._li=t.closest(".tp-revslider-slidesli")),i._row=void 0===i._row?"column"===i._nctype&&i._pw.closest(".rev_row"):i._row,void 0===i._togglelisteners&&t.find(".rs-toggled-content")?(i._togglelisteners=!0,void 0===i.actions&&t.click(function(){A.swaptoggleState(t)})):i._togglelisteners=!1,"fullscreen"==a.sliderLayout&&(e.offsety=i._gh/2-a.gridheight[a.curWinRange]*a.bh/2),("on"==a.autoHeight||null!=a.minHeight&&0<a.minHeight)&&(e.offsety=a.conh/2-a.gridheight[a.curWinRange]*a.bh/2),e.offsety<0&&(e.offsety=0),a.debugMode){t.closest("li").find(".helpgrid").css({top:e.offsety+"px",left:e.offsetx+"px"});var s=a.c.find(".hglayerinfo");t.on("hover, mouseenter",function(){var i="";t.data()&&jQuery.each(t.data(),function(e,t){"object"!=typeof t&&(i=i+'<span style="white-space:nowrap"><span style="color:#27ae60">'+e+":</span>"+t+"</span>&nbsp; &nbsp; ")}),s.html(i)})}if("off"===(void 0===i.visibility?"oon":N(i.visibility,a)[a.forcedWinRange]||N(i.visibility,a)||"ooon")||i._gw<a.hideCaptionAtLimit&&"on"==i.captionhidden||i._gw<a.hideAllCaptionAtLimit?i._pw.addClass("tp-hidden-caption"):i._pw.removeClass("tp-hidden-caption"),i.layertype="html",e.offsetx<0&&(e.offsetx=0),null!=i.thumbimage&&null==i.videoposter&&(i.videoposter=i.thumbimage),0<t.find("img").length){var d=t.find("img");i.layertype="image",0==d.width()&&d.css({width:"auto"}),0==d.height()&&d.css({height:"auto"}),null==d.data("ww")&&0<d.width()&&d.data("ww",d.width()),null==d.data("hh")&&0<d.height()&&d.data("hh",d.height());var l=d.data("ww"),m=d.data("hh"),c="slide"==i._ba?a.ulw:a.gridwidth[a.curWinRange],p="slide"==i._ba?a.ulh:a.gridheight[a.curWinRange],g="full"===(l=N(d.data("ww"),a)[a.curWinRange]||N(d.data("ww"),a)||"auto")||"full-proportional"===l,u="full"===(m=N(d.data("hh"),a)[a.curWinRange]||N(d.data("hh"),a)||"auto")||"full-proportional"===m;if("full-proportional"===l){var f=d.data("owidth"),h=d.data("oheight");f/c<h/p?m=h*((l=c)/f):l=f*((m=p)/h)}else l=g?c:!jQuery.isNumeric(l)&&0<l.indexOf("%")?l:parseFloat(l),m=u?p:!jQuery.isNumeric(m)&&0<m.indexOf("%")?m:parseFloat(m);l=void 0===l?0:l,m=void 0===m?0:m,"off"!==i._responsive?("grid"!=i._ba&&g?jQuery.isNumeric(l)?d.css({width:l+"px"}):d.css({width:l}):jQuery.isNumeric(l)?d.css({width:l*a.bw+"px"}):d.css({width:l}),"grid"!=i._ba&&u?jQuery.isNumeric(m)?d.css({height:m+"px"}):d.css({height:m}):jQuery.isNumeric(m)?d.css({height:m*a.bh+"px"}):d.css({height:m})):d.css({width:l,height:m}),i._ingroup&&"row"!==i._nctype&&(void 0!==l&&!jQuery.isNumeric(l)&&"string"===jQuery.type(l)&&0<l.indexOf("%")&&punchgs.TweenLite.set([i._lw,i._pw,i._mw],{minWidth:l}),void 0!==m&&!jQuery.isNumeric(m)&&"string"===jQuery.type(m)&&0<m.indexOf("%")&&punchgs.TweenLite.set([i._lw,i._pw,i._mw],{minHeight:m}))}if("slide"===i._ba)e.offsetx=0,e.offsety=0;else if(i._isstatic&&void 0!==a.carousel&&void 0!==a.carousel.horizontal_align&&"carousel"===a.sliderType){switch(a.carousel.horizontal_align){case"center":e.offsetx=0+(a.ulw-a.gridwidth[a.curWinRange]*a.bw)/2;break;case"left":break;case"right":e.offsetx=a.ulw-a.gridwidth[a.curWinRange]*a.bw}e.offsetx=e.offsetx<0?0:e.offsetx}var v="html5"==i.audio?"audio":"video";if(t.hasClass("tp-videolayer")||t.hasClass("tp-audiolayer")||0<t.find("iframe").length||0<t.find(v).length){if(i.layertype="video",A.manageVideoLayer&&A.manageVideoLayer(t,a,n,r),!n&&!r){i.videotype;A.resetVideo&&A.resetVideo(t,a,e.preset)}var _=i.aspectratio;null!=_&&1<_.split(":").length&&A.prepareCoveredVideo(a,t);d=t.find("iframe")?t.find("iframe"):d=t.find(v);var b=!t.find("iframe"),y=t.hasClass("coverscreenvideo");d.css({display:"block"}),null==t.data("videowidth")&&(t.data("videowidth",d.width()),t.data("videoheight",d.height()));l=N(t.data("videowidth"),a)[a.curWinRange]||N(t.data("videowidth"),a)||"auto",m=N(t.data("videoheight"),a)[a.curWinRange]||N(t.data("videoheight"),a)||"auto";l="auto"===l||!jQuery.isNumeric(l)&&0<l.indexOf("%")?"auto"===l?"auto":"grid"===i._ba?a.gridwidth[a.curWinRange]*a.bw:i._gw:parseFloat(l)*a.bw+"px",m="auto"===m||!jQuery.isNumeric(m)&&0<m.indexOf("%")?"auto"===m?"auto":"grid"===i._ba?a.gridheight[a.curWinRange]*a.bw:i._gh:parseFloat(m)*a.bh+"px",i.cssobj=void 0===i.cssobj?V(t,0):i.cssobj;var w=Z(i.cssobj,a);if("auto"==w.lineHeight&&(w.lineHeight=w.fontSize+4),t.hasClass("fullscreenvideo")||y){e.offsetx=0,e.offsety=0,t.data("x",0),t.data("y",0);var x=i._gh;"on"==a.autoHeight&&(x=a.conh),t.css({width:i._gw,height:x})}else punchgs.TweenLite.set(t,{paddingTop:Math.round(w.paddingTop*a.bh)+"px",paddingBottom:Math.round(w.paddingBottom*a.bh)+"px",paddingLeft:Math.round(w.paddingLeft*a.bw)+"px",paddingRight:Math.round(w.paddingRight*a.bw)+"px",marginTop:w.marginTop*a.bh+"px",marginBottom:w.marginBottom*a.bh+"px",marginLeft:w.marginLeft*a.bw+"px",marginRight:w.marginRight*a.bw+"px",borderTopWidth:Math.round(w.borderTopWidth*a.bh)+"px",borderBottomWidth:Math.round(w.borderBottomWidth*a.bh)+"px",borderLeftWidth:Math.round(w.borderLeftWidth*a.bw)+"px",borderRightWidth:Math.round(w.borderRightWidth*a.bw)+"px",width:l,height:m});(0==b&&!y||1!=i.forcecover&&!t.hasClass("fullscreenvideo")&&!y)&&(d.width(l),d.height(m)),i._ingroup&&null!==i.videowidth&&void 0!==i.videowidth&&!jQuery.isNumeric(i.videowidth)&&0<i.videowidth.indexOf("%")&&punchgs.TweenLite.set([i._lw,i._pw,i._mw],{minWidth:i.videowidth})}E(t,a,0,i._responsive),t.hasClass("tp-resizeme")&&t.find("*").each(function(){E(jQuery(this),a,"rekursive",i._responsive)});var T=t.outerHeight(),k=t.css("backgroundColor");D(t,".frontcorner","left","borderRight","borderTopColor",T,k),D(t,".frontcornertop","left","borderRight","borderBottomColor",T,k),D(t,".backcorner","right","borderLeft","borderBottomColor",T,k),D(t,".backcornertop","right","borderLeft","borderTopColor",T,k),"on"==a.fullScreenAlignForce&&(e.offsetx=0,e.offsety=0),"block"===i._sfx&&void 0===i._bmask&&(i._bmask=jQuery('<div class="tp-blockmask"></div>'),i._mw.append(i._bmask)),i.arrobj=new Object,i.arrobj.voa=N(i.voffset,a)[a.curWinRange]||N(i.voffset,a)[0],i.arrobj.hoa=N(i.hoffset,a)[a.curWinRange]||N(i.hoffset,a)[0],i.arrobj.elx=N(i.x,a)[a.curWinRange]||N(i.x,a)[0],i.arrobj.ely=N(i.y,a)[a.curWinRange]||N(i.y,a)[0];var j=0==i.arrobj.voa.length?0:i.arrobj.voa,L=0==i.arrobj.hoa.length?0:i.arrobj.hoa,I=0==i.arrobj.elx.length?0:i.arrobj.elx,W=0==i.arrobj.ely.length?0:i.arrobj.ely;i.eow=t.outerWidth(!0),i.eoh=t.outerHeight(!0),0==i.eow&&0==i.eoh&&(i.eow=a.ulw,i.eoh=a.ulh);var R="off"!==i._respoffset?parseInt(j,0)*a.bw:parseInt(j,0),C="off"!==i._respoffset?parseInt(L,0)*a.bw:parseInt(L,0),z="grid"===i._ba?a.gridwidth[a.curWinRange]*a.bw:i._gw,O="grid"===i._ba?a.gridheight[a.curWinRange]*a.bw:i._gh;"on"==a.fullScreenAlignForce&&(z=a.ulw,O=a.ulh),"none"!==i._lig&&null!=i._lig&&(z=i._lig.width(),O=i._lig.height(),e.offsetx=0,e.offsety=0),I="center"===I||"middle"===I?z/2-i.eow/2+C:"left"===I?C:"right"===I?z-i.eow-C:"off"!==i._respoffset?I*a.bw:I,W="center"==W||"middle"==W?O/2-i.eoh/2+R:"top"==W?R:"bottom"==W?O-i.eoh-R:"off"!==i._respoffset?W*a.bw:W,o&&!i._slidelink&&(I+=i.eow),i._slidelink&&(I=0),i.calcx=parseInt(I,0)+e.offsetx,i.calcy=parseInt(W,0)+e.offsety;var Q=t.css("z-Index");if("row"!==i._nctype&&"column"!==i._nctype)punchgs.TweenLite.set(i._pw,{zIndex:Q,top:i.calcy,left:i.calcx,overwrite:"auto"});else if("row"!==i._nctype)punchgs.TweenLite.set(i._pw,{zIndex:Q,width:i.columnwidth,top:0,left:0,overwrite:"auto"});else if("row"===i._nctype){var S="grid"===i._ba?z+"px":"100%";punchgs.TweenLite.set(i._pw,{zIndex:Q,width:S,top:0,left:e.offsetx,overwrite:"auto"})}if(void 0!==i.blendmode&&punchgs.TweenLite.set(i._pw,{mixBlendMode:i.blendmode}),"row"===i._nctype&&(i.columnbreak<=a.curWinRange?t.addClass("rev_break_columns"):t.removeClass("rev_break_columns")),"on"==i.loopanimation&&punchgs.TweenLite.set(i._lw,{minWidth:i.eow,minHeight:i.eoh}),"column"===i._nctype){var M=void 0!==t[0]._gsTransform?t[0]._gsTransform.y:0,P=parseInt(i._column[0].style.paddingTop,0);punchgs.TweenLite.set(t,{y:0}),punchgs.TweenLite.set(i._cbgc_man,{y:parseInt(P+i._column.offset().top-t.offset().top,0)}),punchgs.TweenLite.set(t,{y:M})}i._ingroup&&"row"!==i._nctype&&(void 0!==i._groupw&&!jQuery.isNumeric(i._groupw)&&0<i._groupw.indexOf("%")&&punchgs.TweenLite.set([i._lw,i._pw,i._mw],{minWidth:i._groupw}),void 0!==i._grouph&&!jQuery.isNumeric(i._grouph)&&0<i._grouph.indexOf("%")&&punchgs.TweenLite.set([i._lw,i._pw,i._mw],{minHeight:i._grouph}))},createTimelineStructure:function(s){s.timelines=s.timelines||new Object,s.c.find(".tp-revslider-slidesli, .tp-static-layers").each(function(){var e=jQuery(this),o=e.data("index");s.timelines[o]=s.timelines[o]||{},s.timelines[o].layers=s.timelines[o].layers||new Object,e.find(".tp-caption").each(function(e){var t,i,a,n,r;t=jQuery(this),i=s.timelines[o].layers,a=o,r=new punchgs.TimelineLite({paused:!0}),(i=i||new Object)[t.attr("id")]=i[t.attr("id")]||new Object,"staticlayers"===a&&(i[t.attr("id")].firstslide=t.data("startslide"),i[t.attr("id")].lastslide=t.data("endslide")),t.data("slideid",a),i[t.attr("id")].defclasses=n=t[0].className,i[t.attr("id")].wrapper=0<=n.indexOf("rev_layer_in_column")?t.closest(".rev_column_inner"):0<=n.indexOf("rev_column_inner")?t.closest(".rev_row"):0<=n.indexOf("rev_layer_in_group")?t.closest(".rev_group"):"none",i[t.attr("id")].timeline=r,i[t.attr("id")].layer=t,i[t.attr("id")].triggerstate=t.data("lasttriggerstate"),i[t.attr("id")].dchildren=0<=n.indexOf("rev_row")?t[0].getElementsByClassName("rev_column_inner"):0<=n.indexOf("rev_column_inner")?t[0].getElementsByClassName("tp-caption"):0<=n.indexOf("rev_group")?t[0].getElementsByClassName("rev_layer_in_group"):"none",t.data("timeline",r)})})},buildFullTimeLine:function(e){var t,i,a=e.caption,n=a.data(),r=e.opt,o={},s=h();if(!(t=r.timelines[n._slideid].layers[n._id]).generated||!0===e.regenerate){if(i=t.timeline,t.generated=!0,void 0!==n.current_timeline&&!0!==e.regenerate?(n.current_timeline_pause=n.current_timeline.paused(),n.current_timeline_time=n.current_timeline.time(),n.current_is_nc_timeline=i===n.current_timeline,n.static_layer_timeline_time=n.current_timeline_time):(n.static_layer_timeline_time=n.current_timeline_time,n.current_timeline_time=0,n.current_timeline&&n.current_timeline.clear()),i.clear(),o.svg=null!=n.svg_src&&a.find("svg"),o.svg&&(n.idlesvg=f(n.svg_idle,u()),punchgs.TweenLite.set(o.svg,n.idlesvg.anim)),-1!==n.hoverframeindex&&void 0!==n.hoverframeindex&&!a.hasClass("rs-hover-ready")){if(a.addClass("rs-hover-ready"),n.hovertimelines={},n.hoveranim=F(s,n.frames[n.hoverframeindex].to),n.hoveranim=v(n.hoveranim,n.frames[n.hoverframeindex].style),o.svg){var d=f(n.svg_hover,u());null!=n.hoveranim.anim.color&&(d.anim.fill=n.hoveranim.anim.color,n.idlesvg.anim.css.fill=o.svg.css("fill")),n.hoversvg=d}a.hover(function(e){var t={caption:jQuery(e.currentTarget),opt:r,firstframe:"frame_0",lastframe:"frame_999"},i=(g(t),t.caption),a=i.data(),n=a.frames[a.hoverframeindex];a.forcehover=n.force,a.hovertimelines.item=punchgs.TweenLite.to(i,n.speed/1e3,a.hoveranim.anim),(a.hoverzIndex||a.hoveranim.anim&&a.hoveranim.anim.zIndex)&&(a.basiczindex=void 0===a.basiczindex?a.cssobj.zIndex:a.basiczindex,a.hoverzIndex=void 0===a.hoverzIndex?a.hoveranim.anim.zIndex:a.hoverzIndex,a.inhoverinanimation=!0,0===n.speed&&(a.inhoverinanimation=!1),a.hovertimelines.pwhoveranim=punchgs.TweenLite.to(a._pw,n.speed/1e3,{overwrite:"auto",zIndex:a.hoverzIndex}),a.hovertimelines.pwhoveranim.eventCallback("onComplete",function(e){e.inhoverinanimation=!1},[a])),o.svg&&(a.hovertimelines.svghoveranim=punchgs.TweenLite.to([o.svg,o.svg.find("path")],n.speed/1e3,a.hoversvg.anim)),a.hoveredstatus=!0},function(e){var t={caption:jQuery(e.currentTarget),opt:r,firstframe:"frame_0",lastframe:"frame_999"},i=(g(t),t.caption),a=i.data(),n=a.frames[a.hoverframeindex];a.hoveredstatus=!1,a.inhoveroutanimation=!0,a.hovertimelines.item.pause(),a.hovertimelines.item=punchgs.TweenLite.to(i,n.speed/1e3,jQuery.extend(!0,{},a._gsTransformTo)),0==n.speed&&(a.inhoveroutanimation=!1),a.hovertimelines.item.eventCallback("onComplete",function(e){e.inhoveroutanimation=!1},[a]),void 0!==a.hovertimelines.pwhoveranim&&(a.hovertimelines.pwhoveranim=punchgs.TweenLite.to(a._pw,n.speed/1e3,{overwrite:"auto",zIndex:a.basiczindex})),o.svg&&punchgs.TweenLite.to([o.svg,o.svg.find("path")],n.speed/1e3,a.idlesvg.anim)})}for(var l=0;l<n.frames.length;l++)if(l!==n.hoverframeindex){var m=l===n.inframeindex?"frame_0":l===n.outframeindex||"frame_999"===n.frames[l].frame?"frame_999":"frame_"+l;t[n.frames[l].framename=m]={},t[m].timeline=new punchgs.TimelineLite({align:"normal"});var c=n.frames[l].delay,p=(n.triggered_startstatus,void 0!==c?0<=jQuery.inArray(c,["slideenter","bytrigger","wait"])?c:parseInt(c,0)/1e3:"wait");void 0!==t.firstslide&&"frame_0"===m&&(i.addLabel("slide_"+t.firstslide+"_pause",0),i.addPause("slide_"+t.firstslide+"_pause"),i.addLabel("slide_"+t.firstslide,"+=0.005")),void 0!==t.lastslide&&"frame_999"===m&&(i.addLabel("slide_"+t.lastslide+"_pause","+=0.01"),i.addPause("slide_"+t.lastslide+"_pause"),i.addLabel("slide_"+t.lastslide,"+=0.005")),jQuery.isNumeric(p)?i.addLabel(m,"+="+p):(i.addLabel("pause_"+l,"+=0.01"),i.addPause("pause_"+l),i.addLabel(m,"+=0.01")),i=A.createFrameOnTimeline({caption:e.caption,timeline:i,label:m,frameindex:l,opt:r})}e.regenerate||(n.current_is_nc_timeline&&(n.current_timeline=i),n.current_timeline_pause?i.pause(n.current_timeline_time):i.time(n.current_timeline_time))}},createFrameOnTimeline:function(e){var t=e.caption,i=t.data(),a=e.label,n=e.timeline,r=e.frameindex,o=e.opt,s=t,d={},l=o.timelines[i._slideid].layers[i._id],m=i.frames.length-1,c=i.frames[r].split,p=i.frames[r].split_direction,g=i.frames[r].sfx_effect,u=!1;if(p=void 0===p?"forward":p,-1!==i.hoverframeindex&&i.hoverframeindex==m&&(m-=1),d.content=new punchgs.TimelineLite({align:"normal"}),d.mask=new punchgs.TimelineLite({align:"normal"}),void 0===n.vars.id&&(n.vars.id=Math.round(1e5*Math.random())),"column"===i._nctype&&(n.add(punchgs.TweenLite.set(i._cbgc_man,{visibility:"visible"}),a),n.add(punchgs.TweenLite.set(i._cbgc_auto,{visibility:"hidden"}),a)),i.splittext&&0===r){void 0!==i.mySplitText&&i.mySplitText.revert();var f=0<t.find("a").length?t.find("a"):t;i.mySplitText=new punchgs.SplitText(f,{type:"chars,words,lines",charsClass:"tp-splitted tp-charsplit",wordsClass:"tp-splitted tp-wordsplit",linesClass:"tp-splitted tp-linesplit"}),t.addClass("splitted")}void 0!==i.mySplitText&&c&&c.match(/chars|words|lines/g)&&(s=i.mySplitText[c],u=!0);var h,v,_=r!==i.outframeindex?F(B(),i.frames[r].to,void 0,u,s.length-1):void 0!==i.frames[r].to&&null===i.frames[r].to.match(/auto:auto/g)?F(X(),i.frames[r].to,1==o.sdir,u,s.length-1):F(X(),i.frames[i.inframeindex].from,0==o.sdir,u,s.length-1),b=void 0!==i.frames[r].from?F(_,i.frames[i.inframeindex].from,1==o.sdir,u,s.length-1):void 0,y=i.frames[r].splitdelay;if(0!==r||e.fromcurrentstate?v=H(i.frames[r].mask):h=H(i.frames[r].mask),_.anim.ease=void 0===i.frames[r].ease?punchgs.Power1.easeInOut:i.frames[r].ease,void 0!==b&&(b.anim.ease=void 0===i.frames[r].ease?punchgs.Power1.easeInOut:i.frames[r].ease,b.speed=void 0===i.frames[r].speed?b.speed:i.frames[r].speed,b.anim.x=b.anim.x*o.bw||Y(b.anim.x,o,i.eow,i.eoh,i.calcy,i.calcx,"horizontal"),b.anim.y=b.anim.y*o.bw||Y(b.anim.y,o,i.eow,i.eoh,i.calcy,i.calcx,"vertical")),void 0!==_&&(_.anim.ease=void 0===i.frames[r].ease?punchgs.Power1.easeInOut:i.frames[r].ease,_.speed=void 0===i.frames[r].speed?_.speed:i.frames[r].speed,_.anim.x=_.anim.x*o.bw||Y(_.anim.x,o,i.eow,i.eoh,i.calcy,i.calcx,"horizontal"),_.anim.y=_.anim.y*o.bw||Y(_.anim.y,o,i.eow,i.eoh,i.calcy,i.calcx,"vertical")),t.data("iframes")&&n.add(punchgs.TweenLite.set(t.find("iframe"),{autoAlpha:1}),a+"+=0.001"),r===i.outframeindex&&(i.frames[r].to&&i.frames[r].to.match(/auto:auto/g),_.speed=void 0===i.frames[r].speed||"inherit"===i.frames[r].speed?i.frames[i.inframeindex].speed:i.frames[r].speed,_.anim.ease=void 0===i.frames[r].ease||"inherit"===i.frames[r].ease?i.frames[i.inframeindex].ease:i.frames[r].ease,_.anim.overwrite="auto"),0!==r||e.fromcurrentstate)0===r&&e.fromcurrentstate&&(_.speed=b.speed);else{if(s!=t){var w=jQuery.extend({},_.anim,!0);n.add(punchgs.TweenLite.set(t,_.anim),a),(_=B()).ease=w.ease,void 0!==w.filter&&(_.anim.filter=w.filter),void 0!==w["-webkit-filter"]&&(_.anim["-webkit-filter"]=w["-webkit-filter"])}b.anim.visibility="hidden",b.anim.immediateRender=!0,_.anim.visibility="visible"}e.fromcurrentstate&&(_.anim.immediateRender=!0);var x=-1;if(0===r&&!e.fromcurrentstate&&void 0!==i._bmask&&void 0!==g&&0<=g.indexOf("block")||r===i.outframeindex&&!e.fromcurrentstate&&void 0!==i._bmask&&void 0!==g&&0<=g.indexOf("block")){var T=0===r?b.speed/1e3/2:_.speed/1e3/2,k=[{scaleY:1,scaleX:0,transformOrigin:"0% 50%"},{scaleY:1,scaleX:1,ease:_.anim.ease}],j={scaleY:1,scaleX:0,transformOrigin:"100% 50%",ease:_.anim.ease};switch(x=void 0===y?T:y+T,g){case"blocktoleft":case"blockfromright":k[0].transformOrigin="100% 50%",j.transformOrigin="0% 50%";break;case"blockfromtop":case"blocktobottom":k=[{scaleX:1,scaleY:0,transformOrigin:"50% 0%"},{scaleX:1,scaleY:1,ease:_.anim.ease}],j={scaleX:1,scaleY:0,transformOrigin:"50% 100%",ease:_.anim.ease};break;case"blocktotop":case"blockfrombottom":k=[{scaleX:1,scaleY:0,transformOrigin:"50% 100%"},{scaleX:1,scaleY:1,ease:_.anim.ease}],j={scaleX:1,scaleY:0,transformOrigin:"50% 0%",ease:_.anim.ease}}k[0].background=i.frames[r].sfxcolor,n.add(d.mask.fromTo(i._bmask,T,k[0],k[1],y),a),n.add(d.mask.to(i._bmask,T,j,x),a)}if(u)var L=M(s.length-1,p);if(0!==r||e.fromcurrentstate)if("block"===i._sfx_out&&r===i.outframeindex)n.add(d.content.staggerTo(s,.001,{autoAlpha:0,delay:x}),a),n.add(d.content.staggerTo(s,_.speed/1e3/2-.001,{x:0,delay:x}),a+"+=0.001");else if(u&&void 0!==L){R={to:P(_.anim)};for(var I in s){z=jQuery.extend({},_.anim);for(var W in R.to)z[W]=parseInt(R.to[W].values[R.to[W].index],0),R.to[W].index=R.to[W].index<R.to[W].len?R.to[W].index+1:0;void 0!==i.frames[r].color&&(z.color=i.frames[r].color),void 0!==i.frames[r].bgcolor&&(z.backgroundColor=i.frames[r].bgcolor),n.add(d.content.to(s[L[I]],_.speed/1e3,z,y*I),a)}}else void 0!==i.frames[r].color&&(_.anim.color=i.frames[r].color),void 0!==i.frames[r].bgcolor&&(_.anim.backgroundColor=i.frames[r].bgcolor),n.add(d.content.staggerTo(s,_.speed/1e3,_.anim,y),a);else if("block"===i._sfx_in)n.add(d.content.staggerFromTo(s,.05,{x:0,y:0,autoAlpha:0},{x:0,y:0,autoAlpha:1,delay:x}),a);else if(u&&void 0!==L){var R={from:P(b.anim),to:P(_.anim)};for(var I in s){var C=jQuery.extend({},b.anim),z=jQuery.extend({},_.anim);for(var W in R.from)C[W]=parseInt(R.from[W].values[R.from[W].index],0),R.from[W].index=R.from[W].index<R.from[W].len?R.from[W].index+1:0;z.ease=C.ease,void 0!==i.frames[r].color&&(C.color=i.frames[r].color,z.color=i.cssobj.styleProps.color),void 0!==i.frames[r].bgcolor&&(C.backgroundColor=i.frames[r].bgcolor,z.backgroundColor=i.cssobj.styleProps["background-color"]),n.add(d.content.fromTo(s[L[I]],b.speed/1e3,C,z,y*I),a)}}else void 0!==i.frames[r].color&&(b.anim.color=i.frames[r].color,_.anim.color=i.cssobj.styleProps.color),void 0!==i.frames[r].bgcolor&&(b.anim.backgroundColor=i.frames[r].bgcolor,_.anim.backgroundColor=i.cssobj.styleProps["background-color"]),n.add(d.content.staggerFromTo(s,b.speed/1e3,b.anim,_.anim,y),a);return void 0===v||!1===v||0===r&&e.ignorefirstframe||(v.anim.ease=void 0===v.anim.ease||"inherit"===v.anim.ease?i.frames[0].ease:v.anim.ease,v.anim.overflow="hidden",v.anim.x=v.anim.x*o.bw||Y(v.anim.x,o,i.eow,i.eoh,i.calcy,i.calcx,"horizontal"),v.anim.y=v.anim.y*o.bw||Y(v.anim.y,o,i.eow,i.eoh,i.calcy,i.calcx,"vertical")),0===r&&h&&!1!==h&&!e.fromcurrentstate||0===r&&e.ignorefirstframe?((v=new Object).anim=new Object,v.anim.overwrite="auto",v.anim.ease=_.anim.ease,v.anim.x=v.anim.y=0,h&&!1!==h&&(h.anim.x=h.anim.x*o.bw||Y(h.anim.x,o,i.eow,i.eoh,i.calcy,i.calcx,"horizontal"),h.anim.y=h.anim.y*o.bw||Y(h.anim.y,o,i.eow,i.eoh,i.calcy,i.calcx,"vertical"),h.anim.overflow="hidden")):0===r&&n.add(d.mask.set(i._mw,{overflow:"visible"}),a),void 0!==h&&void 0!==v&&!1!==h&&!1!==v?n.add(d.mask.fromTo(i._mw,b.speed/1e3,h.anim,v.anim,y),a):void 0!==v&&!1!==v&&n.add(d.mask.to(i._mw,_.speed/1e3,v.anim,y),a),n.addLabel(a+"_end"),i._gsTransformTo&&r===m&&i.hoveredstatus&&(i.hovertimelines.item=punchgs.TweenLite.to(t,0,i._gsTransformTo)),i._gsTransformTo=!1,d.content.eventCallback("onStart",O,[r,l,i._pw,i,n,_.anim,t,e.updateStaticTimeline,o]),d.content.eventCallback("onUpdate",Q,[a,i._id,i._pw,i,n,r,jQuery.extend(!0,{},_.anim),e.updateStaticTimeline,t,o]),d.content.eventCallback("onComplete",S,[r,i.frames.length,m,i._pw,i,n,e.updateStaticTimeline,t,o]),n},endMoveCaption:function(e){e.firstframe="frame_0",e.lastframe="frame_999";var t=g(e),i=e.caption.data();if(void 0!==e.frame?t.timeline.play(e.frame):(!t.static||e.currentslide>=t.removeonslide||e.currentslide<t.showonslide)&&(t.outnow=new punchgs.TimelineLite,t.timeline.pause(),!0===i.visibleelement&&A.createFrameOnTimeline({caption:e.caption,timeline:t.outnow,label:"outnow",frameindex:e.caption.data("outframeindex"),opt:e.opt,fromcurrentstate:!0}).play()),e.checkchildrens&&t.timeline_obj&&t.timeline_obj.dchildren&&"none"!==t.timeline_obj.dchildren&&0<t.timeline_obj.dchildren.length)for(var a=0;a<t.timeline_obj.dchildren.length;a++)A.endMoveCaption({caption:jQuery(t.timeline_obj.dchildren[a]),opt:e.opt})},playAnimationFrame:function(e){e.firstframe=e.triggerframein,e.lastframe=e.triggerframeout;var t,i=g(e),a=e.caption.data(),n=0;for(var r in a.frames)a.frames[r].framename===e.frame&&(t=n),n++;void 0!==a.triggeredtimeline&&a.triggeredtimeline.pause(),a.triggeredtimeline=new punchgs.TimelineLite,i.timeline.pause();var o=!0===a.visibleelement;a.triggeredtimeline=A.createFrameOnTimeline({caption:e.caption,timeline:a.triggeredtimeline,label:"triggered",frameindex:t,updateStaticTimeline:!0,opt:e.opt,ignorefirstframe:!0,fromcurrentstate:o}).play()},removeTheCaptions:function(e,i){if("stop"===A.compare_version(l).check)return!1;var t=e.data("index"),a=new Array;i.layers[t]&&jQuery.each(i.layers[t],function(e,t){a.push(t)});var n=A.currentSlideIndex(i);a&&jQuery.each(a,function(e){var t=jQuery(this);"carousel"===i.sliderType&&"on"===i.carousel.showLayersAllTime?(clearTimeout(t.data("videoplaywait")),A.stopVideo&&A.stopVideo(t,i)):(r(t),clearTimeout(t.data("videoplaywait")),A.endMoveCaption({caption:t,opt:i,currentslide:n})),A.removeMediaFromList&&A.removeMediaFromList(t,i),i.lastplayedvideos=[]})}});var O=function(e,t,i,a,n,r,o,s,d){var l={};if(l.layer=o,l.eventtype=0===e?"enterstage":e===a.outframeindex?"leavestage":"framestarted",l.layertype=o.data("layertype"),a.active=!0,l.frame_index=e,l.layersettings=o.data(),d.c.trigger("revolution.layeraction",[l]),"on"==a.loopanimation&&c(a._lw,d.bw),"enterstage"===l.eventtype&&(a.animdirection="in",a.visibleelement=!0,A.toggleState(a.layertoggledby)),"none"!==t.dchildren&&void 0!==t.dchildren&&0<t.dchildren.length)if(0===e)for(var m=0;m<t.dchildren.length;m++)jQuery(t.dchildren[m]).data("timeline").play(0);else if(e===a.outframeindex)for(m=0;m<t.dchildren.length;m++)A.endMoveCaption({caption:jQuery(t.dchildren[m]),opt:d,checkchildrens:!0});punchgs.TweenLite.set(i,{visibility:"visible"}),a.current_frame=e,a.current_timeline=n,a.current_timeline_time=n.time(),s&&(a.static_layer_timeline_time=a.current_timeline_time),a.last_frame_started=e},Q=function(e,t,i,a,n,r,o,s,d,l){"column"===a._nctype&&b(d,l),punchgs.TweenLite.set(i,{visibility:"visible"}),a.current_frame=r,a.current_timeline=n,a.current_timeline_time=n.time(),s&&(a.static_layer_timeline_time=a.current_timeline_time),void 0!==a.hoveranim&&!1===a._gsTransformTo&&(a._gsTransformTo=o,a._gsTransformTo&&a._gsTransformTo.startAt&&delete a._gsTransformTo.startAt,void 0===a.cssobj.styleProps.css?a._gsTransformTo=jQuery.extend(!0,{},a.cssobj.styleProps,a._gsTransformTo):a._gsTransformTo=jQuery.extend(!0,{},a.cssobj.styleProps.css,a._gsTransformTo)),a.visibleelement=!0},S=function(e,t,i,a,n,r,o,s,d){var l={};l.layer=s,l.eventtype=0===e?"enteredstage":e===t-1||e===i?"leftstage":"frameended",l.layertype=s.data("layertype"),l.layersettings=s.data(),d.c.trigger("revolution.layeraction",[l]),"leftstage"!==l.eventtype&&A.animcompleted(s,d),"leftstage"===l.eventtype&&A.stopVideo&&A.stopVideo(s,d),"column"===n._nctype&&(punchgs.TweenLite.to(n._cbgc_man,.01,{visibility:"hidden"}),punchgs.TweenLite.to(n._cbgc_auto,.01,{visibility:"visible"})),"leftstage"===l.eventtype&&(n.active=!1,punchgs.TweenLite.set(a,{visibility:"hidden",overwrite:"auto"}),n.animdirection="out",n.visibleelement=!1,A.unToggleState(n.layertoggledby),"video"===n._nctype&&A.resetVideo&&setTimeout(function(){A.resetVideo(s,d)},100)),n.current_frame=e,n.current_timeline=r,n.current_timeline_time=r.time(),o&&(n.static_layer_timeline_time=n.current_timeline_time)},g=function(e){var t={};return e.firstframe=void 0===e.firstframe?"frame_0":e.firstframe,e.lastframe=void 0===e.lastframe?"frame_999":e.lastframe,t.id=e.caption.data("id")||e.caption.attr("id"),t.slideid=e.caption.data("slideid")||e.caption.closest(".tp-revslider-slidesli").data("index"),t.timeline_obj=e.opt.timelines[t.slideid].layers[t.id],t.timeline=t.timeline_obj.timeline,t.ffs=t.timeline.getLabelTime(e.firstframe),t.ffe=t.timeline.getLabelTime(e.firstframe+"_end"),t.lfs=t.timeline.getLabelTime(e.lastframe),t.lfe=t.timeline.getLabelTime(e.lastframe+"_end"),t.ct=t.timeline.time(),t.static=null!=t.timeline_obj.firstslide||null!=t.timeline_obj.lastslide,t.static&&(t.showonslide=t.timeline_obj.firstslide,t.removeonslide=t.timeline_obj.lastslide),t},M=function(e,t){var i=new Array;switch(t){case"forward":case"random":for(var a=0;a<=e;a++)i.push(a);"random"===t&&(i=function(e){for(var t,i,a=e.length;0!==a;)i=Math.floor(Math.random()*a),t=e[a-=1],e[a]=e[i],e[i]=t;return e}(i));break;case"backward":for(a=0;a<=e;a++)i.push(e-a);break;case"middletoedge":var n=Math.ceil(e/2),r=n-1,o=n+1;i.push(n);for(a=0;a<n;a++)0<=r&&i.push(r),o<=e&&i.push(o),r--,o++;break;case"edgetomiddle":for(r=e,o=0,a=0;a<=Math.floor(e/2);a++)i.push(r),o<r&&i.push(o),r--,o++}return i},P=function(e){var t={};for(var i in e)"string"==typeof e[i]&&0<=e[i].indexOf("|")&&(void 0===t[i]&&(t[i]={index:0}),t[i].values=e[i].replace("[","").replace("]","").split("|"),t[i].len=t[i].values.length-1);return t},B=function(e){return(e=void 0===e?new Object:e).anim=void 0===e.anim?new Object:e.anim,e.anim.x=void 0===e.anim.x?0:e.anim.x,e.anim.y=void 0===e.anim.y?0:e.anim.y,e.anim.z=void 0===e.anim.z?0:e.anim.z,e.anim.rotationX=void 0===e.anim.rotationX?0:e.anim.rotationX,e.anim.rotationY=void 0===e.anim.rotationY?0:e.anim.rotationY,e.anim.rotationZ=void 0===e.anim.rotationZ?0:e.anim.rotationZ,e.anim.scaleX=void 0===e.anim.scaleX?1:e.anim.scaleX,e.anim.scaleY=void 0===e.anim.scaleY?1:e.anim.scaleY,e.anim.skewX=void 0===e.anim.skewX?0:e.anim.skewX,e.anim.skewY=void 0===e.anim.skewY?0:e.anim.skewY,e.anim.opacity=void 0===e.anim.opacity?1:e.anim.opacity,e.anim.transformOrigin=void 0===e.anim.transformOrigin?"50% 50%":e.anim.transformOrigin,e.anim.transformPerspective=void 0===e.anim.transformPerspective?600:e.anim.transformPerspective,e.anim.rotation=void 0===e.anim.rotation?0:e.anim.rotation,e.anim.force3D=void 0===e.anim.force3D?"auto":e.anim.force3D,e.anim.autoAlpha=void 0===e.anim.autoAlpha?1:e.anim.autoAlpha,e.anim.visibility=void 0===e.anim.visibility?"visible":e.anim.visibility,e.anim.overwrite=void 0===e.anim.overwrite?"auto":e.anim.overwrite,e.speed=void 0===e.speed?.3:e.speed,e.filter=void 0===e.filter?"blur(0px) grayscale(0%) brightness(100%)":e.filter,e["-webkit-filter"]=void 0===e["-webkit-filter"]?"blur(0px) grayscale(0%) brightness(100%)":e["-webkit-filter"],e},u=function(){var e=new Object;return e.anim=new Object,e.anim.stroke="none",e.anim.strokeWidth=0,e.anim.strokeDasharray="none",e.anim.strokeDashoffset="0",e},f=function(e,r){var t=e.split(";");return t&&jQuery.each(t,function(e,t){var i=t.split(":"),a=i[0],n=i[1];"sc"==a&&(r.anim.stroke=n),"sw"==a&&(r.anim.strokeWidth=n),"sda"==a&&(r.anim.strokeDasharray=n),"sdo"==a&&(r.anim.strokeDashoffset=n)}),r},X=function(){var e=new Object;return e.anim=new Object,e.anim.x=0,e.anim.y=0,e.anim.z=0,e},h=function(){var e=new Object;return e.anim=new Object,e.speed=.2,e},m=function(e,t,i,a,n){if(n=void 0===n?"":n,jQuery.isNumeric(parseFloat(e)))return parseFloat(e)+n;if(void 0===e||"inherit"===e)return t+"ext";if(1<e.split("{").length){var r=e.split(","),o=parseFloat(r[1].split("}")[0]);if(r=parseFloat(r[0].split("{")[1]),void 0!==i&&void 0!==a){parseInt(Math.random()*(o-r),0),parseInt(r,0);for(var s=0;s<a;s++)e=e+"|"+(parseInt(Math.random()*(o-r),0)+parseInt(r,0))+n;e+="]"}else e=Math.random()*(o-r)+r}return e},Y=function(e,t,i,a,n,r,o){return!jQuery.isNumeric(e)&&e.match(/%]/g)?(e=e.split("[")[1].split("]")[0],"horizontal"==o?e=(i+2)*parseInt(e,0)/100:"vertical"==o&&(e=(a+2)*parseInt(e,0)/100)):e="top"===(e="left"===(e="layer_top"===(e="layer_left"===e?0-i:"layer_right"===e?i:e)?0-a:"layer_bottom"===e?a:e)||"stage_left"===e?0-i-r:"right"===e||"stage_right"===e?t.conw-r:"center"===e||"stage_center"===e?t.conw/2-i/2-r:e)||"stage_top"===e?0-a-n:"bottom"===e||"stage_bottom"===e?t.conh-n:"middle"===e||"stage_middle"===e?t.conh/2-a/2-n:e,e},F=function(e,t,r,o,s){var d=new Object;if(d=jQuery.extend(!0,{},d,e),void 0===t)return d;var i=t.split(";"),l="";return i&&jQuery.each(i,function(e,t){var i=t.split(":"),a=i[0],n=i[1];r&&"none"!==r&&null!=n&&0<n.length&&n.match(/\(R\)/)&&("["===(n="right"===(n=n.replace("(R)",""))?"left":"left"===n?"right":"top"===n?"bottom":"bottom"===n?"top":n)[0]&&"-"===n[1]?n=n.replace("[-","["):"["===n[0]&&"-"!==n[1]?n=n.replace("[","[-"):"-"===n[0]?n=n.replace("-",""):n[0].match(/[1-9]/)&&(n="-"+n)),null!=n&&(n=n.replace(/\(R\)/,""),"rotationX"!=a&&"rX"!=a||(d.anim.rotationX=m(n,d.anim.rotationX,o,s,"deg")),"rotationY"!=a&&"rY"!=a||(d.anim.rotationY=m(n,d.anim.rotationY,o,s,"deg")),"rotationZ"!=a&&"rZ"!=a||(d.anim.rotation=m(n,d.anim.rotationZ,o,s,"deg")),"scaleX"!=a&&"sX"!=a||(d.anim.scaleX=m(n,d.anim.scaleX,o,s)),"scaleY"!=a&&"sY"!=a||(d.anim.scaleY=m(n,d.anim.scaleY,o,s)),"opacity"!=a&&"o"!=a||(d.anim.opacity=m(n,d.anim.opacity,o,s)),"fb"==a&&(l=""===l?"blur("+parseInt(n,0)+"px)":l+" blur("+parseInt(n,0)+"px)"),"fg"==a&&(l=""===l?"grayscale("+parseInt(n,0)+"%)":l+" grayscale("+parseInt(n,0)+"%)"),"fbr"==a&&(l=""===l?"brightness("+parseInt(n,0)+"%)":l+" brightness("+parseInt(n,0)+"%)"),0===d.anim.opacity&&(d.anim.autoAlpha=0),d.anim.opacity=0==d.anim.opacity?1e-4:d.anim.opacity,"skewX"!=a&&"skX"!=a||(d.anim.skewX=m(n,d.anim.skewX,o,s)),"skewY"!=a&&"skY"!=a||(d.anim.skewY=m(n,d.anim.skewY,o,s)),"x"==a&&(d.anim.x=m(n,d.anim.x,o,s)),"y"==a&&(d.anim.y=m(n,d.anim.y,o,s)),"z"==a&&(d.anim.z=m(n,d.anim.z,o,s)),"transformOrigin"!=a&&"tO"!=a||(d.anim.transformOrigin=n.toString()),"transformPerspective"!=a&&"tP"!=a||(d.anim.transformPerspective=parseInt(n,0)),"speed"!=a&&"s"!=a||(d.speed=parseFloat(n)))}),""!==l&&(d.anim["-webkit-filter"]=l,d.anim.filter=l),d},H=function(e){if(void 0===e)return!1;var n=new Object;n.anim=new Object;var t=e.split(";");return t&&jQuery.each(t,function(e,t){var i=(t=t.split(":"))[0],a=t[1];"x"==i&&(n.anim.x=a),"y"==i&&(n.anim.y=a),"s"==i&&(n.speed=parseFloat(a)),"e"!=i&&"ease"!=i||(n.anim.ease=a)}),n},N=function(i,e,t){if(null==i&&(i=0),!jQuery.isArray(i)&&"string"===jQuery.type(i)&&(1<i.split(",").length||1<i.split("[").length)){var a=(i=(i=i.replace("[","")).replace("]","")).match(/'/g)?i.split("',"):i.split(",");i=new Array,a&&jQuery.each(a,function(e,t){t=(t=t.replace("'","")).replace("'",""),i.push(t)})}else{var n=i;jQuery.isArray(i)||(i=new Array).push(n)}n=i[i.length-1];if(i.length<e.rle)for(var r=1;r<=e.curWinRange;r++)i.push(n);return i};function D(e,t,i,a,n,r,o){var s=e.find(t);s.css("borderWidth",r+"px"),s.css(i,0-r+"px"),s.css(a,"0px solid transparent"),s.css(n,o)}var v=function(a,e){if(void 0===e)return a;var t=(e=(e=(e=(e=(e=(e=(e=(e=e.replace("c:","color:")).replace("bg:","background-color:")).replace("bw:","border-width:")).replace("bc:","border-color:")).replace("br:","borderRadius:")).replace("bs:","border-style:")).replace("td:","text-decoration:")).replace("zi:","zIndex:")).split(";");return t&&jQuery.each(t,function(e,t){var i=t.split(":");0<i[0].length&&("background-color"===i[0]&&0<=i[1].indexOf("gradient")&&(i[0]="background"),a.anim[i[0]]=i[1])}),a},V=function(e,t){var i,a=new Object,n=!1;if("rekursive"==t&&(i=e.closest(".tp-caption"))&&e.css("fontSize")===i.css("fontSize")&&e.css("fontWeight")===i.css("fontWeight")&&e.css("lineHeight")===i.css("lineHeight")&&(n=!0),a.basealign=e.data("basealign")||"grid",a.fontSize=n?void 0===i.data("fontsize")?parseInt(i.css("fontSize"),0)||0:i.data("fontsize"):void 0===e.data("fontsize")?parseInt(e.css("fontSize"),0)||0:e.data("fontsize"),a.fontWeight=n?void 0===i.data("fontweight")?parseInt(i.css("fontWeight"),0)||0:i.data("fontweight"):void 0===e.data("fontweight")?parseInt(e.css("fontWeight"),0)||0:e.data("fontweight"),a.whiteSpace=n?void 0===i.data("whitespace")?i.css("whitespace")||"normal":i.data("whitespace"):void 0===e.data("whitespace")?e.css("whitespace")||"normal":e.data("whitespace"),a.textAlign=n?void 0===i.data("textalign")?i.css("textalign")||"inherit":i.data("textalign"):void 0===e.data("textalign")?e.css("textalign")||"inherit":e.data("textalign"),a.zIndex=n?void 0===i.data("zIndex")?i.css("zIndex")||"inherit":i.data("zIndex"):void 0===e.data("zIndex")?e.css("zIndex")||"inherit":e.data("zIndex"),-1!==jQuery.inArray(e.data("layertype"),["video","image","audio"])||e.is("img")?a.lineHeight=0:a.lineHeight=n?void 0===i.data("lineheight")?parseInt(i.css("lineHeight"),0)||0:i.data("lineheight"):void 0===e.data("lineheight")?parseInt(e.css("lineHeight"),0)||0:e.data("lineheight"),a.letterSpacing=n?void 0===i.data("letterspacing")?parseFloat(i.css("letterSpacing"),0)||0:i.data("letterspacing"):void 0===e.data("letterspacing")?parseFloat(e.css("letterSpacing"))||0:e.data("letterspacing"),a.paddingTop=void 0===e.data("paddingtop")?parseInt(e.css("paddingTop"),0)||0:e.data("paddingtop"),a.paddingBottom=void 0===e.data("paddingbottom")?parseInt(e.css("paddingBottom"),0)||0:e.data("paddingbottom"),a.paddingLeft=void 0===e.data("paddingleft")?parseInt(e.css("paddingLeft"),0)||0:e.data("paddingleft"),a.paddingRight=void 0===e.data("paddingright")?parseInt(e.css("paddingRight"),0)||0:e.data("paddingright"),a.marginTop=void 0===e.data("margintop")?parseInt(e.css("marginTop"),0)||0:e.data("margintop"),a.marginBottom=void 0===e.data("marginbottom")?parseInt(e.css("marginBottom"),0)||0:e.data("marginbottom"),a.marginLeft=void 0===e.data("marginleft")?parseInt(e.css("marginLeft"),0)||0:e.data("marginleft"),a.marginRight=void 0===e.data("marginright")?parseInt(e.css("marginRight"),0)||0:e.data("marginright"),a.borderTopWidth=void 0===e.data("bordertopwidth")?parseInt(e.css("borderTopWidth"),0)||0:e.data("bordertopwidth"),a.borderBottomWidth=void 0===e.data("borderbottomwidth")?parseInt(e.css("borderBottomWidth"),0)||0:e.data("borderbottomwidth"),a.borderLeftWidth=void 0===e.data("borderleftwidth")?parseInt(e.css("borderLeftWidth"),0)||0:e.data("borderleftwidth"),a.borderRightWidth=void 0===e.data("borderrightwidth")?parseInt(e.css("borderRightWidth"),0)||0:e.data("borderrightwidth"),"rekursive"!=t){if(a.color=void 0===e.data("color")?"nopredefinedcolor":e.data("color"),a.whiteSpace=n?void 0===i.data("whitespace")?i.css("whiteSpace")||"nowrap":i.data("whitespace"):void 0===e.data("whitespace")?e.css("whiteSpace")||"nowrap":e.data("whitespace"),a.textAlign=n?void 0===i.data("textalign")?i.css("textalign")||"inherit":i.data("textalign"):void 0===e.data("textalign")?e.css("textalign")||"inherit":e.data("textalign"),a.fontWeight=n?void 0===i.data("fontweight")?parseInt(i.css("fontWeight"),0)||0:i.data("fontweight"):void 0===e.data("fontweight")?parseInt(e.css("fontWeight"),0)||0:e.data("fontweight"),a.minWidth=void 0===e.data("width")?parseInt(e.css("minWidth"),0)||0:e.data("width"),a.minHeight=void 0===e.data("height")?parseInt(e.css("minHeight"),0)||0:e.data("height"),null!=e.data("videowidth")&&null!=e.data("videoheight")){var r=e.data("videowidth"),o=e.data("videoheight");r="100%"===r?"none":r,o="100%"===o?"none":o,e.data("width",r),e.data("height",o)}a.maxWidth=void 0===e.data("width")?parseInt(e.css("maxWidth"),0)||"none":e.data("width"),a.maxHeight=-1!==jQuery.inArray(e.data("type"),["column","row"])?"none":void 0===e.data("height")?parseInt(e.css("maxHeight"),0)||"none":e.data("height"),a.wan=void 0===e.data("wan")?parseInt(e.css("-webkit-transition"),0)||"none":e.data("wan"),a.moan=void 0===e.data("moan")?parseInt(e.css("-moz-animation-transition"),0)||"none":e.data("moan"),a.man=void 0===e.data("man")?parseInt(e.css("-ms-animation-transition"),0)||"none":e.data("man"),a.ani=void 0===e.data("ani")?parseInt(e.css("transition"),0)||"none":e.data("ani")}return a.styleProps={borderTopLeftRadius:e[0].style.borderTopLeftRadius,borderTopRightRadius:e[0].style.borderTopRightRadius,borderBottomRightRadius:e[0].style.borderBottomRightRadius,borderBottomLeftRadius:e[0].style.borderBottomLeftRadius,background:e[0].style.background,boxShadow:e[0].style.boxShadow,"background-color":e[0].style["background-color"],"border-top-color":e[0].style["border-top-color"],"border-bottom-color":e[0].style["border-bottom-color"],"border-right-color":e[0].style["border-right-color"],"border-left-color":e[0].style["border-left-color"],"border-top-style":e[0].style["border-top-style"],"border-bottom-style":e[0].style["border-bottom-style"],"border-left-style":e[0].style["border-left-style"],"border-right-style":e[0].style["border-right-style"],"border-left-width":e[0].style["border-left-width"],"border-right-width":e[0].style["border-right-width"],"border-bottom-width":e[0].style["border-bottom-width"],"border-top-width":e[0].style["border-top-width"],color:e[0].style.color,"text-decoration":e[0].style["text-decoration"],"font-style":e[0].style["font-style"]},""!==a.styleProps.background&&void 0!==a.styleProps.background&&a.styleProps.background!==a.styleProps["background-color"]||delete a.styleProps.background,""==a.styleProps.color&&(a.styleProps.color=e.css("color")),a},Z=function(a,n){var r=new Object;return a&&jQuery.each(a,function(e,t){var i=N(t,n)[n.curWinRange];r[e]=void 0!==i?i:a[e]}),r},_=function(e,t,i,a){return e="full"===(e=jQuery.isNumeric(e)?e*t+"px":e)?a:"auto"===e||"none"===e?i:e},E=function(e,t,i,a){var n=e.data();n=void 0===n?{}:n;try{if("BR"==e[0].nodeName||"br"==e[0].tagName)return!1}catch(e){}n.cssobj=void 0===n.cssobj?V(e,i):n.cssobj;var r=Z(n.cssobj,t),o=t.bw,s=t.bh;"off"===a&&(s=o=1),"auto"==r.lineHeight&&(r.lineHeight=r.fontSize+4);var d={Top:r.marginTop,Bottom:r.marginBottom,Left:r.marginLeft,Right:r.marginRight};if("column"===n._nctype&&(punchgs.TweenLite.set(n._column,{paddingTop:Math.round(r.marginTop*s)+"px",paddingBottom:Math.round(r.marginBottom*s)+"px",paddingLeft:Math.round(r.marginLeft*o)+"px",paddingRight:Math.round(r.marginRight*o)+"px"}),d={Top:0,Bottom:0,Left:0,Right:0}),!e.hasClass("tp-splitted")){if(e.css("-webkit-transition","none"),e.css("-moz-transition","none"),e.css("-ms-transition","none"),e.css("transition","none"),(void 0!==e.data("transform_hover")||void 0!==e.data("style_hover"))&&punchgs.TweenLite.set(e,r.styleProps),punchgs.TweenLite.set(e,{fontSize:Math.round(r.fontSize*o)+"px",fontWeight:r.fontWeight,letterSpacing:Math.floor(r.letterSpacing*o)+"px",paddingTop:Math.round(r.paddingTop*s)+"px",paddingBottom:Math.round(r.paddingBottom*s)+"px",paddingLeft:Math.round(r.paddingLeft*o)+"px",paddingRight:Math.round(r.paddingRight*o)+"px",marginTop:d.Top*s+"px",marginBottom:d.Bottom*s+"px",marginLeft:d.Left*o+"px",marginRight:d.Right*o+"px",borderTopWidth:Math.round(r.borderTopWidth*s)+"px",borderBottomWidth:Math.round(r.borderBottomWidth*s)+"px",borderLeftWidth:Math.round(r.borderLeftWidth*o)+"px",borderRightWidth:Math.round(r.borderRightWidth*o)+"px",lineHeight:Math.round(r.lineHeight*s)+"px",textAlign:r.textAlign,overwrite:"auto"}),"rekursive"!=i){var l="slide"==r.basealign?t.ulw:t.gridwidth[t.curWinRange],m="slide"==r.basealign?t.ulh:t.gridheight[t.curWinRange],c=_(r.maxWidth,o,"none",l),p=_(r.maxHeight,s,"none",m),g=_(r.minWidth,o,"0px",l),u=_(r.minHeight,s,"0px",m);if(g=void 0===g?0:g,u=void 0===u?0:u,c=void 0===c?"none":c,p=void 0===p?"none":p,n._isgroup&&("#1/1#"===g&&(g=c=l),"#1/2#"===g&&(g=c=l/2),"#1/3#"===g&&(g=c=l/3),"#1/4#"===g&&(g=c=l/4),"#1/5#"===g&&(g=c=l/5),"#1/6#"===g&&(g=c=l/6),"#2/3#"===g&&(g=c=l/3*2),"#3/4#"===g&&(g=c=l/4*3),"#2/5#"===g&&(g=c=l/5*2),"#3/5#"===g&&(g=c=l/5*3),"#4/5#"===g&&(g=c=l/5*4),"#3/6#"===g&&(g=c=l/6*3),"#4/6#"===g&&(g=c=l/6*4),"#5/6#"===g&&(g=c=l/6*5)),n._ingroup&&(n._groupw=g,n._grouph=u),punchgs.TweenLite.set(e,{maxWidth:c,maxHeight:p,minWidth:g,minHeight:u,whiteSpace:r.whiteSpace,textAlign:r.textAlign,overwrite:"auto"}),"nopredefinedcolor"!=r.color&&punchgs.TweenLite.set(e,{color:r.color,overwrite:"auto"}),null!=n.svg_src){var f="nopredefinedcolor"!=r.color&&null!=r.color?r.color:null!=r.css&&"nopredefinedcolor"!=r.css.color&&null!=r.css.color?r.css.color:null!=r.styleProps.color?r.styleProps.color:null!=r.styleProps.css&&null!=r.styleProps.css.color&&r.styleProps.css.color;0!=f&&(punchgs.TweenLite.set(e.find("svg"),{fill:f,overwrite:"auto"}),punchgs.TweenLite.set(e.find("svg path"),{fill:f,overwrite:"auto"}))}}"column"===n._nctype&&(void 0===n._column_bg_set&&(n._column_bg_set=e.css("backgroundColor"),n._column_bg_image=e.css("backgroundImage"),n._column_bg_image_repeat=e.css("backgroundRepeat"),n._column_bg_image_position=e.css("backgroundPosition"),n._column_bg_image_size=e.css("backgroundSize"),n._column_bg_opacity=e.data("bgopacity"),n._column_bg_opacity=void 0===n._column_bg_opacity?1:n._column_bg_opacity,punchgs.TweenLite.set(e,{backgroundColor:"transparent",backgroundImage:""})),setTimeout(function(){b(e,t)},1),n._cbgc_auto&&0<n._cbgc_auto.length&&(n._cbgc_auto[0].style.backgroundSize=n._column_bg_image_size,jQuery.isArray(r.marginLeft)?punchgs.TweenLite.set(n._cbgc_auto,{borderTopWidth:r.marginTop[t.curWinRange]*s+"px",borderLeftWidth:r.marginLeft[t.curWinRange]*o+"px",borderRightWidth:r.marginRight[t.curWinRange]*o+"px",borderBottomWidth:r.marginBottom[t.curWinRange]*s+"px",backgroundColor:n._column_bg_set,backgroundImage:n._column_bg_image,backgroundRepeat:n._column_bg_image_repeat,backgroundPosition:n._column_bg_image_position,opacity:n._column_bg_opacity}):punchgs.TweenLite.set(n._cbgc_auto,{borderTopWidth:r.marginTop*s+"px",borderLeftWidth:r.marginLeft*o+"px",borderRightWidth:r.marginRight*o+"px",borderBottomWidth:r.marginBottom*s+"px",backgroundColor:n._column_bg_set,backgroundImage:n._column_bg_image,backgroundRepeat:n._column_bg_image_repeat,backgroundPosition:n._column_bg_image_position,opacity:n._column_bg_opacity}))),setTimeout(function(){e.css("-webkit-transition",e.data("wan")),e.css("-moz-transition",e.data("moan")),e.css("-ms-transition",e.data("man")),e.css("transition",e.data("ani"))},30)}},b=function(e,t){var i,a,n,r=e.data();r._cbgc_man&&0<r._cbgc_man.length&&(jQuery.isArray(r.cssobj.marginLeft)?(r.cssobj.marginLeft[t.curWinRange]*t.bw,i=r.cssobj.marginTop[t.curWinRange]*t.bh,a=r.cssobj.marginBottom[t.curWinRange]*t.bh,r.cssobj.marginRight[t.curWinRange],t.bw):(r.cssobj.marginLeft*t.bw,i=r.cssobj.marginTop*t.bh,a=r.cssobj.marginBottom*t.bh,r.cssobj.marginRight,t.bw),n=r._row.hasClass("rev_break_columns")?"100%":r._row.height()-(i+a)+"px",r._cbgc_man[0].style.backgroundSize=r._column_bg_image_size,punchgs.TweenLite.set(r._cbgc_man,{width:"100%",height:n,backgroundColor:r._column_bg_set,backgroundImage:r._column_bg_image,backgroundRepeat:r._column_bg_image_repeat,backgroundPosition:r._column_bg_image_position,overwrite:"auto",opacity:r._column_bg_opacity}))},c=function(e,t){var i=e.data();if(e.hasClass("rs-pendulum")&&null==i._loop_timeline){i._loop_timeline=new punchgs.TimelineLite;var a=null==e.data("startdeg")?-20:e.data("startdeg"),n=null==e.data("enddeg")?20:e.data("enddeg"),r=null==e.data("speed")?2:e.data("speed"),o=null==e.data("origin")?"50% 50%":e.data("origin"),s=null==e.data("easing")?punchgs.Power2.easeInOut:e.data("easing");a*=t,n*=t,i._loop_timeline.append(new punchgs.TweenLite.fromTo(e,r,{force3D:"auto",rotation:a,transformOrigin:o},{rotation:n,ease:s})),i._loop_timeline.append(new punchgs.TweenLite.fromTo(e,r,{force3D:"auto",rotation:n,transformOrigin:o},{rotation:a,ease:s,onComplete:function(){i._loop_timeline.restart()}}))}if(e.hasClass("rs-rotate")&&null==i._loop_timeline){i._loop_timeline=new punchgs.TimelineLite;a=null==e.data("startdeg")?0:e.data("startdeg"),n=null==e.data("enddeg")?360:e.data("enddeg"),r=null==e.data("speed")?2:e.data("speed"),o=null==e.data("origin")?"50% 50%":e.data("origin"),s=null==e.data("easing")?punchgs.Power2.easeInOut:e.data("easing");a*=t,n*=t,i._loop_timeline.append(new punchgs.TweenLite.fromTo(e,r,{force3D:"auto",rotation:a,transformOrigin:o},{rotation:n,ease:s,onComplete:function(){i._loop_timeline.restart()}}))}if(e.hasClass("rs-slideloop")&&null==i._loop_timeline){i._loop_timeline=new punchgs.TimelineLite;var d=null==e.data("xs")?0:e.data("xs"),l=null==e.data("ys")?0:e.data("ys"),m=null==e.data("xe")?0:e.data("xe"),c=null==e.data("ye")?0:e.data("ye");r=null==e.data("speed")?2:e.data("speed"),s=null==e.data("easing")?punchgs.Power2.easeInOut:e.data("easing");d*=t,l*=t,m*=t,c*=t,i._loop_timeline.append(new punchgs.TweenLite.fromTo(e,r,{force3D:"auto",x:d,y:l},{x:m,y:c,ease:s})),i._loop_timeline.append(new punchgs.TweenLite.fromTo(e,r,{force3D:"auto",x:m,y:c},{x:d,y:l,onComplete:function(){i._loop_timeline.restart()}}))}if(e.hasClass("rs-pulse")&&null==i._loop_timeline){i._loop_timeline=new punchgs.TimelineLite;var p=null==e.data("zoomstart")?0:e.data("zoomstart"),g=null==e.data("zoomend")?0:e.data("zoomend");r=null==e.data("speed")?2:e.data("speed"),s=null==e.data("easing")?punchgs.Power2.easeInOut:e.data("easing");i._loop_timeline.append(new punchgs.TweenLite.fromTo(e,r,{force3D:"auto",scale:p},{scale:g,ease:s})),i._loop_timeline.append(new punchgs.TweenLite.fromTo(e,r,{force3D:"auto",scale:g},{scale:p,onComplete:function(){i._loop_timeline.restart()}}))}if(e.hasClass("rs-wave")&&null==i._loop_timeline){i._loop_timeline=new punchgs.TimelineLite;var u=null==e.data("angle")?10:parseInt(e.data("angle"),0),f=null==e.data("radius")?10:parseInt(e.data("radius"),0),h=(r=null==e.data("speed")?-20:e.data("speed"),(o=null==e.data("origin")?"50% 50%":e.data("origin")).split(" ")),v=new Object;1<=h.length?(v.x=h[0],v.y=h[1]):(v.x="50%",v.y="50%"),f*=t;var _=(parseInt(v.x,0)/100-.5)*e.width(),b=(parseInt(v.y,0)/100-.5)*e.height(),y={a:0,ang:u,element:e,unit:f,xoffset:0+_,yoffset:-1*f+b},w=parseInt(u,0),x=new punchgs.TweenLite.fromTo(y,r,{a:0+w},{a:360+w,force3D:"auto",ease:punchgs.Linear.easeNone});x.eventCallback("onUpdate",function(e){var t=e.a*(Math.PI/180),i=e.yoffset+e.unit*(1-Math.sin(t)),a=e.xoffset+Math.cos(t)*e.unit;punchgs.TweenLite.to(e.element,.1,{force3D:"auto",x:a,y:i})},[y]),x.eventCallback("onComplete",function(e){e._loop_timeline.restart()},[i]),i._loop_timeline.append(x)}},r=function(e){e.closest(".rs-pendulum, .rs-slideloop, .rs-pulse, .rs-wave").each(function(){null!=this._loop_timeline&&(this._loop_timeline.pause(),this._loop_timeline=null)})}}(jQuery);
/********************************************
 * REVOLUTION 5.4.6.5 EXTENSION - NAVIGATION
 * @version: 1.3.5 (06.04.2017)
 * @requires jquery.themepunch.revolution.js
 * @author ThemePunch
*********************************************/
!function(a){"use strict";var b=jQuery.fn.revolution,c=b.is_mobile(),d={alias:"Navigation Min JS",name:"revolution.extensions.navigation.min.js",min_core:"5.4.0",version:"1.3.5"};jQuery.extend(!0,b,{hideUnHideNav:function(a){var b=a.c.width(),c=a.navigation.arrows,d=a.navigation.bullets,e=a.navigation.thumbnails,f=a.navigation.tabs;m(c)&&y(a.c.find(".tparrows"),c.hide_under,b,c.hide_over),m(d)&&y(a.c.find(".tp-bullets"),d.hide_under,b,d.hide_over),m(e)&&y(a.c.parent().find(".tp-thumbs"),e.hide_under,b,e.hide_over),m(f)&&y(a.c.parent().find(".tp-tabs"),f.hide_under,b,f.hide_over),x(a)},resizeThumbsTabs:function(a,b){if(a.navigation&&a.navigation.tabs.enable||a.navigation&&a.navigation.thumbnails.enable){var c=(jQuery(window).width()-480)/500,d=new punchgs.TimelineLite,e=a.navigation.tabs,g=a.navigation.thumbnails,h=a.navigation.bullets;if(d.pause(),c=c>1?1:c<0?0:c,m(e)&&(b||e.width>e.min_width)&&f(c,d,a.c,e,a.slideamount,"tab"),m(g)&&(b||g.width>g.min_width)&&f(c,d,a.c,g,a.slideamount,"thumb"),m(h)&&b){var i=a.c.find(".tp-bullets");i.find(".tp-bullet").each(function(a){var b=jQuery(this),c=a+1,d=b.outerWidth()+parseInt(void 0===h.space?0:h.space,0),e=b.outerHeight()+parseInt(void 0===h.space?0:h.space,0);"vertical"===h.direction?(b.css({top:(c-1)*e+"px",left:"0px"}),i.css({height:(c-1)*e+b.outerHeight(),width:b.outerWidth()})):(b.css({left:(c-1)*d+"px",top:"0px"}),i.css({width:(c-1)*d+b.outerWidth(),height:b.outerHeight()}))})}d.play(),x(a)}return!0},updateNavIndexes:function(a){function d(a){c.find(a).lenght>0&&c.find(a).each(function(a){jQuery(this).data("liindex",a)})}var c=a.c;d(".tp-tab"),d(".tp-bullet"),d(".tp-thumb"),b.resizeThumbsTabs(a,!0),b.manageNavigation(a)},manageNavigation:function(a){var c=b.getHorizontalOffset(a.c.parent(),"left"),d=b.getHorizontalOffset(a.c.parent(),"right");m(a.navigation.bullets)&&("fullscreen"!=a.sliderLayout&&"fullwidth"!=a.sliderLayout&&(a.navigation.bullets.h_offset_old=void 0===a.navigation.bullets.h_offset_old?a.navigation.bullets.h_offset:a.navigation.bullets.h_offset_old,a.navigation.bullets.h_offset="center"===a.navigation.bullets.h_align?a.navigation.bullets.h_offset_old+c/2-d/2:a.navigation.bullets.h_offset_old+c-d),t(a.c.find(".tp-bullets"),a.navigation.bullets,a)),m(a.navigation.thumbnails)&&t(a.c.parent().find(".tp-thumbs"),a.navigation.thumbnails,a),m(a.navigation.tabs)&&t(a.c.parent().find(".tp-tabs"),a.navigation.tabs,a),m(a.navigation.arrows)&&("fullscreen"!=a.sliderLayout&&"fullwidth"!=a.sliderLayout&&(a.navigation.arrows.left.h_offset_old=void 0===a.navigation.arrows.left.h_offset_old?a.navigation.arrows.left.h_offset:a.navigation.arrows.left.h_offset_old,a.navigation.arrows.left.h_offset="right"===a.navigation.arrows.left.h_align?a.navigation.arrows.left.h_offset_old+d:a.navigation.arrows.left.h_offset_old+c,a.navigation.arrows.right.h_offset_old=void 0===a.navigation.arrows.right.h_offset_old?a.navigation.arrows.right.h_offset:a.navigation.arrows.right.h_offset_old,a.navigation.arrows.right.h_offset="right"===a.navigation.arrows.right.h_align?a.navigation.arrows.right.h_offset_old+d:a.navigation.arrows.right.h_offset_old+c),t(a.c.find(".tp-leftarrow.tparrows"),a.navigation.arrows.left,a),t(a.c.find(".tp-rightarrow.tparrows"),a.navigation.arrows.right,a)),m(a.navigation.thumbnails)&&e(a.c.parent().find(".tp-thumbs"),a.navigation.thumbnails),m(a.navigation.tabs)&&e(a.c.parent().find(".tp-tabs"),a.navigation.tabs)},createNavigation:function(a,f){if("stop"===b.compare_version(d).check)return!1;var g=a.parent(),j=f.navigation.arrows,n=f.navigation.bullets,r=f.navigation.thumbnails,s=f.navigation.tabs,t=m(j),v=m(n),x=m(r),y=m(s);h(a,f),i(a,f),t&&q(a,j,f),f.li.each(function(b){var c=jQuery(f.li[f.li.length-1-b]),d=jQuery(this);v&&(f.navigation.bullets.rtl?u(a,n,c,f):u(a,n,d,f)),x&&(f.navigation.thumbnails.rtl?w(a,r,c,"tp-thumb",f):w(a,r,d,"tp-thumb",f)),y&&(f.navigation.tabs.rtl?w(a,s,c,"tp-tab",f):w(a,s,d,"tp-tab",f))}),a.bind("revolution.slide.onafterswap revolution.nextslide.waiting",function(){var b=0==a.find(".next-revslide").length?a.find(".active-revslide").data("index"):a.find(".next-revslide").data("index");a.find(".tp-bullet").each(function(){var a=jQuery(this);a.data("liref")===b?a.addClass("selected"):a.removeClass("selected")}),g.find(".tp-thumb, .tp-tab").each(function(){var a=jQuery(this);a.data("liref")===b?(a.addClass("selected"),a.hasClass("tp-tab")?e(g.find(".tp-tabs"),s):e(g.find(".tp-thumbs"),r)):a.removeClass("selected")});var c=0,d=!1;f.thumbs&&jQuery.each(f.thumbs,function(a,e){c=!1===d?a:c,d=e.id===b||a===b||d});var h=c>0?c-1:f.slideamount-1,i=c+1==f.slideamount?0:c+1;if(!0===j.enable){var k=j.tmp;if(void 0!=f.thumbs[h]&&jQuery.each(f.thumbs[h].params,function(a,b){k=k.replace(b.from,b.to)}),j.left.j.html(k),k=j.tmp,i>f.slideamount)return;jQuery.each(f.thumbs[i].params,function(a,b){k=k.replace(b.from,b.to)}),j.right.j.html(k),j.rtl?(punchgs.TweenLite.set(j.left.j.find(".tp-arr-imgholder"),{backgroundImage:"url("+f.thumbs[i].src+")"}),punchgs.TweenLite.set(j.right.j.find(".tp-arr-imgholder"),{backgroundImage:"url("+f.thumbs[h].src+")"})):(punchgs.TweenLite.set(j.left.j.find(".tp-arr-imgholder"),{backgroundImage:"url("+f.thumbs[h].src+")"}),punchgs.TweenLite.set(j.right.j.find(".tp-arr-imgholder"),{backgroundImage:"url("+f.thumbs[i].src+")"}))}}),l(j),l(n),l(r),l(s),g.on("mouseenter mousemove",function(){g.hasClass("tp-mouseover")||(g.addClass("tp-mouseover"),punchgs.TweenLite.killDelayedCallsTo(p),t&&j.hide_onleave&&p(g.find(".tparrows"),j,"show"),v&&n.hide_onleave&&p(g.find(".tp-bullets"),n,"show"),x&&r.hide_onleave&&p(g.find(".tp-thumbs"),r,"show"),y&&s.hide_onleave&&p(g.find(".tp-tabs"),s,"show"),c&&(g.removeClass("tp-mouseover"),o(a,f)))}),g.on("mouseleave",function(){g.removeClass("tp-mouseover"),o(a,f)}),t&&j.hide_onleave&&p(g.find(".tparrows"),j,"hide",0),v&&n.hide_onleave&&p(g.find(".tp-bullets"),n,"hide",0),x&&r.hide_onleave&&p(g.find(".tp-thumbs"),r,"hide",0),y&&s.hide_onleave&&p(g.find(".tp-tabs"),s,"hide",0),x&&k(g.find(".tp-thumbs"),f),y&&k(g.find(".tp-tabs"),f),"carousel"===f.sliderType&&k(a,f,!0),("on"===f.navigation.touch.touchOnDesktop||"on"==f.navigation.touch.touchenabled&&c)&&k(a,f,"swipebased")}});var e=function(a,b){var d=(a.hasClass("tp-thumbs"),a.hasClass("tp-thumbs")?".tp-thumb-mask":".tp-tab-mask"),e=a.hasClass("tp-thumbs")?".tp-thumbs-inner-wrapper":".tp-tabs-inner-wrapper",f=a.hasClass("tp-thumbs")?".tp-thumb":".tp-tab",g=a.find(d),h=g.find(e),i=b.direction,j="vertical"===i?g.find(f).first().outerHeight(!0)+b.space:g.find(f).first().outerWidth(!0)+b.space,k="vertical"===i?g.height():g.width(),l=parseInt(g.find(f+".selected").data("liindex"),0),m=k/j,n="vertical"===i?g.height():g.width(),o=0-l*j,p="vertical"===i?h.height():h.width(),q=o<0-(p-n)?0-(p-n):q>0?0:o,r=h.data("offset");m>2&&(q=o-(r+j)<=0?o-(r+j)<0-j?r:q+j:q,q=o-j+r+k<j&&o+(Math.round(m)-2)*j<r?o+(Math.round(m)-2)*j:q),q=q<0-(p-n)?0-(p-n):q>0?0:q,"vertical"!==i&&g.width()>=h.width()&&(q=0),"vertical"===i&&g.height()>=h.height()&&(q=0),a.hasClass("dragged")||("vertical"===i?h.data("tmmove",punchgs.TweenLite.to(h,.5,{top:q+"px",ease:punchgs.Power3.easeInOut})):h.data("tmmove",punchgs.TweenLite.to(h,.5,{left:q+"px",ease:punchgs.Power3.easeInOut})),h.data("offset",q))},f=function(a,b,c,d,e,f){var g=c.parent().find(".tp-"+f+"s"),h=g.find(".tp-"+f+"s-inner-wrapper"),i=g.find(".tp-"+f+"-mask"),j=d.width*a<d.min_width?d.min_width:Math.round(d.width*a),k=Math.round(j/d.width*d.height),l="vertical"===d.direction?j:j*e+d.space*(e-1),m="vertical"===d.direction?k*e+d.space*(e-1):k,n="vertical"===d.direction?{width:j+"px"}:{height:k+"px"};b.add(punchgs.TweenLite.set(g,n)),b.add(punchgs.TweenLite.set(h,{width:l+"px",height:m+"px"})),b.add(punchgs.TweenLite.set(i,{width:l+"px",height:m+"px"}));var o=h.find(".tp-"+f);return o&&jQuery.each(o,function(a,c){"vertical"===d.direction?b.add(punchgs.TweenLite.set(c,{top:a*(k+parseInt(void 0===d.space?0:d.space,0)),width:j+"px",height:k+"px"})):"horizontal"===d.direction&&b.add(punchgs.TweenLite.set(c,{left:a*(j+parseInt(void 0===d.space?0:d.space,0)),width:j+"px",height:k+"px"}))}),b},g=function(a){var b=0,c=0,d=0,e=0,f=1,g=1,h=1;return"detail"in a&&(c=a.detail),"wheelDelta"in a&&(c=-a.wheelDelta/120),"wheelDeltaY"in a&&(c=-a.wheelDeltaY/120),"wheelDeltaX"in a&&(b=-a.wheelDeltaX/120),"axis"in a&&a.axis===a.HORIZONTAL_AXIS&&(b=c,c=0),d=b*f,e=c*f,"deltaY"in a&&(e=a.deltaY),"deltaX"in a&&(d=a.deltaX),(d||e)&&a.deltaMode&&(1==a.deltaMode?(d*=g,e*=g):(d*=h,e*=h)),d&&!b&&(b=d<1?-1:1),e&&!c&&(c=e<1?-1:1),e=navigator.userAgent.match(/mozilla/i)?10*e:e,(e>300||e<-300)&&(e/=10),{spinX:b,spinY:c,pixelX:d,pixelY:e}},h=function(a,c){"on"===c.navigation.keyboardNavigation&&jQuery(document).keydown(function(d){("horizontal"==c.navigation.keyboard_direction&&39==d.keyCode||"vertical"==c.navigation.keyboard_direction&&40==d.keyCode)&&(c.sc_indicator="arrow",c.sc_indicator_dir=0,b.callingNewSlide(a,1)),("horizontal"==c.navigation.keyboard_direction&&37==d.keyCode||"vertical"==c.navigation.keyboard_direction&&38==d.keyCode)&&(c.sc_indicator="arrow",c.sc_indicator_dir=1,b.callingNewSlide(a,-1))})},i=function(a,c){if("on"===c.navigation.mouseScrollNavigation||"carousel"===c.navigation.mouseScrollNavigation){c.isIEEleven=!!navigator.userAgent.match(/Trident.*rv\:11\./),c.isSafari=!!navigator.userAgent.match(/safari/i),c.ischrome=!!navigator.userAgent.match(/chrome/i);var d=c.ischrome?-49:c.isIEEleven||c.isSafari?-9:navigator.userAgent.match(/mozilla/i)?-29:-49,e=c.ischrome?49:c.isIEEleven||c.isSafari?9:navigator.userAgent.match(/mozilla/i)?29:49;a.on("mousewheel DOMMouseScroll",function(f){var h=g(f.originalEvent),i=a.find(".tp-revslider-slidesli.active-revslide").index(),j=a.find(".tp-revslider-slidesli.processing-revslide").index(),k=-1!=i&&0==i||-1!=j&&0==j,l=-1!=i&&i==c.slideamount-1||1!=j&&j==c.slideamount-1,m=!0;"carousel"==c.navigation.mouseScrollNavigation&&(k=l=!1),-1==j?h.pixelY<d?(k||(c.sc_indicator="arrow","reverse"!==c.navigation.mouseScrollReverse&&(c.sc_indicator_dir=1,b.callingNewSlide(a,-1)),m=!1),l||(c.sc_indicator="arrow","reverse"===c.navigation.mouseScrollReverse&&(c.sc_indicator_dir=0,b.callingNewSlide(a,1)),m=!1)):h.pixelY>e&&(l||(c.sc_indicator="arrow","reverse"!==c.navigation.mouseScrollReverse&&(c.sc_indicator_dir=0,b.callingNewSlide(a,1)),m=!1),k||(c.sc_indicator="arrow","reverse"===c.navigation.mouseScrollReverse&&(c.sc_indicator_dir=1,b.callingNewSlide(a,-1)),m=!1)):m=!1;var n=c.c.offset().top-jQuery("body").scrollTop(),o=n+c.c.height();return"carousel"!=c.navigation.mouseScrollNavigation?("reverse"!==c.navigation.mouseScrollReverse&&(n>0&&h.pixelY>0||o<jQuery(window).height()&&h.pixelY<0)&&(m=!0),"reverse"===c.navigation.mouseScrollReverse&&(n<0&&h.pixelY<0||o>jQuery(window).height()&&h.pixelY>0)&&(m=!0)):m=!1,0==m?(f.preventDefault(f),!1):void 0})}},j=function(a,b,d){return a=c?jQuery(d.target).closest("."+a).length||jQuery(d.srcElement).closest("."+a).length:jQuery(d.toElement).closest("."+a).length||jQuery(d.originalTarget).closest("."+a).length,!0===a||1===a?1:0},k=function(a,d,e){var f=d.carousel;jQuery(".bullet, .bullets, .tp-bullets, .tparrows").addClass("noSwipe"),f.Limit="endless";var h=(c||b.get_browser(),a),i="vertical"===d.navigation.thumbnails.direction||"vertical"===d.navigation.tabs.direction?"none":"vertical",k=d.navigation.touch.swipe_direction||"horizontal";i="swipebased"==e&&"vertical"==k?"none":e?"vertical":i,jQuery.fn.swipetp||(jQuery.fn.swipetp=jQuery.fn.swipe),jQuery.fn.swipetp.defaults&&jQuery.fn.swipetp.defaults.excludedElements||jQuery.fn.swipetp.defaults||(jQuery.fn.swipetp.defaults=new Object),jQuery.fn.swipetp.defaults.excludedElements="label, button, input, select, textarea, .noSwipe",h.swipetp({allowPageScroll:i,triggerOnTouchLeave:!0,treshold:d.navigation.touch.swipe_treshold,fingers:d.navigation.touch.swipe_min_touches,excludeElements:jQuery.fn.swipetp.defaults.excludedElements,swipeStatus:function(e,g,h,i,l,m,n){var o=j("rev_slider_wrapper",a,e),p=j("tp-thumbs",a,e),q=j("tp-tabs",a,e),r=jQuery(this).attr("class"),s=!!r.match(/tp-tabs|tp-thumb/gi);if("carousel"===d.sliderType&&(("move"===g||"end"===g||"cancel"==g)&&d.dragStartedOverSlider&&!d.dragStartedOverThumbs&&!d.dragStartedOverTabs||"start"===g&&o>0&&0===p&&0===q)){if(c&&("up"===h||"down"===h))return;switch(d.dragStartedOverSlider=!0,i=h&&h.match(/left|up/g)?Math.round(-1*i):i=Math.round(1*i),g){case"start":void 0!==f.positionanim&&(f.positionanim.kill(),f.slide_globaloffset="off"===f.infinity?f.slide_offset:b.simp(f.slide_offset,f.maxwidth)),f.overpull="none",f.wrap.addClass("dragged");break;case"move":if(d.c.find(".tp-withaction").addClass("tp-temporarydisabled"),f.slide_offset="off"===f.infinity?f.slide_globaloffset+i:b.simp(f.slide_globaloffset+i,f.maxwidth),"off"===f.infinity){var t="center"===f.horizontal_align?(f.wrapwidth/2-f.slide_width/2-f.slide_offset)/f.slide_width:(0-f.slide_offset)/f.slide_width;"none"!==f.overpull&&0!==f.overpull||!(t<0||t>d.slideamount-1)?t>=0&&t<=d.slideamount-1&&(t>=0&&i>f.overpull||t<=d.slideamount-1&&i<f.overpull)&&(f.overpull=0):f.overpull=i,f.slide_offset=t<0?f.slide_offset+(f.overpull-i)/1.1+Math.sqrt(Math.abs((f.overpull-i)/1.1)):t>d.slideamount-1?f.slide_offset+(f.overpull-i)/1.1-Math.sqrt(Math.abs((f.overpull-i)/1.1)):f.slide_offset}b.organiseCarousel(d,h,!0,!0);break;case"end":case"cancel":f.slide_globaloffset=f.slide_offset,f.wrap.removeClass("dragged"),b.carouselToEvalPosition(d,h),d.dragStartedOverSlider=!1,d.dragStartedOverThumbs=!1,d.dragStartedOverTabs=!1,setTimeout(function(){d.c.find(".tp-withaction").removeClass("tp-temporarydisabled")},19)}}else{if(("move"!==g&&"end"!==g&&"cancel"!=g||d.dragStartedOverSlider||!d.dragStartedOverThumbs&&!d.dragStartedOverTabs)&&!("start"===g&&o>0&&(p>0||q>0))){if("end"==g&&!s){if(d.sc_indicator="arrow","horizontal"==k&&"left"==h||"vertical"==k&&"up"==h)return d.sc_indicator_dir=0,b.callingNewSlide(d.c,1),!1;if("horizontal"==k&&"right"==h||"vertical"==k&&"down"==h)return d.sc_indicator_dir=1,b.callingNewSlide(d.c,-1),!1}return d.dragStartedOverSlider=!1,d.dragStartedOverThumbs=!1,d.dragStartedOverTabs=!1,!0}p>0&&(d.dragStartedOverThumbs=!0),q>0&&(d.dragStartedOverTabs=!0);var u=d.dragStartedOverThumbs?".tp-thumbs":".tp-tabs",v=d.dragStartedOverThumbs?".tp-thumb-mask":".tp-tab-mask",w=d.dragStartedOverThumbs?".tp-thumbs-inner-wrapper":".tp-tabs-inner-wrapper",x=d.dragStartedOverThumbs?".tp-thumb":".tp-tab",y=d.dragStartedOverThumbs?d.navigation.thumbnails:d.navigation.tabs;i=h&&h.match(/left|up/g)?Math.round(-1*i):i=Math.round(1*i);var z=a.parent().find(v),A=z.find(w),B=y.direction,C="vertical"===B?A.height():A.width(),D="vertical"===B?z.height():z.width(),E="vertical"===B?z.find(x).first().outerHeight(!0)+y.space:z.find(x).first().outerWidth(!0)+y.space,F=void 0===A.data("offset")?0:parseInt(A.data("offset"),0),G=0;switch(g){case"start":a.parent().find(u).addClass("dragged"),F="vertical"===B?A.position().top:A.position().left,A.data("offset",F),A.data("tmmove")&&A.data("tmmove").pause();break;case"move":if(C<=D)return!1;G=F+i,G=G>0?"horizontal"===B?G-A.width()*(G/A.width()*G/A.width()):G-A.height()*(G/A.height()*G/A.height()):G;var H="vertical"===B?0-(A.height()-z.height()):0-(A.width()-z.width());G=G<H?"horizontal"===B?G+A.width()*(G-H)/A.width()*(G-H)/A.width():G+A.height()*(G-H)/A.height()*(G-H)/A.height():G,"vertical"===B?punchgs.TweenLite.set(A,{top:G+"px"}):punchgs.TweenLite.set(A,{left:G+"px"});break;case"end":case"cancel":if(s)return G=F+i,G="vertical"===B?G<0-(A.height()-z.height())?0-(A.height()-z.height()):G:G<0-(A.width()-z.width())?0-(A.width()-z.width()):G,G=G>0?0:G,G=Math.abs(i)>E/10?i<=0?Math.floor(G/E)*E:Math.ceil(G/E)*E:i<0?Math.ceil(G/E)*E:Math.floor(G/E)*E,G="vertical"===B?G<0-(A.height()-z.height())?0-(A.height()-z.height()):G:G<0-(A.width()-z.width())?0-(A.width()-z.width()):G,G=G>0?0:G,"vertical"===B?punchgs.TweenLite.to(A,.5,{top:G+"px",ease:punchgs.Power3.easeOut}):punchgs.TweenLite.to(A,.5,{left:G+"px",ease:punchgs.Power3.easeOut}),G=G||("vertical"===B?A.position().top:A.position().left),A.data("offset",G),A.data("distance",i),setTimeout(function(){d.dragStartedOverSlider=!1,d.dragStartedOverThumbs=!1,d.dragStartedOverTabs=!1},100),a.parent().find(u).removeClass("dragged"),!1}}}})},l=function(a){a.hide_delay=jQuery.isNumeric(parseInt(a.hide_delay,0))?a.hide_delay/1e3:.2,a.hide_delay_mobile=jQuery.isNumeric(parseInt(a.hide_delay_mobile,0))?a.hide_delay_mobile/1e3:.2},m=function(a){return a&&a.enable},n=function(a){return a&&a.enable&&!0===a.hide_onleave&&(void 0===a.position||!a.position.match(/outer/g))},o=function(a,b){var d=a.parent();n(b.navigation.arrows)&&punchgs.TweenLite.delayedCall(c?b.navigation.arrows.hide_delay_mobile:b.navigation.arrows.hide_delay,p,[d.find(".tparrows"),b.navigation.arrows,"hide"]),n(b.navigation.bullets)&&punchgs.TweenLite.delayedCall(c?b.navigation.bullets.hide_delay_mobile:b.navigation.bullets.hide_delay,p,[d.find(".tp-bullets"),b.navigation.bullets,"hide"]),n(b.navigation.thumbnails)&&punchgs.TweenLite.delayedCall(c?b.navigation.thumbnails.hide_delay_mobile:b.navigation.thumbnails.hide_delay,p,[d.find(".tp-thumbs"),b.navigation.thumbnails,"hide"]),n(b.navigation.tabs)&&punchgs.TweenLite.delayedCall(c?b.navigation.tabs.hide_delay_mobile:b.navigation.tabs.hide_delay,p,[d.find(".tp-tabs"),b.navigation.tabs,"hide"])},p=function(a,b,c,d){switch(d=void 0===d?.5:d,c){case"show":punchgs.TweenLite.to(a,d,{autoAlpha:1,ease:punchgs.Power3.easeInOut,overwrite:"auto"});break;case"hide":punchgs.TweenLite.to(a,d,{autoAlpha:0,ease:punchgs.Power3.easeInOu,overwrite:"auto"})}},q=function(a,b,c){b.style=void 0===b.style?"":b.style,b.left.style=void 0===b.left.style?"":b.left.style,b.right.style=void 0===b.right.style?"":b.right.style,0===a.find(".tp-leftarrow.tparrows").length&&a.append('<div class="tp-leftarrow tparrows '+b.style+" "+b.left.style+'">'+b.tmp+"</div>"),0===a.find(".tp-rightarrow.tparrows").length&&a.append('<div class="tp-rightarrow tparrows '+b.style+" "+b.right.style+'">'+b.tmp+"</div>");var d=a.find(".tp-leftarrow.tparrows"),e=a.find(".tp-rightarrow.tparrows");b.rtl?(d.click(function(){c.sc_indicator="arrow",c.sc_indicator_dir=0,a.revnext()}),e.click(function(){c.sc_indicator="arrow",c.sc_indicator_dir=1,a.revprev()})):(e.click(function(){c.sc_indicator="arrow",c.sc_indicator_dir=0,a.revnext()}),d.click(function(){c.sc_indicator="arrow",c.sc_indicator_dir=1,a.revprev()})),b.right.j=a.find(".tp-rightarrow.tparrows"),b.left.j=a.find(".tp-leftarrow.tparrows"),b.padding_top=parseInt(c.carousel.padding_top||0,0),b.padding_bottom=parseInt(c.carousel.padding_bottom||0,0),t(d,b.left,c),t(e,b.right,c),b.left.opt=c,b.right.opt=c,"outer-left"!=b.position&&"outer-right"!=b.position||(c.outernav=!0)},r=function(a,b,c){var d=a.outerHeight(!0),f=(a.outerWidth(!0),void 0==b.opt?0:0==c.conh?c.height:c.conh),g="layergrid"==b.container?"fullscreen"==c.sliderLayout?c.height/2-c.gridheight[c.curWinRange]*c.bh/2:"on"==c.autoHeight||void 0!=c.minHeight&&c.minHeight>0?f/2-c.gridheight[c.curWinRange]*c.bh/2:0:0,h="top"===b.v_align?{top:"0px",y:Math.round(b.v_offset+g)+"px"}:"center"===b.v_align?{top:"50%",y:Math.round(0-d/2+b.v_offset)+"px"}:{top:"100%",y:Math.round(0-(d+b.v_offset+g))+"px"};a.hasClass("outer-bottom")||punchgs.TweenLite.set(a,h)},s=function(a,b,c){var e=(a.outerHeight(!0),a.outerWidth(!0)),f="layergrid"==b.container?"carousel"===c.sliderType?0:c.width/2-c.gridwidth[c.curWinRange]*c.bw/2:0,g="left"===b.h_align?{left:"0px",x:Math.round(b.h_offset+f)+"px"}:"center"===b.h_align?{left:"50%",x:Math.round(0-e/2+b.h_offset)+"px"}:{left:"100%",x:Math.round(0-(e+b.h_offset+f))+"px"};punchgs.TweenLite.set(a,g)},t=function(a,b,c){var d=a.closest(".tp-simpleresponsive").length>0?a.closest(".tp-simpleresponsive"):a.closest(".tp-revslider-mainul").length>0?a.closest(".tp-revslider-mainul"):a.closest(".rev_slider_wrapper").length>0?a.closest(".rev_slider_wrapper"):a.parent().find(".tp-revslider-mainul"),e=d.width(),f=d.height();if(r(a,b,c),s(a,b,c),"outer-left"!==b.position||"fullwidth"!=b.sliderLayout&&"fullscreen"!=b.sliderLayout?"outer-right"!==b.position||"fullwidth"!=b.sliderLayout&&"fullscreen"!=b.sliderLayout||punchgs.TweenLite.set(a,{right:0-a.outerWidth()+"px",x:b.h_offset+"px"}):punchgs.TweenLite.set(a,{left:0-a.outerWidth()+"px",x:b.h_offset+"px"}),a.hasClass("tp-thumbs")||a.hasClass("tp-tabs")){var g=a.data("wr_padding"),h=a.data("maxw"),i=a.data("maxh"),j=a.hasClass("tp-thumbs")?a.find(".tp-thumb-mask"):a.find(".tp-tab-mask"),k=parseInt(b.padding_top||0,0),l=parseInt(b.padding_bottom||0,0);h>e&&"outer-left"!==b.position&&"outer-right"!==b.position?(punchgs.TweenLite.set(a,{left:"0px",x:0,maxWidth:e-2*g+"px"}),punchgs.TweenLite.set(j,{maxWidth:e-2*g+"px"})):(punchgs.TweenLite.set(a,{maxWidth:h+"px"}),punchgs.TweenLite.set(j,{maxWidth:h+"px"})),i+2*g>f&&"outer-bottom"!==b.position&&"outer-top"!==b.position?(punchgs.TweenLite.set(a,{top:"0px",y:0,maxHeight:k+l+(f-2*g)+"px"}),punchgs.TweenLite.set(j,{maxHeight:k+l+(f-2*g)+"px"})):(punchgs.TweenLite.set(a,{maxHeight:i+"px"}),punchgs.TweenLite.set(j,{maxHeight:i+"px"})),"outer-left"!==b.position&&"outer-right"!==b.position&&(k=0,l=0),!0===b.span&&"vertical"===b.direction?(punchgs.TweenLite.set(a,{maxHeight:k+l+(f-2*g)+"px",height:k+l+(f-2*g)+"px",top:0-k,y:0}),r(j,b,c)):!0===b.span&&"horizontal"===b.direction&&(punchgs.TweenLite.set(a,{maxWidth:"100%",width:e-2*g+"px",left:0,x:0}),s(j,b,c))}},u=function(a,b,c,d){0===a.find(".tp-bullets").length&&(b.style=void 0===b.style?"":b.style,a.append('<div class="tp-bullets '+b.style+" "+b.direction+'"></div>'));var e=a.find(".tp-bullets"),f=c.data("index"),g=b.tmp;jQuery.each(d.thumbs[c.index()].params,function(a,b){g=g.replace(b.from,b.to)}),e.append('<div class="justaddedbullet tp-bullet">'+g+"</div>");var h=a.find(".justaddedbullet"),i=a.find(".tp-bullet").length,j=h.outerWidth()+parseInt(void 0===b.space?0:b.space,0),k=h.outerHeight()+parseInt(void 0===b.space?0:b.space,0);"vertical"===b.direction?(h.css({top:(i-1)*k+"px",left:"0px"}),e.css({height:(i-1)*k+h.outerHeight(),width:h.outerWidth()})):(h.css({left:(i-1)*j+"px",top:"0px"}),e.css({width:(i-1)*j+h.outerWidth(),height:h.outerHeight()})),h.find(".tp-bullet-image").css({backgroundImage:"url("+d.thumbs[c.index()].src+")"}),h.data("liref",f),h.click(function(){d.sc_indicator="bullet",a.revcallslidewithid(f),a.find(".tp-bullet").removeClass("selected"),jQuery(this).addClass("selected")}),h.removeClass("justaddedbullet"),b.padding_top=parseInt(d.carousel.padding_top||0,0),b.padding_bottom=parseInt(d.carousel.padding_bottom||0,0),b.opt=d,"outer-left"!=b.position&&"outer-right"!=b.position||(d.outernav=!0),e.addClass("nav-pos-hor-"+b.h_align),e.addClass("nav-pos-ver-"+b.v_align),e.addClass("nav-dir-"+b.direction),t(e,b,d)},w=function(a,b,c,d,e){var f="tp-thumb"===d?".tp-thumbs":".tp-tabs",g="tp-thumb"===d?".tp-thumb-mask":".tp-tab-mask",h="tp-thumb"===d?".tp-thumbs-inner-wrapper":".tp-tabs-inner-wrapper",i="tp-thumb"===d?".tp-thumb":".tp-tab",j="tp-thumb"===d?".tp-thumb-image":".tp-tab-image";if(b.visibleAmount=b.visibleAmount>e.slideamount?e.slideamount:b.visibleAmount,b.sliderLayout=e.sliderLayout,0===a.parent().find(f).length){b.style=void 0===b.style?"":b.style;var k=!0===b.span?"tp-span-wrapper":"",l='<div class="'+d+"s "+k+" "+b.position+" "+b.style+'"><div class="'+d+'-mask"><div class="'+d+'s-inner-wrapper" style="position:relative;"></div></div></div>';"outer-top"===b.position?a.parent().prepend(l):"outer-bottom"===b.position?a.after(l):a.append(l),b.padding_top=parseInt(e.carousel.padding_top||0,0),b.padding_bottom=parseInt(e.carousel.padding_bottom||0,0),"outer-left"!=b.position&&"outer-right"!=b.position||(e.outernav=!0)}var m=c.data("index"),n=a.parent().find(f),o=n.find(g),p=o.find(h),q="horizontal"===b.direction?b.width*b.visibleAmount+b.space*(b.visibleAmount-1):b.width,r="horizontal"===b.direction?b.height:b.height*b.visibleAmount+b.space*(b.visibleAmount-1),s=b.tmp;jQuery.each(e.thumbs[c.index()].params,function(a,b){s=s.replace(b.from,b.to)}),p.append('<div data-liindex="'+c.index()+'" data-liref="'+m+'" class="justaddedthumb '+d+'" style="width:'+b.width+"px;height:"+b.height+'px;">'+s+"</div>");var u=n.find(".justaddedthumb"),v=n.find(i).length,w=u.outerWidth()+parseInt(void 0===b.space?0:b.space,0),x=u.outerHeight()+parseInt(void 0===b.space?0:b.space,0);u.find(j).css({backgroundImage:"url("+e.thumbs[c.index()].src+")"}),"vertical"===b.direction?(u.css({top:(v-1)*x+"px",left:"0px"}),p.css({height:(v-1)*x+u.outerHeight(),width:u.outerWidth()})):(u.css({left:(v-1)*w+"px",top:"0px"}),p.css({width:(v-1)*w+u.outerWidth(),height:u.outerHeight()})),n.data("maxw",q),n.data("maxh",r),n.data("wr_padding",b.wrapper_padding);var y="outer-top"===b.position||"outer-bottom"===b.position?"relative":"absolute";"outer-top"!==b.position&&"outer-bottom"!==b.position||b.h_align;o.css({maxWidth:q+"px",maxHeight:r+"px",overflow:"hidden",position:"relative"}),n.css({maxWidth:q+"px",maxHeight:r+"px",overflow:"visible",position:y,background:b.wrapper_color,padding:b.wrapper_padding+"px",boxSizing:"contet-box"}),u.click(function(){e.sc_indicator="bullet";var b=a.parent().find(h).data("distance");b=void 0===b?0:b,Math.abs(b)<10&&(a.revcallslidewithid(m),a.parent().find(f).removeClass("selected"),jQuery(this).addClass("selected"))}),u.removeClass("justaddedthumb"),b.opt=e,n.addClass("nav-pos-hor-"+b.h_align),n.addClass("nav-pos-ver-"+b.v_align),n.addClass("nav-dir-"+b.direction),t(n,b,e)},x=function(a){var b=a.c.parent().find(".outer-top"),c=a.c.parent().find(".outer-bottom");a.top_outer=b.hasClass("tp-forcenotvisible")?0:b.outerHeight()||0,a.bottom_outer=c.hasClass("tp-forcenotvisible")?0:c.outerHeight()||0},y=function(a,b,c,d){b>c||c>d?a.addClass("tp-forcenotvisible"):a.removeClass("tp-forcenotvisible")}}(jQuery);
/********************************************
 * REVOLUTION 5.4.6.5 EXTENSION - NAVIGATION
 * @version: 1.3.5 (06.04.2017)
 * @requires jquery.themepunch.revolution.js
 * @author ThemePunch
*********************************************/
!function(a){"use strict";var b=jQuery.fn.revolution,c=b.is_mobile(),d={alias:"Navigation Min JS",name:"revolution.extensions.navigation.min.js",min_core:"5.4.0",version:"1.3.5"};jQuery.extend(!0,b,{hideUnHideNav:function(a){var b=a.c.width(),c=a.navigation.arrows,d=a.navigation.bullets,e=a.navigation.thumbnails,f=a.navigation.tabs;m(c)&&y(a.c.find(".tparrows"),c.hide_under,b,c.hide_over),m(d)&&y(a.c.find(".tp-bullets"),d.hide_under,b,d.hide_over),m(e)&&y(a.c.parent().find(".tp-thumbs"),e.hide_under,b,e.hide_over),m(f)&&y(a.c.parent().find(".tp-tabs"),f.hide_under,b,f.hide_over),x(a)},resizeThumbsTabs:function(a,b){if(a.navigation&&a.navigation.tabs.enable||a.navigation&&a.navigation.thumbnails.enable){var c=(jQuery(window).width()-480)/500,d=new punchgs.TimelineLite,e=a.navigation.tabs,g=a.navigation.thumbnails,h=a.navigation.bullets;if(d.pause(),c=c>1?1:c<0?0:c,m(e)&&(b||e.width>e.min_width)&&f(c,d,a.c,e,a.slideamount,"tab"),m(g)&&(b||g.width>g.min_width)&&f(c,d,a.c,g,a.slideamount,"thumb"),m(h)&&b){var i=a.c.find(".tp-bullets");i.find(".tp-bullet").each(function(a){var b=jQuery(this),c=a+1,d=b.outerWidth()+parseInt(void 0===h.space?0:h.space,0),e=b.outerHeight()+parseInt(void 0===h.space?0:h.space,0);"vertical"===h.direction?(b.css({top:(c-1)*e+"px",left:"0px"}),i.css({height:(c-1)*e+b.outerHeight(),width:b.outerWidth()})):(b.css({left:(c-1)*d+"px",top:"0px"}),i.css({width:(c-1)*d+b.outerWidth(),height:b.outerHeight()}))})}d.play(),x(a)}return!0},updateNavIndexes:function(a){function d(a){c.find(a).lenght>0&&c.find(a).each(function(a){jQuery(this).data("liindex",a)})}var c=a.c;d(".tp-tab"),d(".tp-bullet"),d(".tp-thumb"),b.resizeThumbsTabs(a,!0),b.manageNavigation(a)},manageNavigation:function(a){var c=b.getHorizontalOffset(a.c.parent(),"left"),d=b.getHorizontalOffset(a.c.parent(),"right");m(a.navigation.bullets)&&("fullscreen"!=a.sliderLayout&&"fullwidth"!=a.sliderLayout&&(a.navigation.bullets.h_offset_old=void 0===a.navigation.bullets.h_offset_old?a.navigation.bullets.h_offset:a.navigation.bullets.h_offset_old,a.navigation.bullets.h_offset="center"===a.navigation.bullets.h_align?a.navigation.bullets.h_offset_old+c/2-d/2:a.navigation.bullets.h_offset_old+c-d),t(a.c.find(".tp-bullets"),a.navigation.bullets,a)),m(a.navigation.thumbnails)&&t(a.c.parent().find(".tp-thumbs"),a.navigation.thumbnails,a),m(a.navigation.tabs)&&t(a.c.parent().find(".tp-tabs"),a.navigation.tabs,a),m(a.navigation.arrows)&&("fullscreen"!=a.sliderLayout&&"fullwidth"!=a.sliderLayout&&(a.navigation.arrows.left.h_offset_old=void 0===a.navigation.arrows.left.h_offset_old?a.navigation.arrows.left.h_offset:a.navigation.arrows.left.h_offset_old,a.navigation.arrows.left.h_offset="right"===a.navigation.arrows.left.h_align?a.navigation.arrows.left.h_offset_old+d:a.navigation.arrows.left.h_offset_old+c,a.navigation.arrows.right.h_offset_old=void 0===a.navigation.arrows.right.h_offset_old?a.navigation.arrows.right.h_offset:a.navigation.arrows.right.h_offset_old,a.navigation.arrows.right.h_offset="right"===a.navigation.arrows.right.h_align?a.navigation.arrows.right.h_offset_old+d:a.navigation.arrows.right.h_offset_old+c),t(a.c.find(".tp-leftarrow.tparrows"),a.navigation.arrows.left,a),t(a.c.find(".tp-rightarrow.tparrows"),a.navigation.arrows.right,a)),m(a.navigation.thumbnails)&&e(a.c.parent().find(".tp-thumbs"),a.navigation.thumbnails),m(a.navigation.tabs)&&e(a.c.parent().find(".tp-tabs"),a.navigation.tabs)},createNavigation:function(a,f){if("stop"===b.compare_version(d).check)return!1;var g=a.parent(),j=f.navigation.arrows,n=f.navigation.bullets,r=f.navigation.thumbnails,s=f.navigation.tabs,t=m(j),v=m(n),x=m(r),y=m(s);h(a,f),i(a,f),t&&q(a,j,f),f.li.each(function(b){var c=jQuery(f.li[f.li.length-1-b]),d=jQuery(this);v&&(f.navigation.bullets.rtl?u(a,n,c,f):u(a,n,d,f)),x&&(f.navigation.thumbnails.rtl?w(a,r,c,"tp-thumb",f):w(a,r,d,"tp-thumb",f)),y&&(f.navigation.tabs.rtl?w(a,s,c,"tp-tab",f):w(a,s,d,"tp-tab",f))}),a.bind("revolution.slide.onafterswap revolution.nextslide.waiting",function(){var b=0==a.find(".next-revslide").length?a.find(".active-revslide").data("index"):a.find(".next-revslide").data("index");a.find(".tp-bullet").each(function(){var a=jQuery(this);a.data("liref")===b?a.addClass("selected"):a.removeClass("selected")}),g.find(".tp-thumb, .tp-tab").each(function(){var a=jQuery(this);a.data("liref")===b?(a.addClass("selected"),a.hasClass("tp-tab")?e(g.find(".tp-tabs"),s):e(g.find(".tp-thumbs"),r)):a.removeClass("selected")});var c=0,d=!1;f.thumbs&&jQuery.each(f.thumbs,function(a,e){c=!1===d?a:c,d=e.id===b||a===b||d});var h=c>0?c-1:f.slideamount-1,i=c+1==f.slideamount?0:c+1;if(!0===j.enable){var k=j.tmp;if(void 0!=f.thumbs[h]&&jQuery.each(f.thumbs[h].params,function(a,b){k=k.replace(b.from,b.to)}),j.left.j.html(k),k=j.tmp,i>f.slideamount)return;jQuery.each(f.thumbs[i].params,function(a,b){k=k.replace(b.from,b.to)}),j.right.j.html(k),j.rtl?(punchgs.TweenLite.set(j.left.j.find(".tp-arr-imgholder"),{backgroundImage:"url("+f.thumbs[i].src+")"}),punchgs.TweenLite.set(j.right.j.find(".tp-arr-imgholder"),{backgroundImage:"url("+f.thumbs[h].src+")"})):(punchgs.TweenLite.set(j.left.j.find(".tp-arr-imgholder"),{backgroundImage:"url("+f.thumbs[h].src+")"}),punchgs.TweenLite.set(j.right.j.find(".tp-arr-imgholder"),{backgroundImage:"url("+f.thumbs[i].src+")"}))}}),l(j),l(n),l(r),l(s),g.on("mouseenter mousemove",function(){g.hasClass("tp-mouseover")||(g.addClass("tp-mouseover"),punchgs.TweenLite.killDelayedCallsTo(p),t&&j.hide_onleave&&p(g.find(".tparrows"),j,"show"),v&&n.hide_onleave&&p(g.find(".tp-bullets"),n,"show"),x&&r.hide_onleave&&p(g.find(".tp-thumbs"),r,"show"),y&&s.hide_onleave&&p(g.find(".tp-tabs"),s,"show"),c&&(g.removeClass("tp-mouseover"),o(a,f)))}),g.on("mouseleave",function(){g.removeClass("tp-mouseover"),o(a,f)}),t&&j.hide_onleave&&p(g.find(".tparrows"),j,"hide",0),v&&n.hide_onleave&&p(g.find(".tp-bullets"),n,"hide",0),x&&r.hide_onleave&&p(g.find(".tp-thumbs"),r,"hide",0),y&&s.hide_onleave&&p(g.find(".tp-tabs"),s,"hide",0),x&&k(g.find(".tp-thumbs"),f),y&&k(g.find(".tp-tabs"),f),"carousel"===f.sliderType&&k(a,f,!0),("on"===f.navigation.touch.touchOnDesktop||"on"==f.navigation.touch.touchenabled&&c)&&k(a,f,"swipebased")}});var e=function(a,b){var d=(a.hasClass("tp-thumbs"),a.hasClass("tp-thumbs")?".tp-thumb-mask":".tp-tab-mask"),e=a.hasClass("tp-thumbs")?".tp-thumbs-inner-wrapper":".tp-tabs-inner-wrapper",f=a.hasClass("tp-thumbs")?".tp-thumb":".tp-tab",g=a.find(d),h=g.find(e),i=b.direction,j="vertical"===i?g.find(f).first().outerHeight(!0)+b.space:g.find(f).first().outerWidth(!0)+b.space,k="vertical"===i?g.height():g.width(),l=parseInt(g.find(f+".selected").data("liindex"),0),m=k/j,n="vertical"===i?g.height():g.width(),o=0-l*j,p="vertical"===i?h.height():h.width(),q=o<0-(p-n)?0-(p-n):q>0?0:o,r=h.data("offset");m>2&&(q=o-(r+j)<=0?o-(r+j)<0-j?r:q+j:q,q=o-j+r+k<j&&o+(Math.round(m)-2)*j<r?o+(Math.round(m)-2)*j:q),q=q<0-(p-n)?0-(p-n):q>0?0:q,"vertical"!==i&&g.width()>=h.width()&&(q=0),"vertical"===i&&g.height()>=h.height()&&(q=0),a.hasClass("dragged")||("vertical"===i?h.data("tmmove",punchgs.TweenLite.to(h,.5,{top:q+"px",ease:punchgs.Power3.easeInOut})):h.data("tmmove",punchgs.TweenLite.to(h,.5,{left:q+"px",ease:punchgs.Power3.easeInOut})),h.data("offset",q))},f=function(a,b,c,d,e,f){var g=c.parent().find(".tp-"+f+"s"),h=g.find(".tp-"+f+"s-inner-wrapper"),i=g.find(".tp-"+f+"-mask"),j=d.width*a<d.min_width?d.min_width:Math.round(d.width*a),k=Math.round(j/d.width*d.height),l="vertical"===d.direction?j:j*e+d.space*(e-1),m="vertical"===d.direction?k*e+d.space*(e-1):k,n="vertical"===d.direction?{width:j+"px"}:{height:k+"px"};b.add(punchgs.TweenLite.set(g,n)),b.add(punchgs.TweenLite.set(h,{width:l+"px",height:m+"px"})),b.add(punchgs.TweenLite.set(i,{width:l+"px",height:m+"px"}));var o=h.find(".tp-"+f);return o&&jQuery.each(o,function(a,c){"vertical"===d.direction?b.add(punchgs.TweenLite.set(c,{top:a*(k+parseInt(void 0===d.space?0:d.space,0)),width:j+"px",height:k+"px"})):"horizontal"===d.direction&&b.add(punchgs.TweenLite.set(c,{left:a*(j+parseInt(void 0===d.space?0:d.space,0)),width:j+"px",height:k+"px"}))}),b},g=function(a){var b=0,c=0,d=0,e=0,f=1,g=1,h=1;return"detail"in a&&(c=a.detail),"wheelDelta"in a&&(c=-a.wheelDelta/120),"wheelDeltaY"in a&&(c=-a.wheelDeltaY/120),"wheelDeltaX"in a&&(b=-a.wheelDeltaX/120),"axis"in a&&a.axis===a.HORIZONTAL_AXIS&&(b=c,c=0),d=b*f,e=c*f,"deltaY"in a&&(e=a.deltaY),"deltaX"in a&&(d=a.deltaX),(d||e)&&a.deltaMode&&(1==a.deltaMode?(d*=g,e*=g):(d*=h,e*=h)),d&&!b&&(b=d<1?-1:1),e&&!c&&(c=e<1?-1:1),e=navigator.userAgent.match(/mozilla/i)?10*e:e,(e>300||e<-300)&&(e/=10),{spinX:b,spinY:c,pixelX:d,pixelY:e}},h=function(a,c){"on"===c.navigation.keyboardNavigation&&jQuery(document).keydown(function(d){("horizontal"==c.navigation.keyboard_direction&&39==d.keyCode||"vertical"==c.navigation.keyboard_direction&&40==d.keyCode)&&(c.sc_indicator="arrow",c.sc_indicator_dir=0,b.callingNewSlide(a,1)),("horizontal"==c.navigation.keyboard_direction&&37==d.keyCode||"vertical"==c.navigation.keyboard_direction&&38==d.keyCode)&&(c.sc_indicator="arrow",c.sc_indicator_dir=1,b.callingNewSlide(a,-1))})},i=function(a,c){if("on"===c.navigation.mouseScrollNavigation||"carousel"===c.navigation.mouseScrollNavigation){c.isIEEleven=!!navigator.userAgent.match(/Trident.*rv\:11\./),c.isSafari=!!navigator.userAgent.match(/safari/i),c.ischrome=!!navigator.userAgent.match(/chrome/i);var d=c.ischrome?-49:c.isIEEleven||c.isSafari?-9:navigator.userAgent.match(/mozilla/i)?-29:-49,e=c.ischrome?49:c.isIEEleven||c.isSafari?9:navigator.userAgent.match(/mozilla/i)?29:49;a.on("mousewheel DOMMouseScroll",function(f){var h=g(f.originalEvent),i=a.find(".tp-revslider-slidesli.active-revslide").index(),j=a.find(".tp-revslider-slidesli.processing-revslide").index(),k=-1!=i&&0==i||-1!=j&&0==j,l=-1!=i&&i==c.slideamount-1||1!=j&&j==c.slideamount-1,m=!0;"carousel"==c.navigation.mouseScrollNavigation&&(k=l=!1),-1==j?h.pixelY<d?(k||(c.sc_indicator="arrow","reverse"!==c.navigation.mouseScrollReverse&&(c.sc_indicator_dir=1,b.callingNewSlide(a,-1)),m=!1),l||(c.sc_indicator="arrow","reverse"===c.navigation.mouseScrollReverse&&(c.sc_indicator_dir=0,b.callingNewSlide(a,1)),m=!1)):h.pixelY>e&&(l||(c.sc_indicator="arrow","reverse"!==c.navigation.mouseScrollReverse&&(c.sc_indicator_dir=0,b.callingNewSlide(a,1)),m=!1),k||(c.sc_indicator="arrow","reverse"===c.navigation.mouseScrollReverse&&(c.sc_indicator_dir=1,b.callingNewSlide(a,-1)),m=!1)):m=!1;var n=c.c.offset().top-jQuery("body").scrollTop(),o=n+c.c.height();return"carousel"!=c.navigation.mouseScrollNavigation?("reverse"!==c.navigation.mouseScrollReverse&&(n>0&&h.pixelY>0||o<jQuery(window).height()&&h.pixelY<0)&&(m=!0),"reverse"===c.navigation.mouseScrollReverse&&(n<0&&h.pixelY<0||o>jQuery(window).height()&&h.pixelY>0)&&(m=!0)):m=!1,0==m?(f.preventDefault(f),!1):void 0})}},j=function(a,b,d){return a=c?jQuery(d.target).closest("."+a).length||jQuery(d.srcElement).closest("."+a).length:jQuery(d.toElement).closest("."+a).length||jQuery(d.originalTarget).closest("."+a).length,!0===a||1===a?1:0},k=function(a,d,e){var f=d.carousel;jQuery(".bullet, .bullets, .tp-bullets, .tparrows").addClass("noSwipe"),f.Limit="endless";var h=(c||b.get_browser(),a),i="vertical"===d.navigation.thumbnails.direction||"vertical"===d.navigation.tabs.direction?"none":"vertical",k=d.navigation.touch.swipe_direction||"horizontal";i="swipebased"==e&&"vertical"==k?"none":e?"vertical":i,jQuery.fn.swipetp||(jQuery.fn.swipetp=jQuery.fn.swipe),jQuery.fn.swipetp.defaults&&jQuery.fn.swipetp.defaults.excludedElements||jQuery.fn.swipetp.defaults||(jQuery.fn.swipetp.defaults=new Object),jQuery.fn.swipetp.defaults.excludedElements="label, button, input, select, textarea, .noSwipe",h.swipetp({allowPageScroll:i,triggerOnTouchLeave:!0,treshold:d.navigation.touch.swipe_treshold,fingers:d.navigation.touch.swipe_min_touches,excludeElements:jQuery.fn.swipetp.defaults.excludedElements,swipeStatus:function(e,g,h,i,l,m,n){var o=j("rev_slider_wrapper",a,e),p=j("tp-thumbs",a,e),q=j("tp-tabs",a,e),r=jQuery(this).attr("class"),s=!!r.match(/tp-tabs|tp-thumb/gi);if("carousel"===d.sliderType&&(("move"===g||"end"===g||"cancel"==g)&&d.dragStartedOverSlider&&!d.dragStartedOverThumbs&&!d.dragStartedOverTabs||"start"===g&&o>0&&0===p&&0===q)){if(c&&("up"===h||"down"===h))return;switch(d.dragStartedOverSlider=!0,i=h&&h.match(/left|up/g)?Math.round(-1*i):i=Math.round(1*i),g){case"start":void 0!==f.positionanim&&(f.positionanim.kill(),f.slide_globaloffset="off"===f.infinity?f.slide_offset:b.simp(f.slide_offset,f.maxwidth)),f.overpull="none",f.wrap.addClass("dragged");break;case"move":if(d.c.find(".tp-withaction").addClass("tp-temporarydisabled"),f.slide_offset="off"===f.infinity?f.slide_globaloffset+i:b.simp(f.slide_globaloffset+i,f.maxwidth),"off"===f.infinity){var t="center"===f.horizontal_align?(f.wrapwidth/2-f.slide_width/2-f.slide_offset)/f.slide_width:(0-f.slide_offset)/f.slide_width;"none"!==f.overpull&&0!==f.overpull||!(t<0||t>d.slideamount-1)?t>=0&&t<=d.slideamount-1&&(t>=0&&i>f.overpull||t<=d.slideamount-1&&i<f.overpull)&&(f.overpull=0):f.overpull=i,f.slide_offset=t<0?f.slide_offset+(f.overpull-i)/1.1+Math.sqrt(Math.abs((f.overpull-i)/1.1)):t>d.slideamount-1?f.slide_offset+(f.overpull-i)/1.1-Math.sqrt(Math.abs((f.overpull-i)/1.1)):f.slide_offset}b.organiseCarousel(d,h,!0,!0);break;case"end":case"cancel":f.slide_globaloffset=f.slide_offset,f.wrap.removeClass("dragged"),b.carouselToEvalPosition(d,h),d.dragStartedOverSlider=!1,d.dragStartedOverThumbs=!1,d.dragStartedOverTabs=!1,setTimeout(function(){d.c.find(".tp-withaction").removeClass("tp-temporarydisabled")},19)}}else{if(("move"!==g&&"end"!==g&&"cancel"!=g||d.dragStartedOverSlider||!d.dragStartedOverThumbs&&!d.dragStartedOverTabs)&&!("start"===g&&o>0&&(p>0||q>0))){if("end"==g&&!s){if(d.sc_indicator="arrow","horizontal"==k&&"left"==h||"vertical"==k&&"up"==h)return d.sc_indicator_dir=0,b.callingNewSlide(d.c,1),!1;if("horizontal"==k&&"right"==h||"vertical"==k&&"down"==h)return d.sc_indicator_dir=1,b.callingNewSlide(d.c,-1),!1}return d.dragStartedOverSlider=!1,d.dragStartedOverThumbs=!1,d.dragStartedOverTabs=!1,!0}p>0&&(d.dragStartedOverThumbs=!0),q>0&&(d.dragStartedOverTabs=!0);var u=d.dragStartedOverThumbs?".tp-thumbs":".tp-tabs",v=d.dragStartedOverThumbs?".tp-thumb-mask":".tp-tab-mask",w=d.dragStartedOverThumbs?".tp-thumbs-inner-wrapper":".tp-tabs-inner-wrapper",x=d.dragStartedOverThumbs?".tp-thumb":".tp-tab",y=d.dragStartedOverThumbs?d.navigation.thumbnails:d.navigation.tabs;i=h&&h.match(/left|up/g)?Math.round(-1*i):i=Math.round(1*i);var z=a.parent().find(v),A=z.find(w),B=y.direction,C="vertical"===B?A.height():A.width(),D="vertical"===B?z.height():z.width(),E="vertical"===B?z.find(x).first().outerHeight(!0)+y.space:z.find(x).first().outerWidth(!0)+y.space,F=void 0===A.data("offset")?0:parseInt(A.data("offset"),0),G=0;switch(g){case"start":a.parent().find(u).addClass("dragged"),F="vertical"===B?A.position().top:A.position().left,A.data("offset",F),A.data("tmmove")&&A.data("tmmove").pause();break;case"move":if(C<=D)return!1;G=F+i,G=G>0?"horizontal"===B?G-A.width()*(G/A.width()*G/A.width()):G-A.height()*(G/A.height()*G/A.height()):G;var H="vertical"===B?0-(A.height()-z.height()):0-(A.width()-z.width());G=G<H?"horizontal"===B?G+A.width()*(G-H)/A.width()*(G-H)/A.width():G+A.height()*(G-H)/A.height()*(G-H)/A.height():G,"vertical"===B?punchgs.TweenLite.set(A,{top:G+"px"}):punchgs.TweenLite.set(A,{left:G+"px"});break;case"end":case"cancel":if(s)return G=F+i,G="vertical"===B?G<0-(A.height()-z.height())?0-(A.height()-z.height()):G:G<0-(A.width()-z.width())?0-(A.width()-z.width()):G,G=G>0?0:G,G=Math.abs(i)>E/10?i<=0?Math.floor(G/E)*E:Math.ceil(G/E)*E:i<0?Math.ceil(G/E)*E:Math.floor(G/E)*E,G="vertical"===B?G<0-(A.height()-z.height())?0-(A.height()-z.height()):G:G<0-(A.width()-z.width())?0-(A.width()-z.width()):G,G=G>0?0:G,"vertical"===B?punchgs.TweenLite.to(A,.5,{top:G+"px",ease:punchgs.Power3.easeOut}):punchgs.TweenLite.to(A,.5,{left:G+"px",ease:punchgs.Power3.easeOut}),G=G||("vertical"===B?A.position().top:A.position().left),A.data("offset",G),A.data("distance",i),setTimeout(function(){d.dragStartedOverSlider=!1,d.dragStartedOverThumbs=!1,d.dragStartedOverTabs=!1},100),a.parent().find(u).removeClass("dragged"),!1}}}})},l=function(a){a.hide_delay=jQuery.isNumeric(parseInt(a.hide_delay,0))?a.hide_delay/1e3:.2,a.hide_delay_mobile=jQuery.isNumeric(parseInt(a.hide_delay_mobile,0))?a.hide_delay_mobile/1e3:.2},m=function(a){return a&&a.enable},n=function(a){return a&&a.enable&&!0===a.hide_onleave&&(void 0===a.position||!a.position.match(/outer/g))},o=function(a,b){var d=a.parent();n(b.navigation.arrows)&&punchgs.TweenLite.delayedCall(c?b.navigation.arrows.hide_delay_mobile:b.navigation.arrows.hide_delay,p,[d.find(".tparrows"),b.navigation.arrows,"hide"]),n(b.navigation.bullets)&&punchgs.TweenLite.delayedCall(c?b.navigation.bullets.hide_delay_mobile:b.navigation.bullets.hide_delay,p,[d.find(".tp-bullets"),b.navigation.bullets,"hide"]),n(b.navigation.thumbnails)&&punchgs.TweenLite.delayedCall(c?b.navigation.thumbnails.hide_delay_mobile:b.navigation.thumbnails.hide_delay,p,[d.find(".tp-thumbs"),b.navigation.thumbnails,"hide"]),n(b.navigation.tabs)&&punchgs.TweenLite.delayedCall(c?b.navigation.tabs.hide_delay_mobile:b.navigation.tabs.hide_delay,p,[d.find(".tp-tabs"),b.navigation.tabs,"hide"])},p=function(a,b,c,d){switch(d=void 0===d?.5:d,c){case"show":punchgs.TweenLite.to(a,d,{autoAlpha:1,ease:punchgs.Power3.easeInOut,overwrite:"auto"});break;case"hide":punchgs.TweenLite.to(a,d,{autoAlpha:0,ease:punchgs.Power3.easeInOu,overwrite:"auto"})}},q=function(a,b,c){b.style=void 0===b.style?"":b.style,b.left.style=void 0===b.left.style?"":b.left.style,b.right.style=void 0===b.right.style?"":b.right.style,0===a.find(".tp-leftarrow.tparrows").length&&a.append('<div class="tp-leftarrow tparrows '+b.style+" "+b.left.style+'">'+b.tmp+"</div>"),0===a.find(".tp-rightarrow.tparrows").length&&a.append('<div class="tp-rightarrow tparrows '+b.style+" "+b.right.style+'">'+b.tmp+"</div>");var d=a.find(".tp-leftarrow.tparrows"),e=a.find(".tp-rightarrow.tparrows");b.rtl?(d.click(function(){c.sc_indicator="arrow",c.sc_indicator_dir=0,a.revnext()}),e.click(function(){c.sc_indicator="arrow",c.sc_indicator_dir=1,a.revprev()})):(e.click(function(){c.sc_indicator="arrow",c.sc_indicator_dir=0,a.revnext()}),d.click(function(){c.sc_indicator="arrow",c.sc_indicator_dir=1,a.revprev()})),b.right.j=a.find(".tp-rightarrow.tparrows"),b.left.j=a.find(".tp-leftarrow.tparrows"),b.padding_top=parseInt(c.carousel.padding_top||0,0),b.padding_bottom=parseInt(c.carousel.padding_bottom||0,0),t(d,b.left,c),t(e,b.right,c),b.left.opt=c,b.right.opt=c,"outer-left"!=b.position&&"outer-right"!=b.position||(c.outernav=!0)},r=function(a,b,c){var d=a.outerHeight(!0),f=(a.outerWidth(!0),void 0==b.opt?0:0==c.conh?c.height:c.conh),g="layergrid"==b.container?"fullscreen"==c.sliderLayout?c.height/2-c.gridheight[c.curWinRange]*c.bh/2:"on"==c.autoHeight||void 0!=c.minHeight&&c.minHeight>0?f/2-c.gridheight[c.curWinRange]*c.bh/2:0:0,h="top"===b.v_align?{top:"0px",y:Math.round(b.v_offset+g)+"px"}:"center"===b.v_align?{top:"50%",y:Math.round(0-d/2+b.v_offset)+"px"}:{top:"100%",y:Math.round(0-(d+b.v_offset+g))+"px"};a.hasClass("outer-bottom")||punchgs.TweenLite.set(a,h)},s=function(a,b,c){var e=(a.outerHeight(!0),a.outerWidth(!0)),f="layergrid"==b.container?"carousel"===c.sliderType?0:c.width/2-c.gridwidth[c.curWinRange]*c.bw/2:0,g="left"===b.h_align?{left:"0px",x:Math.round(b.h_offset+f)+"px"}:"center"===b.h_align?{left:"50%",x:Math.round(0-e/2+b.h_offset)+"px"}:{left:"100%",x:Math.round(0-(e+b.h_offset+f))+"px"};punchgs.TweenLite.set(a,g)},t=function(a,b,c){var d=a.closest(".tp-simpleresponsive").length>0?a.closest(".tp-simpleresponsive"):a.closest(".tp-revslider-mainul").length>0?a.closest(".tp-revslider-mainul"):a.closest(".rev_slider_wrapper").length>0?a.closest(".rev_slider_wrapper"):a.parent().find(".tp-revslider-mainul"),e=d.width(),f=d.height();if(r(a,b,c),s(a,b,c),"outer-left"!==b.position||"fullwidth"!=b.sliderLayout&&"fullscreen"!=b.sliderLayout?"outer-right"!==b.position||"fullwidth"!=b.sliderLayout&&"fullscreen"!=b.sliderLayout||punchgs.TweenLite.set(a,{right:0-a.outerWidth()+"px",x:b.h_offset+"px"}):punchgs.TweenLite.set(a,{left:0-a.outerWidth()+"px",x:b.h_offset+"px"}),a.hasClass("tp-thumbs")||a.hasClass("tp-tabs")){var g=a.data("wr_padding"),h=a.data("maxw"),i=a.data("maxh"),j=a.hasClass("tp-thumbs")?a.find(".tp-thumb-mask"):a.find(".tp-tab-mask"),k=parseInt(b.padding_top||0,0),l=parseInt(b.padding_bottom||0,0);h>e&&"outer-left"!==b.position&&"outer-right"!==b.position?(punchgs.TweenLite.set(a,{left:"0px",x:0,maxWidth:e-2*g+"px"}),punchgs.TweenLite.set(j,{maxWidth:e-2*g+"px"})):(punchgs.TweenLite.set(a,{maxWidth:h+"px"}),punchgs.TweenLite.set(j,{maxWidth:h+"px"})),i+2*g>f&&"outer-bottom"!==b.position&&"outer-top"!==b.position?(punchgs.TweenLite.set(a,{top:"0px",y:0,maxHeight:k+l+(f-2*g)+"px"}),punchgs.TweenLite.set(j,{maxHeight:k+l+(f-2*g)+"px"})):(punchgs.TweenLite.set(a,{maxHeight:i+"px"}),punchgs.TweenLite.set(j,{maxHeight:i+"px"})),"outer-left"!==b.position&&"outer-right"!==b.position&&(k=0,l=0),!0===b.span&&"vertical"===b.direction?(punchgs.TweenLite.set(a,{maxHeight:k+l+(f-2*g)+"px",height:k+l+(f-2*g)+"px",top:0-k,y:0}),r(j,b,c)):!0===b.span&&"horizontal"===b.direction&&(punchgs.TweenLite.set(a,{maxWidth:"100%",width:e-2*g+"px",left:0,x:0}),s(j,b,c))}},u=function(a,b,c,d){0===a.find(".tp-bullets").length&&(b.style=void 0===b.style?"":b.style,a.append('<div class="tp-bullets '+b.style+" "+b.direction+'"></div>'));var e=a.find(".tp-bullets"),f=c.data("index"),g=b.tmp;jQuery.each(d.thumbs[c.index()].params,function(a,b){g=g.replace(b.from,b.to)}),e.append('<div class="justaddedbullet tp-bullet">'+g+"</div>");var h=a.find(".justaddedbullet"),i=a.find(".tp-bullet").length,j=h.outerWidth()+parseInt(void 0===b.space?0:b.space,0),k=h.outerHeight()+parseInt(void 0===b.space?0:b.space,0);"vertical"===b.direction?(h.css({top:(i-1)*k+"px",left:"0px"}),e.css({height:(i-1)*k+h.outerHeight(),width:h.outerWidth()})):(h.css({left:(i-1)*j+"px",top:"0px"}),e.css({width:(i-1)*j+h.outerWidth(),height:h.outerHeight()})),h.find(".tp-bullet-image").css({backgroundImage:"url("+d.thumbs[c.index()].src+")"}),h.data("liref",f),h.click(function(){d.sc_indicator="bullet",a.revcallslidewithid(f),a.find(".tp-bullet").removeClass("selected"),jQuery(this).addClass("selected")}),h.removeClass("justaddedbullet"),b.padding_top=parseInt(d.carousel.padding_top||0,0),b.padding_bottom=parseInt(d.carousel.padding_bottom||0,0),b.opt=d,"outer-left"!=b.position&&"outer-right"!=b.position||(d.outernav=!0),e.addClass("nav-pos-hor-"+b.h_align),e.addClass("nav-pos-ver-"+b.v_align),e.addClass("nav-dir-"+b.direction),t(e,b,d)},w=function(a,b,c,d,e){var f="tp-thumb"===d?".tp-thumbs":".tp-tabs",g="tp-thumb"===d?".tp-thumb-mask":".tp-tab-mask",h="tp-thumb"===d?".tp-thumbs-inner-wrapper":".tp-tabs-inner-wrapper",i="tp-thumb"===d?".tp-thumb":".tp-tab",j="tp-thumb"===d?".tp-thumb-image":".tp-tab-image";if(b.visibleAmount=b.visibleAmount>e.slideamount?e.slideamount:b.visibleAmount,b.sliderLayout=e.sliderLayout,0===a.parent().find(f).length){b.style=void 0===b.style?"":b.style;var k=!0===b.span?"tp-span-wrapper":"",l='<div class="'+d+"s "+k+" "+b.position+" "+b.style+'"><div class="'+d+'-mask"><div class="'+d+'s-inner-wrapper" style="position:relative;"></div></div></div>';"outer-top"===b.position?a.parent().prepend(l):"outer-bottom"===b.position?a.after(l):a.append(l),b.padding_top=parseInt(e.carousel.padding_top||0,0),b.padding_bottom=parseInt(e.carousel.padding_bottom||0,0),"outer-left"!=b.position&&"outer-right"!=b.position||(e.outernav=!0)}var m=c.data("index"),n=a.parent().find(f),o=n.find(g),p=o.find(h),q="horizontal"===b.direction?b.width*b.visibleAmount+b.space*(b.visibleAmount-1):b.width,r="horizontal"===b.direction?b.height:b.height*b.visibleAmount+b.space*(b.visibleAmount-1),s=b.tmp;jQuery.each(e.thumbs[c.index()].params,function(a,b){s=s.replace(b.from,b.to)}),p.append('<div data-liindex="'+c.index()+'" data-liref="'+m+'" class="justaddedthumb '+d+'" style="width:'+b.width+"px;height:"+b.height+'px;">'+s+"</div>");var u=n.find(".justaddedthumb"),v=n.find(i).length,w=u.outerWidth()+parseInt(void 0===b.space?0:b.space,0),x=u.outerHeight()+parseInt(void 0===b.space?0:b.space,0);u.find(j).css({backgroundImage:"url("+e.thumbs[c.index()].src+")"}),"vertical"===b.direction?(u.css({top:(v-1)*x+"px",left:"0px"}),p.css({height:(v-1)*x+u.outerHeight(),width:u.outerWidth()})):(u.css({left:(v-1)*w+"px",top:"0px"}),p.css({width:(v-1)*w+u.outerWidth(),height:u.outerHeight()})),n.data("maxw",q),n.data("maxh",r),n.data("wr_padding",b.wrapper_padding);var y="outer-top"===b.position||"outer-bottom"===b.position?"relative":"absolute";"outer-top"!==b.position&&"outer-bottom"!==b.position||b.h_align;o.css({maxWidth:q+"px",maxHeight:r+"px",overflow:"hidden",position:"relative"}),n.css({maxWidth:q+"px",maxHeight:r+"px",overflow:"visible",position:y,background:b.wrapper_color,padding:b.wrapper_padding+"px",boxSizing:"contet-box"}),u.click(function(){e.sc_indicator="bullet";var b=a.parent().find(h).data("distance");b=void 0===b?0:b,Math.abs(b)<10&&(a.revcallslidewithid(m),a.parent().find(f).removeClass("selected"),jQuery(this).addClass("selected"))}),u.removeClass("justaddedthumb"),b.opt=e,n.addClass("nav-pos-hor-"+b.h_align),n.addClass("nav-pos-ver-"+b.v_align),n.addClass("nav-dir-"+b.direction),t(n,b,e)},x=function(a){var b=a.c.parent().find(".outer-top"),c=a.c.parent().find(".outer-bottom");a.top_outer=b.hasClass("tp-forcenotvisible")?0:b.outerHeight()||0,a.bottom_outer=c.hasClass("tp-forcenotvisible")?0:c.outerHeight()||0},y=function(a,b,c,d){b>c||c>d?a.addClass("tp-forcenotvisible"):a.removeClass("tp-forcenotvisible")}}(jQuery);
/********************************************
 * REVOLUTION 5.4.6.5 EXTENSION - PARALLAX
 * @version: 2.2.3 (17.05.2017)
 * @requires jquery.themepunch.revolution.js
 * @author ThemePunch
*********************************************/
!function(a){"use strict";function e(a,b){a.lastscrolltop=b}var b=jQuery.fn.revolution,c=b.is_mobile(),d={alias:"Parallax Min JS",name:"revolution.extensions.parallax.min.js",min_core:"5.4.5",version:"2.2.3"};jQuery.extend(!0,b,{checkForParallax:function(a,e){function g(a){if("3D"==f.type||"3d"==f.type){a.find(".slotholder").wrapAll('<div class="dddwrapper" style="width:100%;height:100%;position:absolute;top:0px;left:0px;overflow:hidden"></div>'),a.find(".tp-parallax-wrap").wrapAll('<div class="dddwrapper-layer" style="width:100%;height:100%;position:absolute;top:0px;left:0px;z-index:5;overflow:'+f.ddd_layer_overflow+';"></div>'),a.find(".rs-parallaxlevel-tobggroup").closest(".tp-parallax-wrap").wrapAll('<div class="dddwrapper-layertobggroup" style="position:absolute;top:0px;left:0px;z-index:50;width:100%;height:100%"></div>');var b=a.find(".dddwrapper"),c=a.find(".dddwrapper-layer");a.find(".dddwrapper-layertobggroup").appendTo(b),"carousel"==e.sliderType&&("on"==f.ddd_shadow&&b.addClass("dddwrappershadow"),punchgs.TweenLite.set(b,{borderRadius:e.carousel.border_radius})),punchgs.TweenLite.set(a,{overflow:"visible",transformStyle:"preserve-3d",perspective:1600}),punchgs.TweenLite.set(b,{force3D:"auto",transformOrigin:"50% 50%"}),punchgs.TweenLite.set(c,{force3D:"auto",transformOrigin:"50% 50%",zIndex:5}),punchgs.TweenLite.set(e.ul,{transformStyle:"preserve-3d",transformPerspective:1600})}}if("stop"===b.compare_version(d).check)return!1;var f=e.parallax;if(!f.done){if(f.done=!0,c&&"on"==f.disable_onmobile)return!1;"3D"!=f.type&&"3d"!=f.type||(punchgs.TweenLite.set(e.c,{overflow:f.ddd_overflow}),punchgs.TweenLite.set(e.ul,{overflow:f.ddd_overflow}),"carousel"!=e.sliderType&&"on"==f.ddd_shadow&&(e.c.prepend('<div class="dddwrappershadow"></div>'),punchgs.TweenLite.set(e.c.find(".dddwrappershadow"),{force3D:"auto",transformPerspective:1600,transformOrigin:"50% 50%",width:"100%",height:"100%",position:"absolute",top:0,left:0,zIndex:0}))),e.li.each(function(){g(jQuery(this))}),("3D"==f.type||"3d"==f.type)&&e.c.find(".tp-static-layers").length>0&&(punchgs.TweenLite.set(e.c.find(".tp-static-layers"),{top:0,left:0,width:"100%",height:"100%"}),g(e.c.find(".tp-static-layers"))),f.pcontainers=new Array,f.pcontainer_depths=new Array,f.bgcontainers=new Array,f.bgcontainer_depths=new Array,e.c.find(".tp-revslider-slidesli .slotholder, .tp-revslider-slidesli .rs-background-video-layer").each(function(){var a=jQuery(this),b=a.data("bgparallax")||e.parallax.bgparallax;void 0!==(b="on"==b?1:b)&&"off"!==b&&(f.bgcontainers.push(a),f.bgcontainer_depths.push(e.parallax.levels[parseInt(b,0)-1]/100))});for(var h=1;h<=f.levels.length;h++)e.c.find(".rs-parallaxlevel-"+h).each(function(){var a=jQuery(this),b=a.closest(".tp-parallax-wrap");b.data("parallaxlevel",f.levels[h-1]),b.addClass("tp-parallax-container"),f.pcontainers.push(b),f.pcontainer_depths.push(f.levels[h-1])});"mouse"!=f.type&&"scroll+mouse"!=f.type&&"mouse+scroll"!=f.type&&"3D"!=f.type&&"3d"!=f.type||(a.mouseenter(function(b){var c=a.find(".active-revslide"),d=a.offset().top,e=a.offset().left,f=b.pageX-e,g=b.pageY-d;c.data("enterx",f),c.data("entery",g)}),a.on("mousemove.hoverdir, mouseleave.hoverdir, trigger3dpath",function(b,c){var d=c&&c.li?c.li:a.find(".active-revslide");if("enterpoint"==f.origo){var g=a.offset().top,h=a.offset().left;void 0==d.data("enterx")&&d.data("enterx",b.pageX-h),void 0==d.data("entery")&&d.data("entery",b.pageY-g);var i=d.data("enterx")||b.pageX-h,j=d.data("entery")||b.pageY-g,k=i-(b.pageX-h),l=j-(b.pageY-g),m=f.speed/1e3||.4}else var g=a.offset().top,h=a.offset().left,k=e.conw/2-(b.pageX-h),l=e.conh/2-(b.pageY-g),m=f.speed/1e3||3;"mouseleave"==b.type&&(k=f.ddd_lasth||0,l=f.ddd_lastv||0,m=1.5);for(var n=0;n<f.pcontainers.length;n++){var o=f.pcontainers[n],p=f.pcontainer_depths[n],q="3D"==f.type||"3d"==f.type?p/200:p/100,r=k*q,s=l*q;"scroll+mouse"==f.type||"mouse+scroll"==f.type?punchgs.TweenLite.to(o,m,{force3D:"auto",x:r,ease:punchgs.Power3.easeOut,overwrite:"all"}):punchgs.TweenLite.to(o,m,{force3D:"auto",x:r,y:s,ease:punchgs.Power3.easeOut,overwrite:"all"})}if("3D"==f.type||"3d"==f.type){var t=".tp-revslider-slidesli .dddwrapper, .dddwrappershadow, .tp-revslider-slidesli .dddwrapper-layer, .tp-static-layers .dddwrapper-layer";"carousel"===e.sliderType&&(t=".tp-revslider-slidesli .dddwrapper, .tp-revslider-slidesli .dddwrapper-layer, .tp-static-layers .dddwrapper-layer"),e.c.find(t).each(function(){var a=jQuery(this),c=f.levels[f.levels.length-1]/200,d=k*c,g=l*c,h=0==e.conw?0:Math.round(k/e.conw*c*100)||0,i=0==e.conh?0:Math.round(l/e.conh*c*100)||0,j=a.closest("li"),n=0,o=!1;a.hasClass("dddwrapper-layer")&&(n=f.ddd_z_correction||65,o=!0),a.hasClass("dddwrapper-layer")&&(d=0,g=0),j.hasClass("active-revslide")||"carousel"!=e.sliderType?"on"!=f.ddd_bgfreeze||o?punchgs.TweenLite.to(a,m,{rotationX:i,rotationY:-h,x:d,z:n,y:g,ease:punchgs.Power3.easeOut,overwrite:"all"}):punchgs.TweenLite.to(a,.5,{force3D:"auto",rotationY:0,rotationX:0,z:0,ease:punchgs.Power3.easeOut,overwrite:"all"}):punchgs.TweenLite.to(a,.5,{force3D:"auto",rotationY:0,x:0,y:0,rotationX:0,z:0,ease:punchgs.Power3.easeOut,overwrite:"all"}),"mouseleave"==b.type&&punchgs.TweenLite.to(jQuery(this),3.8,{z:0,ease:punchgs.Power3.easeOut})})}}),c&&(window.ondeviceorientation=function(b){var c=Math.round(b.beta||0)-70,d=Math.round(b.gamma||0),g=a.find(".active-revslide");if(jQuery(window).width()>jQuery(window).height()){var h=d;d=c,c=h}var i=a.width(),j=a.height(),k=360/i*d,l=180/j*c,m=f.speed/1e3||3,n=[];if(g.find(".tp-parallax-container").each(function(a){n.push(jQuery(this))}),a.find(".tp-static-layers .tp-parallax-container").each(function(){n.push(jQuery(this))}),jQuery.each(n,function(){var a=jQuery(this),b=parseInt(a.data("parallaxlevel"),0),c=b/100,d=k*c*2,e=l*c*4;punchgs.TweenLite.to(a,m,{force3D:"auto",x:d,y:e,ease:punchgs.Power3.easeOut,overwrite:"all"})}),"3D"==f.type||"3d"==f.type){var o=".tp-revslider-slidesli .dddwrapper, .dddwrappershadow, .tp-revslider-slidesli .dddwrapper-layer, .tp-static-layers .dddwrapper-layer";"carousel"===e.sliderType&&(o=".tp-revslider-slidesli .dddwrapper, .tp-revslider-slidesli .dddwrapper-layer, .tp-static-layers .dddwrapper-layer"),e.c.find(o).each(function(){var a=jQuery(this),c=f.levels[f.levels.length-1]/200,d=k*c,g=l*c*3,h=0==e.conw?0:Math.round(k/e.conw*c*500)||0,i=0==e.conh?0:Math.round(l/e.conh*c*700)||0,j=a.closest("li"),n=0,o=!1;a.hasClass("dddwrapper-layer")&&(n=f.ddd_z_correction||65,o=!0),a.hasClass("dddwrapper-layer")&&(d=0,g=0),j.hasClass("active-revslide")||"carousel"!=e.sliderType?"on"!=f.ddd_bgfreeze||o?punchgs.TweenLite.to(a,m,{rotationX:i,rotationY:-h,x:d,z:n,y:g,ease:punchgs.Power3.easeOut,overwrite:"all"}):punchgs.TweenLite.to(a,.5,{force3D:"auto",rotationY:0,rotationX:0,z:0,ease:punchgs.Power3.easeOut,overwrite:"all"}):punchgs.TweenLite.to(a,.5,{force3D:"auto",rotationY:0,z:0,x:0,y:0,rotationX:0,ease:punchgs.Power3.easeOut,overwrite:"all"}),"mouseleave"==b.type&&punchgs.TweenLite.to(jQuery(this),3.8,{z:0,ease:punchgs.Power3.easeOut})})}}));var i=e.scrolleffect;if(i.bgs=new Array,i.on){if("on"===i.on_slidebg)for(var h=0;h<e.allslotholder.length;h++)i.bgs.push(e.allslotholder[h]);i.multiplicator_layers=parseFloat(i.multiplicator_layers),i.multiplicator=parseFloat(i.multiplicator)}void 0!==i.layers&&0===i.layers.length&&(i.layers=!1),void 0!==i.bgs&&0===i.bgs.length&&(i.bgs=!1),b.scrollTicker(e,a)}},scrollTicker:function(a,d){1!=a.scrollTicker&&(a.scrollTicker=!0,c?(punchgs.TweenLite.ticker.fps(150),punchgs.TweenLite.ticker.addEventListener("tick",function(){b.scrollHandling(a)},d,!1,1)):document.addEventListener("scroll",function(c){b.scrollHandling(a,!0)},{passive:!0})),b.scrollHandling(a,!0)},scrollHandling:function(a,d,f){if(a.lastwindowheight=a.lastwindowheight||window.innerHeight,a.conh=0===a.conh||void 0===a.conh?a.infullscreenmode?a.minHeight:a.c.height():a.conh,a.lastscrolltop==window.scrollY&&!a.duringslidechange&&!d)return!1;punchgs.TweenLite.delayedCall(.2,e,[a,window.scrollY]);var g=a.c[0].getBoundingClientRect(),h=a.viewPort,i=a.parallax,j=g.top<0||g.height>a.lastwindowheight?g.top/g.height:g.bottom>a.lastwindowheight?(g.bottom-a.lastwindowheight)/g.height:0;if(a.scrollproc=j,b.callBackHandling&&b.callBackHandling(a,"parallax","start"),h.enable){var k=1-Math.abs(j);k=k<0?0:k,jQuery.isNumeric(h.visible_area)||-1!==h.visible_area.indexOf("%")&&(h.visible_area=parseInt(h.visible_area)/100),1-h.visible_area<=k?a.inviewport||(a.inviewport=!0,b.enterInViewPort(a)):a.inviewport&&(a.inviewport=!1,b.leaveViewPort(a))}if(c&&"on"==i.disable_onmobile)return!1;if("3d"!=i.type&&"3D"!=i.type){if(("scroll"==i.type||"scroll+mouse"==i.type||"mouse+scroll"==i.type)&&i.pcontainers)for(var l=0;l<i.pcontainers.length;l++)if(i.pcontainers[l].length>0){var m=i.pcontainers[l],n=i.pcontainer_depths[l]/100,o=Math.round(j*(-n*a.conh)*10)/10||0,p=void 0!==f?f:i.speedls/1e3||0;m.data("parallaxoffset",o),punchgs.TweenLite.to(m,p,{overwrite:"auto",force3D:"auto",y:o})}if(i.bgcontainers)for(var l=0;l<i.bgcontainers.length;l++){var q=i.bgcontainers[l],r=i.bgcontainer_depths[l],o=j*(-r*a.conh)||0,p=void 0!==f?f:i.speedbg/1e3||0;punchgs.TweenLite.to(q,p,{position:"absolute",top:"0px",left:"0px",backfaceVisibility:"hidden",force3D:"true",y:o+"px"})}}var s=a.scrolleffect;if(s.on&&("on"!==s.disable_on_mobile||!c)){var t=Math.abs(j)-s.tilt/100;if(t=t<0?0:t,!1!==s.layers){var u=1-t*s.multiplicator_layers,v={backfaceVisibility:"hidden",force3D:"true",z:.001,perspective:600};if("top"==s.direction&&j>=0&&(u=1),"bottom"==s.direction&&j<=0&&(u=1),u=u>1?1:u<0?0:u,"on"===s.fade&&(v.opacity=u),"on"===s.scale){var w=u;v.scale=1-w+1}if("on"===s.blur){var x=(1-u)*s.maxblur;v["-webkit-filter"]="blur("+x+"px)",v.filter="blur("+x+"px)"}if("on"===s.grayscale){var y=100*(1-u),z="grayscale("+y+"%)";v["-webkit-filter"]=void 0===v["-webkit-filter"]?z:v["-webkit-filter"]+" "+z,v.filter=void 0===v.filter?z:v.filter+" "+z}punchgs.TweenLite.set(s.layers,v)}if(!1!==s.bgs){var u=1-t*s.multiplicator,v={backfaceVisibility:"hidden",force3D:"true"};if("top"==s.direction&&j>=0&&(u=1),"bottom"==s.direction&&j<=0&&(u=1),u=u>1?1:u<0?0:u,"on"===s.fade&&(v.opacity=u),"on"===s.scale){var w=u;punchgs.TweenLite.set(jQuery(".tp-kbimg-wrap"),{transformOrigin:"50% 50%",scale:w,force3D:!0})}if("on"===s.blur){var x=(1-u)*s.maxblur;v["-webkit-filter"]="blur("+x+"px)",v.filter="blur("+x+"px)"}if("on"===s.grayscale){var y=100*(1-u),z="grayscale("+y+"%)";v["-webkit-filter"]=void 0===v["-webkit-filter"]?z:v["-webkit-filter"]+" "+z,v.filter=void 0===v.filter?z:v.filter+" "+z}punchgs.TweenLite.set(s.bgs,v)}}b.callBackHandling&&b.callBackHandling(a,"parallax","end")}})}(jQuery);
/************************************************
 * REVOLUTION 5.4.6.5 EXTENSION - SLIDE ANIMATIONS
 * @version: 1.8 (17.05.2017)
 * @requires jquery.themepunch.revolution.js
 * @author ThemePunch
************************************************/
!function(t){"use strict";var L=jQuery.fn.revolution,l={alias:"SlideAnimations Min JS",name:"revolution.extensions.slideanims.min.js",min_core:"5.4.5",version:"1.8"};jQuery.extend(!0,L,{animateSlide:function(t,e,o,a,i,n,r,s){return"stop"===L.compare_version(l).check?s:d(t,e,o,a,i,n,r,s)}});var ct=function(t,e,o,a){var i=t,n=i.find(".defaultimg"),r=n.data("mediafilter"),s=i.data("zoomstart"),l=i.data("rotationstart");null!=n.data("currotate")&&(l=n.data("currotate")),null!=n.data("curscale")&&"box"==a?s=100*n.data("curscale"):null!=n.data("curscale")&&(s=n.data("curscale")),L.slotSize(n,e);var d=n.attr("src"),h=n.data("bgcolor"),f=e.width,c=e.height,u=n.data("fxof");void 0===h&&(h=n.css("backgroundColor")),"on"==e.autoHeight&&(c=e.c.height()),null==u&&(u=0);var p=0,g=n.data("bgfit"),w=n.data("bgrepeat"),m=n.data("bgposition");null==g&&(g="cover"),null==w&&(w="no-repeat"),null==m&&(m="center center");var v="";switch(v=void 0!==h&&0<=h.indexOf("gradient")?"background:"+h:"background-color:"+h+";background-image:url("+d+");background-repeat:"+w+";background-size:"+g+";background-position:"+m,a){case"box":for(var y=0,x=0,T=0;T<e.slots;T++){for(var z=x=0;z<e.slots;z++)i.append('<div class="slot" style="position:absolute;top:'+(0+x)+"px;left:"+(u+y)+"px;width:"+e.slotw+"px;height:"+e.sloth+'px;overflow:hidden;"><div class="slotslide '+r+'" data-x="'+y+'" data-y="'+x+'" style="position:absolute;top:0px;left:0px;width:'+e.slotw+"px;height:"+e.sloth+'px;overflow:hidden;"><div style="position:absolute;top:'+(0-x)+"px;left:"+(0-y)+"px;width:"+f+"px;height:"+c+"px;"+v+';"></div></div></div>'),x+=e.sloth,null!=s&&null!=l&&punchgs.TweenLite.set(i.find(".slot").last(),{rotationZ:l});y+=e.slotw}break;case"vertical":case"horizontal":if("horizontal"==a){if(!o)p=0-e.slotw;for(z=0;z<e.slots;z++)i.append('<div class="slot" style="position:absolute;top:0px;left:'+(u+z*e.slotw)+"px;overflow:hidden;width:"+(e.slotw+.3)+"px;height:"+c+'px"><div class="slotslide '+r+'" style="position:absolute;top:0px;left:'+p+"px;width:"+(e.slotw+.6)+"px;height:"+c+'px;overflow:hidden;"><div style="position:absolute;top:0px;left:'+(0-z*e.slotw)+"px;width:"+f+"px;height:"+c+"px;"+v+';"></div></div></div>'),null!=s&&null!=l&&punchgs.TweenLite.set(i.find(".slot").last(),{rotationZ:l})}else{if(!o)p=0-e.sloth;for(z=0;z<e.slots+2;z++)i.append('<div class="slot" style="position:absolute;top:'+(0+z*e.sloth)+"px;left:"+u+"px;overflow:hidden;width:"+f+"px;height:"+e.sloth+'px"><div class="slotslide '+r+'" style="position:absolute;top:'+p+"px;left:0px;width:"+f+"px;height:"+e.sloth+'px;overflow:hidden;"><div style="position:absolute;top:'+(0-z*e.sloth)+"px;left:0px;width:"+f+"px;height:"+c+"px;"+v+';"></div></div></div>'),null!=s&&null!=l&&punchgs.TweenLite.set(i.find(".slot").last(),{rotationZ:l})}}};var ut=function(t,e){return null==e||jQuery.isNumeric(t)?t:null==t?t:t.split(",")[e]},d=function(a,t,e,o,i,n,r,s){var l=e[0].opt,d=i.index(),h=o.index()<d?1:0;"arrow"==l.sc_indicator&&(h=l.sc_indicator_dir);var f=function(t,o,e,a){var i=t[0].opt,n=punchgs.Power1.easeIn,r=punchgs.Power1.easeOut,s=punchgs.Power1.easeInOut,l=punchgs.Power2.easeIn,d=punchgs.Power2.easeOut,h=punchgs.Power2.easeInOut,f=(punchgs.Power3.easeIn,punchgs.Power3.easeOut),c=punchgs.Power3.easeInOut,u=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45],p=[16,17,18,19,20,21,22,23,24,25,27],g=0,w=1,m=0,v=0,y=(new Array,[["boxslide",0,1,10,0,"box",!1,null,0,r,r,500,6],["boxfade",1,0,10,0,"box",!1,null,1,s,s,700,5],["slotslide-horizontal",2,0,0,200,"horizontal",!0,!1,2,h,h,700,3],["slotslide-vertical",3,0,0,200,"vertical",!0,!1,3,h,h,700,3],["curtain-1",4,3,0,0,"horizontal",!0,!0,4,r,r,300,5],["curtain-2",5,3,0,0,"horizontal",!0,!0,5,r,r,300,5],["curtain-3",6,3,25,0,"horizontal",!0,!0,6,r,r,300,5],["slotzoom-horizontal",7,0,0,400,"horizontal",!0,!0,7,r,r,300,7],["slotzoom-vertical",8,0,0,0,"vertical",!0,!0,8,d,d,500,8],["slotfade-horizontal",9,0,0,1e3,"horizontal",!0,null,9,d,d,2e3,10],["slotfade-vertical",10,0,0,1e3,"vertical",!0,null,10,d,d,2e3,10],["fade",11,0,1,300,"horizontal",!0,null,11,h,h,1e3,1],["crossfade",11,1,1,300,"horizontal",!0,null,11,h,h,1e3,1],["fadethroughdark",11,2,1,300,"horizontal",!0,null,11,h,h,1e3,1],["fadethroughlight",11,3,1,300,"horizontal",!0,null,11,h,h,1e3,1],["fadethroughtransparent",11,4,1,300,"horizontal",!0,null,11,h,h,1e3,1],["slideleft",12,0,1,0,"horizontal",!0,!0,12,c,c,1e3,1],["slideup",13,0,1,0,"horizontal",!0,!0,13,c,c,1e3,1],["slidedown",14,0,1,0,"horizontal",!0,!0,14,c,c,1e3,1],["slideright",15,0,1,0,"horizontal",!0,!0,15,c,c,1e3,1],["slideoverleft",12,7,1,0,"horizontal",!0,!0,12,c,c,1e3,1],["slideoverup",13,7,1,0,"horizontal",!0,!0,13,c,c,1e3,1],["slideoverdown",14,7,1,0,"horizontal",!0,!0,14,c,c,1e3,1],["slideoverright",15,7,1,0,"horizontal",!0,!0,15,c,c,1e3,1],["slideremoveleft",12,8,1,0,"horizontal",!0,!0,12,c,c,1e3,1],["slideremoveup",13,8,1,0,"horizontal",!0,!0,13,c,c,1e3,1],["slideremovedown",14,8,1,0,"horizontal",!0,!0,14,c,c,1e3,1],["slideremoveright",15,8,1,0,"horizontal",!0,!0,15,c,c,1e3,1],["papercut",16,0,0,600,"",null,null,16,c,c,1e3,2],["3dcurtain-horizontal",17,0,20,100,"vertical",!1,!0,17,s,s,500,7],["3dcurtain-vertical",18,0,10,100,"horizontal",!1,!0,18,s,s,500,5],["cubic",19,0,20,600,"horizontal",!1,!0,19,c,c,500,1],["cube",19,0,20,600,"horizontal",!1,!0,20,c,c,500,1],["flyin",20,0,4,600,"vertical",!1,!0,21,f,c,500,1],["turnoff",21,0,1,500,"horizontal",!1,!0,22,c,c,500,1],["incube",22,0,20,200,"horizontal",!1,!0,23,h,h,500,1],["cubic-horizontal",23,0,20,500,"vertical",!1,!0,24,d,d,500,1],["cube-horizontal",23,0,20,500,"vertical",!1,!0,25,d,d,500,1],["incube-horizontal",24,0,20,500,"vertical",!1,!0,26,h,h,500,1],["turnoff-vertical",25,0,1,200,"horizontal",!1,!0,27,h,h,500,1],["fadefromright",12,1,1,0,"horizontal",!0,!0,28,h,h,1e3,1],["fadefromleft",15,1,1,0,"horizontal",!0,!0,29,h,h,1e3,1],["fadefromtop",14,1,1,0,"horizontal",!0,!0,30,h,h,1e3,1],["fadefrombottom",13,1,1,0,"horizontal",!0,!0,31,h,h,1e3,1],["fadetoleftfadefromright",12,2,1,0,"horizontal",!0,!0,32,h,h,1e3,1],["fadetorightfadefromleft",15,2,1,0,"horizontal",!0,!0,33,h,h,1e3,1],["fadetobottomfadefromtop",14,2,1,0,"horizontal",!0,!0,34,h,h,1e3,1],["fadetotopfadefrombottom",13,2,1,0,"horizontal",!0,!0,35,h,h,1e3,1],["parallaxtoright",15,3,1,0,"horizontal",!0,!0,36,h,l,1500,1],["parallaxtoleft",12,3,1,0,"horizontal",!0,!0,37,h,l,1500,1],["parallaxtotop",14,3,1,0,"horizontal",!0,!0,38,h,n,1500,1],["parallaxtobottom",13,3,1,0,"horizontal",!0,!0,39,h,n,1500,1],["scaledownfromright",12,4,1,0,"horizontal",!0,!0,40,h,l,1e3,1],["scaledownfromleft",15,4,1,0,"horizontal",!0,!0,41,h,l,1e3,1],["scaledownfromtop",14,4,1,0,"horizontal",!0,!0,42,h,l,1e3,1],["scaledownfrombottom",13,4,1,0,"horizontal",!0,!0,43,h,l,1e3,1],["zoomout",13,5,1,0,"horizontal",!0,!0,44,h,l,1e3,1],["zoomin",13,6,1,0,"horizontal",!0,!0,45,h,l,1e3,1],["slidingoverlayup",27,0,1,0,"horizontal",!0,!0,47,s,r,2e3,1],["slidingoverlaydown",28,0,1,0,"horizontal",!0,!0,48,s,r,2e3,1],["slidingoverlayright",30,0,1,0,"horizontal",!0,!0,49,s,r,2e3,1],["slidingoverlayleft",29,0,1,0,"horizontal",!0,!0,50,s,r,2e3,1],["parallaxcirclesup",31,0,1,0,"horizontal",!0,!0,51,h,n,1500,1],["parallaxcirclesdown",32,0,1,0,"horizontal",!0,!0,52,h,n,1500,1],["parallaxcirclesright",33,0,1,0,"horizontal",!0,!0,53,h,n,1500,1],["parallaxcirclesleft",34,0,1,0,"horizontal",!0,!0,54,h,n,1500,1],["notransition",26,0,1,0,"horizontal",!0,null,46,h,l,1e3,1],["parallaxright",15,3,1,0,"horizontal",!0,!0,55,h,l,1500,1],["parallaxleft",12,3,1,0,"horizontal",!0,!0,56,h,l,1500,1],["parallaxup",14,3,1,0,"horizontal",!0,!0,57,h,n,1500,1],["parallaxdown",13,3,1,0,"horizontal",!0,!0,58,h,n,1500,1],["grayscale",11,5,1,300,"horizontal",!0,null,11,h,h,1e3,1],["grayscalecross",11,6,1,300,"horizontal",!0,null,11,h,h,1e3,1],["brightness",11,7,1,300,"horizontal",!0,null,11,h,h,1e3,1],["brightnesscross",11,8,1,300,"horizontal",!0,null,11,h,h,1e3,1],["blurlight",11,9,1,300,"horizontal",!0,null,11,h,h,1e3,1],["blurlightcross",11,10,1,300,"horizontal",!0,null,11,h,h,1e3,1],["blurstrong",11,9,1,300,"horizontal",!0,null,11,h,h,1e3,1],["blurstrongcross",11,10,1,300,"horizontal",!0,null,11,h,h,1e3,1]]);i.duringslidechange=!0,i.testanims=!1,1==i.testanims&&(i.nexttesttransform=void 0===i.nexttesttransform?34:i.nexttesttransform+1,i.nexttesttransform=70<i.nexttesttransform?0:i.nexttesttransform,o=y[i.nexttesttransform][0],console.log(o+"  "+i.nexttesttransform+"  "+y[i.nexttesttransform][1]+"  "+y[i.nexttesttransform][2])),jQuery.each(["parallaxcircles","slidingoverlay","slide","slideover","slideremove","parallax","parralaxto"],function(t,e){o==e+"horizontal"&&(o=1!=a?e+"left":e+"right"),o==e+"vertical"&&(o=1!=a?e+"up":e+"down")}),"random"==o&&(o=Math.round(Math.random()*y.length-1),y.length-1<o&&(o=y.length-1)),"random-static"==o&&(o=Math.round(Math.random()*u.length-1),u.length-1<o&&(o=u.length-1),o=u[o]),"random-premium"==o&&(o=Math.round(Math.random()*p.length-1),p.length-1<o&&(o=p.length-1),o=p[o]);if(1==i.isJoomla&&null!=window.MooTools&&-1!=[12,13,14,15,16,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45].indexOf(o)){var x=Math.round(Math.random()*(p.length-2))+1;p.length-1<x&&(x=p.length-1),0==x&&(x=1),o=p[x]}jQuery.each(y,function(t,e){e[0]!=o&&e[8]!=o||(g=e[1],w=e[2],m=v),v+=1}),30<g&&(g=30),g<0&&(g=0);var T=new Object;return T.nexttrans=g,T.STA=y[m],T.specials=w,T}(e,t,0,h),c=f.STA,u=f.specials;a=f.nexttrans;"on"==n.data("kenburns")&&(a=11);var p=o.data("nexttransid")||0,g=ut(o.data("masterspeed"),p);g=(g="default"===g?c[11]:"random"===g?Math.round(1e3*Math.random()+300):null!=g?parseInt(g,0):c[11])>l.delay?l.delay:g,g+=c[4],l.slots=ut(o.data("slotamount"),p),l.slots=null==l.slots||"default"==l.slots?c[12]:"random"==l.slots?Math.round(12*Math.random()+4):l.slots,l.slots=l.slots<1?"boxslide"==t?Math.round(6*Math.random()+3):"flyin"==t?Math.round(4*Math.random()+1):l.slots:l.slots,l.slots=(4==a||5==a||6==a)&&l.slots<3?3:l.slots,l.slots=0!=c[3]?Math.min(l.slots,c[3]):l.slots,l.slots=9==a?l.width/l.slots:10==a?l.height/l.slots:l.slots,l.rotate=ut(o.data("rotate"),p),l.rotate=null==l.rotate||"default"==l.rotate?0:999==l.rotate||"random"==l.rotate?Math.round(360*Math.random()):l.rotate,l.rotate=l.ie||l.ie9?0:l.rotate,11!=a&&(null!=c[7]&&ct(r,l,c[7],c[5]),null!=c[6]&&ct(n,l,c[6],c[5])),s.add(punchgs.TweenLite.set(n.find(".defaultvid"),{y:0,x:0,top:0,left:0,scale:1}),0),s.add(punchgs.TweenLite.set(r.find(".defaultvid"),{y:0,x:0,top:0,left:0,scale:1}),0),s.add(punchgs.TweenLite.set(n.find(".defaultvid"),{y:"+0%",x:"+0%"}),0),s.add(punchgs.TweenLite.set(r.find(".defaultvid"),{y:"+0%",x:"+0%"}),0),s.add(punchgs.TweenLite.set(n,{autoAlpha:1,y:"+0%",x:"+0%"}),0),s.add(punchgs.TweenLite.set(r,{autoAlpha:1,y:"+0%",x:"+0%"}),0),s.add(punchgs.TweenLite.set(n.parent(),{backgroundColor:"transparent"}),0),s.add(punchgs.TweenLite.set(r.parent(),{backgroundColor:"transparent"}),0);var w=ut(o.data("easein"),p),m=ut(o.data("easeout"),p);if(w="default"===w?c[9]||punchgs.Power2.easeInOut:w||c[9]||punchgs.Power2.easeInOut,m="default"===m?c[10]||punchgs.Power2.easeInOut:m||c[10]||punchgs.Power2.easeInOut,0==a){var v=Math.ceil(l.height/l.sloth),y=0;n.find(".slotslide").each(function(t){var e=jQuery(this);(y+=1)==v&&(y=0),s.add(punchgs.TweenLite.from(e,g/600,{opacity:0,top:0-l.sloth,left:0-l.slotw,rotation:l.rotate,force3D:"auto",ease:w}),(15*t+30*y)/1500)})}if(1==a){var x;n.find(".slotslide").each(function(t){var e=jQuery(this),o=Math.random()*g+300,a=500*Math.random()+200;x<o+a&&(x=a+a,t),s.add(punchgs.TweenLite.from(e,o/1e3,{autoAlpha:0,force3D:"auto",rotation:l.rotate,ease:w}),a/1e3)})}if(2==a){var T=new punchgs.TimelineLite;r.find(".slotslide").each(function(){var t=jQuery(this);T.add(punchgs.TweenLite.to(t,g/1e3,{left:l.slotw,ease:w,force3D:"auto",rotation:0-l.rotate}),0),s.add(T,0)}),n.find(".slotslide").each(function(){var t=jQuery(this);T.add(punchgs.TweenLite.from(t,g/1e3,{left:0-l.slotw,ease:w,force3D:"auto",rotation:l.rotate}),0),s.add(T,0)})}if(3==a){T=new punchgs.TimelineLite;r.find(".slotslide").each(function(){var t=jQuery(this);T.add(punchgs.TweenLite.to(t,g/1e3,{top:l.sloth,ease:w,rotation:l.rotate,force3D:"auto",transformPerspective:600}),0),s.add(T,0)}),n.find(".slotslide").each(function(){var t=jQuery(this);T.add(punchgs.TweenLite.from(t,g/1e3,{top:0-l.sloth,rotation:l.rotate,ease:m,force3D:"auto",transformPerspective:600}),0),s.add(T,0)})}if(4==a||5==a){setTimeout(function(){r.find(".defaultimg").css({opacity:0})},100);var z=g/1e3;T=new punchgs.TimelineLite;r.find(".slotslide").each(function(t){var e=jQuery(this),o=t*z/l.slots;5==a&&(o=(l.slots-t-1)*z/l.slots/1.5),T.add(punchgs.TweenLite.to(e,3*z,{transformPerspective:600,force3D:"auto",top:0+l.height,opacity:.5,rotation:l.rotate,ease:w,delay:o}),0),s.add(T,0)}),n.find(".slotslide").each(function(t){var e=jQuery(this),o=t*z/l.slots;5==a&&(o=(l.slots-t-1)*z/l.slots/1.5),T.add(punchgs.TweenLite.from(e,3*z,{top:0-l.height,opacity:.5,rotation:l.rotate,force3D:"auto",ease:punchgs.eo,delay:o}),0),s.add(T,0)})}if(6==a){l.slots<2&&(l.slots=2),l.slots%2&&(l.slots=l.slots+1);T=new punchgs.TimelineLite;setTimeout(function(){r.find(".defaultimg").css({opacity:0})},100),r.find(".slotslide").each(function(t){var e=jQuery(this);if(t+1<l.slots/2)var o=90*(t+2);else o=90*(2+l.slots-t);T.add(punchgs.TweenLite.to(e,(g+o)/1e3,{top:0+l.height,opacity:1,force3D:"auto",rotation:l.rotate,ease:w}),0),s.add(T,0)}),n.find(".slotslide").each(function(t){var e=jQuery(this);if(t+1<l.slots/2)var o=90*(t+2);else o=90*(2+l.slots-t);T.add(punchgs.TweenLite.from(e,(g+o)/1e3,{top:0-l.height,opacity:1,force3D:"auto",rotation:l.rotate,ease:m}),0),s.add(T,0)})}if(7==a){(g*=2)>l.delay&&(g=l.delay);T=new punchgs.TimelineLite;setTimeout(function(){r.find(".defaultimg").css({opacity:0})},100),r.find(".slotslide").each(function(){var t=jQuery(this).find("div");T.add(punchgs.TweenLite.to(t,g/1e3,{left:0-l.slotw/2+"px",top:0-l.height/2+"px",width:2*l.slotw+"px",height:2*l.height+"px",opacity:0,rotation:l.rotate,force3D:"auto",ease:w}),0),s.add(T,0)}),n.find(".slotslide").each(function(t){var e=jQuery(this).find("div");T.add(punchgs.TweenLite.fromTo(e,g/1e3,{left:0,top:0,opacity:0,transformPerspective:600},{left:0-t*l.slotw+"px",ease:m,force3D:"auto",top:"0px",width:l.width,height:l.height,opacity:1,rotation:0,delay:.1}),0),s.add(T,0)})}if(8==a){(g*=3)>l.delay&&(g=l.delay);T=new punchgs.TimelineLite;r.find(".slotslide").each(function(){var t=jQuery(this).find("div");T.add(punchgs.TweenLite.to(t,g/1e3,{left:0-l.width/2+"px",top:0-l.sloth/2+"px",width:2*l.width+"px",height:2*l.sloth+"px",force3D:"auto",ease:w,opacity:0,rotation:l.rotate}),0),s.add(T,0)}),n.find(".slotslide").each(function(t){var e=jQuery(this).find("div");T.add(punchgs.TweenLite.fromTo(e,g/1e3,{left:0,top:0,opacity:0,force3D:"auto"},{left:"0px",top:0-t*l.sloth+"px",width:n.find(".defaultimg").data("neww")+"px",height:n.find(".defaultimg").data("newh")+"px",opacity:1,ease:m,rotation:0}),0),s.add(T,0)})}if(9==a||10==a){n.find(".slotslide").each(function(t){var e=jQuery(this);0,s.add(punchgs.TweenLite.fromTo(e,g/2e3,{autoAlpha:0,force3D:"auto",transformPerspective:600},{autoAlpha:1,ease:w,delay:t*l.slots/100/2e3}),0)})}if(27==a||28==a||29==a||30==a){var L=n.find(".slot"),b=27==a||29==a?"-100%":"+100%",A=27==a||29==a?"+100%":"-100%",D=27==a||29==a?"-80%":"80%",j=27==a||29==a?"+80%":"-80%",Q=27==a||29==a?"+10%":"-10%",M={overwrite:"all"},P={autoAlpha:0,zIndex:1,force3D:"auto",ease:w},k={position:"inherit",autoAlpha:0,overwrite:"all",zIndex:1},O={autoAlpha:1,force3D:"auto",ease:m},I={overwrite:"all",zIndex:2,opacity:1,autoAlpha:1},X={autoAlpha:1,force3D:"auto",overwrite:"all",ease:w},Y={overwrite:"all",zIndex:2,autoAlpha:1},S={autoAlpha:1,force3D:"auto",ease:w},_=1==(27==a||28==a?1:2)?"y":"x";M[_]="0px",P[_]=b,k[_]=Q,O[_]="0%",I[_]=A,X[_]=b,Y[_]=D,S[_]=j,L.append('<span style="background-color:rgba(0,0,0,0.6);width:100%;height:100%;position:absolute;top:0px;left:0px;display:block;z-index:2"></span>'),s.add(punchgs.TweenLite.fromTo(r,g/1e3,M,P),0),s.add(punchgs.TweenLite.fromTo(n.find(".defaultimg"),g/2e3,k,O),g/2e3),s.add(punchgs.TweenLite.fromTo(L,g/1e3,I,X),0),s.add(punchgs.TweenLite.fromTo(L.find(".slotslide div"),g/1e3,Y,S),0)}if(31==a||32==a||33==a||34==a){g=6e3,w=punchgs.Power3.easeInOut;var C=g/1e3;mas=C-C/5,_nt=a,fy=31==_nt?"+100%":32==_nt?"-100%":"0%",fx=33==_nt?"+100%":34==_nt?"-100%":"0%",ty=31==_nt?"-100%":32==_nt?"+100%":"0%",tx=33==_nt?"-100%":34==_nt?"+100%":"0%",s.add(punchgs.TweenLite.fromTo(r,C-.2*C,{y:0,x:0},{y:ty,x:tx,ease:m}),.2*C),s.add(punchgs.TweenLite.fromTo(n,C,{y:fy,x:fx},{y:"0%",x:"0%",ease:w}),0),n.find(".slot").remove(),n.find(".defaultimg").clone().appendTo(n).addClass("slot"),function(t,f,c,e,u){var o=t.find(".slot"),p=[2,1.2,.9,.7,.55,.42],g=t.width(),w=t.height();o.wrap('<div class="slot-circle-wrapper" style="overflow:hidden;position:absolute;border:1px solid #fff"></div>');for(var a=0;a<6;a++)o.parent().clone(!1).appendTo(nextsh);t.find(".slot-circle-wrapper").each(function(t){if(t<6){var e=jQuery(this),o=e.find(".slot"),a=w<g?p[t]*g:p[t]*w,i=a/2-g/2+0,n=a/2-w/2+0,r={scale:1,transformOrigo:"50% 50%",width:a+"px",height:a+"px",top:w/2-a/2+"px",left:(33==c?g/2-a/2:34==c?g-a:g/2-a/2)+"px",borderRadius:0!=t?"50%":"0"},s={scale:1,top:w/2-a/2,left:g/2-a/2,ease:u},l={width:g,height:w,autoAlpha:1,top:n+"px",position:"absolute",left:(33==c?i:34==c?i+g/2:i)+"px"},d={top:n+"px",left:i+"px",ease:u},h=f;mtl.add(punchgs.TweenLite.fromTo(e,h,r,s),0),mtl.add(punchgs.TweenLite.fromTo(o,h,l,d),0),mtl.add(punchgs.TweenLite.fromTo(e,.001,{autoAlpha:0},{autoAlpha:1}),0)}})}(n,C,_nt,0,w)}if(11==a){12<u&&(u=0);var V=2==u?"#000000":3==u?"#ffffff":"transparent";switch(u){case 0:s.add(punchgs.TweenLite.fromTo(n,g/1e3,{autoAlpha:0},{autoAlpha:1,force3D:"auto",ease:w}),0);break;case 1:s.add(punchgs.TweenLite.fromTo(n,g/1e3,{autoAlpha:0},{autoAlpha:1,force3D:"auto",ease:w}),0),s.add(punchgs.TweenLite.fromTo(r,g/1e3,{autoAlpha:1},{autoAlpha:0,force3D:"auto",ease:w}),0);break;case 2:case 3:case 4:s.add(punchgs.TweenLite.set(r.parent(),{backgroundColor:V,force3D:"auto"}),0),s.add(punchgs.TweenLite.set(n.parent(),{backgroundColor:"transparent",force3D:"auto"}),0),s.add(punchgs.TweenLite.to(r,g/2e3,{autoAlpha:0,force3D:"auto",ease:w}),0),s.add(punchgs.TweenLite.fromTo(n,g/2e3,{autoAlpha:0},{autoAlpha:1,force3D:"auto",ease:w}),g/2e3);break;case 5:case 6:case 7:case 8:case 9:case 10:case 11:case 12:var Z="blur("+(0<=jQuery.inArray(u,[9,10])?5:0<=jQuery.inArray(u,[11,12])?10:0)+"px) grayscale("+(0<=jQuery.inArray(u,[5,6,7,8])?100:0)+"%) brightness("+(0<=jQuery.inArray(u,[7,8])?300:0)+"%)",H="blur(0px) grayscale(0%) brightness(100%)";s.add(punchgs.TweenLite.fromTo(n,g/1e3,{autoAlpha:0,filter:Z,"-webkit-filter":Z},{autoAlpha:1,filter:H,"-webkit-filter":H,force3D:"auto",ease:w}),0),0<=jQuery.inArray(u,[6,8,10])&&s.add(punchgs.TweenLite.fromTo(r,g/1e3,{autoAlpha:1,filter:H,"-webkit-filter":H},{autoAlpha:0,force3D:"auto",ease:w,filter:Z,"-webkit-filter":Z}),0)}s.add(punchgs.TweenLite.set(n.find(".defaultimg"),{autoAlpha:1}),0),s.add(punchgs.TweenLite.set(r.find("defaultimg"),{autoAlpha:1}),0)}if(26==a){g=0,s.add(punchgs.TweenLite.fromTo(n,g/1e3,{autoAlpha:0},{autoAlpha:1,force3D:"auto",ease:w}),0),s.add(punchgs.TweenLite.to(r,g/1e3,{autoAlpha:0,force3D:"auto",ease:w}),0),s.add(punchgs.TweenLite.set(n.find(".defaultimg"),{autoAlpha:1}),0),s.add(punchgs.TweenLite.set(r.find("defaultimg"),{autoAlpha:1}),0)}if(12==a||13==a||14==a||15==a){(g=g)>l.delay&&(g=l.delay),setTimeout(function(){punchgs.TweenLite.set(r.find(".defaultimg"),{autoAlpha:0})},100);var J=l.width,N=l.height,R=n.find(".slotslide, .defaultvid"),q=0,B=0,E=1,F=1,G=1,K=g/1e3,U=K;"fullwidth"!=l.sliderLayout&&"fullscreen"!=l.sliderLayout||(J=R.width(),N=R.height()),12==a?q=J:15==a?q=0-J:13==a?B=N:14==a&&(B=0-N),1==u&&(E=0),2==u&&(E=0),3==u&&(K=g/1300),4!=u&&5!=u||(F=.6),6==u&&(F=1.4),5!=u&&6!=u||(G=1.4,B=q=N=J=E=0),6==u&&(G=.6);7==u&&(N=J=0);var W=n.find(".slotslide"),$=r.find(".slotslide, .defaultvid");if(s.add(punchgs.TweenLite.set(i,{zIndex:15}),0),s.add(punchgs.TweenLite.set(o,{zIndex:20}),0),8==u?(s.add(punchgs.TweenLite.set(i,{zIndex:20}),0),s.add(punchgs.TweenLite.set(o,{zIndex:15}),0),s.add(punchgs.TweenLite.set(W,{left:0,top:0,scale:1,opacity:1,rotation:0,ease:w,force3D:"auto"}),0)):s.add(punchgs.TweenLite.from(W,K,{left:q,top:B,scale:G,opacity:E,rotation:l.rotate,ease:w,force3D:"auto"}),0),4!=u&&5!=u||(N=J=0),1!=u)switch(a){case 12:s.add(punchgs.TweenLite.to($,U,{left:0-J+"px",force3D:"auto",scale:F,opacity:E,rotation:l.rotate,ease:m}),0);break;case 15:s.add(punchgs.TweenLite.to($,U,{left:J+"px",force3D:"auto",scale:F,opacity:E,rotation:l.rotate,ease:m}),0);break;case 13:s.add(punchgs.TweenLite.to($,U,{top:0-N+"px",force3D:"auto",scale:F,opacity:E,rotation:l.rotate,ease:m}),0);break;case 14:s.add(punchgs.TweenLite.to($,U,{top:N+"px",force3D:"auto",scale:F,opacity:E,rotation:l.rotate,ease:m}),0)}}if(16==a){T=new punchgs.TimelineLite;s.add(punchgs.TweenLite.set(i,{position:"absolute","z-index":20}),0),s.add(punchgs.TweenLite.set(o,{position:"absolute","z-index":15}),0),i.wrapInner('<div class="tp-half-one" style="position:relative; width:100%;height:100%"></div>'),i.find(".tp-half-one").clone(!0).appendTo(i).addClass("tp-half-two"),i.find(".tp-half-two").removeClass("tp-half-one");J=l.width,N=l.height;"on"==l.autoHeight&&(N=e.height()),i.find(".tp-half-one .defaultimg").wrap('<div class="tp-papercut" style="width:'+J+"px;height:"+N+'px;"></div>'),i.find(".tp-half-two .defaultimg").wrap('<div class="tp-papercut" style="width:'+J+"px;height:"+N+'px;"></div>'),i.find(".tp-half-two .defaultimg").css({position:"absolute",top:"-50%"}),i.find(".tp-half-two .tp-caption").wrapAll('<div style="position:absolute;top:-50%;left:0px;"></div>'),s.add(punchgs.TweenLite.set(i.find(".tp-half-two"),{width:J,height:N,overflow:"hidden",zIndex:15,position:"absolute",top:N/2,left:"0px",transformPerspective:600,transformOrigin:"center bottom"}),0),s.add(punchgs.TweenLite.set(i.find(".tp-half-one"),{width:J,height:N/2,overflow:"visible",zIndex:10,position:"absolute",top:"0px",left:"0px",transformPerspective:600,transformOrigin:"center top"}),0);i.find(".defaultimg");var tt=Math.round(20*Math.random()-10),et=Math.round(20*Math.random()-10),ot=Math.round(20*Math.random()-10),at=.4*Math.random()-.2,it=.4*Math.random()-.2,nt=1*Math.random()+1,rt=1*Math.random()+1,st=.3*Math.random()+.3;s.add(punchgs.TweenLite.set(i.find(".tp-half-one"),{overflow:"hidden"}),0),s.add(punchgs.TweenLite.fromTo(i.find(".tp-half-one"),g/800,{width:J,height:N/2,position:"absolute",top:"0px",left:"0px",force3D:"auto",transformOrigin:"center top"},{scale:nt,rotation:tt,y:0-N-N/4,autoAlpha:0,ease:w}),0),s.add(punchgs.TweenLite.fromTo(i.find(".tp-half-two"),g/800,{width:J,height:N,overflow:"hidden",position:"absolute",top:N/2,left:"0px",force3D:"auto",transformOrigin:"center bottom"},{scale:rt,rotation:et,y:N+N/4,ease:w,autoAlpha:0,onComplete:function(){punchgs.TweenLite.set(i,{position:"absolute","z-index":15}),punchgs.TweenLite.set(o,{position:"absolute","z-index":20}),0<i.find(".tp-half-one").length&&(i.find(".tp-half-one .defaultimg").unwrap(),i.find(".tp-half-one .slotholder").unwrap()),i.find(".tp-half-two").remove()}}),0),T.add(punchgs.TweenLite.set(n.find(".defaultimg"),{autoAlpha:1}),0),null!=i.html()&&s.add(punchgs.TweenLite.fromTo(o,(g-200)/1e3,{scale:st,x:l.width/4*at,y:N/4*it,rotation:ot,force3D:"auto",transformOrigin:"center center",ease:m},{autoAlpha:1,scale:1,x:0,y:0,rotation:0}),0),s.add(T,0)}if(17==a&&n.find(".slotslide").each(function(t){var e=jQuery(this);s.add(punchgs.TweenLite.fromTo(e,g/800,{opacity:0,rotationY:0,scale:.9,rotationX:-110,force3D:"auto",transformPerspective:600,transformOrigin:"center center"},{opacity:1,top:0,left:0,scale:1,rotation:0,rotationX:0,force3D:"auto",rotationY:0,ease:w,delay:.06*t}),0)}),18==a&&n.find(".slotslide").each(function(t){var e=jQuery(this);s.add(punchgs.TweenLite.fromTo(e,g/500,{autoAlpha:0,rotationY:110,scale:.9,rotationX:10,force3D:"auto",transformPerspective:600,transformOrigin:"center center"},{autoAlpha:1,top:0,left:0,scale:1,rotation:0,rotationX:0,force3D:"auto",rotationY:0,ease:w,delay:.06*t}),0)}),19==a||22==a){T=new punchgs.TimelineLite;s.add(punchgs.TweenLite.set(i,{zIndex:20}),0),s.add(punchgs.TweenLite.set(o,{zIndex:20}),0),setTimeout(function(){r.find(".defaultimg").css({opacity:0})},100);var lt=90,dt=(E=1,"center center ");1==h&&(lt=-90),19==a?(dt=dt+"-"+l.height/2,E=0):dt+=l.height/2,punchgs.TweenLite.set(e,{transformStyle:"flat",backfaceVisibility:"hidden",transformPerspective:600}),n.find(".slotslide").each(function(t){var e=jQuery(this);T.add(punchgs.TweenLite.fromTo(e,g/1e3,{transformStyle:"flat",backfaceVisibility:"hidden",left:0,rotationY:l.rotate,z:10,top:0,scale:1,force3D:"auto",transformPerspective:600,transformOrigin:dt,rotationX:lt},{left:0,rotationY:0,top:0,z:0,scale:1,force3D:"auto",rotationX:0,delay:50*t/1e3,ease:w}),0),T.add(punchgs.TweenLite.to(e,.1,{autoAlpha:1,delay:50*t/1e3}),0),s.add(T)}),r.find(".slotslide").each(function(t){var e=jQuery(this),o=-90;1==h&&(o=90),T.add(punchgs.TweenLite.fromTo(e,g/1e3,{transformStyle:"flat",backfaceVisibility:"hidden",autoAlpha:1,rotationY:0,top:0,z:0,scale:1,force3D:"auto",transformPerspective:600,transformOrigin:dt,rotationX:0},{autoAlpha:1,rotationY:l.rotate,top:0,z:10,scale:1,rotationX:o,delay:50*t/1e3,force3D:"auto",ease:m}),0),s.add(T)}),s.add(punchgs.TweenLite.set(i,{zIndex:18}),0)}if(20==a){if(setTimeout(function(){r.find(".defaultimg").css({opacity:0})},100),1==h){var ht=-l.width;lt=80,dt="20% 70% -"+l.height/2}else ht=l.width,lt=-80,dt="80% 70% -"+l.height/2;n.find(".slotslide").each(function(t){var e=jQuery(this),o=50*t/1e3;s.add(punchgs.TweenLite.fromTo(e,g/1e3,{left:ht,rotationX:40,z:-600,opacity:E,top:0,scale:1,force3D:"auto",transformPerspective:600,transformOrigin:dt,transformStyle:"flat",rotationY:lt},{left:0,rotationX:0,opacity:1,top:0,z:0,scale:1,rotationY:0,delay:o,ease:w}),0)}),r.find(".slotslide").each(function(t){var e=jQuery(this),o=50*t/1e3;if(o=0<t?o+g/9e3:0,1!=h)var a=-l.width/2,i=30,n="20% 70% -"+l.height/2;else a=l.width/2,i=-30,n="80% 70% -"+l.height/2;m=punchgs.Power2.easeInOut,s.add(punchgs.TweenLite.fromTo(e,g/1e3,{opacity:1,rotationX:0,top:0,z:0,scale:1,left:0,force3D:"auto",transformPerspective:600,transformOrigin:n,transformStyle:"flat",rotationY:0},{opacity:1,rotationX:20,top:0,z:-600,left:a,force3D:"auto",rotationY:i,delay:o,ease:m}),0)})}if(21==a||25==a){setTimeout(function(){r.find(".defaultimg").css({opacity:0})},100);lt=90,ht=-l.width;var ft=-lt;if(1==h)if(25==a){dt="center top 0";lt=l.rotate}else{dt="left center 0";ft=l.rotate}else if(ht=l.width,lt=-90,25==a){dt="center bottom 0";ft=-lt,lt=l.rotate}else{dt="right center 0";ft=l.rotate}n.find(".slotslide").each(function(t){var e=jQuery(this),o=g/1.5/3;s.add(punchgs.TweenLite.fromTo(e,2*o/1e3,{left:0,transformStyle:"flat",rotationX:ft,z:0,autoAlpha:0,top:0,scale:1,force3D:"auto",transformPerspective:1200,transformOrigin:dt,rotationY:lt},{left:0,rotationX:0,top:0,z:0,autoAlpha:1,scale:1,rotationY:0,force3D:"auto",delay:o/1e3,ease:w}),0)}),1!=h?(ht=-l.width,lt=90,25==a?(dt="center top 0",ft=-lt,lt=l.rotate):(dt="left center 0",ft=l.rotate)):(ht=l.width,lt=-90,25==a?(dt="center bottom 0",ft=-lt,lt=l.rotate):(dt="right center 0",ft=l.rotate)),r.find(".slotslide").each(function(t){var e=jQuery(this);s.add(punchgs.TweenLite.fromTo(e,g/1e3,{left:0,transformStyle:"flat",rotationX:0,z:0,autoAlpha:1,top:0,scale:1,force3D:"auto",transformPerspective:1200,transformOrigin:dt,rotationY:0},{left:0,rotationX:ft,top:0,z:0,autoAlpha:1,force3D:"auto",scale:1,rotationY:lt,ease:m}),0)})}if(23==a||24==a){setTimeout(function(){r.find(".defaultimg").css({opacity:0})},100);lt=-90,E=1;if(1==h&&(lt=90),23==a){dt="center center -"+l.width/2;E=0}else dt="center center "+l.width/2;punchgs.TweenLite.set(e,{transformStyle:"preserve-3d",backfaceVisibility:"hidden",perspective:2500}),n.find(".slotslide").each(function(t){var e=jQuery(this);s.add(punchgs.TweenLite.fromTo(e,g/1e3,{left:0,rotationX:l.rotate,force3D:"auto",opacity:E,top:0,scale:1,transformPerspective:1200,transformOrigin:dt,rotationY:lt},{left:0,rotationX:0,autoAlpha:1,top:0,z:0,scale:1,rotationY:0,delay:50*t/500,ease:w}),0)}),lt=90,1==h&&(lt=-90),r.find(".slotslide").each(function(t){var e=jQuery(this);s.add(punchgs.TweenLite.fromTo(e,g/1e3,{left:0,rotationX:0,top:0,z:0,scale:1,force3D:"auto",transformStyle:"flat",transformPerspective:1200,transformOrigin:dt,rotationY:0},{left:0,rotationX:l.rotate,top:0,scale:1,rotationY:lt,delay:50*t/500,ease:m}),0),23==a&&s.add(punchgs.TweenLite.fromTo(e,g/2e3,{autoAlpha:1},{autoAlpha:0,delay:50*t/500+g/3e3,ease:m}),0)})}return s}}(jQuery);
/********************************************
 * REVOLUTION 5.4.6.5 EXTENSION - VIDEO FUNCTIONS
 * @version: 2.2.2 (04.06.2018)
 * @requires jquery.themepunch.revolution.js
 * @author ThemePunch
*********************************************/
;!function(e){"use strict";var I=jQuery.fn.revolution,_=I.is_mobile(),S=(I.is_android(),{alias:"Video Min JS",name:"revolution.extensions.video.min.js",min_core:"5.4.8",version:"2.2.2"});function j(e){return null==e?-1:jQuery.isNumeric(e)?e:1<e.split(":").length?60*parseInt(e.split(":")[0],0)+parseInt(e.split(":")[1],0):e}jQuery.extend(!0,I,{preLoadAudio:function(e,a){if("stop"===I.compare_version(S).check)return!1;e.find(".tp-audiolayer").each(function(){var e=jQuery(this),t={};0===e.find("audio").length&&(t.src=null!=e.data("videomp4")?e.data("videomp4"):"",t.pre=e.data("videopreload")||"",void 0===e.attr("id")&&e.attr("audio-layer-"+Math.round(199999*Math.random())),t.id=e.attr("id"),t.status="prepared",t.start=jQuery.now(),t.waittime=1e3*e.data("videopreloadwait")||5e3,"auto"!=t.pre&&"canplaythrough"!=t.pre&&"canplay"!=t.pre&&"progress"!=t.pre||(void 0===a.audioqueue&&(a.audioqueue=[]),a.audioqueue.push(t),I.manageVideoLayer(e,a)))})},preLoadAudioDone:function(a,e,i){e.audioqueue&&0<e.audioqueue.length&&jQuery.each(e.audioqueue,function(e,t){a.data("videomp4")!==t.src||t.pre!==i&&"auto"!==t.pre||(t.status="loaded")})},resetVideo:function(e,t,a,i){var o=e.data();switch(o.videotype){case"youtube":o.player;try{if("on"==o.forcerewind){var d=-1==(l=j(e.data("videostartat"))),n=1===o.bgvideo||0<e.find(".tp-videoposter").length;null!=o.player&&(l=-1==l?0:l,o.player.seekTo(l),o.player.pauseVideo())}}catch(e){}0==e.find(".tp-videoposter").length&&1!==o.bgvideo&&!0!==a&&punchgs.TweenLite.to(e.find("iframe"),.3,{autoAlpha:1,display:"block",ease:punchgs.Power3.easeInOut});break;case"vimeo":var r=e.data("vimeoplayer");try{if("on"==o.forcerewind){var l=j(o.videostartat);d=-1==l,n=1===o.bgvideo||0<e.find(".tp-videoposter").length;(0!==(l=-1==l?0:l)&&!d||n)&&r.pause().then(function(){r.setCurrentTime(l)})}}catch(e){}0==e.find(".tp-videoposter").length&&1!==o.bgvideo&&!0!==a&&punchgs.TweenLite.to(e.find("iframe"),.3,{autoAlpha:1,display:"block",ease:punchgs.Power3.easeInOut});break;case"html5":if(_&&1==o.disablevideoonmobile)return!1;var s="html5"==o.audio?"audio":"video",u=e.find(s),p=u[0];if(punchgs.TweenLite.to(u,.3,{autoAlpha:1,display:"block",ease:punchgs.Power3.easeInOut}),"on"==o.forcerewind&&!e.hasClass("videoisplaying"))try{l=j(o.videostartat);p.currentTime=-1==l?0:l}catch(e){}("mute"==o.volume||I.lastToggleState(e.videomutetoggledby)||!0===t.globalmute)&&(p.muted=!0)}},isVideoMuted:function(e,t){var a=!1,i=e.data();switch(i.videotype){case"youtube":try{a=i.player.isMuted()}catch(e){}break;case"vimeo":try{"mute"==i.volume&&(a=!0)}catch(e){}break;case"html5":var o="html5"==i.audio?"audio":"video";e.find(o)[0].muted&&(a=!0)}return a},muteVideo:function(e,t){var a=e.data();switch(a.videotype){case"youtube":try{a.player.mute()}catch(e){}break;case"vimeo":try{var i=e.data("vimeoplayer");e.data("volume","mute"),i.setVolume(0)}catch(e){}break;case"html5":var o="html5"==a.audio?"audio":"video";e.find(o)[0].muted=!0}},unMuteVideo:function(e,t){if(!0!==t.globalmute){var a=e.data();switch(a.videotype){case"youtube":try{a.player.unMute()}catch(e){}break;case"vimeo":try{var i=e.data("vimeoplayer");e.data("volume","1"),i.setVolume(1)}catch(e){}break;case"html5":var o="html5"==a.audio?"audio":"video";e.find(o)[0].muted=!1}}},stopVideo:function(e,t){var a=e.data();switch(t.leaveViewPortBasedStop||(t.lastplayedvideos=[]),t.leaveViewPortBasedStop=!1,a.videotype){case"youtube":try{var i=a.player;if(2===i.getPlayerState()||5===i.getPlayerState())return;i.pauseVideo(),a.youtubepausecalled=!0,setTimeout(function(){a.youtubepausecalled=!1},80)}catch(e){console.log("Issue at YouTube Video Pause:"),console.log(e)}break;case"vimeo":try{e.data("vimeoplayer").pause(),a.vimeopausecalled=!0,setTimeout(function(){a.vimeopausecalled=!1},80)}catch(e){console.log("Issue at Vimeo Video Pause:"),console.log(e)}break;case"html5":var o="html5"==a.audio?"audio":"video",d=e.find(o),n=d[0];null!=d&&null!=n&&n.pause()}},playVideo:function(a,i){clearTimeout(a.data("videoplaywait"));var e=a.data();switch(e.videotype){case"youtube":if(0==a.find("iframe").length)a.append(a.data("videomarkup")),O(a,i,!0);else if(null!=e.player.playVideo){var t=j(a.data("videostartat")),o=e.player.getCurrentTime();1==a.data("nextslideatend-triggered")&&(o=-1,a.data("nextslideatend-triggered",0)),-1!=t&&o<t&&e.player.seekTo(t),!0!==e.youtubepausecalled&&e.player.playVideo()}else a.data("videoplaywait",setTimeout(function(){!0!==e.youtubepausecalled&&I.playVideo(a,i)},50));break;case"vimeo":if(0==a.find("iframe").length)a.removeData("vimeoplayer"),a.append(a.data("videomarkup")),O(a,i,!0);else if(a.hasClass("rs-apiready")){var d,n=a.find("iframe").attr("id");a.data("vimeoplayer")?d=a.data("vimeoplayer"):(d=new Vimeo.Player(n),a.data("vimeoplayer",d)),d.getPaused()?setTimeout(function(){var e=j(a.data("videostartat")),t=a.data("currenttime");t||(t=0),1==a.data("nextslideatend-triggered")&&(t=-1,a.data("nextslideatend-triggered",0)),-1!=e&&t<e&&d.setCurrentTime(e),d.play()},510):a.data("videoplaywait",setTimeout(function(){!0!==e.vimeopausecalled&&I.playVideo(a,i)},50))}else a.data("videoplaywait",setTimeout(function(){!0!==e.vimeopausecalled&&I.playVideo(a,i)},50));break;case"html5":var r="html5"==e.audio?"audio":"video",l=a.find(r),s=l[0];if(1!=l.parent().data("metaloaded"))A(s,"loadedmetadata",function(e){I.resetVideo(e,i),s.play();var t=j(e.data("videostartat")),a=s.currentTime;1==e.data("nextslideatend-triggered")&&(a=-1,e.data("nextslideatend-triggered",0)),-1!=t&&a<t&&(s.currentTime=t)}(a));else{s.play();t=j(a.data("videostartat")),o=s.currentTime;1==a.data("nextslideatend-triggered")&&(o=-1,a.data("nextslideatend-triggered",0)),-1!=t&&o<t&&(s.currentTime=t)}}},isVideoPlaying:function(a,e){var i=!1;return null!=e.playingvideos&&jQuery.each(e.playingvideos,function(e,t){a.attr("id")==t.attr("id")&&(i=!0)}),i},removeMediaFromList:function(e,t){V(e,t)},prepareCoveredVideo:function(e,t){if((!t.hasClass("tp-caption")||t.hasClass("coverscreenvideo"))&&(void 0===t.data("vimeoid")||void 0!==t.data("vimeoplayerloaded"))){var a={};a.ifr=t.find("iframe, video"),a.asp=t.data("aspectratio"),a.wa=a.asp.split(":")[0],a.ha=a.asp.split(":")[1],a.vd=a.wa/a.ha;var i="carousel"!==e.sliderType?e.conw:t.closest(".tp-revslider-slidesli").width();if(0===i||0===e.conh)return I.setSize(e),clearTimeout(a.ifr.data("resizelistener")),void a.ifr.data("resizelistener",setTimeout(function(){I.prepareCoveredVideo(e,t)},100));var o=i/e.conh,d=o/a.vd*100,n=a.vd/o*100;o>a.vd?punchgs.TweenLite.set(a.ifr,{height:d+"%",width:"100%",top:-(d-100)/2+"%",left:"0px",position:"absolute"}):punchgs.TweenLite.set(a.ifr,{width:n+"%",height:"100%",left:-(n-100)/2+"%",top:"0px",position:"absolute"}),a.ifr.hasClass("resizelistener")||(a.ifr.addClass("resizelistener"),jQuery(window).resize(function(){I.prepareCoveredVideo(e,t),clearTimeout(a.ifr.data("resizelistener")),a.ifr.data("resizelistener",setTimeout(function(){I.prepareCoveredVideo(e,t)},90))}))}},checkVideoApis:function(e,t,a){location.protocol;if((null!=e.data("ytid")||0<e.find("iframe").length&&0<e.find("iframe").attr("src").toLowerCase().indexOf("youtube"))&&(t.youtubeapineeded=!0),(null!=e.data("ytid")||0<e.find("iframe").length&&0<e.find("iframe").attr("src").toLowerCase().indexOf("youtube"))&&0==a.addedyt){t.youtubestarttime=jQuery.now(),a.addedyt=1;var i=document.createElement("script");i.src="https://www.youtube.com/iframe_api";var o=document.getElementsByTagName("script")[0],d=!0;jQuery("head").find("*").each(function(){"https://www.youtube.com/iframe_api"==jQuery(this).attr("src")&&(d=!1)}),d&&o.parentNode.insertBefore(i,o)}if((null!=e.data("vimeoid")||0<e.find("iframe").length&&0<e.find("iframe").attr("src").toLowerCase().indexOf("vimeo"))&&(t.vimeoapineeded=!0),(null!=e.data("vimeoid")||0<e.find("iframe").length&&0<e.find("iframe").attr("src").toLowerCase().indexOf("vimeo"))&&0==a.addedvim){t.vimeostarttime=jQuery.now(),a.addedvim=1;var n=document.createElement("script");o=document.getElementsByTagName("script")[0],d=!0;n.src="https://player.vimeo.com/api/player.js",jQuery("head").find("*").each(function(){"https://player.vimeo.com/api/player.js"==jQuery(this).attr("src")&&(d=!1)}),d&&o.parentNode.insertBefore(n,o)}return a},manageVideoLayer:function(i,o,e,t){if("stop"===I.compare_version(S).check)return!1;var a=i.data(),d=a.videoattributes,n=a.ytid,r=a.vimeoid,l="auto"===a.videopreload||"canplay"===a.videopreload||"canplaythrough"===a.videopreload||"progress"===a.videopreload?"auto":a.videopreload,s=a.videomp4,u=a.videowebm,p=a.videoogv,v=a.allowfullscreenvideo,c=a.videocontrols,m="http",g="loop"==a.videoloop?"loop":"loopandnoslidestop"==a.videoloop?"loop":"",y=null!=s||null!=u?"html5":null!=n&&1<String(n).length?"youtube":null!=r&&1<String(r).length?"vimeo":"none",f="html5"==a.audio?"audio":"video",h="html5"==y&&0==i.find(f).length?"html5":"youtube"==y&&0==i.find("iframe").length?"youtube":"vimeo"==y&&0==i.find("iframe").length?"vimeo":"none";switch(g=!0===a.nextslideatend?"":g,a.videotype=y,h){case"html5":"controls"!=c&&(c="");f="video";"html5"==a.audio&&(f="audio",i.addClass("tp-audio-html5"));var b="";"video"===f&&(I.is_mobile()||I.isSafari11())&&("on"===a.autoplay||"true"===a.autoplay||!0===a.autoplay?b="muted playsinline autoplay":1!=a.videoinline&&"true"!==a.videoinline&&1!==a.videoinline||(b+=" playsinline"));var w="<"+f+" "+b+' style="object-fit:cover;background-size:cover;visible:hidden;width:100%; height:100%" class="" '+g+' preload="'+l+'">';"auto"==l&&(o.mediapreload=!0),"video"===f?(null!=u&&"firefox"==I.get_browser().toLowerCase()&&(w=w+'<source src="'+u+'" type="video/webm" />'),null!=s&&(w=w+'<source src="'+s+'" type="video/mp4" />'),null!=p&&(w=w+'<source src="'+p+'" type="video/ogg" />')):"audio"===f&&(null!=s&&(w=w+'<source src="'+s+'" type="audio/mpeg" />'),null!=p&&(w=w+'<source src="'+p+'" type="audio/ogg" />')),w=w+"</"+f+">";var T="";"true"!==v&&!0!==v||(T='<div class="tp-video-button-wrap"><button  type="button" class="tp-video-button tp-vid-full-screen">Full-Screen</button></div>'),"controls"==c&&(w=w+'<div class="tp-video-controls"><div class="tp-video-button-wrap"><button type="button" class="tp-video-button tp-vid-play-pause">Play</button></div><div class="tp-video-seek-bar-wrap"><input  type="range" class="tp-seek-bar" value="0"></div><div class="tp-video-button-wrap"><button  type="button" class="tp-video-button tp-vid-mute">Mute</button></div><div class="tp-video-vol-bar-wrap"><input  type="range" class="tp-volume-bar" min="0" max="1" step="0.1" value="1"></div>'+T+"</div>"),i.data("videomarkup",w),i.append(w),(_&&1==i.data("disablevideoonmobile")||I.isIE(8))&&i.find(f).remove(),i.find(f).each(function(e){var t,a=jQuery(this);a.parent().hasClass("html5vid")||a.wrap('<div class="html5vid" style="position:relative;top:0px;left:0px;width:100%;height:100%; overflow:hidden;"></div>'),1!=a.parent().data("metaloaded")&&A(this,"loadedmetadata",(Q(t=i,o),void I.resetVideo(t,o)))});break;case"youtube":m="https","none"==c&&-1==(d=d.replace("controls=1","controls=0")).toLowerCase().indexOf("controls")&&(d+="&controls=0"),(!0===a.videoinline||"true"===a.videoinline||1===a.videoinline||i.hasClass("rs-background-video-layer")||"on"===i.data("autoplay"))&&(d+="&playsinline=1");var k=j(i.data("videostartat")),x=j(i.data("videoendat"));-1!=k&&(d=d+"&start="+k),-1!=x&&(d=d+"&end="+x);var V=d.split("origin="+m+"://"),L="";1<V.length?(L=V[0]+"origin="+m+"://",self.location.href.match(/www/gi)&&!V[1].match(/www/gi)&&(L+="www."),L+=V[1]):L=d;var C="true"===v||!0===v?"allowfullscreen":"";i.data("videomarkup",'<iframe type="text/html" src="'+m+"://www.youtube-nocookie.com/embed/"+n+"?"+L+'" '+C+' width="100%" height="100%" style="opacity:0;width:100%;height:100%"></iframe>');break;case"vimeo":m="https",i.data("videomarkup",'<iframe src="'+m+"://player.vimeo.com/video/"+r+"?"+d+'" webkitallowfullscreen mozallowfullscreen allowfullscreen width="100%" height="100%" style="opacity:0;visibility:hidden;width:100%;height:100%"></iframe>')}var P=_&&"on"==i.data("noposteronmobile");if(null!=a.videoposter&&2<a.videoposter.length&&!P)0==i.find(".tp-videoposter").length&&i.append('<div class="tp-videoposter noSwipe" style="cursor:pointer; position:absolute;top:0px;left:0px;width:100%;height:100%;z-index:3;background-image:url('+a.videoposter+'); background-size:cover;background-position:center center;"></div>'),0==i.find("iframe").length&&i.find(".tp-videoposter").click(function(){if(I.playVideo(i,o),_){if(1==i.data("disablevideoonmobile"))return!1;punchgs.TweenLite.to(i.find(".tp-videoposter"),.3,{autoAlpha:0,force3D:"auto",ease:punchgs.Power3.easeInOut}),punchgs.TweenLite.to(i.find("iframe"),.3,{autoAlpha:1,display:"block",ease:punchgs.Power3.easeInOut})}});else{if(_&&1==i.data("disablevideoonmobile"))return!1;0!=i.find("iframe").length||"youtube"!=y&&"vimeo"!=y||(i.removeData("vimeoplayer"),i.append(i.data("videomarkup")),O(i,o,!1))}"none"!=i.data("dottedoverlay")&&null!=i.data("dottedoverlay")&&1!=i.find(".tp-dottedoverlay").length&&i.append('<div class="tp-dottedoverlay '+i.data("dottedoverlay")+'"></div>'),i.addClass("HasListener"),1==i.data("bgvideo")&&(i.data("ytid")?punchgs.TweenLite.set(i.find("iframe"),{opacity:0}):punchgs.TweenLite.set(i.find("video, iframe"),{autoAlpha:0}))}});var A=function(e,t,a){e.addEventListener?e.addEventListener(t,a,{capture:!1,passive:!0}):e.attachEvent(t,a,{capture:!1,passive:!0})},b=function(e,t,a){var i={};return i.video=e,i.videotype=t,i.settings=a,i},w=function(e,t){if(1==t.data("bgvideo")||1==t.data("forcecover")){1===t.data("forcecover")&&t.removeClass("fullscreenvideo").addClass("coverscreenvideo");var a=t.data("aspectratio");void 0===a&&a.split(":").length<=1&&t.data("aspectratio","16:9"),I.prepareCoveredVideo(e,t)}},O=function(r,o,e){var l=r.data(),t=r.find("iframe"),a="iframe"+Math.round(1e5*Math.random()+1),d=l.videoloop,n="loopandnoslidestop"!=d;if(d="loop"==d||"loopandnoslidestop"==d,w(o,r),t.attr("id",a),e&&r.data("startvideonow",!0),1!==r.data("videolistenerexist"))switch(l.videotype){case"youtube":var s=new YT.Player(a,{events:{onStateChange:function(e){var t=r.closest(".tp-simpleresponsive"),a=(l.videorate,r.data("videostart"),k());if(e.data==YT.PlayerState.PLAYING)punchgs.TweenLite.to(r.find(".tp-videoposter"),.3,{autoAlpha:0,force3D:"auto",ease:punchgs.Power3.easeInOut}),punchgs.TweenLite.to(r.find("iframe"),.3,{autoAlpha:1,display:"block",ease:punchgs.Power3.easeInOut}),"mute"==r.data("volume")||I.lastToggleState(r.data("videomutetoggledby"))||!0===o.globalmute?s.mute():(s.unMute(),s.setVolume(parseInt(r.data("volume"),0)||75)),o.videoplaying=!0,x(r,o),n?o.c.trigger("stoptimer"):o.videoplaying=!1,o.c.trigger("revolution.slide.onvideoplay",b(s,"youtube",r.data())),I.toggleState(l.videotoggledby);else{if(0==e.data&&d){var i=j(r.data("videostartat"));-1!=i&&s.seekTo(i),s.playVideo(),I.toggleState(l.videotoggledby)}a||0!=e.data&&2!=e.data||!("on"==r.data("showcoveronpause")&&0<r.find(".tp-videoposter").length||1===r.data("bgvideo")&&0<r.find(".rs-fullvideo-cover").length)||(1===r.data("bgvideo")?punchgs.TweenLite.to(r.find(".rs-fullvideo-cover"),.1,{autoAlpha:1,force3D:"auto",ease:punchgs.Power3.easeInOut}):punchgs.TweenLite.to(r.find(".tp-videoposter"),.1,{autoAlpha:1,force3D:"auto",ease:punchgs.Power3.easeInOut}),punchgs.TweenLite.to(r.find("iframe"),.1,{autoAlpha:0,ease:punchgs.Power3.easeInOut})),-1!=e.data&&3!=e.data&&(o.videoplaying=!1,o.tonpause=!1,V(r,o),t.trigger("starttimer"),o.c.trigger("revolution.slide.onvideostop",b(s,"youtube",r.data())),null!=o.currentLayerVideoIsPlaying&&o.currentLayerVideoIsPlaying.attr("id")!=r.attr("id")||I.unToggleState(l.videotoggledby)),0==e.data&&1==r.data("nextslideatend")?(T(),r.data("nextslideatend-triggered",1),o.c.revnext(),V(r,o)):(V(r,o),o.videoplaying=!1,t.trigger("starttimer"),o.c.trigger("revolution.slide.onvideostop",b(s,"youtube",r.data())),null!=o.currentLayerVideoIsPlaying&&o.currentLayerVideoIsPlaying.attr("id")!=r.attr("id")||I.unToggleState(l.videotoggledby))}},onReady:function(e){var t,a=I.is_mobile(),i=r.hasClass("tp-videolayer");if(a||I.isSafari11()){var o=i&&"off"!==r.data("autoplay");if(r.hasClass("rs-background-video-layer")||o)a&&i||(t=!0,s.setVolume(0),r.data("volume","mute"),s.mute(),clearTimeout(r.data("mobilevideotimr")),r.data("mobilevideotimr",setTimeout(function(){s.playVideo()},500)))}t||"mute"!=r.data("volume")||(s.setVolume(0),s.mute());var d=l.videorate;r.data("videostart");if(r.addClass("rs-apiready"),null!=d&&e.target.setPlaybackRate(parseFloat(d)),r.find(".tp-videoposter").unbind("click"),r.find(".tp-videoposter").click(function(){_||s.playVideo()}),r.data("startvideonow")){l.player.playVideo();var n=j(r.data("videostartat"));-1!=n&&l.player.seekTo(n)}r.data("videolistenerexist",1)}}});r.data("player",s);break;case"vimeo":for(var i,u=t.attr("src"),p={},v=u,c=/([^&=]+)=([^&]*)/g;i=c.exec(v);)p[decodeURIComponent(i[1])]=decodeURIComponent(i[2]);u=(u=null!=p.player_id?u.replace(p.player_id,a):u+"&player_id="+a).replace(/&api=0|&api=1/g,"");var m=I.is_mobile(),g=r.data("autoplay"),y=(r.data("volume"),m||I.isSafari11());r.hasClass("rs-background-video-layer");(g="on"===g||"true"===g||!0===g)&&y&&(u+="?autoplay=1&autopause=0&muted=1&background=1&playsinline=1",r.data({vimeoplaysinline:!0,volume:"mute"})),t.attr("src",u);s=r.find("iframe")[0],jQuery("#"+a);if(r.data("vimeoplayer")?h=r.data("vimeoplayer"):(h=new Vimeo.Player(a),r.data("vimeoplayer",h)),h.on("loaded",function(e){var t={};h.getVideoWidth().then(function(e){t.width=e,void 0!==t.width&&void 0!==t.height&&(r.data("aspectratio",t.width+":"+t.height),r.data("vimeoplayerloaded",!0),w(o,r))}),h.getVideoHeight().then(function(e){t.height=e,void 0!==t.width&&void 0!==t.height&&(r.data("aspectratio",t.width+":"+t.height),r.data("vimeoplayerloaded",!0),w(o,r))})}),r.addClass("rs-apiready"),h.on("play",function(e){r.data("nextslidecalled",0),punchgs.TweenLite.to(r.find(".tp-videoposter"),.3,{autoAlpha:0,force3D:"auto",ease:punchgs.Power3.easeInOut}),punchgs.TweenLite.to(r.find("iframe"),.3,{autoAlpha:1,display:"block",ease:punchgs.Power3.easeInOut}),o.c.trigger("revolution.slide.onvideoplay",b(h,"vimeo",r.data())),o.videoplaying=!0,x(r,o),n?o.c.trigger("stoptimer"):o.videoplaying=!1,r.data("vimeoplaysinline")||("mute"==r.data("volume")||I.lastToggleState(r.data("videomutetoggledby"))||!0===o.globalmute?h.setVolume(0):h.setVolume(parseInt(r.data("volume"),0)/100||.75),I.toggleState(l.videotoggledby))}),h.on("timeupdate",function(e){var t=j(r.data("videoendat"));if(r.data("currenttime",e.seconds),0!=t&&Math.abs(t-e.seconds)<1&&t>e.seconds&&1!=r.data("nextslidecalled"))if(d){h.play();var a=j(r.data("videostartat"));-1!=a&&h.setCurrentTime(a)}else 1==r.data("nextslideatend")&&(r.data("nextslideatend-triggered",1),r.data("nextslidecalled",1),o.c.revnext()),h.pause()}),h.on("ended",function(e){V(r,o),o.videoplaying=!1,o.c.trigger("starttimer"),o.c.trigger("revolution.slide.onvideostop",b(h,"vimeo",r.data())),1==r.data("nextslideatend")&&(r.data("nextslideatend-triggered",1),o.c.revnext()),null!=o.currentLayerVideoIsPlaying&&o.currentLayerVideoIsPlaying.attr("id")!=r.attr("id")||I.unToggleState(l.videotoggledby)}),h.on("pause",function(e){("on"==r.data("showcoveronpause")&&0<r.find(".tp-videoposter").length||1===r.data("bgvideo")&&0<r.find(".rs-fullvideo-cover").length)&&(1===r.data("bgvideo")?punchgs.TweenLite.to(r.find(".rs-fullvideo-cover"),.1,{autoAlpha:1,force3D:"auto",ease:punchgs.Power3.easeInOut}):punchgs.TweenLite.to(r.find(".tp-videoposter"),.1,{autoAlpha:1,force3D:"auto",ease:punchgs.Power3.easeInOut}),punchgs.TweenLite.to(r.find("iframe"),.1,{autoAlpha:0,ease:punchgs.Power3.easeInOut})),o.videoplaying=!1,o.tonpause=!1,V(r,o),o.c.trigger("starttimer"),o.c.trigger("revolution.slide.onvideostop",b(h,"vimeo",r.data())),null!=o.currentLayerVideoIsPlaying&&o.currentLayerVideoIsPlaying.attr("id")!=r.attr("id")||I.unToggleState(l.videotoggledby)}),r.find(".tp-videoposter").unbind("click"),r.find(".tp-videoposter").click(function(){if(!_)return h.play(),!1}),r.data("startvideonow"))h.play(),-1!=(f=j(r.data("videostartat")))&&h.setCurrentTime(f);r.data("videolistenerexist",1)}else{var f=j(r.data("videostartat"));switch(l.videotype){case"youtube":e&&(l.player.playVideo(),-1!=f&&l.player.seekTo());break;case"vimeo":var h;if(e)(h=r.data("vimeoplayer")).play(),-1!=f&&h.seekTo(f)}}},T=function(){document.exitFullscreen?document.exitFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitExitFullscreen&&document.webkitExitFullscreen()},k=function(){try{if(void 0!==window.fullScreen)return window.fullScreen;var e=5;return jQuery.browser.webkit&&/Apple Computer/.test(navigator.vendor)&&(e=42),screen.width==window.innerWidth&&Math.abs(screen.height-window.innerHeight)<e}catch(e){}},Q=function(o,d,e){if(_&&1==o.data("disablevideoonmobile"))return!1;var n=o.data(),t="html5"==n.audio?"audio":"video",a=o.find(t),r=a[0],i=a.parent(),l=n.videoloop,s="loopandnoslidestop"!=l;if(l="loop"==l||"loopandnoslidestop"==l,i.data("metaloaded",1),1!=o.data("bgvideo")||"none"!==n.videoloop&&!1!==n.videoloop||(s=!1),null==a.attr("control")&&(0!=o.find(".tp-video-play-button").length||_||o.append('<div class="tp-video-play-button"><i class="revicon-right-dir"></i><span class="tp-revstop">&nbsp;</span></div>'),o.find("video, .tp-poster, .tp-video-play-button").click(function(){o.hasClass("videoisplaying")?r.pause():r.play()})),1==o.data("forcecover")||o.hasClass("fullscreenvideo")||1==o.data("bgvideo"))if(1==o.data("forcecover")||1==o.data("bgvideo")){i.addClass("fullcoveredvideo");var u=o.data("aspectratio");void 0!==u&&1!=u.split(":").length||o.data("aspectratio","16:9"),I.prepareCoveredVideo(d,o)}else i.addClass("fullscreenvideo");var p=o.find(".tp-vid-play-pause")[0],v=o.find(".tp-vid-mute")[0],c=o.find(".tp-vid-full-screen")[0],m=o.find(".tp-seek-bar")[0],g=o.find(".tp-volume-bar")[0];null!=p&&A(p,"click",function(){1==r.paused?r.play():r.pause()}),null!=v&&A(v,"click",function(){0==r.muted?(r.muted=!0,v.innerHTML="Unmute"):(r.muted=!1,v.innerHTML="Mute")}),null!=c&&c&&A(c,"click",function(){r.requestFullscreen?r.requestFullscreen():r.mozRequestFullScreen?r.mozRequestFullScreen():r.webkitRequestFullscreen&&r.webkitRequestFullscreen()}),null!=m&&(A(m,"change",function(){var e=r.duration*(m.value/100);r.currentTime=e}),A(m,"mousedown",function(){o.addClass("seekbardragged"),r.pause()}),A(m,"mouseup",function(){o.removeClass("seekbardragged"),r.play()})),A(r,"canplaythrough",function(){I.preLoadAudioDone(o,d,"canplaythrough")}),A(r,"canplay",function(){I.preLoadAudioDone(o,d,"canplay")}),A(r,"progress",function(){I.preLoadAudioDone(o,d,"progress")}),A(r,"timeupdate",function(){var e=100/r.duration*r.currentTime,t=j(o.data("videoendat")),a=r.currentTime;if(null!=m&&(m.value=e),0!=t&&-1!=t&&Math.abs(t-a)<=.3&&a<t&&1!=o.data("nextslidecalled"))if(l){r.play();var i=j(o.data("videostartat"));-1!=i&&(r.currentTime=i)}else 1==o.data("nextslideatend")&&(o.data("nextslideatend-triggered",1),o.data("nextslidecalled",1),d.just_called_nextslide_at_htmltimer=!0,d.c.revnext(),setTimeout(function(){d.just_called_nextslide_at_htmltimer=!1},1e3)),r.pause()}),null!=g&&A(g,"change",function(){r.volume=g.value}),A(r,"play",function(){o.data("nextslidecalled",0);var e=o.data("volume");e=null!=e&&"mute"!=e?parseFloat(e)/100:e,I.is_mobile()||I.isSafari11()||(!0===d.globalmute?r.muted=!0:r.muted=!1,1<e&&(e/=100),"mute"==e?r.muted=!0:null!=e&&(r.volume=e)),o.addClass("videoisplaying");var t="html5"==n.audio?"audio":"video";x(o,d),s&&"audio"!=t?(d.videoplaying=!0,d.c.trigger("stoptimer"),d.c.trigger("revolution.slide.onvideoplay",b(r,"html5",n))):(d.videoplaying=!1,"audio"!=t&&d.c.trigger("starttimer"),d.c.trigger("revolution.slide.onvideostop",b(r,"html5",n))),punchgs.TweenLite.to(o.find(".tp-videoposter"),.3,{autoAlpha:0,force3D:"auto",ease:punchgs.Power3.easeInOut}),punchgs.TweenLite.to(o.find(t),.3,{autoAlpha:1,display:"block",ease:punchgs.Power3.easeInOut});var a=o.find(".tp-vid-play-pause")[0],i=o.find(".tp-vid-mute")[0];null!=a&&(a.innerHTML="Pause"),null!=i&&r.muted&&(i.innerHTML="Unmute"),I.toggleState(n.videotoggledby)}),A(r,"pause",function(e){var t="html5"==n.audio?"audio":"video";!k()&&0<o.find(".tp-videoposter").length&&"on"==o.data("showcoveronpause")&&!o.hasClass("seekbardragged")&&(punchgs.TweenLite.to(o.find(".tp-videoposter"),.3,{autoAlpha:1,force3D:"auto",ease:punchgs.Power3.easeInOut}),punchgs.TweenLite.to(o.find(t),.3,{autoAlpha:0,ease:punchgs.Power3.easeInOut})),o.removeClass("videoisplaying"),d.videoplaying=!1,V(o,d),"audio"!=t&&d.c.trigger("starttimer"),d.c.trigger("revolution.slide.onvideostop",b(r,"html5",o.data()));var a=o.find(".tp-vid-play-pause")[0];null!=a&&(a.innerHTML="Play"),null!=d.currentLayerVideoIsPlaying&&d.currentLayerVideoIsPlaying.attr("id")!=o.attr("id")||I.unToggleState(n.videotoggledby)}),A(r,"ended",function(){T(),V(o,d),d.videoplaying=!1,V(o,d),"audio"!=t&&d.c.trigger("starttimer"),d.c.trigger("revolution.slide.onvideostop",b(r,"html5",o.data())),!0===o.data("nextslideatend")&&0<r.currentTime&&(1==!d.just_called_nextslide_at_htmltimer&&(o.data("nextslideatend-triggered",1),d.c.revnext(),d.just_called_nextslide_at_htmltimer=!0),setTimeout(function(){d.just_called_nextslide_at_htmltimer=!1},1500)),o.removeClass("videoisplaying")})},x=function(e,a){null==a.playingvideos&&(a.playingvideos=new Array),e.data("stopallvideos")&&null!=a.playingvideos&&0<a.playingvideos.length&&(a.lastplayedvideos=jQuery.extend(!0,[],a.playingvideos),jQuery.each(a.playingvideos,function(e,t){I.stopVideo(t,a)})),a.playingvideos.push(e),a.currentLayerVideoIsPlaying=e},V=function(e,t){null!=t.playingvideos&&0<=jQuery.inArray(e,t.playingvideos)&&t.playingvideos.splice(jQuery.inArray(e,t.playingvideos),1)}}(jQuery);