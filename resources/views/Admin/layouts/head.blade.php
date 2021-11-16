{{-- {{ dd($settings->web_name_en) }} --}}
<title>@yield('title')</title>


    <!-- Favicon -->
   <link rel="shortcut icon" href="{{ asset('admin/img/favicon.png') }}">

   <!-- Web Fonts -->
   <link href="https://fonts.googleapis.com/css?family=PT+Sans:400,400i,700,700i&display=swap"
    rel="stylesheet">
@yield('css')

   <!-- ======= BEGIN GLOBAL MANDATORY STYLES ======= -->
   <link rel="stylesheet" href="{{ asset('admin/bootstrap/css/bootstrap.min.css') }}">

   <link rel="stylesheet" href="{{ asset('admin/bootstrap/css/bootstrap.min.css') }}">

   <link rel="stylesheet" href="{{ asset('admin/fonts/icofont/icofont.min.css') }}">
      <link rel="stylesheet" href="{{asset('admin/fonts/et-lineicon/et-lineicons.css')}}">

       <link rel="stylesheet" href="{{asset('admin/plugins/perfect-scrollbar/perfect-scrollbar.min.css')}}">
             <link rel="stylesheet" href="{{asset('admin/plugins/toastr/toastr.min.css')}}">

   
   <link rel="stylesheet" href="{{asset('admin/plugins/datepicker/datepicker.min.css')}}">



   <link rel="stylesheet" href="{{ asset('admin/plugins/perfect-scrollbar/perfect-scrollbar.min.css') }}">
   <!-- ======= END BEGIN GLOBAL MANDATORY STYLES ======= -->

   <!-- ======= BEGIN PAGE LEVEL PLUGINS STYLES ======= -->
   <link rel="stylesheet" href="{{ asset('admin/plugins/apex/apexcharts.css') }}">
   <!-- ======= END BEGIN PAGE LEVEL PLUGINS STYLES ======= -->


   <!-- ======= MAIN STYLES ======= -->
@if (App::getLocale() == 'en')


<link rel="stylesheet" href="{{ asset('admin/en/css/style.css') }}">
@else
<link rel="stylesheet" href="{{ asset('admin/ar/css/style.css') }}">
@endif



   <!-- ======= END MAIN STYLES ======= -->


