function initTimezone() {
  const TIME_START = 9; // 09:00
  const TIME_END = 22; // 22:00
  const ROW_HEIGHT = 35; // 1시간당 px

  $(".bx.timezone-wrap").each(function () {
    const $widget = $(this);
    const apiUrl = $widget.data("api");

    // ---- 시간 → px 위치 변환 ----
    function timeToY(timeStr) {
      const [h, m] = timeStr.split(":").map(Number);
      return (h - TIME_START + m / 60) * ROW_HEIGHT;
    }

    // ---- 데모/테스트용 임시 데이터 ----
    function getMockData() {
      return {
        date: "2026-05-20",
        dateLabel: "5월 20일 (수)",
        rooms: [
          {
            id: "theater",
            name: "다리소극장(공연장)",
            floor: "지하1층",
            reservations: [
              { start: "09:00", end: "13:30", status: "approved" },
              { start: "17:00", end: "21:00", status: "standby" },
            ],
          },
          {
            id: "room10",
            name: "모임방 10",
            floor: "3F",
            reservations: [
              { start: "13:00", end: "17:00", status: "standby" },
              { start: "20:00", end: "21:30", status: "approved" },
            ],
          },
          {
            id: "room78",
            name: "모임방7+8",
            floor: "4F",
            reservations: [],
          },
          {
            id: "room3",
            name: "모임방 3",
            floor: "5F",
            reservations: [{ start: "13:00", end: "16:00", status: "approved", applicant: "이*안", roomLabel: "스스로공부방" }],
          },
          {
            id: "youth",
            name: "청소년동아리방",
            floor: "3F",
            reservations: [{ start: "10:30", end: "13:30", status: "standby" }],
          },
        ],
      };
    }

    /* =========================================================
      [개발 연동 지점] 일정 데이터 API
      -----------------------------------------------------
      엔드포인트: $widget.data('api')에 지정된 URL (예: data-api="/api/schedule")
      요청: GET {API_URL}?date=YYYY-MM-DD
      응답 형식(JSON):
      {
        "date": "2026-05-20",
        "dateLabel": "5월 20일 (수)",   // 화면 좌측 상단에 표시될 날짜 텍스트
        "rooms": [
          {
            "id": "theater",            // 방 고유 식별자 (DB 기본키 등, 화면엔 안 보임)
            "name": "다리소극장(공연장)", // 컬럼 헤더에 표시될 방 이름
            "floor": "지하1층",          // 우측 상단 층 필터 그룹핑 기준
            "reservations": [
              {
                "start": "09:00",       // 시작 시각 (HH:mm, 24시간제)
                "end": "13:30",         // 종료 시각 (HH:mm, 24시간제)
                "status": "approved",   // "approved"(승인, 주황) | "standby"(대기, 회색)
                "applicant": "이*안",    // 선택값. 있으면 툴팁에 신청자명 같이 표시
                "roomLabel": "스스로공부방" // 선택값. 있으면 방 이름 대신 이 텍스트를 툴팁에 표시
              }
            ]
          }
        ]
      }

      - rooms 배열의 순서가 곧 화면에 가로로 나열되는 컬럼 순서임
      - reservations가 빈 배열이면 해당 방은 막대 없이 빈 컬럼으로만 표시됨
      - API 호출이 실패(404, 네트워크 에러 등)하면 getMockData()의 더미 데이터로
        자동 대체되어 화면이 비지 않음 (콘솔에 warning 로그 출력)
    ========================================================= */
    function fetchSchedule(date) {
      if (!apiUrl) {
        return Promise.resolve(getMockData());
      }
      return fetch(apiUrl + (date ? "?date=" + date : ""))
        .then(function (res) {
          if (!res.ok) throw new Error("schedule fetch failed: " + res.status);
          return res.json();
        })
        .catch(function (err) {
          console.warn("일정 데이터를 불러오지 못해 임시 데이터로 표시합니다.", err);
          return getMockData();
        });
    }

    let currentData = null;
    let currentFloor = "전체";
    let timeLabelsRendered = false; // 09:00~22:00 라벨은 데이터가 바뀌어도 동일하므로 한 번만 그림

    // 정적 틀(.tz-date, .tz-floor-filter 등)은 마크업에 미리 있으므로 매번 다시 찾지 않게 캐싱
    const $dateEl = $widget.find(".tz-date");
    const $floorFilter = $widget.find(".tz-floor-filter");
    const $timeCol = $widget.find(".tz-time-col");
    const $roomsTrack = $widget.find(".tz-rooms-track");
    const $tooltip = $widget.find(".tz-tooltip");

    function renderTimeLabelsOnce() {
      if (timeLabelsRendered) return;
      let html = "";
      for (let h = TIME_START; h <= TIME_END; h++) {
        html += '<div class="tz-time-label">' + String(h).padStart(2, "0") + ":00</div>";
      }
      $timeCol.append(html);
      timeLabelsRendered = true;
    }

    function render(data) {
      currentData = data;

      const floors = ["전체"].concat(
        Array.from(
          new Set(
            data.rooms.map(function (r) {
              return r.floor;
            }),
          ),
        ),
      );

      const visibleRooms =
        currentFloor === "전체"
          ? data.rooms
          : data.rooms.filter(function (r) {
              return r.floor === currentFloor;
            });

      // ---- 방 컬럼 ----
      let roomsHtml = "";
      if (visibleRooms.length === 0) {
        roomsHtml = '<div class="tz-empty">해당 층의 공간이 없습니다.</div>';
      } else {
        visibleRooms.forEach(function (room) {
          // row-line은 첫 줄(09:00)이 top:0이 아니라 ROW_HEIGHT부터 시작하도록
          // (h - TIME_START + 1)로 한 칸씩 밀어서 그림
          let rowLinesHtml = "";
          for (let h = TIME_START; h <= TIME_END; h++) {
            const top = (h - TIME_START + 1) * ROW_HEIGHT;
            rowLinesHtml += '<div class="row-line" style="top:' + top + 'px;"></div>';
          }

          let barsHtml = "";
          room.reservations.forEach(function (rv) {
            const top = timeToY(rv.start);
            const bottom = timeToY(rv.end);
            const height = Math.max(bottom - top, 16);
            const statusClass = rv.status === "approved" ? "approved" : "standby";
            const label = (rv.roomLabel ? rv.roomLabel : room.name) + (rv.applicant ? "&nbsp;&nbsp;" + rv.applicant : "");
            const durationHour = ((timeToY(rv.end) - timeToY(rv.start)) / ROW_HEIGHT).toFixed(1).replace(/\.0$/, "");

            barsHtml += '<div class="tz-bar ' + statusClass + '" ' + 'style="top:' + top + "px; height:" + height + 'px;" ' + 'data-tooltip-label="' + label + '" ' + 'data-tooltip-time="' + rv.start + " ~ " + rv.end + " " + durationHour + '시간"></div>';
          });

          roomsHtml += '<div class="tz-room-col">' + '<div class="tz-room-header">' + room.name + "</div>" + '<div class="tz-room-body">' + rowLinesHtml + barsHtml + "</div>" + "</div>";
        });
      }

      // 전체 버튼에는 'all' 클래스를, 현재 선택된 층에는 'active' 클래스를 붙임
      const floorButtonsHtml = floors
        .map(function (f) {
          const classes = [];
          if (f === "전체") classes.push("all");
          if (f === currentFloor) classes.push("active");
          return '<button type="button" class="' + classes.join(" ") + '" data-floor="' + f + '">' + f + "</button>";
        })
        .join("");

      // ---- 정적 틀의 빈 자리만 채움. .tz-header/.tz-grid-area 등 틀 자체는 다시 만들지 않음 ----
      $dateEl.text(data.dateLabel);
      $floorFilter.html(floorButtonsHtml);
      renderTimeLabelsOnce();
      $roomsTrack.html(roomsHtml);

      bindDynamicEvents();
    }

    function bindDynamicEvents() {
      // 층 필터 클릭 (매번 새로 그려지는 버튼이라 off().on()으로 중복 바인딩 방지)
      $floorFilter
        .find("button")
        .off("click")
        .on("click", function () {
          currentFloor = $(this).data("floor");
          render(currentData);
        });

      // 막대 호버 → 툴팁
      // 툴팁 위치는 getBoundingClientRect()로 막대/위젯의 화면상 절대 좌표를 구한 뒤
      // 그 차이로 위젯 기준 상대 좌표를 계산함 (left/top은 막대의 정중앙 좌표).
      // CSS의 transform: translate(-50%, -50%)가 툴팁 자신의 크기만큼 당겨서
      // 그 중앙 좌표에 툴팁의 정중앙이 오도록 맞춰줌.
      $roomsTrack
        .find(".tz-bar")
        .off("mouseenter mouseleave")
        .on("mouseenter", function () {
          const $bar = $(this);
          const label = $bar.data("tooltip-label");
          const time = $bar.data("tooltip-time");
          const status = $bar.hasClass("approved") ? "approved" : "standby";

          // 이전에 호버했던 막대의 색상 클래스가 남아있지 않도록 매번 깨끗이 지우고 다시 붙임
          $tooltip
            .removeClass("approved standby")
            .addClass(status)
            .html("<strong>" + label + "</strong><br>" + time);

          const barRect = this.getBoundingClientRect();
          const widgetRect = $widget[0].getBoundingClientRect();

          const left = barRect.left + barRect.width / 2 - widgetRect.left;
          const top = barRect.top + barRect.height / 2 - widgetRect.top;

          $tooltip.css({ left: left + "px", top: top + "px" }).addClass("show");
        })
        .on("mouseleave", function () {
          $tooltip.removeClass("show");
        });
    }

    fetchSchedule().then(render);
  });
}

$(function () {
  initTimezone();
});
