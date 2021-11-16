/*---------------------------------------------
Template name :  Dashmin
Version       :  1.0
Author        :  ThemeLooks
Author url    :  http://themelooks.com


** Fullcalendar Config

----------------------------------------------*/

var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi;
jQuery.htmlPrefilter = function( html ) {
    return html.replace( rxhtmlTag, "<$1></$2>" );
};

$(function() {
    'use strict';

  // sample calendar events data
  var curYear = moment().format('YYYY');
  var curMonth = moment().format('MM');

  // Calendar Event Source
  var calendarEvents = {
    id: 1,
    backgroundColor: '#D2BB00',
    borderColor: '#0168fa',
    textColor: '#fff',
    events: [
      {
        id: '1',
        start: curYear+'-'+curMonth+'-11T08:25:00',
        end: curYear+'-'+curMonth+'-12T08:25:00',
        date: '11 . 05 . 2020',
        title: 'Friends Chill Time',
        location: 'Po Box 931, Sterling City, Malta',
        user: 'Anyone',
        event: 'Calendar'
      }
    ]
  };

  // Birthday Events Source
  var birthdayEvents = {
    id: 2,
    backgroundColor: '#FC7383',
    borderColor: '#FFE2E6',
    textColor: '#fff',
    events: [
      {
        id: '2',
        start: curYear+'-'+curMonth+'-13T08:25:00',
        end: curYear+'-'+curMonth+'-14T08:25:00',
        date: '13 . 05 . 2020',
        title: 'Friends Chill Time',
        location: 'Po Box 931, Sterling City, Malta',
        user: 'Anyone',
        event: 'Birthday'
      }]
  };

  // Holydays Events Source
  var holidayEvents = {
    id: 3,
    backgroundColor: '#FFB959',
    borderColor: '#FFF4E6',
    textColor: '#fff',
    events: [
      {
        id: '3',
        start: curYear+'-'+curMonth+'-13T08:25:00',
        end: curYear+'-'+curMonth+'-14T08:25:00',
        date: '13 . 05 . 2020',
        title: 'Friends Chill Time',
        location: 'Po Box 931, Sterling City, Malta',
        user: 'Anyone',
        event: 'Holydays'
      }
    ]
  };

  // Discoverd Events Source
  var discoveredEvents = {
    id: 4,
    backgroundColor: '#67CF94',
    borderColor: '#DBF7E8',
    textColor: '#fff',
    events: [
      {
        id: '4',
        start: curYear+'-'+curMonth+'-13T08:25:00',
        end: curYear+'-'+curMonth+'-14T08:25:00',
        date: '13 . 05 . 2020',
        title: 'Friends Chill Time',
        location: 'Po Box 931, Sterling City, Malta',
        user: 'Anyone',
        event: 'Discovered'
      }
    ]
  };

  // Meetup Events Source
  var meetupEvents = {
    id: 5,
    backgroundColor: '#C491FF',
    borderColor: '#E9E7FF',
    textColor: '#fff',
    events: [
      {
        id: '5',
        start: curYear+'-'+curMonth+'-21T08:25:00',
        end: curYear+'-'+curMonth+'-24T08:25:00',
        date: '21 . 05 . 2020',
        title: 'Friends Chill Time',
        location: 'Po Box 931, Sterling City, Malta',
        user: 'Anyone',
        event: 'Meetup'
      }
    ]
  };

  // Anniversary Events Source
  var anniversaryEvents = {
    id: 6,
    backgroundColor: '#4F9DF8',
    borderColor: '#ECF3FD',
    textColor: '#fff',
    events: [
      {
        id: '6',
        start: curYear+'-'+curMonth+'-15T08:25:00',
        end: curYear+'-'+curMonth+'-15T08:25:00',
        date: '15 . 05 . 2020',
        title: 'Friends Chill Time',
        location: 'Po Box 931, Sterling City, Malta',
        user: 'Anyone',
        event: 'Anniversary'
      },
      {
        id: '7',
        start: curYear+'-'+curMonth+'-21T08:25:00',
        end: curYear+'-'+curMonth+'-21T08:25:00',
        date: '21 . 05 . 2020',
        title: 'Friends Chill Time',
        location: 'Po Box 931, Sterling City, Malta',
        user: 'Anyone',
        event: 'Anniversary'
      }
    ]
  };
  

  // initialize the external events
  $('#external-events .fc-event').each(function() {
    // store data so the calendar knows to render an event upon drop
    $(this).data('event', {
      title: $.trim($(this).text()), // use the element's text as the event title
      stick: true // maintain when user navigates (see docs on the renderEvent method)
    });
    // make the event draggable using jQuery UI
    $(this).draggable({
      zIndex: 999,
      revert: true,      // will cause the event to go back to its
      revertDuration: 0  //  original position after the drag
    });

  });


  // initialize the calendar
  $('#fullcalendar').fullCalendar({
    header: {
      left: 'title,prev,next,today',
      right: 'month,agendaWeek,agendaDay'
    },
    firstDay: 1,
    editable: true,
    droppable: true, // this allows things to be dropped onto the calendar
    dragRevertDuration: 0,
    defaultView: 'month',
    eventLimit: true, // allow "more" link when too many events
    eventSources: [calendarEvents, birthdayEvents, holidayEvents, discoveredEvents, meetupEvents, anniversaryEvents],
    eventClick:  function(event, jsEvent, view) {
      $('#modalTitle1').html(event.title);
      $('#modalDate').html(event.date);
      $('#modalLocation').html(event.location);
      $('#modalVisibility').html(event.user);
      $('#modalEvent').html(event.event);
      $('#eventUrl').attr('href',event.url);
      $('#fullCalModal').modal();
    },
    dayClick: function(date, jsEvent, view) {
      $("#createEventModal").modal("show");
    },
    
    eventDragStop: function( event, jsEvent, ui, view ) {
      if(isEventOverDiv(jsEvent.clientX, jsEvent.clientY)) {
        // $('#calendar').fullCalendar('removeEvents', event._id);
        var el = $( "<div class='fc-event'>" ).appendTo( '#external-events-listing' ).text( event.title );
        el.draggable({
          zIndex: 999,
          revert: true, 
          revertDuration: 0 
        });
        el.data('event', { title: event.title, id :event.id, stick: true });
      }
    }
  });


  var isEventOverDiv = function(x, y) {
    var external_events = $( '#external-events' );
    var offset = external_events.offset();
    offset.right = external_events.width() + offset.left;
    offset.bottom = external_events.height() + offset.top;

    // Compare
    if (x >= offset.left
      && y >= offset.top
      && x <= offset.right
      && y <= offset .bottom) { return true; }
    return false;
  }

});