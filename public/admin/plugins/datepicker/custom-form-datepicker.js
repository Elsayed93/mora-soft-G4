/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


** Form Datepicker

----------------------------------------------*/

$(function() {
	'use strict';
	
	$(document).ready(function() {
		/* --- Form - Datepicker -- */
		//Default Date
		$('#default-date').datepicker({
			language: 'en',
			dateFormat: 'dd MM yyyy',
		});

		//Formate Date
		$('#formate-date').datepicker({
			language: 'en',
			dateFormat: 'dd, MM, yyyy',
		});

		//Week View Date
		$('#datepicker55').datepicker({
			language: 'en',
			onSelect: function (dateText, inst) {
				var d = new Date(dateText);
				$('#datepicker55').val(`Week ${$.datepicker.iso8601Week(d)}, ${$.datepicker.formatDate('yy', d)}`);
			}
		});

		//Month View Date
		$('#month-view-date').datepicker({
			language: 'en',
			minView: 'months',
			view: 'months',	    
			dateFormat: 'MM yyyy'
		});

		//Fixed Date
		$("#fixed-date").datepicker({
			language: 'en',
			dateFormat: 'dd MM yyyy',
			minDate: new Date('2020-5-5'),
			maxDate: new Date('2020-7-5'),
		});

		//Translate Date
		$("#translate-date").datepicker({
			language: 'en',
			dateFormat: 'dd MM yyyy'
		});
		$( "#locale" ).on( "change", function() {

			$( "#translate-date" ).datepicker( {
				language: $( this ).val()
			});

		});

		//Short String Date
		$("#short-string-date").datepicker({
			language: 'en',
			dateFormat: 'dd MM yyyy',
			monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
						 "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			onSelect: function (dateText, inst) {
				navigatedate(dateText, inst);
			}
		});

		// Change First Weekday
		$("#change-first-weekday").datepicker({
			language: 'en',
			dateFormat: 'dd MM yyyy',
			firstDay: 1
		});

		// Disable Date & Week
		var disabledDays = [0, 6];
		$('#disable-date-week').datepicker({
			language: 'en',
			dateFormat: 'dd MM yyyy',
			position: 'top left',
			onRenderCell: function (date, cellType) {
				if (cellType == 'day') {
					var day = date.getDay(),
						isDisabled = disabledDays.indexOf(day) != -1;

					return {
						disabled: isDisabled
					}
				}
			}
		});

		// Inline Date Picker
		$('#inline-date').datepicker({
			language: 'en',
		});

		if($('#time-picker, #format-time-picker, #interval-time-picker, #min-max-time-picker').length) {
			// Default Time Picker
			$('#time-picker').timepicker({ timeFormat: 'H:i:s A' });

			// Format Time Picker
			$('#format-time-picker').timepicker({ timeFormat: 'h:i:s A' });

			// Interval Time Picker
			$('#interval-time-picker').timepicker({ 
				timeFormat: 'H:i:s A',
				interval: 60,
			});

			// Max Min Time Picker
			$('#min-max-time-picker').timepicker({
				timeFormat: 'H:i:s A',
				minTime: '10',
				maxTime: '6:00pm',
			});
		}

		//Date Range Picker
		if($('input[name="daterange"]').length) {
			$('input[name="daterange"]').daterangepicker({
				opens: 'left'
			}, function(start, end, label) {
				console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
			});

			//Date Time Range Picker
			$('input[name="datetimes"]').daterangepicker({
				timePicker: true,
				startDate: moment().startOf('hour'),
				endDate: moment().startOf('hour').add(32, 'hour'),
				locale: {
				format: 'M/DD hh:mm A'
				}
			});
		}
	});
});