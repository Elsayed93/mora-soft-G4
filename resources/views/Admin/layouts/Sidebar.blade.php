<!-- Sidebar -->
<nav class="sidebar" data-trigger="scrollbar">
    <!-- Sidebar Header -->
    <div class="sidebar-header d-none d-lg-block">
        <!-- Sidebar Toggle Pin Button -->
        <div class="sidebar-toogle-pin">
            <i class="icofont-tack-pin"></i>
        </div>
        <!-- End Sidebar Toggle Pin Button -->
    </div>
    <!-- End Sidebar Header -->

    <!-- Sidebar Body -->
    <div class="sidebar-body">
        <!-- Nav -->
        <ul class="nav">
            <li class="nav-category">Main</li>
            <li class="active">
                <a href="index.html">
                    <i class="icofont-pie-chart"></i>
                    <span class="link-title">Dashboard</span>
                </a>
            </li>

            <li>
                <a href="#">
                    <i class="icofont-shopping-cart"></i>
                    <span class="link-title">Ecommerce</span>
                </a>

                <!-- Sub Menu -->
                <ul class="nav sub-menu">
                    <li><a href="pages/ecommerce/ecommerce.html">Dashboard 1</a></li>
                    <li><a href="pages/ecommerce/ecommerce2.html">dashboard 2</a></li>
                    <li><a href="pages/ecommerce/orders.html">orders</a></li>
                    <li><a href="pages/ecommerce/product-catelog.html">Products Catalog</a></li>
                    <li><a href="pages/ecommerce/product-details.html">Product Details</a></li>
                    <li><a href="pages/ecommerce/cartlist.html">cart list</a></li>
                </ul>
                <!-- End Sub Menu -->
            </li>

            {{-- settings --}}
            <li class="active">
                <a href="#">
                    <i class="icofont-pie-chart"></i>
                    <span class="link-title">@lang('settings.settings')</span>
                </a>
            </li>


            <li class="nav-category">others</li>

            {{-- <li>
                <a href="#" class="disabled">
                    <i class="icofont-not-allowed"></i>
                    <span class="link-title">Disable Menu</span>
                </a>
            </li> --}}

            {{-- <li class="nav-category">Support</li> --}}
        </ul>
        <!-- End Nav -->
    </div>
    <!-- End Sidebar Body -->
</nav>
<!-- End Sidebar -->
