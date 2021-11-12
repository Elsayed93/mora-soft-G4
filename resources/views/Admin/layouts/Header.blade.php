<!-- Header -->
<header class="header white-bg fixed-top d-flex align-content-center flex-wrap">
    <!-- Logo -->
    <div class="logo">
        <a href="/" class="default-logo"><img src="{{ asset('admin/ar/assets/img/logo.png') }}" alt=""></a>
        <a href="/" class="mobile-logo"><img src="{{ $settings->image ?  asset('images/' . $settings->image) : asset('admin/ar/assets/img/mobile-logo.png')}}" alt=""></a>
    </div>
    <!-- End Logo -->

    <!-- Main Header -->
    <div class="main-header">
        <div class="container-fluid">
            <div class="row justify-content-between">
                <div class="col-3 col-lg-1 col-xl-4">
                    <!-- Header Left -->
                    <div class="main-header-left h-100 d-flex align-items-center">
                        <!-- Main Header User -->
                        <div class="main-header-user">
                            <a href="#" class="d-flex align-items-center" data-toggle="dropdown">
                                <div class="menu-icon">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>


                            </a>
                            <div class="dropdown-menu">
                                <a href="#">Log Out</a>
                            </div>
                        </div>
                        <!-- End Main Header User -->

                        <!-- Main Header Menu -->
                        <div class="main-header-menu d-block d-lg-none">
                            <div class="header-toogle-menu">
                                <!-- <i class="icofont-navigation-menu"></i> -->
                                <img src="{{ asset('admin/ar/assets/img/menu.png') }}" alt="">
                            </div>
                        </div>
                        <!-- End Main Header Menu -->
                    </div>
                    <!-- End Header Left -->
                </div>
                <div class="col-9 col-lg-11 col-xl-8">
                    <!-- Header Right -->
                    <div class="main-header-right d-flex justify-content-end">
                        <ul class="nav">
                            <li class="ml-0">
                                <!-- Main Header Language -->
                                <div class="main-header-language">
                                    <a href="#" data-toggle="dropdown">
                                        <img src="{{ asset('admin/ar/assets/img/svg/globe-icon.svg') }}" alt="">
                                    </a>


                                    <div class="dropdown-menu style--three">
                                        @foreach (LaravelLocalization::getSupportedLocales() as $localeCode => $properties)
                                            <a rel="alternate" hreflang="{{ $localeCode }}"
                                                href="{{ LaravelLocalization::getLocalizedURL($localeCode, null, [], true) }}">
                                                <span><img src="{{ asset('admin/ar/assets/img/usa.png') }}"
                                                        alt=""></span>
                                                {{ $properties['native'] }}
                                            </a>
                                        @endforeach
                                    </div>


                                </div>
                                <!-- End Main Header Language -->
                            </li>

                            <li>
                                <!-- Main Header Notification -->
                                <div class="main-header-notification">
                                    <a href="#" class="header-icon notification-icon" data-toggle="dropdown">
                                        <span class="count" data-bg-img="assets/img/count-bg.png">50</span>
                                        <img src="{{ asset('admin/ar/assets/img/svg/notification-icon.svg') }}" alt=""
                                            class="svg">
                                    </a>
                                    <div class="dropdown-menu style--two">
                                        <!-- Dropdown Header -->
                                        <div class="dropdown-header d-flex align-items-center justify-content-between">
                                            <h5>5 New notifications</h5>
                                            <a href="#" class="text-mute d-inline-block">Clear all</a>
                                        </div>
                                        <!-- End Dropdown Header -->

                                        <!-- Dropdown Body -->
                                        <div class="dropdown-body">
                                            <!-- Item Single -->
                                            <a href="#" class="item-single d-flex align-items-center">
                                                <div class="content">
                                                    <div class="mb-2">
                                                        <p class="time">2 min ago</p>
                                                    </div>
                                                    <p class="main-text">Donec dapibus mauris id odio ornare tempus
                                                        amet.</p>
                                                </div>
                                            </a>
                                            <!-- End Item Single -->

                                            <!-- Item Single -->
                                            <a href="#" class="item-single d-flex align-items-center">
                                                <div class="content">
                                                    <div class="mb-2">
                                                        <p class="time">2 min ago</p>
                                                    </div>
                                                    <p class="main-text">Donec dapibus mauris id odio ornare
                                                        tempus.
                                                        Duis sit amet accumsan justo.</p>
                                                </div>
                                            </a>
                                            <!-- End Item Single -->

                                            <!-- Item Single -->
                                            <a href="#" class="item-single d-flex align-items-center">
                                                <div class="content">
                                                    <div class="mb-2">
                                                        <p class="time">2 min ago</p>
                                                    </div>
                                                    <p class="main-text">Donec dapibus mauris id odio ornare
                                                        tempus.
                                                        Duis sit amet accumsan justo.</p>
                                                </div>
                                            </a>
                                            <!-- End Item Single -->

                                            <!-- Item Single -->
                                            <a href="#" class="item-single d-flex align-items-center">
                                                <div class="content">
                                                    <div class="mb-2">
                                                        <p class="time">2 min ago</p>
                                                    </div>
                                                    <p class="main-text">Donec dapibus mauris id odio ornare
                                                        tempus.
                                                        Duis sit amet accumsan justo.</p>
                                                </div>
                                            </a>
                                            <!-- End Item Single -->
                                        </div>
                                        <!-- End Dropdown Body -->
                                    </div>
                                </div>
                                <!-- End Main Header Notification -->
                            </li>
                        </ul>
                    </div>
                    <!-- End Header Right -->
                </div>
            </div>
        </div>
    </div>
    <!-- End Main Header -->
</header>
<!-- End Header -->
