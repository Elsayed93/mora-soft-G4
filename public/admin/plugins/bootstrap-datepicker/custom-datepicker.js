/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


** Datepicker Active

----------------------------------------------*/

$(function() {
  'use strict';

  $.fn.datepicker.defaults.format = "dd MM yyyy";
  if($('#datePickerExample').length) {
    var date = new Date();
    var today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var today2 = new Date(date.getFullYear(), date.getMonth());
    $('#datePickerExample').datepicker({
        format: "dd MM yyyy",
        todayHighlight: true,
        autoclose: true,
    });
    $('#datePickerExample').datepicker('setDate', today);
    $('#datePickerExample2').datepicker('setDate', today);
  }

});