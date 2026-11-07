document.addEventListener("DOMContentLoaded", function () {
  $(".calendar-wrap").each(function () {
    var $wrap = $(this);
    var calendarEl = $wrap.find(".calendar")[0];
    if (!calendarEl) return;

    var type = $wrap.data("type");
    if (type === "range") {
      initRangeCalendar($wrap, calendarEl);
      return;
    }
    var isMobile = window.matchMedia("(max-width: 768px)").matches;
    var dayStatus = resolveDateStatus($wrap.data("status"));
    /* data-status 가 있으면 기본적으로 적힌 날짜에만 상태를 표시하고 나머지는 활성. .calendar-wrap 에 reverse 클래스가 있으면 반대로 status 에 적힌 날짜만 활성 (나머지는 disabled) */
    var reverseMode = !!dayStatus && $wrap.hasClass("reverse");
    /* state-dot 클래스가 있으면 불가(full)는 글자 대신 점으로 표시 : PC 는 날짜 숫자 오른쪽 위의 빨간 점(.event-dot.full, 메인 일정 위젯의 점과 같은 위치 · 크기), 모바일은 다른 점들과 같은 줄(날짜 아래) */
    var stateDot = !!dayStatus && $wrap.hasClass("state-dot");
    var holidaySet = buildHolidaySet($wrap, type === "notice" ? window.scheduleEvents : window.calendarEvents);
    var dayStatusText = { wait: "접수전", full: "불가" };

    var calendar = new FullCalendar.Calendar(calendarEl, {
      locale: "ko",
      height: type === "notice" ? "auto" : (isMobile ? "auto" : (type === "timetable" || type === "panel" ? "100%" : 500)),
      headerToolbar: {
        left: "prev",
        center: "title",
        right: "next",
      },
      initialView: "dayGridMonth",
      fixedWeekCount: false,
      /* 공휴일 : window.holidays / data-holidays='["YYYY-MM-DD", ...]' / type 이 holiday 인 일정이 있는 날짜에 fc-day-holiday 클래스를 붙여 숫자를 빨간색으로 표시 */
      dayCellClassNames: function (arg) {
        var d = arg.date;
        var dateStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
        var cls = holidaySet[dateStr] ? ["fc-day-holiday"] : [];
        /* data-status 가 있는 달력 : 상태가 있는 날에 상태 클래스(wait/full)를, 오늘 이전 날짜에 disabled 를 붙임
           상태값이 off 인 날은 글자 없이 disabled 만 붙임 (오늘 이후여도 회색 + 클릭 불가)
           기본 : 나머지 날짜도 모두 활성 (reverse 클래스가 있으면 data-status 에 적힌 날짜(on/wait/full)만 활성, 나머지는 모두 disabled) */
        if (dayStatus) {
          var today = new Date();
          today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          var st = dayStatus[dateStr];
          if (dayStatusText[st]) cls.push(st);
          if (d < today || st === "off" || (reverseMode && !st)) cls.push("disabled");
        }
        return cls;
      },
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
            window.onNoticeCalendarMonthChange(date, $wrap[0]);
          }
        }
      },
      dayCellContent: function (arg) {
        var html = arg.date.getDate().toString();
        if (stateDot) {
          var d = arg.date;
          var key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
          if (dayStatus[key] === "full") html += '<span class="event-dot full"></span>';
        }
        return { html: html };
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
        if (info.dayEl.classList.contains("disabled")) return;

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
            /* 그 날짜의 일정을 모두 한 줄씩 보여줌 (여러 개면 아래로 쌓임) */
            var items = matched.map(function (ev) {
              return '<p><span class="dots"></span>' + $("<span>").text(ev.title).html() + "</p>";
            });
            panel.innerHTML = "<strong>" + dateLabel + '</strong><div class="event-list">' + items.join("") + "</div>";
            panel.classList.toggle("multi", matched.length > 1);
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

          var $sideWrap = $wrap.closest(".schedule-wrap").find(".bx.timezone-wrap, .bx.facility-schedule");
          var api = $sideWrap.data("timezoneApi") || $sideWrap.data("facilityScheduleApi");
          if (api) api.goToDate(info.dateStr);
        }
      },
      events: $wrap.data("events") || (type === "notice" ? window.scheduleEvents : window.calendarEvents),
    });

    calendar.render();
    $wrap.data("calendarInstance", calendar);

    /* 초기 렌더링 시점에 컨테이너 크기가 아직 최종값이 아니면(레이아웃이 자리잡기 전 등)
       FullCalendar가 잘못된 크기로 그려진 채 남아있어서, prev/next로 뷰를 다시 그리기
       전까지는 깨져 보이는 문제가 있음. 컨테이너 크기가 바뀔 때마다 다시 맞춰줌 */
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () {
        calendar.updateSize();
      });
      ro.observe(calendarEl);
    }

    /* 범례는 notice · rental 모두 모바일에서 제목 바로 아래(달력 위)에 놓임 : DOM 에서도 툴바 다음으로 옮김 (rental 의 PC 범례는 CSS 로 absolute 배치라 옮겨도 그대로) */
    if (type === "notice" || type === "rental") {
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
        calendar.setOption("height", nowMobile ? "auto" : (type === "timetable" || type === "panel" ? "100%" : 500));
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
        var statusClass = item.status === "confirm" ? "theme" : "yellow";
        $listBody.append("<tr>" + "<td>" + item.facility + "</td>" + "<td>" + item.time + "</td>" + "<td>" + item.duration + "</td>" + '<td><p class="status light ' + statusClass + '">' + statusLabel + "</p></td>" + "</tr>");
      });

      $count.text((data.list || []).length);

      /* 모바일 : 예약목록을 카드 슬라이드(.table-swiper-wrap)로도 그려줌 */
      var $swiperWrapper = $("#rentalSwiperWrapper").empty();
      (data.list || []).forEach(function (item) {
        var statusLabel = item.status === "confirm" ? "확정" : "예약";
        $swiperWrapper.append(
          '<div class="swiper-slide"><div class="bx"><ul>' +
            '<li><p class="dt">시설</p><p class="dd">' + item.facility + "</p></li>" +
            '<li><p class="dt">예약시간</p><p class="dd">' + item.time + "</p></li>" +
            '<li><p class="dt">이용시간</p><p class="dd">' + item.duration + "</p></li>" +
            '<li><p class="dt">상태</p><p class="dd">' + statusLabel + "</p></li>" +
            "</ul></div></div>"
        );
      });

      var swiperEl = $(".rental-list-wrap .swiper.slide")[0];
      if (swiperEl && swiperEl.swiper) {
        swiperEl.swiper.update();
        swiperEl.swiper.slideTo(0);
        $(".rental-list-wrap .counter .cur").text(1);
        $(".rental-list-wrap .counter .total").text(swiperEl.swiper.slides.length);
      }
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
        /* data-status 달력은 숫자 안에 상태 글자(.rc-state)가 같이 들어 있으므로, 숫자 글자만 재서 기준으로 삼음 */
        if (number.firstChild && number.firstChild.nodeType === 3) {
          var textRange = document.createRange();
          textRange.selectNodeContents(number.firstChild);
          numberRect = textRange.getBoundingClientRect();
        }

        [dayEl.querySelector(".fc-daygrid-day-bg"), $(calendarEl).closest(".calendar-wrap").is("[data-status]") ? null : dayEl.querySelector(".event-pill")].forEach(function (marker) {
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

      /* data-status 달력 : 상태 글자(접수전 · 불가)를 그 날짜의 일정 알약들 맨 아래에 붙임 */
      function appendState(frame, dateStr) {
        var text = dayStatus && dayStatusText[dayStatus[dateStr]];
        if (!text) return;
        var em = document.createElement("em");
        em.className = "rc-state";
        em.textContent = text;
        frame.appendChild(em);
      }

      ($(calendarEl).closest(".calendar-wrap").data("events") || window.scheduleEvents || []).forEach(function (ev) {
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
            appendState(frame, dateStr);
            return;
          }

          dayEl.classList.add("has-event");

        var priority = dayStatus ? ["holiday"].concat(TYPE_PRIORITY.filter(function (t) { return t !== "holiday"; })) : TYPE_PRIORITY;
        var presentTypes = priority.filter(function (t) {
          return items.some(function (it) { return it.type === t; });
        });

        /* 일정 하나당 알약 하나씩, 우선순위 순서로 쌓아서 보여줌 (data-status 달력은 공휴일 → 그 밖의 일정 순서로 쌓고, 맨 아래에 상태 글자) */
        var ordered = [];
        presentTypes.forEach(function (t) {
          items.forEach(function (it) { if (it.type === t) ordered.push(it); });
        });
        ordered.forEach(function (it) {
          var pill = document.createElement("span");
          pill.className = "event-pill " + it.type;
          pill.textContent = it.title;
          frame.appendChild(pill);
        });

        appendState(frame, dateStr);

        var dotWrap = document.createElement("div");
        dotWrap.className = "event-dot-wrap";
        /* 모바일에서 첫 번째 종류는 날짜 뒤의 색 원으로 보이지만, 오늘 칸은 그 자리가 검은 원이라 색 원이 안 보이므로 모든 종류를 점으로 표시 */
        var dotTypes = dayEl.classList.contains("fc-day-today") ? presentTypes : presentTypes.slice(1);
        dotTypes.forEach(function (t) {
          var dot = document.createElement("span");
          dot.className = "event-dot-type " + t;
          dotWrap.appendChild(dot);
        });
        if (dotWrap.children.length) frame.appendChild(dotWrap);
      });
    }
  });
});

/* =========================================================
   날짜별 상태(data-status) 읽기
   - data-status='{"YYYY-MM-DD":"on|wait|full|done|off"}' : 속성에 JSON 을 직접 씀
   - data-status="변수명" : window.변수명 에 목록으로 둠 (날짜가 많을 때). 예) data-status="dateStatus"
       window.dateStatus = [ { date: 'YYYY-MM-DD', status: 'on' }, ... ];
     한 페이지에 달력이 여러 개면 변수명을 달리해서 달력마다 따로 지정
========================================================= */
function resolveDateStatus(v) {
  if (typeof v === "string") v = v ? window[v.replace(/^window\./, "")] : null;
  if (!v) return null;
  if (!Array.isArray(v)) return v;
  var map = {};
  v.forEach(function (it) {
    if (it && it.date) map[it.date] = it.status;
  });
  return map;
}

/* =========================================================
   기간 선택 달력 (.calendar-wrap[data-type="range"]) : 입소·퇴소처럼 시작일과 종료일을 고르는 레이어팝업용
   - 구조 : .layer-popup > .calendar-wrap[data-type="range"][data-in="#시작input"][data-out="#종료input"][data-status='{...}']
            > .calendar + ul.rc-legend (범례, 모바일에서는 달마다 하나씩 복사되어 표시)
            팝업 안의 .rc-cancel / .rc-apply 버튼으로 취소 / 선택
   - FullCalendar multiMonth 로 2개월을 나란히 그리고, 날짜 클릭으로 기간을 고름
     (첫 클릭 = 시작일, 두 번째 클릭 = 종료일, 시작일보다 앞을 누르면 시작일을 다시 지정)
   - 날짜별 상태 : data-status='{"YYYY-MM-DD":"wait|full|done|off"}' (wait 접수전 / full 불가 / done 대관완료 / off 글자 없이 날짜만 회색)
     .calendar-wrap 에 reverse 클래스를 추가하면 반대로 "on"(글자 없음)으로 적은 날짜만 선택 가능하고 나머지는 모두 회색 (wait · full · done 은 글자만 표시되고 그대로 선택 불가)
     상태가 있는 날과 오늘 이전 날짜는 선택 불가 (td 에 .disabled)
   - 선택하면 두 input 에 YYYY-MM-DD 를 넣고 팝업을 닫음, 취소는 입력값을 바꾸지 않고 닫음
   - data-out 을 생략하면 날짜 하나만 고르는 모드 (입소일만 선택, 첫 클릭한 날짜가 그대로 선택됨)
   - 입소일과 퇴소일 사이에 상태가 있는 날(접수전·불가·대관완료)이 끼어 있으면 퇴소일로 선택할 수 없음
     (안내 토스트 후 누른 날짜가 새 입소일이 됨, off 인 날도 마찬가지)
   - data-max-days="N" : 입소일·퇴소일을 모두 포함해 최대 N일까지만 선택 가능 (생략하면 제한 없음, 넘으면 위와 같이 처리)
========================================================= */
function initRangeCalendar($wrap, calendarEl) {
  var $popup = $wrap.closest(".layer-popup");
  var $in = $($wrap.data("in"));
  var single = !$wrap.data("out");
  var $out = single ? $() : $($wrap.data("out"));
  var status = resolveDateStatus($wrap.data("status")) || {};
  var reverseMode = $wrap.hasClass("reverse"); // reverse 클래스가 있으면 data-status 에 "on" 으로 적은 날짜만 선택 가능
  var maxDays = parseInt($wrap.data("max-days"), 10) || 0; // 입소일·퇴소일을 모두 포함한 최대 선택 일수 (0 이면 제한 없음)
  var stateText = { wait: "접수전", full: "불가", done: "대관완료", off: "", on: "" };
  var legendHtml = $wrap.children(".rc-legend").html() || "";
  var holidaySet = buildHolidaySet($wrap);
  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var sIn = null;
  var sOut = null;

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }
  function fmt(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function parse(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  function stateOf(d) {
    var st = status[fmt(d)];
    return stateText.hasOwnProperty(st) ? st : "";
  }
  /* 선택 가능한 날 : 기본은 상태가 없거나 "on" 인 날, reverse 는 "on" 인 날만 */
  function selectable(d) {
    var st = stateOf(d);
    return reverseMode ? st === "on" : st === "" || st === "on";
  }
  function daysBetween(a, b) {
    return Math.round((b - a) / 86400000);
  }
  /* 시작일과 종료일 사이(양 끝 제외)에 상태가 있는 날이 하나라도 있는지 */
  function hasBlockedBetween(a, b) {
    for (var t = new Date(a.getFullYear(), a.getMonth(), a.getDate() + 1); t < b; t.setDate(t.getDate() + 1)) {
      if (!selectable(t)) return true;
    }
    return false;
  }
  /* 안내 문구 : 공통 토스트(showToast), 없으면 alert */
  function notify(msg) {
    if (typeof window.showToast === "function") window.showToast(msg, "warning", 3000);
    else alert(msg);
  }

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "multiMonthTwo",
    views: { multiMonthTwo: { type: "multiMonth", duration: { months: 2 }, dateIncrement: { months: 1 } } },
    multiMonthMaxColumns: 2,
    multiMonthMinWidth: 280,
    showNonCurrentDates: false,
    fixedWeekCount: false,
    height: "auto",
    headerToolbar: { left: "prev", center: "", right: "next" },
    validRange: { start: fmt(new Date(today.getFullYear(), today.getMonth(), 1)) },
    multiMonthTitleFormat: function (arg) {
      return arg.date.year + ". " + (arg.date.month + 1);
    },
    dayHeaderContent: function (arg) {
      return ["일", "월", "화", "수", "목", "금", "토"][arg.date.getDay()];
    },
    dayCellClassNames: function (arg) {
      var st = stateOf(arg.date);
      var cls = [];
      if (st) cls.push(st);
      if (!selectable(arg.date) || arg.date < today) cls.push("disabled");
      if (holidaySet[fmt(arg.date)]) cls.push("fc-day-holiday");
      return cls;
    },
    dayCellContent: function (arg) {
      var st = stateOf(arg.date);
      return { html: '<span class="rc-num">' + arg.date.getDate() + '</span><em class="rc-state">' + (st ? stateText[st] : "") + "</em>" };
    },
    datesSet: function () {
      setTimeout(decorate, 0);
    },
    dateClick: function (info) {
      if (info.dayEl.classList.contains("disabled") || info.dayEl.classList.contains("fc-day-other")) return;
      var d = parse(info.dateStr);
      if (single) {
        sIn = d;
        sOut = null;
      } else if (!sIn || sOut || d <= sIn) {
        sIn = d;
        sOut = null;
      } else {
        /* 입소일 ~ 종료일 사이에 상태(접수전·불가·대관완료)가 있는 날이 끼어 있거나 최대 일수를 넘으면
           종료일로 받지 않고 안내 후 누른 날짜를 새 입소일로 다시 시작함 */
        var msg = hasBlockedBetween(sIn, d) ? "선택한 기간 사이에 신청할 수 없는 날짜가 포함되어 있습니다." : maxDays && daysBetween(sIn, d) + 1 > maxDays ? "최대 " + maxDays + "일까지 선택할 수 있습니다." : "";
        if (msg) {
          notify(msg);
          sIn = d;
          sOut = null;
        } else {
          sOut = d;
        }
      }
      paint();
    },
  });

  calendar.render();
  $wrap.data("calendarInstance", calendar);

  /* 팝업이 닫힌 채 그려져 크기가 0 이면 열릴 때 다시 맞춤 */
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () {
      requestAnimationFrame(function () {
        calendar.updateSize();
      });
    });
    ro.observe(calendarEl);
  }

  /* 모바일에서 달마다 보이는 범례를 각 달 아래에 붙이고 선택 상태를 다시 칠함 */
  function decorate() {
    if (legendHtml) {
      $(calendarEl)
        .find(".fc-multimonth-month")
        .each(function () {
          if (!$(this).children(".rc-legend-month").length) {
            $(this).append('<ul class="rc-legend rc-legend-month">' + legendHtml + "</ul>");
          }
        });
    }
    paint();
  }

  function paint() {
    $(calendarEl)
      .find(".fc-daygrid-day[data-date]")
      .each(function () {
        var $td = $(this);
        var $em = $td.find(".rc-state");
        if (!$em.length) return;
        var d = parse($td.attr("data-date"));
        var st = stateOf(d);
        var label = st ? stateText[st] : "";
        $td.removeClass("sel in out between range-start range-end");
        if (sIn && d.getTime() === sIn.getTime()) {
          $td.addClass("sel in" + (sOut ? " range-start" : ""));
          label = "입소";
        }
        if (sOut && d.getTime() === sOut.getTime()) {
          $td.addClass("sel out range-end");
          label = "퇴소";
        }
        if (sIn && sOut && d > sIn && d < sOut) $td.addClass("between");
        $em.text(label);
      });
  }

  function sync() {
    sIn = parse($in.val());
    sOut = single ? null : parse($out.val());
    if (!sIn || !sOut) sOut = null;
    calendar.gotoDate(sIn && sIn >= today ? fmt(sIn) : fmt(today));
    setTimeout(function () {
      calendar.updateSize();
      decorate();
    }, 50);
  }

  function close() {
    $popup.find(".head .close").trigger("click");
  }

  $in.add($out).on("click", sync);
  $popup.on("click", ".rc-cancel", close);
  $popup.on("click", ".rc-apply", function () {
    if (!sIn || (!single && !sOut)) {
      alert(single ? "입소일자를 선택해 주세요." : "입소일자와 퇴소일자를 모두 선택해 주세요.");
      return;
    }
    $in.val(fmt(sIn)).trigger("input");
    if (!single) $out.val(fmt(sOut)).trigger("input");
    close();
  });
}

/* 공휴일 날짜 모음 : window.holidays, .calendar-wrap 의 data-holidays='["YYYY-MM-DD", ...]', 일정(events) 중 type 이 holiday 인 날짜 */
function buildHolidaySet($wrap, events) {
  var set = {};
  (Array.isArray(window.holidays) ? window.holidays : []).forEach(function (d) {
    set[d] = true;
  });
  ($wrap.data("holidays") || []).forEach(function (d) {
    set[d] = true;
  });
  ($wrap.data("events") || events || []).forEach(function (ev) {
    if (ev && ev.extendedProps && ev.extendedProps.type === "holiday" && ev.start) set[String(ev.start).slice(0, 10)] = true;
  });
  return set;
}

/* =========================================================
   일정 내용보기 팝업 : 페이지에 .layer-popup[data-popup="popupSchedule"] 이 있으면 notice 달력의 알약을 PC에서 눌렀을 때 그 일정의 내용을 채워서 엶
   - 일정 찾는 순서 : 1) window.scheduleListByMonth['YYYY-MM'] 에서 제목 · 날짜가 같은 항목  2) 없으면 달력 일정 데이터(window.scheduleEvents / data-events) 자체 (일정 목록이 없는 페이지도 열림)
   - 달력 일정 데이터로 열 때는 extendedProps 의 place · content · dept · typeLabel … 가 팝업 칸에 채워지고, 없는 값은 '-'
   - 팝업 칸 : [data-field="title|dept|type|date|place|deadline|fee|content"]. type 칸은 typeLabel(없으면 category)을 보여 줌
   - 모바일(768px 이하)은 한 날짜에 일정이 여러 개일 때 하나만 열리지 않도록 달력에서는 열지 않음 (일정 목록의 행 · 카드를 눌러서 열고, 그때는 window.fillSchedulePopup(item) 으로 채움)
   ========================================================= */
window.fillSchedulePopup = function (item) {
  var $p = $('.layer-popup[data-popup="popupSchedule"]');
  $p.find("[data-field]").each(function () {
    var key = $(this).attr("data-field");
    var val = key === "type" ? item.typeLabel || item.category : item[key];
    $(this).text(val || "-");
  });
};

$(document).on("click", '.calendar-wrap[data-type="notice"] .fc-daygrid-day.has-event', function (e) {
  if ($(this).hasClass("fc-day-other")) return;
  if (window.matchMedia("(max-width: 768px)").matches) return;
  if (!$('.layer-popup[data-popup="popupSchedule"]').length) return;

  var date = $(this).attr("data-date");
  var title = $(e.target).closest(".event-pill").text();
  if (!title) return;

  var TYPE_LABEL = { edu: "교육·연수", event: "행사", etc: "기타", holiday: "공휴일" };
  var item = null;
  ((window.scheduleListByMonth || {})[date.slice(0, 7)] || []).forEach(function (it) {
    var d = String(it.date || "").split(" ~ ");
    if (!item && it.title === title && d[0] <= date && date <= d[d.length - 1]) item = it;
  });
  if (!item) {
    var events = $(this).closest(".calendar-wrap").data("events") || window.scheduleEvents || [];
    events.forEach(function (ev) {
      if (item || ev.title !== title || String(ev.start).slice(0, 10) !== date) return;
      var ep = ev.extendedProps || {};
      item = $.extend({ title: ev.title, date: date, typeLabel: ep.typeLabel || TYPE_LABEL[ep.type] }, ep);
    });
  }
  if (!item) return;
  window.fillSchedulePopup(item);
  if (window.openLayerPopup) window.openLayerPopup("popupSchedule");
});
