document.addEventListener("DOMContentLoaded", function () {
  $(".calendar-wrap").each(function () {
    var $wrap = $(this);
    var calendarEl = $wrap.find(".calendar")[0];
    if (!calendarEl) return;

    var type = $wrap.data("type");
    var isMobile = window.matchMedia("(max-width: 768px)").matches;

    var calendar = new FullCalendar.Calendar(calendarEl, {
      locale: "ko",
      height: type === "notice" ? "auto" : (isMobile ? "auto" : 500),
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
        if (type === "notice") {
          renderNoticeDots(calendarEl);
          setTimeout(function () {
            centerNoticeMarkers(calendarEl);
          }, 0);
          if (typeof window.onNoticeCalendarMonthChange === "function") {
            window.onNoticeCalendarMonthChange(date);
          }
        }
      },
      dayCellContent: function (arg) {
        return { html: arg.date.getDate().toString() };
      },
      eventContent: function (arg) {
        return { html: "" };
      },
      eventDidMount: function (info) {
        if (type === "rental" || type === "notice") return; // rental/notice는 점을 따로 그리거나 알약 자체로 보여주므로 건너뜀
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
      events: $wrap.data("events") || (type === "notice" ? window.scheduleEvents : window.calendarEvents),
    });

    calendar.render();
    $wrap.data("calendarInstance", calendar);

    if (type === "notice") {
      var $toolbar = $wrap.find(".fc-header-toolbar");
      var $legend = $wrap.find(".calendar-legend");
      if ($toolbar.length && $legend.length) {
        $legend.insertAfter($toolbar);
      }
    }

    var noticeResizeTimer = null;

    $(window).on("resize", function () {
      if (type !== "notice") {
        var nowMobile = window.matchMedia("(max-width: 768px)").matches;
        calendar.setOption("height", nowMobile ? "auto" : 620);
      } else if (window.matchMedia("(max-width: 768px)").matches) {
        clearTimeout(noticeResizeTimer);
        noticeResizeTimer = setTimeout(function () {
          centerNoticeMarkers(calendarEl);
        }, 150);
      } else {
        clearTimeout(noticeResizeTimer);
        resetNoticeMarkerPositions(calendarEl);
      }

      // setOption()이 내부적으로 뷰를 다시 그리면서 FullCalendar 자체 로케일 제목과
      // 겹쳐 붙는 경우가 있어, 직접 설정한 제목으로 한 번 더 덮어씀
      var d = calendar.getDate();
      var titleEl = calendarEl.querySelector(".fc-toolbar-title");
      if (titleEl) {
        titleEl.textContent = d.getFullYear() + "년 " + String(d.getMonth() + 1).padStart(2, "0") + "월";
      }
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

    /* notice 타입 : 하루에 교육연수/행사/기타/공휴일이 겹치면, 우선순위가 가장 높은 타입만 알약으로 보여주고
       나머지 타입들은 그 타입 색깔의 작은 점으로 표시함. 우선순위: 교육연수 > 행사 > 기타 > 공휴일 */
    /* notice 타입 : 모바일에서 오늘 배경원 / 이벤트 알약을 날짜 숫자의 실제 렌더링 위치 기준으로
       가운데 정렬. CSS px 값으로 추정하는 대신 실측해서 맞추므로 폰트·기기 차이에 안정적임 */
    function resetNoticeMarkerPositions(calendarEl) {
      calendarEl.querySelectorAll(".fc-daygrid-day-bg, .event-pill").forEach(function (marker) {
        marker.style.left = "";
        marker.style.top = "";
        marker.style.margin = "";
        marker.style.transform = "";
      });
    }

    function centerNoticeMarkers(calendarEl) {
      if (!window.matchMedia("(max-width: 768px)").matches) return;

      calendarEl.querySelectorAll(".fc-daygrid-day").forEach(function (dayEl) {
        var number = dayEl.querySelector(".fc-daygrid-day-number");
        if (!number) return;
        var numberRect = number.getBoundingClientRect();

        [dayEl.querySelector(".fc-daygrid-day-bg"), dayEl.querySelector(".event-pill")].forEach(function (marker) {
          if (!marker) return;
          var parent = marker.offsetParent; // top/left 계산 기준이 되는 실제 조상(가정하지 않고 직접 물어봄)
          if (!parent) return;
          var parentRect = parent.getBoundingClientRect();

          var centerX = numberRect.left + numberRect.width / 2 - parentRect.left;
          var centerY = numberRect.top + numberRect.height / 2 - parentRect.top;

          marker.style.left = centerX + "px";
          marker.style.top = centerY + "px";
          marker.style.margin = "0";
          marker.style.transform = "translate(-50%, -50%)";
        });
      });
    }

    function renderNoticeDots(calendarEl) {
      var TYPE_PRIORITY = ["edu", "event", "etc", "holiday", "dp00", "dp01", "dp02", "dp03", "dp04", "dp05", "dp06", "dp07", "dp08", "dp09", "dp10", "dp11", "dp12", "dp13", "dp14", "dp15", "dp16", "dp17"];
      var byDate = {};

      (window.scheduleEvents || []).forEach(function (ev) {
        var date = ev.start;
        var evType = ev.extendedProps && ev.extendedProps.type;
        if (!date || !evType) return;
        if (!byDate[date]) byDate[date] = [];
        byDate[date].push({ title: ev.title, type: evType });
      });

      calendarEl.querySelectorAll(".fc-daygrid-day").forEach(function (dayEl) {
        var dateStr = dayEl.getAttribute("data-date");
        var frame = dayEl.querySelector(".fc-daygrid-day-events");
        if (!frame) return;

        frame.innerHTML = "";

        var items = byDate[dateStr];
          if (!items || !items.length) {
            dayEl.classList.remove("has-event");
            return;
          }

          dayEl.classList.add("has-event");

        var presentTypes = TYPE_PRIORITY.filter(function (t) {
          return items.some(function (it) { return it.type === t; });
        });

        var pillType = presentTypes[0];
        var pillItem = items.filter(function (it) { return it.type === pillType; })[0];

        var pill = document.createElement("span");
        pill.className = "event-pill " + pillType;
        pill.textContent = pillItem.title;
        frame.appendChild(pill);

        var dotWrap = document.createElement("div");
        dotWrap.className = "event-dot-wrap";
        presentTypes.slice(1).forEach(function (t) {
          var dot = document.createElement("span");
          dot.className = "event-dot-type " + t;
          dotWrap.appendChild(dot);
        });
        if (dotWrap.children.length) frame.appendChild(dotWrap);
      });
    }
  });
});