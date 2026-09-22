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
    container.kakaoMapClearPin = closeOverlay;
    // 검색 결과 0개일 때 외부(검색 스크립트)에서 핀을 지울 수 있도록 노출

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

function initKakaoMapUniv() {
  if (!window.kakao || !kakao.maps) return;

  var container = document.getElementById("map");
  if (!container) return;

  var $items = $(".univ-item");
  if (!$items.length) return;

  var districtColors = { 1: "#ff1617", 2: "#ff904b", 3: "#fddf58", 4: "#7ed956", 5: "#35b8fd" };
  var darkTextDistricts = { 3: true, 4: true };

  var geocoder = new kakao.maps.services.Geocoder();
  var places = new kakao.maps.services.Places();
  var map = new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(37.5665, 126.978),
    level: 8,
  });

  container.kakaoMapInstance = map;

  var markers = [];
  var currentOverlay = null;
  var parishOverlay = null;
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

  function openOverlay($item) {
    closeOverlay();
    $item.addClass("active");

    var latlng = $item.data("_latlng");
    var name = $item.data("name");
    var district = $item.data("district");
    var community = $item.data("community");
    var parish = $item.data("parish");
    var parishLink = $item.data("parish-link");

    var html = ['<div class="map-overlay univ-overlay">', '<span class="ov-close"></span>', "<p class=\"ov-name\">" + name + "</p>", "<p class=\"ov-address\"><strong>지구</strong>" + district + "지구</p>"];

    if (community) {
      html.push("<p class=\"ov-address\"><strong>공동체</strong>" + community + "</p>");
    }
    if (parish) {
      html.push("<p class=\"ov-address\"><strong>관할성당</strong>" + parish + "</p>");
    }
    if (parishLink) {
      html.push('<a href="' + parishLink + '" target="_blank" class="ov-btn">성당 홈페이지</a>');
    }
    html.push("</div>");

    currentOverlay = new kakao.maps.CustomOverlay({
      position: latlng,
      content: html.join(""),
      yAnchor: 1.15,
      zIndex: 10,
      map: map,
    });

    setTimeout(function () {
      $(".univ-overlay .ov-close").on("click", function () {
        closeOverlay();
      });
    }, 0);

    if (window.innerWidth <= 768) {
      map.setCenter(latlng);
      setTimeout(function () {
        var overlayHeight = $(".univ-overlay").outerHeight() || 150;
        map.panBy(0, -(overlayHeight / 2));
      }, 50);
    } else {
      map.setCenter(latlng);
    }
  }

  function createMarker($item, latlng) {
    var district = String($item.data("district"));
    var color = districtColors[district] || "#111";
    var textColor = darkTextDistricts[district] ? "#000" : "#fff";
    var name = $item.data("name");

    $item.data("_latlng", latlng);

    var el = document.createElement("div");
    el.className = "univ-marker";
    el.style.background = color;
    el.style.color = textColor;
    el.textContent = "🏛️ " + name;
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      if (district === "office") return;
      openOverlay($item);
    });

    var overlay = new kakao.maps.CustomOverlay({
      position: latlng,
      content: el,
      yAnchor: 1,
      zIndex: 1,
      map: map,
    });

    markers.push({ $item: $item, overlay: overlay, latlng: latlng, district: district });
    bounds.extend(latlng);
  }

  var SCHOOL_ZOOM_LEVEL = 4;

  function fitVisibleBounds() {
    var visibleBounds = new kakao.maps.LatLngBounds();
    var any = false;

    markers.forEach(function (m) {
      if (m.overlay.getMap()) {
        visibleBounds.extend(m.latlng);
        any = true;
      }
    });

    if (any) map.setBounds(visibleBounds);
  }

  function applyDistrictFilter(val) {
    markers.forEach(function (m) {
      var show = !val || m.district === "office" || m.district === String(val);
      m.overlay.setMap(show ? map : null);
    });

    closeOverlay();
    clearParishMarker();
    fitVisibleBounds();
  }

  function clearParishMarker() {
    if (parishOverlay) {
      parishOverlay.setMap(null);
      parishOverlay = null;
    }
  }

  function showParishMarker(name) {
    clearParishMarker();
    if (!name) return;

    places.keywordSearch(name, function (result, status) {
      if (status !== kakao.maps.services.Status.OK || !result[0]) return;

      var latlng = new kakao.maps.LatLng(result[0].y, result[0].x);
      var el = document.createElement("div");
      el.className = "univ-marker parish-marker";
      el.textContent = "⛪ " + name;

      parishOverlay = new kakao.maps.CustomOverlay({
        position: latlng,
        content: el,
        yAnchor: 1,
        zIndex: 2,
        map: map,
      });
    });
  }

  function bindFilters() {
    var $filterWrap = $(container).closest("section").find(".search-wrap");
    var $districtSelect = $filterWrap.find(".select-box-wrap").eq(0);
    var $schoolSelect = $filterWrap.find(".select-box-wrap").eq(1);

    function filterSchoolOptions(val) {
      $schoolSelect.find(".select-box-list-wr li").each(function () {
        var $li = $(this);
        var liDistrict = $li.data("district");
        $li.toggle(!val || !liDistrict || String(liDistrict) === String(val));
      });

      $schoolSelect.find("input[type='hidden']").val("");
      $schoolSelect.find(".select-label p").text("전체 단위대 보기").addClass("placeholder");
    }

    $districtSelect.find(".select-box-list-wr li").on("click", function () {
      var val = $(this).data("value");
      applyDistrictFilter(val);
      filterSchoolOptions(val);
    });

    $schoolSelect.find(".select-box-list-wr li").on("click", function () {
      var idx = $(this).data("value");

      if (!idx) {
        closeOverlay();
        clearParishMarker();
        fitVisibleBounds();
        return;
      }

      var $target = $items.filter('[data-idx="' + idx + '"]');
      if (!$target.length || !$target.data("_latlng")) return;

      var match = markers.filter(function (m) {
        return m.$item.is($target);
      })[0];
      if (match) match.overlay.setMap(map);

      openOverlay($target);
      map.setLevel(SCHOOL_ZOOM_LEVEL);
      showParishMarker($target.data("parish"));
    });
  }

  $items.each(function () {
    var $item = $(this);
    var address = $item.data("address");
    var name = $item.data("name");

    function finish(result) {
      done++;

      if (result) {
        var latlng = new kakao.maps.LatLng(result.y, result.x);
        createMarker($item, latlng);
      } else {
        console.warn("좌표를 찾을 수 없습니다:", address, name);
      }

      if (done === total) {
        if (!bounds.isEmpty()) map.setBounds(bounds);
        bindFilters();
      }
    }

    geocoder.addressSearch(address, function (result, status) {
      if (status === kakao.maps.services.Status.OK && result[0]) {
        finish(result[0]);
        return;
      }

      // 주소 지오코딩 실패 시 학교명 키워드 검색으로 재시도
      places.keywordSearch(name, function (result2, status2) {
        if (status2 === kakao.maps.services.Status.OK && result2[0]) {
          finish(result2[0]);
        } else {
          finish(null);
        }
      });
    });
  });
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
