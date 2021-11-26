<!-- ======= BEGIN GLOBAL MANDATORY SCRIPTS ======= -->






<script src="https://code.jquery.com/jquery-3.6.0.min.js" 
integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>


<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"
 integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
  crossorigin="anonymous"></script>

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


<script type="text/javascript">

    // start check all
    var checked_all = false;

    var check_all_button = document.querySelector('#check-all');
    var target_checkboxes = document.querySelectorAll('.checkboxes');


    target_checkboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', function() {

        var unchecked = Array.prototype.slice.call(target_checkboxes).filter(checkbox => !checkbox.checked);

        if(unchecked.length) {
           checked_all = false;
           check_all_button.checked = false;
        } else {
          checked_all = true;
          check_all_button.checked = true;
        }
      });
    });

    check_all_button.addEventListener('click', function() {
      checked_all = !checked_all;
      target_checkboxes.forEach(function(checkbox) {
        checkbox.checked = checked_all;
       
      });
    });

    // End check all


    </script>




<script type="text/javascript">
    // Start post Delete All

    $(function() {
        $("#btn_delete_all").click(function() {
            var selected = new Array();
          var $refat =   $("#datatable input[type=checkbox]:checked").each(function() {
                selected.push(this.value);
                console.log($refat);
            });

            if (selected.length > 0) {
                $('#delete_all').modal('show')
               var i = $('input[id="delete_all_id"]').val(selected);
            }

        });
    });
 
    // End post Delete All

    // Start disabled button and abled


var checkboxes = $("input[type='checkbox']"),
    submitButt = $("#btn_delete_all");

checkboxes.click(function() {
    submitButt.attr("disabled", !checkboxes.is(":checked"));
});
    // End  disabled button and abled

</script>




@yield('js')
