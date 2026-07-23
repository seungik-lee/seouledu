document.addEventListener("DOMContentLoaded", function () {
  initializeCommonFeatures();
});

/* 공통 기능들 초기화 */
function initializeCommonFeatures() {
  setGnbMaxHeight();
  bindNavEvents();
  initHeaderInvert();
  initSelectBox();
  initFamilySite();
  initReplyCount();
  initViewThumbSlider();
  initTab();
  initVideoPlayer();
  initMapListTab();
  initFloating();
  initLayerPopups();
  initAccordion();
  initAgreeChk();
  initDatepicker();
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
  $("header #gnb, header #gnb > ul > li.dep1").removeClass("on");

  $("header").each(function () {
    var $header = $(this);

    if ($header.hasClass("typeB")) {
      return;
    }

    if ($header.hasClass("typeC")) {
      $header.find(".inner").removeClass("wide");
      $header.find(".inner #gnb > ul > li.dep1 > .dep2-wrap").stop(true).hide();
      return;
    }

    $header.find(".inner").removeClass("wide");
  });

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

function initSelectBox() {
  $(document).on("click", ".select-box-wrap > p", function () {
    var $this = $(this);
    var $listWr = $this.closest(".select-box-wrap").find(".select-box-list-wr");

    if ($this.hasClass("open")) {
      $listWr.stop().slideUp(150);
      setTimeout(function () {
        $this.removeClass("open");
      }, 150);
    } else {
      $this.addClass("open");
      setTimeout(function () {
        $listWr.stop().slideDown(150);
      }, 200);
    }
  });

  $(document).on("click", ".select-box-wrap .select-box-list-wr li", function (e) {
    e.stopPropagation(); // ✅ 버블링 차단

    var $wrap = $(this).closest(".select-box-wrap");
    var $p = $wrap.find("> p");
    var $input = $wrap.find("input[type='hidden']");
    var $listWr = $wrap.find(".select-box-list-wr");
    var text = $(this).find("p").text() || $(this).text();

    $p.text(text);
    var value = $(this).data("value") || text;
    $input.val(value);

    $listWr.stop().slideUp(150);
    setTimeout(function () {
      $p.removeClass("open");
    }, 150);
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

function initReplyCount() {
  $(document).on("input", ".reply-input", function () {
    var $textarea = $(this);
    var $count = $textarea.closest(".textarea-wr").find(".text-count");
    var max = 1000;
    var val = $textarea.val();

    if (val.length > max) {
      $textarea.val(val.slice(0, max)); // 1000자 초과 입력 차단
    }

    $count.text("(" + $textarea.val().length + "/" + max + ")");
  });
}

function initViewThumbSlider() {
  $(".thumbnail-type .slider-wrap").each(function () {
    var $wrap = $(this);
    var $mainSwiperEl = $wrap.find(".swiper.slide");
    var $thumbSwiperEl = $wrap.find(".swiper.thumb");
    var $prev = $wrap.find(".btn.prev");
    var $next = $wrap.find(".btn.next");

    var MOBILE_BREAKPOINT = 768;

    var thumbSwiper = new Swiper($thumbSwiperEl[0], {
      slidesPerView: "auto",
      spaceBetween: 20,
      watchSlidesProgress: true,
      freemode: true,
      breakpoints: {
        0: { slidesPerView: 2.6, spaceBetween: 12 },
        768: { slidesPerView: "auto", spaceBetween: 16 },
      },
    });

    var $thumbSlides = $thumbSwiperEl.find(".swiper-slide");

    function syncThumbActive(idx) {
      $thumbSlides.removeClass("is-active").eq(idx).addClass("is-active");
      thumbSwiper.slideTo(idx);
    }

    var mainSwiper = new Swiper($mainSwiperEl[0], {
      autoHeight: true,
      allowTouchMove: true,
      navigation: {
        prevEl: $prev[0],
        nextEl: $next[0],
      },
      on: {
        init: function (sw) {
          syncThumbActive(sw.realIndex);
        },
        slideChange: function (sw) {
          syncThumbActive(sw.realIndex);
        },
      },
    });

    $thumbSlides.on("click", function () {
      mainSwiper.slideTo($thumbSlides.index(this));
    });
  });
}

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
  });
}

function initVideoPlayer() {
  $(".video-wrap").each(function () {
    var $wrap = $(this);
    var $video = $wrap.find("video");
    var $btn = $wrap.find(".play-btn");
    var video = $video[0];

    $btn.on("click", function () {
      video.play();
      $btn.hide();
    });

    $video.on("pause ended", function () {
      $btn.show();
    });

    $video.on("play", function () {
      $btn.hide();
    });
  });
}

function initMapListTab() {
  $(".map-list-tab").each(function () {
    var $wrap = $(this);
    var $btns = $wrap.find(".tab-btn");
    var $indicator = $wrap.find(".tab-indicator");

    function moveIndicator($btn) {
      $indicator.css({
        left: $btn.position().left,
        width: $btn.outerWidth(),
      });
    }

    // 초기 위치 세팅 (transition 없이)
    $indicator.css("transition", "none");
    moveIndicator($btns.filter(".active"));
    setTimeout(function () {
      $indicator.css("transition", "");
    }, 50);

    $btns.on("click", function () {
      var $btn = $(this);
      var tab = $btn.data("tab");

      $btns.removeClass("active");
      $btn.addClass("active");
      moveIndicator($btn);

      $(".tab-cont").removeClass("on");
      $("." + tab + "-tab").addClass("on");
    });
  });
}

function initFloating() {
  var $floating = $(".floating");
  if (!$floating.length) return;

  var $default = $floating.find(".defalut");
  var $links = $floating.find(".floating-links");
  var timer;

  $floating
    .on("mouseenter", function () {
      clearTimeout(timer);
      $default.slideUp(200, function () {
        $floating.addClass("open");
        $links.slideDown(250);
      });
    })
    .on("mouseleave", function () {
      timer = setTimeout(function () {
        $links.slideUp(200, function () {
          $default.slideDown(200);
          $floating.removeClass("open");
        });
      }, 200);
    });
}

function initLayerPopups() {
  var scrollY = 0;

  function lockScroll() {
    scrollY = window.scrollY;
    $("html, body").css("overflow", "hidden");
  }

  function unlockScroll() {
    $("html, body").css("overflow", "");
  }

  function openPopup(id) {
    var $popup = $(".layer-popup[data-popup='" + id + "']");
    if (!$popup.length) return;
    lockScroll();
    $popup.closest(".layer-popup-wrap").addClass("active");
    $popup.addClass("active");
  }

  function closePopup($popup) {
    $popup.removeClass("active");
    $popup.closest(".layer-popup-wrap").removeClass("active");
    unlockScroll();
  }

  // ✅ 트리거 버튼만 — .layer-popup 자체가 data-popup을 가지므로 제외
  $(document).on("click", "[data-popup]:not(.layer-popup)", function () {
    var id = $(this).data("popup");
    openPopup(id);
  });

  // ✅ 닫기 버튼 — 버블링 차단
  $(document).on("click", ".layer-popup .close", function (e) {
    e.stopPropagation();
    closePopup($(this).closest(".layer-popup"));
  });

  /* [바깥클릭 닫기 START] */
  $(document).on("click", ".layer-popup-wrap.active", function (e) {
    if ($(e.target).closest(".layer-popup").length === 0) {
      closePopup($(this).find(".layer-popup.active"));
    }
  });
  /* [바깥클릭 닫기 END] */
}

function initAccordion() {
  $(document).on("click", ".accordion-wrap .open-btn", function () {
    var $wrap = $(this).closest(".accordion-wrap");

    if ($wrap.hasClass("open")) {
      $wrap.removeClass("open");
      $wrap.find(".accordion-bottom").slideUp(250);
    } else {
      /* =========================================================
         multi 클래스 없음 → 하나씩 열리는 방식
         같은 부모 안의 형제 accordion-wrap을 닫음
      ========================================================= */
      if (!$wrap.hasClass("multi")) {
        $wrap.siblings(".accordion-wrap").removeClass("open");
        $wrap.siblings(".accordion-wrap").find(".accordion-bottom").slideUp(250);
      }

      /* =========================================================
         multi 클래스 있음 → 오픈 유지 방식
         그냥 자기 자신만 열림
      ========================================================= */
      $wrap.addClass("open");
      $wrap.find(".accordion-bottom").slideDown(250);
    }
  });
}

function initAgreeChk() {
  $(document).on("change", ".agree-wrap #chk-all", function () {
    var $wrap = $(this).closest(".agree-wrap");
    var checked = $(this).is(":checked");

    // 하위 체크박스 전체 동기화
    $wrap.find(".accordion-wrap .chk input[type='checkbox']").each(function () {
      $(this)
        .prop("checked", checked)
        .val(checked ? "Y" : "N");
    });

    $(this).val(checked ? "Y" : "N");
  });

  $(document).on("change", ".agree-wrap .accordion-wrap .chk input[type='checkbox']", function () {
    var $wrap = $(this).closest(".agree-wrap");
    var $allChk = $wrap.find("#chk-all");
    var $childChks = $wrap.find(".accordion-wrap .chk input[type='checkbox']");
    var checked = $(this).is(":checked");

    $(this).val(checked ? "Y" : "N");

    // 전체 체크 여부 확인 → chk-all 동기화
    var allChecked = $childChks.length === $childChks.filter(":checked").length;
    $allChk.prop("checked", allChecked).val(allChecked ? "Y" : "N");
  });
}

function initDatepicker() {
  if (!$.fn.datepicker) return; // ✅ jQuery UI 없으면 스킵

  $(".datepicker-input").datepicker({
    dateFormat: "y-mm-dd",
    showOn: "both",
    buttonText: "",
    prevText: "&#8249;",
    nextText: "&#8250;",
    monthNames: ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],
    dayNamesMin: ["일","월","화","수","목","금","토"],
    showButtonPanel: false,
  });

  $(document).on("click", ".datepicker-btn", function () {
    $(this).siblings(".datepicker-input").datepicker("show");
  });
}