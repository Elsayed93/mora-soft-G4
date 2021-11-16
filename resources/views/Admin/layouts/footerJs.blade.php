<!-- ======= BEGIN GLOBAL MANDATORY SCRIPTS ======= -->
<script src="{{asset('admin/js/jquery.min.js')}}"></script>
<script src="{{asset('admin/bootstrap/js/bootstrap.bundle.min.js')}}"></script>
<script src="{{asset('admin/plugins/perfect-scrollbar/perfect-scrollbar.min.js')}}"></script>
<script src="{{asset('admin/js/script.js')}}"></script>
<!-- ======= BEGIN GLOBAL MANDATORY SCRIPTS ======= -->

<script src="{{asset('admin/plugins/toastr/toastr.min.js')}}"></script>
   <script src="{{asset('admin/plugins/toastr/toastr.js')}}"></script>

<!-- ======= BEGIN PAGE LEVEL PLUGINS/CUSTOM SCRIPTS ======= -->
<script src="{{asset('admin/plugins/apex/apexcharts.min.js')}}"></script>
<script src="{{asset('admin/plugins/apex/custom-apexcharts.js')}}"></script>
<!-- ======= End BEGIN PAGE LEVEL PLUGINS/CUSTOM SCRIPTS ======= -->


<script>
    $(document).ready(function() {
        $('#datatable').DataTable();
    } );

</script>


@if (App::getLocale() == 'en')

    <script src="{{ URL::asset('admin/bootstrap-datatables/en/jquery.dataTables.min.js') }}"></script>

    <script src="{{ URL::asset('admin/bootstrap-datatables/en/dataTables.bootstrap4.min.js') }}"></script>

@else

    <script src="{{ URL::asset('admin/bootstrap-datatables/ar/jquery.dataTables.min.js') }}"></script>
    <script src="{{ URL::asset('admin/bootstrap-datatables/ar/dataTables.bootstrap4.min.js') }}"></script>
@endif



@yield('js')
