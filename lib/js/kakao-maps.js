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

    container.kakaoMapInstance = map;

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

    container.kakaoMapInstance = map;

    function resolveLogoUrl() {
      if (!container.classList.contains("logo")) return null;

      var raw = getComputedStyle(container).getPropertyValue("--logo").trim();
      var match = raw.match(/url\((['"]?)(.*?)\1\)/);
      if (!match) return null;

      var rawPath = match[2];
      var imgIndex = rawPath.indexOf("img/");
      if (imgIndex === -1) return null;
      var relativeFromImg = rawPath.slice(imgIndex + 4);

      var scriptEl = document.querySelector('script[src*="lib/js/"]');
      if (!scriptEl) return null;

      var scriptUrl = new URL(scriptEl.getAttribute("src"), document.baseURI).href;
      var libRoot = scriptUrl.slice(0, scriptUrl.indexOf("lib/js/")) + "lib/img/";

      return libRoot + relativeFromImg;
    }

    geocoder.addressSearch(address, function (result, status) {
      if (status !== kakao.maps.services.Status.OK) return;
      var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

      new kakao.maps.Marker({ position: coords, map: map });
      map.setCenter(coords);

      var logoUrl = resolveLogoUrl();
      var content = null;

      if (logoUrl) {
        var maxW = parseFloat(getComputedStyle(container).getPropertyValue("--logo-max-w")) || 194;
        var ratioStr = getComputedStyle(container).getPropertyValue("--logo-ratio").trim(); // "194 / 36"
        var ratioParts = ratioStr.split("/").map(function (n) {
          return parseFloat(n);
        });
        var h = ratioParts.length === 2 ? Math.round((maxW * ratioParts[1]) / ratioParts[0]) : Math.round(maxW * 0.186);

        var wrap = document.createElement("div");
        wrap.className = "map-overlay logo-only";

        var img = document.createElement("img");
        img.src = logoUrl;
        img.alt = "";
        img.width = maxW;
        img.height = h;
        img.style.maxWidth = "none";

        wrap.appendChild(img);

        var etc = container.dataset.etc || "";
        if (etc) {
          var etcEl = document.createElement("p");
          etcEl.className = "ov-etc";
          etcEl.textContent = etc;
          wrap.appendChild(etcEl);
        }

        content = wrap;
        var overlayYAnchor = etc ? 1.6 : 1.9;
      }

      if (content) {
        new kakao.maps.CustomOverlay({
          position: coords,
          content: content,
          yAnchor: overlayYAnchor,
          map: map,
        });
      }
    });
  }
}

function initKakaoMapPins() {
  if (!window.kakao || !kakao.maps) return;

  var container = document.getElementById("map");
  if (!container) return;

  var $items = $(".map-list-item");
  if (!$items.length) return;

  var geocoder = new kakao.maps.services.Geocoder();
  var map = new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(37.5665, 126.978),
    level: 8,
  });

  var currentOverlay = null;
  var bounds = new kakao.maps.LatLngBounds();
  var total = $items.length;
  var done = 0;

  function closeOverlay() {
    if (currentOverlay) {
      currentOverlay.setMap(null);
      currentOverlay = null;
    }
    $items.removeClass("active");
  }

  function openOverlay($item, latlng) {
    closeOverlay();
    $item.addClass("active");

    var name = $item.data("name");
    var address = $item.data("address");
    var dirUrl = "https://map.kakao.com/link/to/" + encodeURIComponent(name) + "," + latlng.getLat() + "," + latlng.getLng();

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
      });
    }, 0);
  }

  // 지오코딩 완료 시점에 showPin() 같은 자동 오버레이 호출을 하지 않음 -> 클릭 전엔 정보 안 뜸
  $items.each(function () {
    var $item = $(this);
    var address = $item.data("address");

    geocoder.addressSearch(address, function (result, status) {
      done++;

      if (status === kakao.maps.services.Status.OK && result[0]) {
        var latlng = new kakao.maps.LatLng(result[0].y, result[0].x);
        $item.data("lat", result[0].y);
        $item.data("lng", result[0].x);

        // 핀마다 각자 마커 생성 (하나만 두고 교체하는 방식이 아님) -> 전체 핀이 다 보임
        var marker = new kakao.maps.Marker({ position: latlng, map: map });
        kakao.maps.event.addListener(marker, "click", function () {
          openOverlay($item, latlng);
        });

        bounds.extend(latlng);
      } else {
        console.warn("주소를 찾을 수 없습니다:", address);
      }

      // 전체 핀이 다 보이도록 지도 범위를 자동으로 맞춤 (고정 레벨 안 씀) -> 축소 문제 해결
      if (done === total && !bounds.isEmpty()) {
        map.setBounds(bounds);
      }
    });
  });
}
