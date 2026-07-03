document.addEventListener("DOMContentLoaded", function () {
  initializeCommonFeatures();
});

/* 공통 기능들 초기화 */
function initializeCommonFeatures() {
  setGnbMaxHeight();
  bindNavEvents();
  initHeaderInvert();
  initMainSlider();
  initThumbSlider();
  initArchSlider();
  initTextImageSlider();
  initScheduleSlider();
  initTab();
  initMap();
  initFamilySite();
}
/* GNB 영역 */
function setGnbMaxHeight() {
  $("header").each(function () {
    var $header = $(this);
    var maxHeight = 0;

    $header.find("#gnb > ul > li.dep1 > .dep2-wrap").each(function () {
      var $wrap = $(this);
      $wrap.css({ display: "block", visibility: "hidden", height: "auto" });
      var h = $wrap.outerHeight();
      $wrap.css({ display: "none", visibility: "" });
      if (h > maxHeight) maxHeight = h + 36;
    });

    this.style.setProperty("--gnb-bgH", maxHeight + "px");
  });
}

function bindNavEvents() {
  $("header .inner #gnb > ul > li.dep1").off();
  $("header .inner #gnb").off();
  $("header .inner #gnb > ul > li.dep1 > a").off();
  $("header .menu").off();

  $("header").each(function () {
    var $header = $(this);

    if ($(window).width() > 1240) {
      $header.find(".inner #gnb > ul > li.dep1").hover(function () {
        if ($("body").hasClass("menu-open") && !$header.hasClass("typeC")) return;
        var $this = $(this);
        if (!$header.hasClass("typeB")) {
          $header.find(".inner").addClass("wide");
        }
        $header.find(".inner #gnb").addClass("on");
        $header.find(".inner #gnb > ul > li.dep1").not($this).removeClass("on");
        $this.addClass("on");
        $header.find(".inner #gnb > ul > li.dep1 > .dep2-wrap").stop().fadeIn(900);
      });

      $header.find(".inner #gnb").mouseleave(function () {
        if ($("body").hasClass("menu-open")) return;
        if (!$header.hasClass("typeB")) {
          $header.find(".inner").removeClass("wide");
        }
        $(this).removeClass("on");
        $header.find(".inner #gnb > ul > li.dep1").removeClass("on");
        $header.find(".inner #gnb > ul > li.dep1 > .dep2-wrap").stop().fadeOut(100);
      });
    } else {
      $header.find(".inner #gnb > ul > li.dep1 > a").on("click", function (event) {
        if ($(this).hasClass("single_depth") || $(this).parent(".dep1").hasClass("dir_menu")) {
          return;
        }
        event.preventDefault();

        const $parentLi = $(this).closest("#gnb > ul > li.dep1");
        if ($parentLi.hasClass("open")) {
          $parentLi.removeClass("open");
          $(this).siblings(".dep2-wrap").slideUp(250);
        } else {
          $header.find("#gnb > ul > li.dep1 > .dep2-wrap").slideUp(250);
          $header.find("#gnb > ul > li.dep1").removeClass("open");
          $parentLi.addClass("open");
          $(this).siblings(".dep2-wrap").slideDown(250);
        }
      });
    }

    $header.find(".menu").on("click", function (e) {
      if (!$(this).hasClass("close")) {
        $(this).addClass("close");
        $("body").addClass("menu-open");
        $(".quick-menu").hide();
        if ($(window).width() > 1240 && $header.hasClass("typeC")) {
          $header.find(".inner").addClass("wide");
          $header.find(".inner #gnb").addClass("on");
          $header.find(".inner #gnb > ul > li.dep1 > .dep2-wrap").stop().fadeIn(100);
        }
      } else {
        e.preventDefault();
        $(this).removeClass("close");
        $("body").removeClass("menu-open");
        $(".quick-menu").show();
        if ($(window).width() > 1240 && $header.hasClass("typeC")) {
          $header.find(".inner").removeClass("wide");
          $header.find(".inner #gnb").removeClass("on");
          $header.find(".inner #gnb > ul > li.dep1").removeClass("on");
          $header.find(".inner #gnb > ul > li.dep1 > .dep2-wrap").stop().fadeOut(100);
        }
      }
    });
  });
}

$(window).on("resize", function () {
  $("body").removeClass("menu-open");
  $("header .menu").removeClass("close");
  $("header .inner").removeClass("wide");
  $("header #gnb, header #gnb > ul > li.dep1").removeClass("on");
  setGnbMaxHeight();
  bindNavEvents();
});

/* 헤더 스크롤 */
function initHeaderInvert() {
  var $headers = $("header");

  function checkScroll() {
    if ($(window).scrollTop() > 0) {
      $headers.addClass("scroll");
    } else {
      $headers.removeClass("scroll");
    }
  }

  checkScroll();
  $(window).on("scroll", checkScroll);
}

/* 메인비주얼 swiper */
function initMainSlider() {
  $(".slider-wrap.main").each(function () {
    const $wrap = $(this);

    const $swiper = $wrap.find(".swiper").first();
    const type = $wrap.data("type");
    const useProgressBar = type === "typeB" || type === "typeC";
    const delay = $swiper.data("autoplay") || 3000;
    const $prev = $wrap.find(".prev");
    const $next = $wrap.find(".next");
    const $cur = $wrap.find(".cur");
    const $total = $wrap.find(".total");
    const $track = $wrap.find(".progress-track");
    const count = $swiper.find(".swiper-slide").length;

    $total.text(useProgressBar ? String(count).padStart(2, "0") : count);

    const $fill = $track.find(".seg-fill");

    function startProgress() {
      $fill.css({ transition: "none", width: "0%" });
      $fill[0].getBoundingClientRect();
      $fill.css({
        transition: `width ${delay}ms linear`,
        width: "100%",
      });
    }

    function pauseProgress() {
      const w = $fill.css("width");
      $fill.css({ transition: "none", width: w });
    }

    function resumeProgress() {
      const current = parseFloat($fill.css("width"));
      const parent = parseFloat($fill.parent().css("width"));
      const pct = (current / parent) * 100;
      const remain = ((100 - pct) / 100) * delay;
      $fill[0].getBoundingClientRect();
      $fill.css({
        transition: `width ${remain}ms linear`,
        width: "100%",
      });
    }

    function updateUI(sw) {
      const idx = sw.realIndex;
      const num = idx + 1;
      $cur.text(useProgressBar ? String(num).padStart(2, "0") : num);
      if (useProgressBar) startProgress();
    }

    const useSlideEffect = $swiper.hasClass("slide");
    const isMobileOnly = $swiper.hasClass("mobile-only");
    const autoplayEnabled = $swiper.data("autoplay-enable") === "enable";

    new Swiper($swiper[0], {
      loop: true,
      effect: useSlideEffect ? "slide" : "fade",
      allowTouchMove: true,
      autoplay: autoplayEnabled ? { delay: delay, disableOnInteraction: false } : false,
      navigation: { prevEl: $prev[0], nextEl: $next[0] },
      breakpoints: isMobileOnly ? { 0: { enabled: true }, 769: { enabled: false } } : undefined,
      on: {
        init(sw) {
          updateUI(sw);
        },
        slideChange(sw) {
          updateUI(sw);
        },
        autoplayPause() {
          if (useProgressBar) pauseProgress();
        },
        autoplayResume() {
          if (useProgressBar) resumeProgress();
        },
      },
    });
  });
}

/* 썸네일형 swiper */
function initThumbSlider() {
  $(".slider-wrap.thumbnail").each(function () {
    const $wrap = $(this);

    const $swiper = $wrap.find(".swiper").not(".thumb").first();
    const type = $wrap.data("type");
    const useProgressBar = type === "typeB" || type === "typeC" || true; // 항상 progress bar 사용
    const delay = $swiper.data("autoplay") || 3000;
    const $prev = $wrap.find(".prev");
    const $next = $wrap.find(".next");
    const $cur = $wrap.find(".cur");
    const $total = $wrap.find(".total");
    const $track = $wrap.find(".progress-track");
    const count = $swiper.find(".swiper-slide").length;

    $total.text(String(count).padStart(2, "0"));

    const $fill = $track.find(".seg-fill");

    function startProgress() {
      $fill.css({ transition: "none", width: "0%" });
      $fill[0].getBoundingClientRect();
      $fill.css({ transition: `width ${delay}ms linear`, width: "100%" });
    }

    function pauseProgress() {
      const w = $fill.css("width");
      $fill.css({ transition: "none", width: w });
    }

    function resumeProgress() {
      const current = parseFloat($fill.css("width"));
      const parent = parseFloat($fill.parent().css("width"));
      const pct = (current / parent) * 100;
      const remain = ((100 - pct) / 100) * delay;
      $fill[0].getBoundingClientRect();
      $fill.css({ transition: `width ${remain}ms linear`, width: "100%" });
    }

    const MOBILE_BREAKPOINT = 768;
    const THUMBS_PER_VIEW = 4;
    const $thumbSwiperEl = $wrap.find(".swiper.thumb");
    const thumbSwiper = new Swiper($thumbSwiperEl[0], {
      slidesPerView: THUMBS_PER_VIEW,
      slidesPerGroup: THUMBS_PER_VIEW,
      spaceBetween: 16,
      watchSlidesProgress: true,
      breakpoints: {
        0: { slidesPerView: 1.6, slidesPerGroup: 1, spaceBetween: 12, freeMode: true },
        768: { slidesPerView: THUMBS_PER_VIEW, slidesPerGroup: THUMBS_PER_VIEW, spaceBetween: 16, freeMode: false },
      },
    });
    const $thumbSlides = $thumbSwiperEl.find(".swiper-slide");

    let isFirstUpdate = true;

    function syncThumbActive(realIdx) {
      $thumbSlides.removeClass("is-active").eq(realIdx).addClass("is-active");
      if (isFirstUpdate) return;

      if (window.innerWidth > MOBILE_BREAKPOINT) {
        const pageIndex = Math.floor(realIdx / THUMBS_PER_VIEW);
        thumbSwiper.slideTo(pageIndex * THUMBS_PER_VIEW);
      } else {
        thumbSwiper.slideTo(realIdx);
      }
    }

    function updateUI(sw) {
      const idx = sw.realIndex;
      const num = idx + 1;
      $cur.text(String(num).padStart(2, "0"));
      startProgress();
      syncThumbActive(idx);
      isFirstUpdate = false;
    }

    const useSlideEffect = $swiper.hasClass("slide");
    const autoplayEnabled = $swiper.data("autoplay-enable") === "enable";

    const sw = new Swiper($swiper[0], {
      loop: true,
      effect: useSlideEffect ? "slide" : "fade",
      allowTouchMove: true,
      autoplay: autoplayEnabled ? { delay: delay, disableOnInteraction: false } : false,
      navigation: { prevEl: $prev[0], nextEl: $next[0] },
      on: {
        init(sw) {
          updateUI(sw);
        },
        slideChange(sw) {
          updateUI(sw);
        },
        autoplayPause() {
          pauseProgress();
        },
        autoplayResume() {
          resumeProgress();
        },
      },
    });

    $thumbSlides.on("click", function () {
      const targetIdx = $thumbSlides.index(this);
      sw.slideToLoop(targetIdx);
    });
  });
}

/* 부채꼴 swiper */
function initArchSlider() {
  $(".slider-wrap.arch").each(function () {
    const $wrap = $(this);
    const $swiperEl = $wrap.find(".swiper");
    if ($swiperEl.length === 0) return;

    const $wrapperEl = $swiperEl.find(".swiper-wrapper");

    // 슬라이드 복제 전에 원본 개수를 먼저 기록해둠 (카운터 표시 기준)
    const originalCount = $wrapperEl.find(".swiper-slide").length;

    if (!$wrap.data("archSlidesDuplicated")) {
      const originalHtml = $wrapperEl.html();
      $wrapperEl.html(originalHtml + originalHtml);
      $wrap.data("archSlidesDuplicated", true);
    }

    const $prevBtn = $wrap.find(".prev");
    const $nextBtn = $wrap.find(".next");
    const $cur = $wrap.find(".cur");
    const $total = $wrap.find(".total");
    const $track = $wrap.find(".progress-track");
    const $fill = $track.find(".seg-fill");

    $total.text(String(originalCount).padStart(2, "0"));

    const delay = $swiperEl.data("autoplay") || 3000;
    const autoplayEnabled = $swiperEl.data("autoplay-enable") === "enable";

    function startProgress() {
      $fill.css({ transition: "none", width: "0%" });
      $fill[0].getBoundingClientRect();
      $fill.css({
        transition: `width ${delay}ms linear`,
        width: "100%",
      });
    }

    function pauseProgress() {
      const w = $fill.css("width");
      $fill.css({ transition: "none", width: w });
    }

    function resumeProgress() {
      const current = parseFloat($fill.css("width"));
      const parent = parseFloat($fill.parent().css("width"));
      const pct = (current / parent) * 100;
      const remain = ((100 - pct) / 100) * delay;
      $fill[0].getBoundingClientRect();
      $fill.css({
        transition: `width ${remain}ms linear`,
        width: "100%",
      });
    }

    function updateUI(sw) {
      // 슬라이드가 2배로 복제되어 있으므로 원본 개수 기준으로 나머지 연산
      const num = (sw.realIndex % originalCount) + 1;
      $cur.text(String(num).padStart(2, "0"));
      startProgress();
    }

    const MOBILE_BREAKPOINT = 768;
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    const swiperOptions = {
      loop: true,
      slidesPerView: "auto",
      centeredSlides: true,
      loopAdditionalSlides: 5,
      navigation: {
        nextEl: $nextBtn[0],
        prevEl: $prevBtn[0],
      },
      autoplay: autoplayEnabled ? { delay: delay, disableOnInteraction: false } : false,
      on: {
        init(sw) {
          updateUI(sw);
        },
        slideChange(sw) {
          updateUI(sw);
        },
        autoplayPause() {
          pauseProgress();
        },
        autoplayResume() {
          resumeProgress();
        },
      },
    };

    if (isMobile) {
      swiperOptions.effect = "slide";
      swiperOptions.spaceBetween = 12;
      swiperOptions.allowTouchMove = true;
      swiperOptions.grabCursor = true;
    } else {
      swiperOptions.effect = "creative";
      swiperOptions.allowTouchMove = false;
      swiperOptions.grabCursor = false;
      swiperOptions.creativeEffect = {
        perspective: true,
        limitProgress: 5,
        prev: {
          translate: ["var(--arch-x-left)", "var(--arch-y)", -100],
          rotate: [0, 0, -23],
          origin: "bottom",
        },
        next: {
          translate: ["var(--arch-x-right)", "var(--arch-y)", -100],
          rotate: [0, 0, 23],
          origin: "bottom",
        },
      };
    }

    const sw = new Swiper($swiperEl[0], swiperOptions);

    // 화면 폭이 바뀌면(리사이즈, 디바이스 회전) effect 자체를 바꿔야 하는데
    // Swiper는 effect를 동적으로 못 바꾸므로 인스턴스를 파괴하고 다시 생성함
    let resizeTimer;
    $(window).on("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        const nowMobile = window.innerWidth <= MOBILE_BREAKPOINT;
        if (nowMobile !== isMobile) {
          sw.destroy(true, true);
          initArchSlider(); // 모드가 바뀌었을 때만 통째로 재초기화
        }
      }, 200);
    });
  });
}

/* 탭메뉴 */
function initTab() {
  $(".tab-wrap li").on("click", function () {
    const $clickedLi = $(this);
    const target = $clickedLi.data("tab");
    const $tabWrap = $clickedLi.closest(".tab-wrap");

    let $section = $tabWrap.parent();
    while ($section.length && $section.find(".tab-cont").length === 0) {
      $section = $section.parent();
    }

    const $tabCont = $section.find(".tab-cont");

    $tabWrap.find("li").removeClass("on");
    $clickedLi.addClass("on");

    $tabCont.removeClass("on");
    const $target = $tabCont.filter("#" + target).addClass("on");

    const sw = $target.data("swiperInstance");
    if (sw) {
      sw.update();
      sw.emit("slideChange");
      if (sw.params.autoplay && sw.params.autoplay.enabled) {
        sw.autoplay.stop();
        sw.autoplay.start();
      }
    }
  });

  $(".tab-cont").each(function () {
    const $wrap = $(this);
    const count = $wrap.find(".swiper-slide").length;

    if (count === 0) return; // 슬라이드 없는 탭 콘텐츠는 건너뜀

    const MOBILE_BREAKPOINT = 768;
    const MOBILE_VISIBLE_COUNT = 3; // 모바일에서 고정으로 보일 개수

    const delay = $wrap.data("autoplay") || 3000;
    const $prev = $wrap.find(".prev");
    const $next = $wrap.find(".next");
    const $cur = $wrap.find(".cur");
    const $total = $wrap.find(".total");
    const $track = $wrap.find(".progress-track");
    const $slides = $wrap.find(".swiper-slide");

    $total.text(String(count).padStart(2, "0"));

    const $fill = $track.find(".seg-fill");

    function updateProgressByRatio(sw) {
      let pct;
      if (sw.isEnd) {
        pct = 100;
      } else if (sw.isBeginning) {
        pct = (1 / count) * 100;
      } else {
        pct = ((sw.realIndex + 1) / count) * 100;
      }
      $fill.css({ transition: "width 0.3s ease", width: pct + "%" });
    }

    function updateUI(sw) {
      const idx = sw.realIndex;
      const num = idx + 1;
      $cur.text(String(num).padStart(2, "0"));
      updateProgressByRatio(sw);
    }

    const useSlideEffect = $wrap.hasClass("slide");
    const autoplayEnabled = $wrap.data("autoplay-enable") === "enable";

    let sw = null;
    let isMobileMode = null; // 최초 1회는 무조건 타도록 null로 시작

    function buildSwiper() {
      sw = new Swiper($wrap[0], {
        loop: false,
        slidesPerView: "auto",
        spaceBetween: 20,
        effect: useSlideEffect ? "slide" : "fade",
        allowTouchMove: true,
        autoplay: autoplayEnabled
          ? {
              delay: delay,
              disableOnInteraction: false,
            }
          : false,
        navigation: {
          prevEl: $prev[0],
          nextEl: $next[0],
        },
        on: {
          init(sw) {
            updateUI(sw);
          },
          slideChange(sw) {
            updateUI(sw);
          },
        },
      });
      $wrap.data("swiperInstance", sw);
    }

    function destroySwiper() {
      if (sw) {
        sw.destroy(true, true);
        sw = null;
        $wrap.data("swiperInstance", null);
      }
    }

    function refreshLayout() {
      const nowMobile = window.innerWidth <= MOBILE_BREAKPOINT;
      if (nowMobile === isMobileMode) return; // 모드 변화 없으면 아무것도 안 함
      isMobileMode = nowMobile;

      if (nowMobile) {
        destroySwiper();
        $slides.show().each(function (i) {
          if (i >= MOBILE_VISIBLE_COUNT) $(this).hide();
        });
      } else {
        $slides.show();
        buildSwiper();
      }
    }

    refreshLayout();
    $(window).on("resize", refreshLayout);
  });
}

/* 텍스트(fade) + 이미지(slide) 동기화 swiper */
function initTextImageSlider() {
  $(".slider-wrap.text-image").each(function () {
    const $wrap = $(this);
    const $textSwiperEl = $wrap.find(".swiper.text");
    const $imgSwiperEl = $wrap.find(".swiper.img");
    if ($textSwiperEl.length === 0 || $imgSwiperEl.length === 0) return;

    const $prev = $wrap.find(".prev");
    const $next = $wrap.find(".next");

    // 텍스트는 fade로 부드럽게 전환, 이미지는 slide로 옆에서 밀려옴
    const textSwiper = new Swiper($textSwiperEl[0], {
      loop: true,
      effect: "fade",
      slidesPerView: 1,
      allowTouchMove: false, // 텍스트 쪼은 직접 드래그하지 않고 이미지 쪼에 따라만 움직임
    });

    const imgSwiper = new Swiper($imgSwiperEl[0], {
      loop: true,
      effect: "slide",
      slidesPerView: "auto",
      allowTouchMove: true,
      navigation: {
        prevEl: $prev[0],
        nextEl: $next[0],
      },
      on: {
        slideChange(sw) {
          textSwiper.slideToLoop(sw.realIndex);
        },
      },
    });
  });
}

function initScheduleSlider() {
  $(".slider-wrap.schedule").each(function () {
    var $slider = $(this);

    var swiper = new Swiper($slider.find(".swiper")[0], {
      allowTouchMove: false,
      speed: 400,
      navigation: {
        nextEl: $slider.find(".btn.next")[0],
        prevEl: $slider.find(".btn.prev")[0],
      },
      breakpoints: {
        0: {
          slidesPerView: "auto",
          freeMode: true,
          freeModeMomentum: true,
          allowTouchMove: true,
        },
        1000: {
          slidesPerView: 6,
          slidesPerGroup: 6,
          allowTouchMove: false,
        }
      },
      on: {
        slideChange: function () {
          $slider.find(".swiper-slide").removeClass("on");
        }
      }
    });

    // PC hover / click — MO는 무시
    $slider.on("mouseenter click", ".swiper-slide", function () {
      $slider.find(".swiper-slide").removeClass("on"); // 다른 슬라이드 on 제거
      $(this).addClass("on");
    }).on("mouseleave", ".swiper-slide", function () {
      $(this).removeClass("on");
    });

    // 리사이즈 시 hover 상태 초기화
    $(window).on("resize", function () {
      $slider.find(".swiper-slide").removeClass("on");
    });
  });
}

function initMap() {

  function switchDistrict($wrap, num) {
    var $tbody  = $wrap.find("table tbody");
    var $dataEl = $wrap.find(".district-data");
    var allData = $dataEl.length ? JSON.parse($dataEl.text()) : {};
    var rows    = allData[num] || [];

    $tbody.empty();
    rows.forEach(function (row) {
      $tbody.append(
        "<tr>" + row.map(function (cell) { return "<td>" + cell + "</td>"; }).join("") + "</tr>"
      );
    });
  }

  $(".map-wrap").each(function () {
    var $mapWrap  = $(this);
    var $listPins = $mapWrap.find(".list > .pin");
    var $mapPins  = $mapWrap.find(".pin-wrap > .pin");

    function getCode($el) {
      var match = ($el.attr("class") || "").match(/\bc\d+\b/);
      return match ? match[0] : null;
    }

    $listPins.each(function () {
      var $listPin = $(this);
      var code = getCode($listPin);
      if (!code) return;
      var $mapPin = $mapPins.filter("." + code);
      if (!$mapPin.length) return;

      $listPin.on("mouseenter", function () {
        $mapPin.addClass("on").append("<p>" + $listPin.text() + "</p>");
      }).on("mouseleave", function () {
        $mapPin.removeClass("on").find("p").remove();
      });
    });

    $mapPins.each(function () {
      var $mapPin = $(this);
      var code = getCode($mapPin);
      if (!code) return;
      var $listPin = $listPins.filter("." + code);
      if (!$listPin.length) return;

      $mapPin.on("mouseenter", function () {
        $listPin.addClass("on");
        $mapPin.append("<p>" + $listPin.text() + "</p>");
      }).on("mouseleave", function () {
        $listPin.removeClass("on");
        $mapPin.find("p").remove();
      });
    });
  });

  $(".map-wrap, .bx.map-table").each(function () {
    var $wrap = $(this);

    $wrap.find("[data-district]").on("click", function (e) {
      e.preventDefault();
      var num  = $(this).data("district");
      var $img = $wrap.find(".img");

      // 배경이미지 교체 (map-table에만 존재)
      if ($img.length) {
        $img.attr("class", function (_, cls) {
          return cls.replace(/\bdistrict\d+\b/g, "").trim();
        }).addClass("district0" + num);
      }

      // 클릭 활성화
      $wrap.find("[data-district]").removeClass("on");
      $(this).addClass("on");

      switchDistrict($wrap, num);
    });

    switchDistrict($wrap, 1);
  });
}

function initFamilySite() {
  $(".familysite p").click(function () {
    if ($(this).hasClass("open")) {
      $(".site-list-wr").stop().slideUp(150);
      setTimeout(function () {
        $(".familysite p").removeClass("open");
      }, 150);
    } else {
      $(".familysite p").addClass("open");
      setTimeout(function () {
        $(".site-list-wr").stop().slideDown(150);
      }, 200);
    }
  });
}
