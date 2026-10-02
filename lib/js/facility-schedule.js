document.addEventListener("DOMContentLoaded", function () {
  $(".bx.facility-schedule").each(function () {
    var $wrap = $(this);
    var data = $wrap.data("scheduleData") || window.facilityScheduleData || {};
    var $date = $wrap.find(".fs-date");
    var $scroll = $wrap.find(".fs-scroll");
    var days = ["일", "월", "화", "수", "목", "금", "토"];

    function formatDate(dateStr) {
      var d = new Date(dateStr + "T00:00:00");
      return (d.getMonth() + 1) + "월 " + d.getDate() + "일 (" + days[d.getDay()] + ")";
    }

    function render(dateStr) {
      $date.text(formatDate(dateStr));
      $scroll.empty();

      var floors = data[dateStr];
      if (!floors || !floors.length) {
        $scroll.append('<p class="fs-empty">등록된 예약 일정이 없습니다.</p>');
        return;
      }

      floors.forEach(function (floor) {
        var $group = $('<div class="fs-floor-group"></div>');
        $group.append($('<div class="fs-floor-label"></div>').text(floor.floor));
        floor.rooms.forEach(function (row) {
          var $row = $('<div class="fs-row"></div>');
          $row.append($('<p class="fs-room"></p>').text(row.room));
          $row.append($('<p class="fs-time"></p>').text(row.time));
          $row.append($('<p class="fs-title"></p>').text(row.title));
          $group.append($row);
        });
        $scroll.append($group);
      });
    }

    var defaultDate = $wrap.data("defaultDate") || Object.keys(data)[0];
    if (defaultDate) render(defaultDate);

    $wrap.data("facilityScheduleApi", { goToDate: render });
  });
});
