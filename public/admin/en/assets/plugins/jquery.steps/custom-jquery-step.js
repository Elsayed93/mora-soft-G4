/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


** Jquery Step Custom JS

----------------------------------------------*/

$("#example-vertical").steps({
    headerTag: "h3",
    bodyTag: "section",
    onStepChanging: function(){
        var text = $("#example-vertical input").val();        
        if(text === ''){
          return false;
        }else{
          return true;
        }
    },
    onFinished: function (event, currentIndex) {
        $(this).children('.actions').remove();
    }
});
$('#example-vertical-t-0').prepend('<i class="icofont-user-alt-7"></i>');
$('#example-vertical-t-1').prepend('<i class="icofont-location-pin"></i>');
$('#example-vertical-t-2').prepend('<i class="icofont-check-circled"></i>');