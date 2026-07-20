function initKakaoMap() {
  if (!window.kakao || !kakao.maps) return;

  var container = document.getElementById("map");
  if (!container) return;

  var $items = $(".map-list-item");
  var geocoder = new kakao.maps.services.Geocoder();

  /* =========================================================
     기관검색 지도 (map-list-item 있을 때)
  ========================================================= */
  if ($items.length) {
    var map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 5,
    });

    var currentMarker = null;
    var currentOverlay = null;
    var total = $items.length;
    var done = 0;

    function closeOverlay() {
      if (currentOverlay) {
        currentOverlay.setMap(null);
        currentOverlay = null;
      }
      if (currentMarker) {
        currentMarker.setMap(null);
        currentMarker = null;
      }
    }

    function showPin($item) {
      closeOverlay();

      var lat = $item.data("lat");
      var lng = $item.data("lng");
      var name = $item.data("name");
      var address = $item.data("address");
      var latlng = new kakao.maps.LatLng(lat, lng);
      var dirUrl = "https://map.kakao.com/link/to/" + encodeURIComponent(name) + "," + lat + "," + lng;

      currentMarker = new kakao.maps.Marker({ position: latlng, map: map });

      var content = ['<div class="map-overlay">', '<span class="ov-close"></span>', '<p class="ov-name">' + name + "</p>", '<p class="ov-address">주소 ' + address + "</p>", '<a href="' + dirUrl + '" target="_blank" class="ov-btn">길찾기</a>', "</div>"].join("");

      currentOverlay = new kakao.maps.CustomOverlay({
        position: latlng,
        content: content,
        yAnchor: 1.45,
        map: map,
      });

      setTimeout(function () {
        $(".map-overlay .ov-close").on("click", function () {
          closeOverlay();
          $items.removeClass("active");
        });
      }, 0);

      if (window.innerWidth <= 768) {
        // ✅ 항상 핀 위치로 먼저 리셋 → panBy는 항상 같은 기준에서 출발
        map.setCenter(latlng);
        setTimeout(function () {
          var overlayHeight = $(".map-overlay").outerHeight() || 150;
          map.panBy(0, -(overlayHeight / 2));
        }, 50);
      } else {
        map.setCenter(latlng);
      }
    }

    // 주소 → 좌표 변환 후 첫 번째 핀 활성화
    $items.each(function () {
      var $item = $(this);
      var address = $item.data("address");

      geocoder.addressSearch(address, function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
          $item.data("lat", result[0].y);
          $item.data("lng", result[0].x);
        }
        done++;
        if (done === total) {
          $items.first().addClass("active");
          showPin($items.first());
          map.setCenter(new kakao.maps.LatLng($items.first().data("lat"), $items.first().data("lng")));
        }
      });
    });

    $items.on("click", function () {
      $items.removeClass("active");
      $(this).addClass("active");
      showPin($(this));
    });

    /* =========================================================
     단순 핀 지도 — data-address 기반 geocoder 처리
  ========================================================= */
  } else {
    var address = container.dataset.address || "";
    if (!address) return;

    var map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 4,
    });

    geocoder.addressSearch(address, function (result, status) {
      if (status !== kakao.maps.services.Status.OK) return;
      var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
      new kakao.maps.Marker({ position: coords, map: map });
      map.setCenter(coords);
    });
  }
}
