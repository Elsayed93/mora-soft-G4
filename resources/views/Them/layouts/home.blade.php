<!DOCTYPE html>
<html lang="en" class="no-js no-svg">

<head>
    @include('Them.layouts.head')
</head>

<body
    class="active-pageloader corporate logistics header-sticky hide-on-scroll header-menu-with-icons header-menu-border-bottom header-topbar topbar-background dark-color footer-widgets footer-background dark-color submenu-show-arrow-right menu-is-capitalized submenu-is-capitalized logo-text-is-capitalized page-index">
    <div class="pageloader is-active"></div>
    <div id="site-wrap" class="site">
        <div id="header-top-wrap" class="is-clearfix">
            <div id="header-top" class="site-header-top">
                <div id="header-top-inner" class="site-header-top-inner container">
                    <div class="level">
                        <div class="level-left">
                            <ul class="topbar-info ">
                                <li>
                                    <a href="#">
                                        <span class="icon">
                                            <i class="icon-clock"></i>
                                        </span> Mon - Fri : 09:00 - 17:00 </a>
                                </li>
                                <li>
                                    <a href="mailto:info@company.com">
                                        <span class="icon">
                                            <i class="icon-envelope"></i>
                                        </span> {{ $settings->email }} </a>
                                </li>
                                <li>
                                    <a href="tel:+66396847263">
                                        <span class="icon">
                                            <i class="icon-phone"></i>
                                        </span> {{ $settings->phone }} </a>
                                </li>
                            </ul>
                        </div>
                        <!-- .level-left -->
                        <div class="level-right">
                            <ul class="header-menu-icons social">
                                <li>
                                    <a href="{{ $settings->facebook_link }}" target="_blank">
                                        <span class="icon">
                                            <i class="fab fa-facebook-f"></i>
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <a href="{{ $settings->twitter_link }}" target="_blank">
                                        <span class="icon">
                                            <i class="fab fa-twitter"></i>
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <a href="{{ $settings->linkedin_link }}" target="_blank">
                                        <span class="icon">
                                            <i class="fab fa-linkedin-in"></i>
                                        </span>
                                    </a>
                                </li>
                            </ul>
                            <!-- .header-menu-icons -->
                            <ul class="nav-menu-dropdown style-2 global-style on-click">
                                <li>
                                    <a href="javascript:void(0);">
                                        <span class="icon">
                                            <i class="icon-globe"></i>
                                        </span>global</a>
                                    <ul>
                                        <li>
                                            <a href="javascript:void(0);">Africa</a>
                                        </li>
                                        <li>
                                            <a href="javascript:void(0);">europe</a>
                                        </li>
                                        <li>
                                            <a href="javascript:void(0);">America</a>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                            <!-- .header-menu-icons -->
                            <ul class="nav-menu-dropdown style-2 on-click">
                                <li>
                                    <a href="javascript:void(0);">
                                        <span class="flag-icon flag-icon-gb"></span>En</a>
                                    <ul>
                                        <li>
                                            <a href="javascript:void(0);">
                                                <span class="flag-icon flag-icon-es"></span>Es</a>
                                        </li>
                                        <li>
                                            <a href="javascript:void(0);">
                                                <span class="flag-icon flag-icon-tr"></span>tr</a>
                                        </li>
                                        <li>
                                            <a href="javascript:void(0);">
                                                <span class="flag-icon flag-icon-eg"></span>ع</a>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                            <!-- .header-menu-icons -->
                        </div>
                        <!-- .level-right -->
                    </div>
                    <!-- .level -->
                </div>
                <!-- #header-top-inner -->
            </div>
            <!-- #header-top -->
        </div>
        <!-- #header-top-wrap -->
        <div id="header-wrap" class="is-clearfix">
            <header id="header" class="site-header">
                <div id="header-inner" class="site-header-inner container">
                    <div class="level">
                        <div class="level-left">
                            <div id="header-logo" class="site-logo ">
                                <div id="logo-inner" class="site-logo-inner">
                                    <a href="./index.html">
                                        <img alt="Joo - Niche Multi-Purpose HTML Template"
                                            src="{{ asset('assets/images/logo/logo2.png') }}">
                                        <span
                                            class="logo-text">{{ App::getLocale() == 'ar' ? $settings->web_name_ar : $settings->web_name_en }}</span>
                                    </a>
                                </div>
                                <!-- #logo-inner -->
                            </div>
                            <!-- #header-logo -->
                        </div>
                        <!-- .level-left -->
                        <div class="level-right">
                            <div class="nav-wrap">
                                <nav class="main-navigation right">
                                    <ul class="menu">
                                        @foreach ($navSections as $navSection)
                                            <li
                                                class="mega-menu niche-templates {{ request()->segment(3) == $navSection->nav_section_link ? 'active' : '' }}">
                                                <a href="/{{ App::getLocale() }}/them/{{ $navSection->nav_section_link }}">
                                                    {{ App::getLocale() == 'ar' ? $navSection->nav_section_name_ar : $navSection->nav_section_name_en }}
                                                </a>
                                            </li>
                                        @endforeach
                                </nav>
                                <!-- #site-navigation -->
                            </div>
                            <!-- #nav-wrap -->
                            <ul class="header-menu-icons default ">
                                <li class="dropdown-search-form search-style-2">
                                    <a href="javascript:void(0);">
                                        <span class="icon">
                                            <i class="icon-magnifier"></i>
                                        </span>
                                    </a>
                                    <ul>
                                        <li class="header widget-form">
                                            <form>
                                                <div class="field">
                                                    <div class="control is-expanded">
                                                        <input class="input" type="text"
                                                            placeholder="Search...">
                                                        <button type="submit" class="button">
                                                            <span class="icon">
                                                                <i class="icon-magnifier"></i>
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                            <!-- .header-menu-icons -->
                            <a href="#quote" class="button is-white">get a quote</a>
                            <div class="modal search-form-overlay">
                                <div class="modal-background"></div>
                                <div class="modal-content">
                                    <form class="widget-form">
                                        <div class="field">
                                            <div class="control is-expanded">
                                                <input class="input" type="text" placeholder="Search...">
                                                <button type="submit" class="button">
                                                    <span class="icon">
                                                        <i class="icon-magnifier"></i>
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <button class="modal-close is-large" aria-label="close"></button>
                            </div>
                            <!-- .modal.search-form-overlay -->
                        </div>
                        <!-- .level-right -->
                    </div>
                    <!-- .level -->
                </div>
                <!-- #header-inner -->
            </header>
            <!-- #header -->
        </div>
        <!-- #header-wrap -->
        <div id="header-bottom-wrap" class="is-clearfix">
            <div id="header-bottom" class="site-header-bottom">
                <div id="header-bottom-inner" class="site-header-bottom-inner ">
                    <section class="hero slider is-clearfix ">
                        <h2 class="display-none">slider</h2>
                        <div class="rev_slider_wrapper fullscreen-container ">
                            <div id="rev_slider_1" class="rev_slider tp-overflow-hidden fullscreenbanner"
                                data-version="5.4.7" style="display:none">
                                <a href="#welcome" class="slider-scroll-down">scroll down</a>
                                <ul>
                                    <li data-transition="fade" data-thumb="{{ asset('assets/images/icons/1.png') }}"
                                        data-title="warehousing"
                                        data-param1="Lorem ipsum dolor sit ultrices eleifend gravi."
                                        data-param2="{{ asset('assets/images/icons/1.png') }}">
                                        <img alt="Joo - Niche Multi-Purpose HTML Template" class="rev-slidebg"
                                            src="{{ asset('assets/images/slider/4.png') }}"
                                            data-bgposition="center center" data-bgfit="cover" data-bgrepeat="no-repeat"
                                            data-kenburns="off" data-duration="30000" data-ease="Linear.easeNone"
                                            data-scalestart="100" data-scaleend="115" data-rotatestart="0"
                                            data-rotateend="0" data-offsetstart="0 0" data-offsetend="0 0"
                                            data-bgparallax="15">
                                        <div class="tp-caption tp-resizeme small_text top" data-x="left"
                                            data-hoffset="['-105','-105','0','0']" data-y="center"
                                            data-voffset="['-152','-152','-152','-152']" data-width="none"
                                            data-height="none" data-whitespace="nowrap" data-type="text"
                                            data-responsive-offset="on"
                                            data-frames='[{"from":"y:[100%];z:0;rX:0deg;rY:0;rZ:0;sX:1;sY:1;skX:0;skY:0;","mask":"x:0px;y:0px;s:inherit;e:inherit;","speed":1600,"to":"o:1;","delay":800,"ease":"Power3.easeInOut"},{"delay":"wait","speed":1000,"to":"opacity:0;","ease":"nothing"}]'
                                            data-textAlign="['left','left','left','left']" data-paddingtop="[0,0,0,0]"
                                            data-paddingright="[0,0,0,0]" data-paddingbottom="[0,0,0,0]"
                                            data-paddingleft="[0,0,0,0]"> logistics cargo </div>
                                        <div class="tp-caption tp-resizeme large_text" data-x="left"
                                            data-hoffset="['-105','-105','0','0']" data-y="center"
                                            data-voffset="['-56','-56','-56','-56']" data-width="none"
                                            data-height="none" data-whitespace="nowrap" data-type="text"
                                            data-responsive-offset="on"
                                            data-frames='[{"from":"y:[100%];z:0;rX:0deg;rY:0;rZ:0;sX:1;sY:1;skX:0;skY:0;","mask":"x:0px;y:0px;s:inherit;e:inherit;","speed":1600,"to":"o:1;","delay":1200,"ease":"Power3.easeInOut"},{"delay":"wait","speed":1000,"to":"opacity:0;","ease":"nothing"}]'
                                            data-textAlign="['left','left','left','left']" data-paddingtop="[0,0,0,0]"
                                            data-paddingright="[0,0,0,0]" data-paddingbottom="[0,0,0,0]"
                                            data-paddingleft="[0,0,0,0]"> local pickup and delivery
                                            <br> services of any cargo.
                                        </div>
                                        <a class="tp-caption tp-resizeme button is-primary" href="#"
                                            data-frames='[{"delay":1600,"speed":2000,"frame":"0","from":"y:[100%];z:0;rX:0deg;rY:0;rZ:0;sX:1;sY:1;skX:0;skY:0;opacity:0;","mask":"x:0px;y:[100%];s:inherit;e:inherit;","to":"o:1;","ease":"Power2.easeInOut"},{"delay":"wait","speed":800,"frame":"999","to":"auto:auto;","ease":"Power3.easeInOut"}]'
                                            data-x="left" data-hoffset="['-102','-102','0','0']" data-y="center"
                                            data-voffset="['82','82','0','0']" data-type="button">
                                            <span>learn More</span>
                                            <span class="icon is-small">
                                                <i class="ion-ios-arrow-round-forward"></i>
                                            </span>
                                        </a>
                                    </li>
                                    <!-- slide -->
                                    <li data-transition="fade" data-thumb="{{ asset('assets/images/icons/2.png') }}"
                                        data-title="air freight"
                                        data-param1="Lorem ipsum dolor sit ultrices eleifend gravi."
                                        data-param2="{{ asset('assets/images/icons/2.png') }}">
                                        <img alt="Joo - Niche Multi-Purpose HTML Template" class="rev-slidebg"
                                            src="{{ asset('assets/images/slider/3.png') }}"
                                            data-bgposition="center center" data-bgfit="cover" data-bgrepeat="no-repeat"
                                            data-kenburns="off" data-duration="30000" data-ease="Linear.easeNone"
                                            data-scalestart="100" data-scaleend="115" data-rotatestart="0"
                                            data-rotateend="0" data-offsetstart="0 0" data-offsetend="0 0"
                                            data-bgparallax="15">
                                        <div class="tp-caption tp-resizeme small_text top" data-x="left"
                                            data-hoffset="['-105','-105','0','0']" data-y="center"
                                            data-voffset="['-152','-152','-152','-152']" data-width="none"
                                            data-height="none" data-whitespace="nowrap" data-type="text"
                                            data-responsive-offset="on"
                                            data-frames='[{"from":"y:[100%];z:0;rX:0deg;rY:0;rZ:0;sX:1;sY:1;skX:0;skY:0;","mask":"x:0px;y:0px;s:inherit;e:inherit;","speed":1600,"to":"o:1;","delay":800,"ease":"Power3.easeInOut"},{"delay":"wait","speed":1000,"to":"opacity:0;","ease":"nothing"}]'
                                            data-textAlign="['left','left','left','left']" data-paddingtop="[0,0,0,0]"
                                            data-paddingright="[0,0,0,0]" data-paddingbottom="[0,0,0,0]"
                                            data-paddingleft="[0,0,0,0]"> logistics cargo </div>
                                        <div class="tp-caption tp-resizeme large_text" data-x="left"
                                            data-hoffset="['-105','-105','0','0']" data-y="center"
                                            data-voffset="['-56','-56','-56','-56']" data-width="none"
                                            data-height="none" data-whitespace="nowrap" data-type="text"
                                            data-responsive-offset="on"
                                            data-frames='[{"from":"y:[100%];z:0;rX:0deg;rY:0;rZ:0;sX:1;sY:1;skX:0;skY:0;","mask":"x:0px;y:0px;s:inherit;e:inherit;","speed":1600,"to":"o:1;","delay":1200,"ease":"Power3.easeInOut"},{"delay":"wait","speed":1000,"to":"opacity:0;","ease":"nothing"}]'
                                            data-textAlign="['left','left','left','left']" data-paddingtop="[0,0,0,0]"
                                            data-paddingright="[0,0,0,0]" data-paddingbottom="[0,0,0,0]"
                                            data-paddingleft="[0,0,0,0]"> local pickup and delivery
                                            <br> services of any cargo.
                                        </div>
                                        <a class="tp-caption tp-resizeme button is-primary" href="#"
                                            data-frames='[{"delay":1600,"speed":2000,"frame":"0","from":"y:[100%];z:0;rX:0deg;rY:0;rZ:0;sX:1;sY:1;skX:0;skY:0;opacity:0;","mask":"x:0px;y:[100%];s:inherit;e:inherit;","to":"o:1;","ease":"Power2.easeInOut"},{"delay":"wait","speed":800,"frame":"999","to":"auto:auto;","ease":"Power3.easeInOut"}]'
                                            data-x="left" data-hoffset="['-102','-102','0','0']" data-y="center"
                                            data-voffset="['82','82','0','0']" data-type="button">
                                            <span>learn More</span>
                                            <span class="icon is-small">
                                                <i class="ion-ios-arrow-round-forward"></i>
                                            </span>
                                        </a>
                                    </li>
                                    <!-- slide -->
                                    <li data-transition="fade" data-thumb="{{ asset('assets/images/icons/3.png') }}"
                                        data-title="ocean freight"
                                        data-param1="Lorem ipsum dolor sit ultrices eleifend gravi."
                                        data-param2="{{ asset('assets/images/icons/3.png') }}">
                                        <img alt="Joo - Niche Multi-Purpose HTML Template" class="rev-slidebg"
                                            src="{{ asset('assets/images/slider/2.png') }}"
                                            data-bgposition="center center" data-bgfit="cover" data-bgrepeat="no-repeat"
                                            data-kenburns="off" data-duration="30000" data-ease="Linear.easeNone"
                                            data-scalestart="100" data-scaleend="115" data-rotatestart="0"
                                            data-rotateend="0" data-offsetstart="0 0" data-offsetend="0 0"
                                            data-bgparallax="15">
                                        <div class="tp-caption tp-resizeme small_text top" data-x="left"
                                            data-hoffset="['-105','-105','0','0']" data-y="center"
                                            data-voffset="['-152','-152','-152','-152']" data-width="none"
                                            data-height="none" data-whitespace="nowrap" data-type="text"
                                            data-responsive-offset="on"
                                            data-frames='[{"from":"y:[100%];z:0;rX:0deg;rY:0;rZ:0;sX:1;sY:1;skX:0;skY:0;","mask":"x:0px;y:0px;s:inherit;e:inherit;","speed":1600,"to":"o:1;","delay":800,"ease":"Power3.easeInOut"},{"delay":"wait","speed":1000,"to":"opacity:0;","ease":"nothing"}]'
                                            data-textAlign="['left','left','left','left']" data-paddingtop="[0,0,0,0]"
                                            data-paddingright="[0,0,0,0]" data-paddingbottom="[0,0,0,0]"
                                            data-paddingleft="[0,0,0,0]"> logistics cargo </div>
                                        <div class="tp-caption tp-resizeme large_text" data-x="left"
                                            data-hoffset="['-105','-105','0','0']" data-y="center"
                                            data-voffset="['-56','-56','-56','-56']" data-width="none"
                                            data-height="none" data-whitespace="nowrap" data-type="text"
                                            data-responsive-offset="on"
                                            data-frames='[{"from":"y:[100%];z:0;rX:0deg;rY:0;rZ:0;sX:1;sY:1;skX:0;skY:0;","mask":"x:0px;y:0px;s:inherit;e:inherit;","speed":1600,"to":"o:1;","delay":1200,"ease":"Power3.easeInOut"},{"delay":"wait","speed":1000,"to":"opacity:0;","ease":"nothing"}]'
                                            data-textAlign="['left','left','left','left']" data-paddingtop="[0,0,0,0]"
                                            data-paddingright="[0,0,0,0]" data-paddingbottom="[0,0,0,0]"
                                            data-paddingleft="[0,0,0,0]"> local pickup and delivery
                                            <br> services of any cargo.
                                        </div>
                                        <a class="tp-caption tp-resizeme button is-primary" href="#"
                                            data-frames='[{"delay":1600,"speed":2000,"frame":"0","from":"y:[100%];z:0;rX:0deg;rY:0;rZ:0;sX:1;sY:1;skX:0;skY:0;opacity:0;","mask":"x:0px;y:[100%];s:inherit;e:inherit;","to":"o:1;","ease":"Power2.easeInOut"},{"delay":"wait","speed":800,"frame":"999","to":"auto:auto;","ease":"Power3.easeInOut"}]'
                                            data-x="left" data-hoffset="['-102','-102','0','0']" data-y="center"
                                            data-voffset="['82','82','0','0']" data-type="button">
                                            <span>learn More</span>
                                            <span class="icon is-small">
                                                <i class="ion-ios-arrow-round-forward"></i>
                                            </span>
                                        </a>
                                    </li>
                                    <!-- slide -->
                                    <li data-transition="fade" data-thumb="{{ asset('assets/images/icons/4.png') }}"
                                        data-title="land transport"
                                        data-param1="Lorem ipsum dolor sit ultrices eleifend gravi."
                                        data-param2="{{ asset('assets/images/icons/4.png') }}">
                                        <img alt="Joo - Niche Multi-Purpose HTML Template" class="rev-slidebg"
                                            src="{{ asset('assets/images/slider/1.png') }}"
                                            data-bgposition="center center" data-bgfit="cover" data-bgrepeat="no-repeat"
                                            data-kenburns="off" data-duration="30000" data-ease="Linear.easeNone"
                                            data-scalestart="100" data-scaleend="115" data-rotatestart="0"
                                            data-rotateend="0" data-offsetstart="0 0" data-offsetend="0 0"
                                            data-bgparallax="15">
                                        <div class="tp-caption tp-resizeme small_text top" data-x="left"
                                            data-hoffset="['-105','-105','0','0']" data-y="center"
                                            data-voffset="['-152','-152','-152','-152']" data-width="none"
                                            data-height="none" data-whitespace="nowrap" data-type="text"
                                            data-responsive-offset="on"
                                            data-frames='[{"from":"y:[100%];z:0;rX:0deg;rY:0;rZ:0;sX:1;sY:1;skX:0;skY:0;","mask":"x:0px;y:0px;s:inherit;e:inherit;","speed":1600,"to":"o:1;","delay":800,"ease":"Power3.easeInOut"},{"delay":"wait","speed":1000,"to":"opacity:0;","ease":"nothing"}]'
                                            data-textAlign="['left','left','left','left']" data-paddingtop="[0,0,0,0]"
                                            data-paddingright="[0,0,0,0]" data-paddingbottom="[0,0,0,0]"
                                            data-paddingleft="[0,0,0,0]"> logistics cargo </div>
                                        <div class="tp-caption tp-resizeme large_text" data-x="left"
                                            data-hoffset="['-105','-105','0','0']" data-y="center"
                                            data-voffset="['-56','-56','-56','-56']" data-width="none"
                                            data-height="none" data-whitespace="nowrap" data-type="text"
                                            data-responsive-offset="on"
                                            data-frames='[{"from":"y:[100%];z:0;rX:0deg;rY:0;rZ:0;sX:1;sY:1;skX:0;skY:0;","mask":"x:0px;y:0px;s:inherit;e:inherit;","speed":1600,"to":"o:1;","delay":1200,"ease":"Power3.easeInOut"},{"delay":"wait","speed":1000,"to":"opacity:0;","ease":"nothing"}]'
                                            data-textAlign="['left','left','left','left']" data-paddingtop="[0,0,0,0]"
                                            data-paddingright="[0,0,0,0]" data-paddingbottom="[0,0,0,0]"
                                            data-paddingleft="[0,0,0,0]"> local pickup and delivery
                                            <br> services of any cargo.
                                        </div>
                                        <a class="tp-caption tp-resizeme button is-primary" href="#"
                                            data-frames='[{"delay":1600,"speed":2000,"frame":"0","from":"y:[100%];z:0;rX:0deg;rY:0;rZ:0;sX:1;sY:1;skX:0;skY:0;opacity:0;","mask":"x:0px;y:[100%];s:inherit;e:inherit;","to":"o:1;","ease":"Power2.easeInOut"},{"delay":"wait","speed":800,"frame":"999","to":"auto:auto;","ease":"Power3.easeInOut"}]'
                                            data-x="left" data-hoffset="['-102','-102','0','0']" data-y="center"
                                            data-voffset="['82','82','0','0']" data-type="button">
                                            <span>learn More</span>
                                            <span class="icon is-small">
                                                <i class="ion-ios-arrow-round-forward"></i>
                                            </span>
                                        </a>
                                    </li>
                                    <!-- slide -->
                                </ul>
                            </div>
                            <!-- .rev_slider -->
                        </div>
                        <!-- .rev_slider_wrapper -->
                    </section>
                    <!-- .slider -->
                </div>
                <!-- #header-bottom-inner -->
            </div>
            <!-- #header-bottom -->
        </div>
        <!-- #header-bottom-wrap -->
        <!-- import content layouts and modules -->
        <div id="content-main-wrap" class="is-clearfix">
            <div id="content-area" class="site-content-area">
                <div id="content-area-inner" class="site-content-area-inner">
                    <!-- import content layouts and modules -->
                    <!-- start adding page content -->
                    <section id="welcome" class="section welcome-section has-background-primary-light is-clearfix">
                        <div class="container">
                            <p class="heading-title-top has-text-centered">welcome logistics</p>
                            <h1 class="heading-title style-3"> freight company with logistics
                                <br> difference.
                                <span class="has-text-primary">innovation</span>
                            </h1>
                            <br>
                            <br>
                            <div class="blog-list style-2 columns is-variable is-4 is-multiline">
                                <div class="column is-4" data-aos="fade">
                                    <article class="blog-post">
                                        <figure class="post-image">
                                            <a href="./pages/about.html">
                                                <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                    src="{{ asset('assets/images/blog/1.png') }}"> </a>
                                        </figure>
                                        <div class="entry-header">
                                            <h2 class="entry-title">
                                                <a href="./pages/about.html">our expert staff</a>
                                            </h2>
                                        </div>
                                        <!-- .entry-header -->
                                        <div class="entry-content">
                                            <p>The main component of a healthy for self esteem is that it needs be
                                                nurturing. It should provide warmth..</p>
                                        </div>
                                        <!-- .entry-content -->
                                        <div class="entry-footer">
                                            <a href="./pages/about.html" class="button">Read More</a>
                                        </div>
                                    </article>
                                    <!-- .blog-post -->
                                </div>
                                <div class="column is-4" data-aos="fade">
                                    <article class="blog-post">
                                        <figure class="post-image">
                                            <a href="./pages/about.html">
                                                <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                    src="{{ asset('assets/images/blog/2.png') }}"> </a>
                                        </figure>
                                        <div class="entry-header">
                                            <h2 class="entry-title">
                                                <a href="./pages/about.html">logistic services</a>
                                            </h2>
                                        </div>
                                        <!-- .entry-header -->
                                        <div class="entry-content">
                                            <p>The main component of a healthy for self esteem is that it needs be
                                                nurturing. It should provide warmth..</p>
                                        </div>
                                        <!-- .entry-content -->
                                        <div class="entry-footer">
                                            <a href="./pages/about.html" class="button">Read More</a>
                                        </div>
                                    </article>
                                    <!-- .blog-post -->
                                </div>
                                <div class="column is-4" data-aos="fade">
                                    <article class="blog-post">
                                        <figure class="post-image">
                                            <a href="./pages/about.html">
                                                <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                    src="{{ asset('assets/images/blog/3.png') }}"> </a>
                                        </figure>
                                        <div class="entry-header">
                                            <h2 class="entry-title">
                                                <a href="./pages/about.html">ground shipping</a>
                                            </h2>
                                        </div>
                                        <!-- .entry-header -->
                                        <div class="entry-content">
                                            <p>The main component of a healthy for self esteem is that it needs be
                                                nurturing. It should provide warmth..</p>
                                        </div>
                                        <!-- .entry-content -->
                                        <div class="entry-footer">
                                            <a href="./pages/about.html" class="button">Read More</a>
                                        </div>
                                    </article>
                                    <!-- .blog-post -->
                                </div>
                            </div>
                            <br>
                        </div>
                    </section>
                    <section id="tracking" class="section tracking-section is-clearfix">
                        <div class="container">
                            <p class="heading-title-top has-text-centered">tracking</p>
                            <h1 class="heading-title style-3">track your shipment</h1>
                            <div class="columns is-mobile is-centered">
                                <div class="column is-10" data-aos="fade-up">
                                    <div class="subscribe-form style-1">
                                        <form>
                                            <div class="field has-addons has-addons-centered is-grouped">
                                                <div class="control">
                                                    <input class="input" type="text"
                                                        placeholder="Type your tracking number">
                                                </div>
                                                <div class="control">
                                                    <a href="#" class="button">
                                                        <span>Track it</span>
                                                        <span class="icon is-small">
                                                            <i class="icon-target"></i>
                                                        </span>
                                                    </a>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <p class="help"> separate multiple tracking numbers with a space or
                                        comma.
                                        <a href="#">Advanced Tracking</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section id="services" class="section services-section has-background-primary-light is-clearfix">
                        <div class="container">
                            <div class="columns is-variable is-multiline is-4">
                                <div class="column is-5-desktop is-12-tablet">
                                    <p class="heading-title-top">logistics services</p>
                                    <h1 class="heading-title style-3 has-text-left">our special services</h1>
                                </div>
                                <div class="column is-7-desktop is-12-tablet">
                                    <p class="heading-title-bottom">Lorem ipsum dolor sit amet, consectetur adipiscing
                                        elit Nulla chronocrator accumsan, metus ultrices eleifend gravi.</p>
                                </div>
                            </div>
                            <br>
                            <div class="columns is-variable is-4 is-multiline boxes-style-2">
                                <div class="column is-4" data-aos="fade">
                                    <div class="box-item">
                                        <a href="./pages/services.html">
                                            <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                src="{{ asset('assets/images/icons/4.png') }}"> </a>
                                        <h3>
                                            <a href="./pages/services.html">land transport</a>
                                        </h3>
                                        <p>Climatology chronocrator puppysnatch leacher unrived tomentum.</p>
                                        <a href="./pages/services.html" class="button"></a>
                                    </div>
                                    <!-- .box-item -->
                                </div>
                                <div class="column is-4" data-aos="fade">
                                    <div class="box-item">
                                        <a href="./pages/services.html">
                                            <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                src="{{ asset('assets/images/icons/3.png') }}"> </a>
                                        <h3>
                                            <a href="./pages/services.html">ocean freight</a>
                                        </h3>
                                        <p>Climatology chronocrator puppysnatch leacher unrived tomentum.</p>
                                        <a href="./pages/services.html" class="button"></a>
                                    </div>
                                    <!-- .box-item -->
                                </div>
                                <div class="column is-4" data-aos="fade">
                                    <div class="box-item">
                                        <a href="./pages/services.html">
                                            <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                src="{{ asset('assets/images/icons/1.png') }}"> </a>
                                        <h3>
                                            <a href="./pages/services.html">warehousing</a>
                                        </h3>
                                        <p>Climatology chronocrator puppysnatch leacher unrived tomentum.</p>
                                        <a href="./pages/services.html" class="button"></a>
                                    </div>
                                    <!-- .box-item -->
                                </div>
                                <div class="column is-4" data-aos="fade">
                                    <div class="box-item">
                                        <a href="./pages/services.html">
                                            <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                src="{{ asset('assets/images/icons/3.png') }}"> </a>
                                        <h3>
                                            <a href="./pages/services.html">ocean freight</a>
                                        </h3>
                                        <p>Climatology chronocrator puppysnatch leacher unrived tomentum.</p>
                                        <a href="./pages/services.html" class="button"></a>
                                    </div>
                                    <!-- .box-item -->
                                </div>
                                <div class="column is-4" data-aos="fade">
                                    <div class="box-item">
                                        <a href="./pages/services.html">
                                            <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                src="{{ asset('assets/images/icons/4.png') }}"> </a>
                                        <h3>
                                            <a href="./pages/services.html">land transport</a>
                                        </h3>
                                        <p>Climatology chronocrator puppysnatch leacher unrived tomentum.</p>
                                        <a href="./pages/services.html" class="button"></a>
                                    </div>
                                    <!-- .box-item -->
                                </div>
                                <div class="column is-4" data-aos="fade">
                                    <div class="box-item">
                                        <a href="./pages/services.html">
                                            <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                src="{{ asset('assets/images/icons/2.png') }}"> </a>
                                        <h3>
                                            <a href="./pages/services.html">air freight</a>
                                        </h3>
                                        <p>Climatology chronocrator puppysnatch leacher unrived tomentum.</p>
                                        <a href="./pages/services.html" class="button"></a>
                                    </div>
                                    <!-- .box-item -->
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="section watch-video is-clearfix">
                        <div class="container">
                            <br>
                            <br>
                            <div class="columns is-variable is-8 is-multiline">
                                <div class="column is-6-desktop is-12-tablet has-text-centered" data-aos="fade-up">
                                    <div class="works-latest">
                                        <div class="works-latest-item">
                                            <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                src="{{ asset('assets/images/global/introduction.png') }}">
                                            <div class="works-latest-item-icon style-2">
                                                <a href="https://www.youtube.com/watch?v=jc4y2Xqerj0"
                                                    class="mfp-lightbox mfp-iframe">
                                                    <span class="icon ripple-effect">
                                                        <i class="ion-ios-play"></i>
                                                    </span>
                                                </a>
                                            </div>
                                            <!-- .works-latest-icon -->
                                        </div>
                                        <!-- .works-latest-item -->
                                    </div>
                                </div>
                                <div class="column is-6-desktop is-12-tablet" data-aos="fade">
                                    <br>
                                    <h1 class="heading-title style-3 has-text-left"> local pickup with logistics
                                        <br> services of any
                                        <span class="has-text-primary">cargo.</span>
                                    </h1>
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla accumsan, metus
                                        ultrices eleifend gravi, nulla nunc varius lectus, nec rutrum justo nibh eu
                                        lectus metus ultrices.</p>
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla accumsan, metus
                                        ultrices eleifend gravi.</p>
                                    <br>
                                    <div class="level">
                                        <div class="level-left">
                                            <h4>Mohamed Saad
                                                <br>
                                                <span>CEO & Founder</span>
                                            </h4>
                                        </div>
                                        <div class="level-right">
                                            <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                src="{{ asset('assets/images/global/mark.png') }}">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <br>
                        </div>
                    </section>
                    <section class="hero fun-facts is-clearfix">
                        <div class="hero-body">
                            <h2 class="display-none">funfacts</h2>
                            <nav class="level counterup style-5">
                                <div class="level-item has-text-centered">
                                    <div>
                                        <p class="title counter">340</p>
                                        <p class="heading">years of experience</p>
                                    </div>
                                </div>
                                <div class="level-item has-text-centered">
                                    <div>
                                        <p class="title counter">120</p>
                                        <p class="heading">branches over world</p>
                                    </div>
                                </div>
                                <div class="level-item has-text-centered">
                                    <div>
                                        <p class="title counter">230</p>
                                        <p class="heading">tonnes transported</p>
                                    </div>
                                </div>
                                <div class="level-item has-text-centered">
                                    <div>
                                        <p class="title counter">110</p>
                                        <p class="heading">countries covered</p>
                                    </div>
                                </div>
                            </nav>
                        </div>
                    </section>
                    <section id="tracking-steps" class="section tracking-steps-section is-clearfix">
                        <div class="container">
                            <p class="heading-title-top has-text-centered">tracking</p>
                            <h1 class="heading-title style-3">how we work</h1>
                            <br>
                            <br>
                            <div class="steps" data-aos="fade-right">
                                <div class="step-item" data-step-id="0">
                                    <div class="step-marker"> 1 </div>
                                    <div class="step-details">
                                        <p class="step-title">lorem ipsum dolor</p>
                                        <p>Lorem ipsum dolor sit amet nulla varius lectus.</p>
                                    </div>
                                </div>
                                <div class="step-item active" data-step-id="1">
                                    <div class="step-marker">2</div>
                                    <div class="step-details">
                                        <p class="step-title">lorem ipsum dolor</p>
                                        <p>Lorem ipsum dolor sit amet nulla varius lectus.</p>
                                    </div>
                                </div>
                                <div class="step-item" data-step-id="2">
                                    <div class="step-marker">3</div>
                                    <div class="step-details">
                                        <p class="step-title">lorem ipsum dolor</p>
                                        <p>Lorem ipsum dolor sit amet nulla varius lectus.</p>
                                    </div>
                                </div>
                                <div class="step-item" data-step-id="3">
                                    <div class="step-marker"> 4 </div>
                                    <div class="step-details">
                                        <p class="step-title">lorem ipsum dolor</p>
                                        <p>Lorem ipsum dolor sit amet nulla varius lectus.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section id="news" class="section news-section is-clearfix">
                        <div class="container">
                            <div class="blog-list style-2 columns is-variable is-4 is-multiline">
                                <div class="column is-4" data-aos="fade">
                                    <div class="blog-post-heading">
                                        <p class="heading-title-top">latest news</p>
                                        <h1 class="heading-title style-3 has-text-left"> Lorem ipsum is
                                            <span class="has-text-primary">simply</span>
                                        </h1>
                                        <p>Lorem ipsum dolor sit amet is, consectetur adipiscing. Nulla accumsan, metus
                                            ultrices ele gravi, nulla nunc varius.</p>
                                        <a href="./blog/index.html" class="button">Our blog
                                            <span class="icon">
                                                <i class="ion-ios-arrow-round-forward"></i>
                                            </span>
                                        </a>
                                    </div>
                                    <!-- .blog-post -->
                                </div>
                                <div class="column is-4" data-aos="fade">
                                    <article class="blog-post">
                                        <figure class="post-image">
                                            <a href="./blog/single.html">
                                                <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                    src="{{ asset('assets/images/blog/4.png') }}"> </a>
                                        </figure>
                                        <div class="entry-header">
                                            <div class="post-meta">
                                                <ul>
                                                    <li>
                                                        <a href="#">
                                                            <span>APRIL 5, 2018</span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                            <h2 class="entry-title">
                                                <a href="./blog/single.html">Self Motivation How To Keep Land
                                                    Transport</a>
                                            </h2>
                                        </div>
                                        <div class="entry-footer">
                                            <a href="./blog/single.html" class="button">Read More</a>
                                        </div>
                                    </article>
                                    <!-- .blog-post -->
                                </div>
                                <div class="column is-4" data-aos="fade">
                                    <article class="blog-post">
                                        <figure class="post-image">
                                            <a href="./blog/single.html">
                                                <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                    src="{{ asset('assets/images/blog/5.png') }}"> </a>
                                        </figure>
                                        <div class="entry-header">
                                            <div class="post-meta">
                                                <ul>
                                                    <li>
                                                        <a href="#">
                                                            <span>APRIL 5, 2018</span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                            <h2 class="entry-title">
                                                <a href="./blog/single.html">Self Motivation How To Keep Land
                                                    Transport</a>
                                            </h2>
                                        </div>
                                        <div class="entry-footer">
                                            <a href="./blog/single.html" class="button">Read More</a>
                                        </div>
                                    </article>
                                    <!-- .blog-post -->
                                </div>
                            </div>
                        </div>
                    </section>
                    <section id="testimonials"
                        class="section testimonials-section has-background-primary-light is-clearfix">
                        <div class="container">
                            <p class="heading-title-top has-text-centered">testimonial</p>
                            <h1 class="heading-title style-3">clients feedback</h1>
                            <div class="testimonials  owl-carousel dots carousel-items-3 columns-style-1 ">
                                <div class="testimonials-item">
                                    <p>Any time we start something new it is exciting and we are very motivated and
                                        committed. As time goes by</p>
                                    <img alt="Joo - Niche Multi-Purpose HTML Template"
                                        src="{{ asset('assets/images/testimonials/1.png') }}">
                                    <h3>mohamed ahmed
                                        <br>
                                        <span>CEO & stylist</span>
                                    </h3>
                                </div>
                                <div class="testimonials-item">
                                    <p>Any time we start something new it is exciting and we are very motivated and
                                        committed. As time goes by</p>
                                    <img alt="Joo - Niche Multi-Purpose HTML Template"
                                        src="{{ asset('assets/images/testimonials/2.png') }}">
                                    <h3>olivia allison
                                        <br>
                                        <span>CEO & stylist</span>
                                    </h3>
                                </div>
                                <div class="testimonials-item">
                                    <p>Any time we start something new it is exciting and we are very motivated and
                                        committed. As time goes by</p>
                                    <img alt="Joo - Niche Multi-Purpose HTML Template"
                                        src="{{ asset('assets/images/testimonials/3.png') }}">
                                    <h3>olivia allison
                                        <br>
                                        <span>CEO & stylist</span>
                                    </h3>
                                </div>
                                <div class="testimonials-item">
                                    <p>Any time we start something new it is exciting and we are very motivated and
                                        committed. As time goes by</p>
                                    <img alt="Joo - Niche Multi-Purpose HTML Template"
                                        src="{{ asset('assets/images/testimonials/1.png') }}">
                                    <h3>mohamed ahmed
                                        <br>
                                        <span>CEO & stylist</span>
                                    </h3>
                                </div>
                                <div class="testimonials-item">
                                    <p>Any time we start something new it is exciting and we are very motivated and
                                        committed. As time goes by</p>
                                    <img alt="Joo - Niche Multi-Purpose HTML Template"
                                        src="{{ asset('assets/images/testimonials/2.png') }}">
                                    <h3>olivia allison
                                        <br>
                                        <span>CEO & stylist</span>
                                    </h3>
                                </div>
                                <div class="testimonials-item">
                                    <p>Any time we start something new it is exciting and we are very motivated and
                                        committed. As time goes by</p>
                                    <img alt="Joo - Niche Multi-Purpose HTML Template"
                                        src="{{ asset('assets/images/testimonials/3.png') }}">
                                    <h3>olivia allison
                                        <br>
                                        <span>CEO & stylist</span>
                                    </h3>
                                </div>
                                <div class="testimonials-item">
                                    <p>Any time we start something new it is exciting and we are very motivated and
                                        committed. As time goes by</p>
                                    <img alt="Joo - Niche Multi-Purpose HTML Template"
                                        src="{{ asset('assets/images/testimonials/1.png') }}">
                                    <h3>mohamed ahmed
                                        <br>
                                        <span>CEO & stylist</span>
                                    </h3>
                                </div>
                                <div class="testimonials-item">
                                    <p>Any time we start something new it is exciting and we are very motivated and
                                        committed. As time goes by</p>
                                    <img alt="Joo - Niche Multi-Purpose HTML Template"
                                        src="{{ asset('assets/images/testimonials/2.png') }}">
                                    <h3>olivia allison
                                        <br>
                                        <span>CEO & stylist</span>
                                    </h3>
                                </div>
                                <div class="testimonials-item">
                                    <p>Any time we start something new it is exciting and we are very motivated and
                                        committed. As time goes by</p>
                                    <img alt="Joo - Niche Multi-Purpose HTML Template"
                                        src="{{ asset('assets/images/testimonials/3.png') }}">
                                    <h3>olivia allison
                                        <br>
                                        <span>CEO & stylist</span>
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section id="quote" class="section quote-section padding-bottom-none is-clearfix">
                        <div class="container">
                            <div class="columns is-variable is-2 is-multiline">
                                <div class="column is-6-desktop is-12-tablet" data-aos="fade">
                                    <h1 class="heading-title style-3 has-text-left"> request a
                                        <span class="has-text-primary">quote</span>
                                    </h1>
                                    <p class="heading-title-bottom">Lorem ipsum dolor sit amet, consectetur adipiscing
                                        elit Nulla chronocrator accumsan, metus ultrices eleifend gravi.</p>
                                    <!-- successful form message -->
                                    <div class="overhang-message-content is-hidden success">
                                        <span class="icon">
                                            <i class="ion-md-notifications"></i>
                                        </span> Thank You! Your message was sent successfully.
                                    </div>
                                    <!-- error form message -->
                                    <div class="overhang-message-content is-hidden error">
                                        <span class="icon">
                                            <i class="ion-md-notifications"></i>
                                        </span> Oops! Something went wrong, we couldn't send your message.
                                    </div>
                                    <!-- ajax contact form -->
                                    <form accept-charset="UTF-8" class="ajax-contact-form"
                                        action="https://usebasin.com/f/3587049dbc33.json" method="POST">
                                        <div class="field is-horizontal">
                                            <div class="field-body">
                                                <div class="field">
                                                    <div class="control is-expanded">
                                                        <input class="input" type="text" name="name"
                                                            placeholder="Name" required>
                                                    </div>
                                                </div>
                                                <!-- .field -->
                                                <div class="field">
                                                    <div class="control is-expanded">
                                                        <input class="input" type="email" name="email"
                                                            placeholder="Email" required="">
                                                    </div>
                                                </div>
                                                <!-- .field -->
                                            </div>
                                            <!-- .field-body -->
                                        </div>
                                        <div class="field is-horizontal">
                                            <div class="field-body">
                                                <div class="field">
                                                    <div class="control is-expanded">
                                                        <input class="input" type="text" name="subject"
                                                            placeholder="Subject" required="">
                                                    </div>
                                                </div>
                                                <!-- .field -->
                                                <div class="field">
                                                    <div class="control is-expanded">
                                                        <div class="select">
                                                            <select>
                                                                <option>Air Freight</option>
                                                                <option>Land Transport</option>
                                                                <option>Ocean Freight</option>
                                                                <option>Warehousing</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <!-- .field -->
                                                </div>
                                                <!-- .field-body -->
                                            </div>
                                        </div>
                                        <div class="field ">
                                            <div class="control is-expanded">
                                                <textarea class="textarea" name="textarea" placeholder="Message"
                                                    required=""></textarea>
                                            </div>
                                        </div>
                                        <div class="field ">
                                            <div class="control">
                                                <button class="button" type="submit">request a quote</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div class="column is-6-desktop is-12-tablet" data-aos="fade-up" data-aos-delay="600">
                                    <br>
                                    <br>
                                    <br>
                                    <br>
                                    <img alt="Joo - Niche Multi-Purpose HTML Template"
                                        src="{{ asset('assets/images/global/man.png') }}">
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <!-- #content-area-inner -->
            </div>
            <!-- #content-area -->
        </div>
        <!-- #content-main-wrap -->
        <div id="footer-top-wrap" class="is-clearfix">
            <div id="footer-top" class="site-footer-top">
                <div id="footer-top-inner" class="site-footer-top-inner ">
                    <section class="hero clients-section is-clearfix">
                        <div class="container">
                            <div class="columns is-variable is-4 is-multiline">
                                <div class="column is-2-desktop is-12-tablet">
                                    <h1 class="heading-title style-3 has-text-left">our partners</h1>
                                </div>
                                <div class="column is-10-desktop is-12-tablet">
                                    <nav class="clients-list level  owl-carousel no-dots carousel-items-5">
                                        <div class="client-item has-text-centered level-item">
                                            <a href="#" target="_blank">
                                                <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                    src="{{ asset('assets/images/clients/7.png') }}"> </a>
                                        </div>
                                        <div class="client-item has-text-centered level-item">
                                            <a href="#" target="_blank">
                                                <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                    src="{{ asset('assets/images/clients/8.png') }}"> </a>
                                        </div>
                                        <div class="client-item has-text-centered level-item">
                                            <a href="#" target="_blank">
                                                <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                    src="{{ asset('assets/images/clients/9.png') }}"> </a>
                                        </div>
                                        <div class="client-item has-text-centered level-item">
                                            <a href="#" target="_blank">
                                                <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                    src="{{ asset('assets/images/clients/7.png') }}"> </a>
                                        </div>
                                        <div class="client-item has-text-centered level-item">
                                            <a href="#" target="_blank">
                                                <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                    src="{{ asset('assets/images/clients/8.png') }}"> </a>
                                        </div>
                                        <div class="client-item has-text-centered level-item">
                                            <a href="#" target="_blank">
                                                <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                    src="{{ asset('assets/images/clients/9.png') }}"> </a>
                                        </div>
                                        <div class="client-item has-text-centered level-item">
                                            <a href="#" target="_blank">
                                                <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                    src="{{ asset('assets/images/clients/7.png') }}"> </a>
                                        </div>
                                        <div class="client-item has-text-centered level-item">
                                            <a href="#" target="_blank">
                                                <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                    src="{{ asset('assets/images/clients/8.png') }}"> </a>
                                        </div>
                                        <div class="client-item has-text-centered level-item">
                                            <a href="#" target="_blank">
                                                <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                    src="{{ asset('assets/images/clients/9.png') }}"> </a>
                                        </div>
                                        <div class="client-item has-text-centered level-item">
                                            <a href="#" target="_blank">
                                                <img alt="Joo - Niche Multi-Purpose HTML Template"
                                                    src="{{ asset('assets/images/clients/7.png') }}"> </a>
                                        </div>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                <!-- #footer-top-inner -->
            </div>
            <!-- #footer-top -->
        </div>
        <!-- #footer-top-wrap -->
        @include('Them.layouts.footer')


    </div>
    <!-- #site-wrap -->
    @include('Them.layouts.footerJs')
</body>

</html>
