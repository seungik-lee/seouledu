document.addEventListener("DOMContentLoaded", function () {
  $(".calendar-wrap").each(function () {
    var $wrap = $(this);
    var calendarEl = $wrap.find(".calendar")[0];
    if (!calendarEl) return;

    var type = $wrap.data("type");
    var isMobile = window.matchMedia("(max-width: 768px)").matches;

    var calendar = new FullCalendar.Calendar(calendarEl, {
      locale: "ko",
      height: isMobile ? "auto" : 500,
      headerToolbar: {
        left: "prev",
        center: "title",
        right: "next",
      },
      initialView: "dayGridMonth",
      fixedWeekCount: false,
      datesSet: function (info) {
        var date = info.view.currentStart;
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, "0");
        var titleEl = calendarEl.querySelector(".fc-toolbar-title");
        if (titleEl) {
          titleEl.textContent = year + "년 " + month + "월";
        }
        if (type === "rental") {
          renderRentalDots(calendarEl);
        }
      },
      dayCellContent: function (arg) {
        return { html: arg.date.getDate().toString() };
      },
      eventContent: function (arg) {
        return { html: "" };
      },
      eventDidMount: function (info) {
        if (type === "rental") return; // rental은 renderRentalDots가 따로 도트를 그림
        var dayEl = info.el.closest(".fc-daygrid-day");
        if (dayEl && !dayEl.querySelector(".event-dot")) {
          var dot = document.createElement("span");
          var status = info.event.extendedProps.status;
          dot.className = "event-dot" + (status === "wait" ? " wait" : "");
          dayEl.querySelector(".fc-daygrid-day-number").appendChild(dot);
        }
      },
      dateClick: function (info) {
        if (info.dayEl.classList.contains("fc-day-other")) {
          calendar.gotoDate(info.dateStr);
        }

        if (type === "panel") {
          $wrap.find(".fc-daygrid-day.selected").removeClass("selected");
          info.dayEl.classList.add("selected");

          var clickedDate = info.dateStr;
          var matched = calendar.getEvents().filter(function (e) {
            return e.startStr.startsWith(clickedDate);
          });
          var panel = $wrap.find(".event-panel")[0];
          if (matched.length > 0) {
            var dateLabel = clickedDate.replace(/-/g, ".");
            panel.innerHTML = "<strong>" + dateLabel + '</strong><p><span class="dots"></span>' + matched[0].title + "</p>";
          } else {
            panel.innerHTML = "";
          }
        } else if (type === "rental") {
          $wrap.find(".fc-daygrid-day.selected").removeClass("selected");
          info.dayEl.classList.add("selected");
          renderRentalDetail($wrap, info.dateStr);
        } else if (type === "timetable") {
          $wrap.find(".fc-daygrid-day.selected").removeClass("selected");
          info.dayEl.classList.add("selected");

          var $timezoneWrap = $wrap.closest(".schedule-wrap").find(".bx.timezone-wrap");
          var api = $timezoneWrap.data("timezoneApi");
          if (api) api.goToDate(info.dateStr);
        }
      },
      events: $wrap.data("events") || window.calendarEvents,
    });

    calendar.render();
    $wrap.data("calendarInstance", calendar);

    $(window).on("resize", function () {
      var nowMobile = window.matchMedia("(max-width: 768px)").matches;
      calendar.setOption("height", nowMobile ? "auto" : 620);
    });

    function renderRentalDetail($calendarWrap, dateStr) {
      var $panel = $calendarWrap.closest(".rental-status-wrap").find(".rental-detail-wrap");
      var data = (window.rentalStatusData || {})[dateStr];

      if (!data) {
          $panel.find(".rental-detail").hide();
          $panel.find(".rental-empty p").html("선택하신 날짜에는<br>정보가 없습니다.");
          $panel.find(".rental-empty").show();
          $(".rental-list-wrap").hide();
          return;
      }

      $panel.find(".rental-empty").hide();
      $panel.find(".rental-detail").show();
      $(".rental-list-wrap").show();

      var d = new Date(dateStr + "T00:00:00");
      var days = ["일", "월", "화", "수", "목", "금", "토"];
      $panel.find(".date-tit").text(dateStr + " (" + days[d.getDay()] + ")");

      var $rows = $panel.find(".timeline-rows").empty();
      var $listBody = $(".rental-list-body").empty();
      var $count = $(".rental-total-count");

      (data.rooms || []).forEach(function (room) {
        var $row = $('<div class="timeline-row"></div>');
        $row.append('<p class="room">' + room.name + "</p>");
        var $track = $('<div class="bar-track"></div>');

        room.bars.forEach(function (bar) {
          var startH = toHour(bar.start);
          var endH = toHour(bar.end);
          var left = ((startH - 9) / 14) * 100;
          var width = ((endH - startH) / 14) * 100;
          $track.append('<span class="bar ' + bar.status + '" style="left:' + left + "%;width:" + width + '%;">' + bar.start.slice(0, 2) + "~" + bar.end.slice(0, 2) + "</span>");
        });

        $row.append($track);
        $rows.append($row);
      });

      (data.list || []).forEach(function (item) {
        var statusLabel = item.status === "confirm" ? "확정" : "예약";
        var statusClass = item.status === "confirm" ? "blue" : "yellow";
        $listBody.append("<tr>" + "<td>" + item.facility + "</td>" + "<td>" + item.time + "</td>" + "<td>" + item.duration + "</td>" + '<td><p class="status light ' + statusClass + '">' + statusLabel + "</p></td>" + "</tr>");
      });

      $count.text((data.list || []).length);
    }

    function toHour(hhmm) {
      var parts = hhmm.split(":");
      return parseInt(parts[0], 10) + parseInt(parts[1], 10) / 60;
    }

    function renderRentalDots(calendarEl) {
      var data = window.rentalStatusData || {};

      calendarEl.querySelectorAll(".fc-daygrid-day").forEach(function (dayEl) {
        var dateStr = dayEl.getAttribute("data-date");
        var numberEl = dayEl.querySelector(".fc-daygrid-day-number");
        if (!numberEl) return;

        numberEl.querySelectorAll(".event-dot").forEach(function (el) {
          el.remove();
        });

        var dayData = data[dateStr];
        if (!dayData) return;

        var hasConfirm = false;
        var hasWait = false;
        (dayData.list || []).forEach(function (item) {
          if (item.status === "confirm") hasConfirm = true;
          if (item.status === "wait") hasWait = true;
        });

        if (hasConfirm) {
          var dotConfirm = document.createElement("span");
          dotConfirm.className = "event-dot";
          numberEl.appendChild(dotConfirm);
        }
        if (hasWait) {
          var dotWait = document.createElement("span");
          dotWait.className = "event-dot wait" + (hasConfirm ? " dot2" : "");
          numberEl.appendChild(dotWait);
        }
      });
    }
  });
});
