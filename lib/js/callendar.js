document.addEventListener('DOMContentLoaded', function() {
  $('.calendar-wrap').each(function () {
    var $wrap = $(this);
    var calendarEl = $wrap.find('.calendar')[0];
    if (!calendarEl) return;

    var type = $wrap.data('type');

    var calendar = new FullCalendar.Calendar(calendarEl, {
      locale: 'ko',
      height: 'auto',
      headerToolbar: {
        left: 'prev',
        center: 'title',
        right: 'next'
      },
      initialView: 'dayGridMonth',
      fixedWeekCount: false,
      datesSet: function(info) {
        var date = info.view.currentStart;
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var titleEl = calendarEl.querySelector('.fc-toolbar-title');
        if (titleEl) {
          titleEl.textContent = year + '년 ' + month + '월';
        }
      },
      dayCellContent: function(arg) {
        return { html: arg.date.getDate().toString() };
      },
      eventContent: function(arg) {
        return { html: '' };
      },
      eventDidMount: function(info) {
        var dayEl = info.el.closest('.fc-daygrid-day');
        if (dayEl && !dayEl.querySelector('.event-dot')) {
          var dot = document.createElement('span');
          dot.className = 'event-dot';
          dayEl.querySelector('.fc-daygrid-day-number').appendChild(dot);
        }
      },
      dateClick: function(info) {
        if (type === 'panel') {
          $wrap.find('.fc-daygrid-day.selected').removeClass('selected');
          info.dayEl.classList.add('selected');

          var clickedDate = info.dateStr;
          var matched = calendar.getEvents().filter(function(e) {
            return e.startStr.startsWith(clickedDate);
          });
          var panel = $wrap.find('.event-panel')[0];
          if (matched.length > 0) {
            var dateLabel = clickedDate.replace(/-/g, '.');
            panel.innerHTML = '<strong>' + dateLabel + '</strong><p><span class="dots"></span>' + matched[0].title + '</p>';
          } else {
            panel.innerHTML = '';
          }
        }
      },
      events: $wrap.data('events') || window.calendarEvents,
    });

    calendar.render();
    $wrap.data('calendarInstance', calendar);
  });
});