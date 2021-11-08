<!doctype html>
<html lang="ar">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="keywords" content="">
    @include('Admin.layouts.head')
</head>
<body>

<!-- Offcanval Overlay -->
<div class="offcanvas-overlay"></div>
<!-- Offcanval Overlay -->

<div class="wrapper">

@include('Admin.layouts.Header')

<!-- Main Wrapper -->
    <div class="main-wrapper">
        <!-- Sidebar -->
    @include('Admin.layouts.Sidebar')
    <!-- End Sidebar -->

    <!-- Main Content -->
    @include('Admin.layouts.MainContent')
    <!-- End Main Content -->
    </div>
    <!-- End Main Wrapper -->

    <!-- Footer -->
@include('Admin.layouts.footer')
<!-- End Footer -->
</div>

@include('Admin.layouts.footerJs')
</body>
</html>
