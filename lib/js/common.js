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
  initMoveTab();
  initFloating();
  initLayerPopups();
  initAccordion();
  initAgreeChk();
  initDatepicker();
  initAddrSearch();
  initRadioChkGroup();
  initLpSearch();
  initTableSwiper();
  initCountWrap();
  initHistoryPage();
  initRentalInputStep();
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
  function calcWidth() {
    $(".select-box-wrap").each(function () {
      var $wrap = $(this);
      var $label = $wrap.find(".select-label");
      var $list = $wrap.find(".select-box-list-wr");

      if (window.innerWidth <= 768) {
        $label.css("width", "");
        $list.css("width", "");
      } else {
        $label.css("width", "");
        $list.css({ visibility: "hidden", display: "block", width: "max-content", minWidth: "0" });
        var listWidth = $list.outerWidth() + 10;
        var labelWidth = $label.outerWidth();
        $list.css({ visibility: "", display: "", width: "", minWidth: "" });

        if (listWidth > labelWidth) {
          $label.css("width", listWidth + 20 + "px");
        } else {
          $label.css("width", labelWidth + "px");
        }
      }
    });
  }

  calcWidth();

  $(window).on("resize", function () {
    calcWidth();
  });

  $(document).on("click", ".select-box-wrap .select-label", function () {
    var $this = $(this);
    var $wrap = $this.closest(".select-box-wrap");
    var $listWr = $wrap.find(".select-box-list-wr");

    if ($this.hasClass("open")) {
      $listWr.stop().slideUp(150);
      setTimeout(function () {
        $this.removeClass("open");
      }, 150);
    } else {
      if ($wrap.closest(".tbl-wrap.overflow").length) {
        var rect = this.getBoundingClientRect();
        $listWr.css({
          top: rect.bottom - 2 + "px",
          left: rect.left + "px",
          width: rect.width + "px",
        });
      }

      $this.addClass("open");
      setTimeout(function () {
        $listWr.stop().slideDown(150);
      }, 200);
    }
  });

  $(document).on("scroll", function () {
    var $wrap = $(this).find(".tbl-wrap.overflow .select-box-wrap .select-label.open");
    if ($wrap.length) {
      $wrap.closest(".select-box-wrap").find(".select-box-list-wr").stop().hide();
      $wrap.removeClass("open");
    }
  });

  $(document).on("click", ".select-box-wrap .select-box-list-wr li", function (e) {
    e.stopPropagation();

    var $wrap = $(this).closest(".select-box-wrap");
    var $label = $wrap.find(".select-label");
    var $p = $label.find("p");
    var $input = $wrap.find("input[type='hidden']");
    var $listWr = $wrap.find(".select-box-list-wr");
    var text = $(this).find("p").text() || $(this).text();

    if ($p.hasClass("placeholder")) {
      $p.removeClass("placeholder");
    }
    $p.text(text);
    $input.val($(this).data("value") || text);

    $listWr.stop().slideUp(150);
    setTimeout(function () {
      $label.removeClass("open");
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

function initMoveTab() {
  $(".move-list-tab").each(function () {
    var $wrap = $(this);
    var $btns = $wrap.find(".tab-btn");
    var $indicator = $wrap.find(".tab-indicator");

    // 탭 콘텐츠 범위 탐색 (initTab과 동일한 방식)
    var $section = $wrap.parent();
    while ($section.length && $section.find(".tab-cont").length === 0) {
      $section = $section.parent();
    }
    var $tabCont = $section.find(".tab-cont");

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

      // ✅ 클래스 방식 → ID 방식
      $tabCont.removeClass("on");
      $tabCont.filter("#" + tab).addClass("on");
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

    $wrap.find(".accordion-wrap .chk input[type='checkbox'], .agree-item .chk input[type='checkbox']").each(function () {
      $(this)
        .prop("checked", checked)
        .val(checked ? "Y" : "N");
    });

    $(this).val(checked ? "Y" : "N");
  });

  $(document).on("change", ".agree-wrap .accordion-wrap .chk input[type='checkbox'], .agree-wrap .agree-item .chk input[type='checkbox']", function () {
    var $wrap = $(this).closest(".agree-wrap");
    var $allChk = $wrap.find("#chk-all");
    var $childChks = $wrap.find(".accordion-wrap .chk input[type='checkbox'], .agree-item .chk input[type='checkbox']");
    var checked = $(this).is(":checked");

    $(this).val(checked ? "Y" : "N");

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
    monthNames: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    dayNamesMin: ["일", "월", "화", "수", "목", "금", "토"],
    showButtonPanel: false,
  });

  $(document).on("click", ".datepicker-btn", function () {
    $(this).siblings(".datepicker-input").datepicker("show");
  });
}

function initAddrSearch() {
  $(document).on("click", ".addr-search-btn", function () {
    var $wrap = $(this).closest("dd");
    var $zip = $wrap.find(".addr-zip");
    var $main = $wrap.find(".addr-main");
    var $detail = $wrap.find(".addr-detail");
    var $pcWrap = $wrap.find(".addr-postcode-wrap");
    var $pcLayer = $wrap.find(".addr-postcode-layer");

    // 토글
    if ($pcWrap.is(":visible")) {
      $pcWrap.hide();
      return;
    }

    // 이미 embed됐으면 재사용
    if ($pcLayer.children().length) {
      $pcWrap.show();
      return;
    }

    $pcWrap.show();

    new daum.Postcode({
      oncomplete: function (data) {
        var addr = data.roadAddress || data.jibunAddress;
        $zip.val(data.zonecode);
        $main.val(addr);
        $detail.val("").focus();
        $pcWrap.hide();
      },
      width: "100%",
      height: "100%",
    }).embed($pcLayer[0]);
  });
}

function initRadioChkGroup() {
  $(document).on("change", ".radio-chk-group input[type='radio']", function () {
    var $group = $(this).closest(".radio-chk-group");
    var $radioRow = $(this).closest(".radio-row");

    $group.find(".chk-group .chk").removeClass("enabled");
    $group.find(".chk-group input[type='checkbox']").prop("checked", false);
    $radioRow.find(".chk-group .chk").addClass("enabled");
  });

  $(document).on("change", "input[type='radio']", function () {
    var name = $(this).attr("name");
    var pair = $(this).data("radio-pair");

    $("input[type='radio'][name='" + name + "']").each(function () {
      var targetPair = $(this).data("radio-pair");
      if (targetPair) {
        $("input[name='" + targetPair + "']")
          .prop("disabled", true)
          .val("");
      }
    });

    if (pair) {
      $("input[name='" + pair + "']")
        .prop("disabled", false)
        .focus();
    }
  });
}

function initLpSearch() {
  var $targetInput = null;
  var $targetRadio = null;

  $(document).on("click", ".lp-search-btn", function () {
    $targetInput = $(this).closest(".input-btn-wrap").find("input[type='text']");

    // 버튼에서 위로 올라가며 radio 찾기
    var $el = $(this).parent();
    while ($el.length && !$el.find("input[type='radio']").length) {
      $el = $el.parent();
    }
    $targetRadio = $el.find("input[type='radio']");
  });

  $(document).on("click", ".lp-search-list p", function () {
    if (!$targetInput || !$targetInput.length) return;

    // ✅ 라디오 먼저 체크 → input 활성화
    if ($targetRadio && $targetRadio.length) {
      $targetRadio.prop("checked", true).trigger("change");
    }

    // ✅ 활성화된 후 값 삽입
    $targetInput.val($(this).text().trim());

    $targetInput = null;
    $targetRadio = null;

    $(this).closest(".lp-search").removeClass("active");
    $(".layer-popup-wrap").removeClass("active");
    $("html, body").css("overflow", "");
  });
}

/* 테이블 + 모바일 슬라이드 swiper */
function initTableSwiper() {
  $(".table-swiper-wrap").each(function () {
    var $wrap = $(this);
    var $swiper = $wrap.find(".swiper.slide");
    var $cur = $wrap.find(".counter .cur");
    var $total = $wrap.find(".counter .total");
    var swiper = null;

    function initSwiper() {
      if (swiper) return; // 이미 초기화된 경우 스킵

      swiper = new Swiper($swiper[0], {
        slidesPerView: 1,
        allowTouchMove: true,
        navigation: {
          nextEl: $wrap.find(".btn.next")[0],
          prevEl: $wrap.find(".btn.prev")[0],
        },
        on: {
          init: function () {
            $cur.text(this.realIndex + 1);
            $total.text(this.slides.length);
          },
          slideChange: function () {
            $cur.text(this.realIndex + 1);
          },
        },
      });
    }

    function destroySwiper() {
      if (!swiper) return;
      swiper.destroy(true, true);
      swiper = null;
    }

    function checkBreakpoint() {
      if ($(window).width() <= 768) {
        initSwiper();
      } else {
        destroySwiper();
      }
    }

    checkBreakpoint();

    $(window).on("resize", function () {
      checkBreakpoint();
    });
  });
}

function initCountWrap() {
  function syncRows($wrap, count) {
    var targetSel = $wrap.data("target");
    if (!targetSel) return;

    var $tbody = $("#" + targetSel).find("tbody");
    if (!$tbody.length) return;

    var $rows = $tbody.find("tr");
    var cur = $rows.length;

    if (count > cur) {
      var $tpl = $rows.first();
      for (var i = cur; i < count; i++) {
        var $new = $tpl.clone();
        $new.find("input[type='text']").val("");
        $new.find("input[type='hidden']").val("");
        $new.find(".select-label p").text("선택").addClass("placeholder");
        $new
          .find("td")
          .eq(0)
          .text(i + 1);
        $tbody.append($new);
      }
    } else if (count < cur) {
      $rows.slice(count).remove();
    }
  }

  $(document).on("click", ".count-wrap .minus, .count-wrap .plus", function () {
    var $wrap = $(this).closest(".count-wrap");
    var $input = $wrap.find("input");
    var min = parseInt($wrap.data("min"), 10) || 1;
    var max = parseInt($wrap.data("max"), 10) || 999;
    var val = parseInt($input.val(), 10) || min;

    if ($(this).hasClass("plus")) {
      val = Math.min(val + 1, max);
    } else {
      val = Math.max(val - 1, min);
    }

    $input.val(val);
    $wrap.find(".minus").prop("disabled", val <= min);
    $wrap.find(".plus").prop("disabled", val >= max);

    syncRows($wrap, val);
  });
}

function initHistoryPage() {
  var $page = $(".history-page");
  if (!$page.length) return;

  var $side = $page.find(".history-fixed-side");
  var $rollList = $side.find(".roll-list");

  var decades = {
    tab2020: ["26", "25", "24", "23", "22", "21", "20"],
    tab2010: ["19", "18", "17", "16", "15", "14", "13", "12", "11", "10"],
    tab2000: ["09", "08", "07", "06", "05", "04", "03", "02", "01", "00"],
  };

  /* ---------- 반응형 기준값 ---------- */

  function isMobile() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function getFadedH() {
    return isMobile() ? 48 : 124;
  }

  function getTopOffset() {
    return isMobile() ? 90 : 120;
  }

  /* ---------- 연도 숫자 롤 ---------- */

  function renderRollList(tabId) {
    $rollList.empty();
    decades[tabId].forEach(function (y) {
      $rollList.append('<li data-year="20' + y + '">' + y + "</li>");
    });
    setActiveIndex(0, true);
  }

  function setActiveIndex(idx, skipTransition) {
    var $lis = $rollList.find("li");
    var fadedH = getFadedH();

    $lis.removeClass("active dist-1 dist-2 dist-3 dist-4 dist-5 dist-6");
    $lis.each(function (i) {
      var dist = i - idx;
      if (dist === 0) {
        $(this).addClass("active");
      } else if (dist > 0) {
        $(this).addClass("dist-" + Math.min(dist, 6));
      }
    });

    if (skipTransition) $rollList.css("transition", "none");
    $rollList.css("transform", "translateY(-" + idx * fadedH + "px)");
    if (skipTransition) {
      $rollList[0].offsetHeight;
      $rollList.css("transition", "");
    }
  }

  /* 현재 활성 tab-cont 안의 연도 그룹이 뷰포트 상단 부근에 들어오면 그 인덱스로 롤 이동 */
  function initHistoryScroll() {
    if (!("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var $group = $(entry.target);
          if (!$group.closest(".tab-cont").hasClass("on")) return;

          var year = $group.data("year") + "";
          var idx = $rollList.find('li[data-year="' + year + '"]').index();
          if (idx > -1) setActiveIndex(idx, false);
        });
      },
      { root: null, rootMargin: "0px 0px -70% 0px", threshold: 0 },
    );

    $page.find(".history-group[data-year]").each(function () {
      observer.observe(this);
    });
  }

  /* ---------- 좌측 고정(사이드 전체: 탭 + 연도 숫자) ---------- */

  function initStickySide() {
    if (!$side.length) {
      return null;
    }

    var naturalLeft, sideW, sideH;

    function measure() {
      $side.removeClass("is-fixed is-bottom").css({ top: "", left: "", width: "" });
      naturalLeft = $side.offset().left;
      sideW = $side.outerWidth();
      sideH = $side.outerHeight();
    }

    function activeContHeight() {
      var $cont = $page.find(".history-body .tab-cont.on");
      return $cont.length ? $cont.outerHeight() : 0;
    }

    function update() {
      var topOffset = getTopOffset();
      var pageTop = $page.offset().top - 80;
      var bodyH = activeContHeight();
      var scrollY = $(window).scrollTop();

      var start = pageTop - topOffset;

      var contentEnd = pageTop + bodyH - sideH - topOffset;
      var footerEnd = Infinity;
      var $footer = $("footer").first();
      if ($footer.length) {
        footerEnd = $footer.offset().top - $(window).height() + 100;
      }
      var end = footerEnd;
      var realPageTop = $page.offset().top;

      if (scrollY <= start || bodyH <= sideH) {
        $side.removeClass("is-fixed is-bottom").css({ top: "", left: "", paddingTop: "" });
      } else if (scrollY >= end) {
        var dockTop = isMobile() ? end - realPageTop : end - realPageTop + topOffset;
        $side
          .removeClass("is-fixed")
          .addClass("is-bottom")
          .css({ top: dockTop + "px", left: 0 });
      } else if (isMobile()) {
        $side
          .removeClass("is-bottom")
          .addClass("is-fixed")
          .css({ top: 0, left: "var(--content-padding-x)", paddingTop: topOffset + "px" });
      } else {
        $side
          .removeClass("is-bottom")
          .addClass("is-fixed")
          .css({ top: topOffset + "px", left: naturalLeft + "px" });
      }
      console.log({ contentEnd: contentEnd, footerEnd: footerEnd, scrollY: scrollY, bodyH: bodyH, sideH: sideH });
    }

    measure();
    update();

    $(window).on("scroll", update);
    $(window).on("resize", function () {
      measure();
      update();
    });

    return { measure: measure, update: update };
  }

  /* ---------- 탭 전환 ---------- */

  function initHistoryTabFlow(sticky) {
    $page.find(".history-tab li").on("click", function () {
      $("html, body")
        .stop()
        .animate({ scrollTop: $page.offset().top - getTopOffset() }, 300);

      setTimeout(function () {
        var id = $page.find(".history-body .tab-cont.on").attr("id");
        renderRollList(id);
        sticky.measure();
        sticky.update();
      }, 350);
    });
  }

  /* ---------- 실행 ---------- */

  renderRollList("tab2020");
  try {
    initHistoryScroll();
  } catch (e) {
    console.error("initHistoryScroll", e);
  }

  var sticky = null;
  try {
    sticky = initStickySide();
  } catch (e) {
    console.error("initStickySide", e);
  }

  if (sticky) {
    try {
      initHistoryTabFlow(sticky);
    } catch (e) {
      console.error("initHistoryTabFlow", e);
    }
  }
}

function initRentalInputStep() {
  if (!$(".rental-input-wrap").length) return;

  var FACILITIES = window.rentalFacilities || {};
  var EQUIPMENTS = window.rentalEquipments || [];

  var selectedFacilities = [];
  var equipmentSelections = {};
  var availabilityChecked = false;
  var startTouched = false;
  var durationTouched = false;

  var $tagWrap = $("#selectedFacilityTags");
  var $equipSec = $("#equipmentSection");
  var $equipBody = $("#equipmentTableBody");
  var $costSec = $("#costSection");
  var $costBody = $("#costTableBody");
  var $costDate = $("#costSummaryDate");
  var $costTotal = $("#costTotalValue");
  var $costTotalLabel = $("#costTotalLabel");

  /* ---------- 반응형 판별 ---------- */
  function isMobileWidth() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  /* ---------- 시설 id -> input id 변환 ---------- */
  function facilityInputId(id) {
    return "f" + id.charAt(0).toUpperCase() + id.slice(1);
  }

  /* ---------- 시설 목록(아코디언) 렌더링 ---------- */
  function renderFacilityAccordion() {
    var $container = $("#facilityAccordionList");
    if (!$container.length) return;

    var groups = [];
    var groupMap = {};

    Object.keys(FACILITIES).forEach(function (id) {
      var group = FACILITIES[id].group;
      if (!groupMap[group]) {
        groupMap[group] = [];
        groups.push(group);
      }
      groupMap[group].push(id);
    });

    var html = "";
    groups.forEach(function (group) {
      html += '<div class="accordion-wrap multi open">';
      html += '<div class="accordion-head"><p class="tit open-btn">' + group + "</p></div>";
      html += '<div class="accordion-bottom" style="display:block;">';
      groupMap[group].forEach(function (id) {
        var inputId = facilityInputId(id);
        html += '<div class="chk-wrap"><div class="chk facility-chk">' + '<input type="checkbox" id="' + inputId + '" data-facility="' + id + '">' + '<label for="' + inputId + '">' + FACILITIES[id].name + "</label>" + "</div></div>";
      });
      html += "</div></div>";
    });

    $container.html(html);
  }

  /* ---------- 왼쪽 시설 목록 높이를 오른쪽 이용시간 박스 높이에 맞춤 (모바일 제외) ---------- */
  function syncFacilityListHeight() {
    var $list = $(".accordion-wrap-list");
    var $timeCol = $(".time-select-col .line-bx");
    if (!$list.length || !$timeCol.length) return;

    if (isMobileWidth()) {
      $list.css("max-height", "");
      return;
    }

    $list.css("max-height", "none"); // 재측정 전 초기화
    var targetHeight = $timeCol.outerHeight();
    $list.css("max-height", targetHeight + "px");
  }

  /* ---------- 선택된 시설들의 운영시간 교집합으로 시작시간 옵션 다시 그리기 ---------- */
  function renderHourOptions() {
    var range = { start: 0, end: 23 };

    if (selectedFacilities.length) {
      var starts = selectedFacilities.map(function (id) {
        return (FACILITIES[id].hourRange || range).start;
      });
      var ends = selectedFacilities.map(function (id) {
        return (FACILITIES[id].hourRange || range).end;
      });
      range = { start: Math.max.apply(null, starts), end: Math.min.apply(null, ends) };
    } else {
      range = window.rentalHourRange || range;
    }

    var $ul = $("#startHourSelect .select-box-list-wr ul").empty();

    if (range.start > range.end) {
      /* 선택한 시설들끼리 겹치는 운영시간이 없는 경우 */
      return;
    }

    for (var h = range.start; h <= range.end; h++) {
      $ul.append("<li><p>" + h + "시</p></li>");
    }

    var curVal = parseInt($('#startHourSelect input[type="hidden"]').val(), 10);
    if (isNaN(curVal) || curVal < range.start || curVal > range.end) {
      $('#startHourSelect input[type="hidden"]').val("");
      $("#startHourSelect .select-label p").text("시작시간").addClass("placeholder");
      startTouched = false;
      updateEndTime();
    }
  }

  /* ---------- 시설 체크 -> 태그 동기화 ---------- */
  function isExclusiveBlocked(id) {
    var conflictId = null;
    FACILITIES[id].exclusiveWith.forEach(function (ex) {
      if (selectedFacilities.indexOf(ex) > -1) conflictId = ex;
    });
    return conflictId;
  }

  function renderTags() {
    if (!selectedFacilities.length) {
      $tagWrap.html('<p class="empty-txt">아직 선택된 시설이 없습니다.</p>');
      return;
    }
    var html = "";
    selectedFacilities.forEach(function (id) {
      html += '<span class="tag-chip" data-facility="' + id + '">' + FACILITIES[id].name + '<button type="button" aria-label="선택 해제"></button></span>';
    });
    $tagWrap.html(html);
  }

  function addFacility(id) {
    if (selectedFacilities.indexOf(id) > -1) return;
    var conflict = isExclusiveBlocked(id);
    if (conflict) {
      alert(FACILITIES[id].name + "은(는) " + FACILITIES[conflict].name + "과(와) 동일일시 중복대관이 불가합니다.");
      $("#" + facilityInputId(id)).prop("checked", false);
      return;
    }
    selectedFacilities.push(id);
    equipmentSelections[id] = {};
    renderTags();
    syncFacilityListHeight();
    renderHourOptions();
    resetAvailability();
    renderEquipmentTable();
    renderCostTable($(".datepicker-input").val());
  }

  function removeFacility(id) {
    var idx = selectedFacilities.indexOf(id);
    if (idx > -1) selectedFacilities.splice(idx, 1);
    delete equipmentSelections[id];
    $('.facility-chk input[data-facility="' + id + '"]').prop("checked", false);
    renderTags();
    syncFacilityListHeight();
    renderHourOptions();
    resetAvailability();
    renderEquipmentTable();
    renderCostTable($(".datepicker-input").val());
  }

  function resetAvailability() {
    availabilityChecked = false;
  }

  $(document).on("change", '.facility-chk input[type="checkbox"]', function () {
    var id = $(this).data("facility");
    if ($(this).is(":checked")) {
      addFacility(id);
    } else {
      removeFacility(id);
    }
  });

  $(document).on("click", ".tag-chip button", function () {
    var id = $(this).closest(".tag-chip").data("facility");
    removeFacility(id);
  });

  /* ---------- 시작시간 + 이용시간 -> 종료시간 자동 계산 ---------- */
  function updateEndTime() {
    if (!startTouched || !durationTouched) {
      $("#endTimeView").val("");
      return;
    }

    var startH = parseInt($('#startHourSelect input[type="hidden"]').val(), 10) || 0;
    var startM = parseInt($('#startMinSelect input[type="hidden"]').val(), 10) || 0;
    var dur = parseInt($('#durationSelect input[type="hidden"]').val(), 10) || 0;

    var totalMin = startH * 60 + startM + dur * 60;
    var endM = totalMin % 60;
    var endH = Math.floor(totalMin / 60) % 24;

    if (endH === 0 && endM === 0) endH = 24; // 정확히 자정에 걸리면 00시 대신 24시로 표기

    $("#endTimeView").val(endH + "시 " + String(endM).padStart(2, "0") + "분");
  }

  /* select-box-wrap의 옵션 클릭은 common.js의 initSelectBox()가 처리하지만,
      hidden input 값이 바뀐 뒤 종료시간/예상비용 재계산은 별도로 감지해야 함 */
  $(document).on("click", "#startHourSelect .select-box-list-wr li, #startMinSelect .select-box-list-wr li", function () {
    startTouched = true;
    setTimeout(function () {
      updateEndTime();
      renderCostTable($(".datepicker-input").val());
    }, 0);
  });

  $(document).on("click", "#durationSelect .select-box-list-wr li", function () {
    durationTouched = true;
    setTimeout(function () {
      updateEndTime();
      renderCostTable($(".datepicker-input").val());
    }, 0);
  });

  $(document).on("change", ".datepicker-input", function () {
    renderCostTable($(this).val());
  });

  /* ---------- 이용가능여부 확인 ---------- */
  $("#checkAvailableBtn").on("click", function () {
    if (!selectedFacilities.length) {
      alert("시설을 먼저 선택해 주세요.");
      return;
    }
    var date = $(".datepicker-input").val();
    if (!date) {
      alert("대관일자를 선택해 주세요.");
      return;
    }

    /* 실제로는 여기서 서버에 해당 시설/일자/시간대 예약 가능 여부를 조회해야 합니다.
         지금은 항상 가능한 것으로 처리하는 목업입니다. */
    availabilityChecked = true;
    renderCostTable(date);
  });

  /* ---------- 부대설비 표 ---------- */
  function renderEquipmentTable() {
    var html = "";
    selectedFacilities.forEach(function (id) {
      html += '<tr data-facility="' + id + '">';
      html += '<td class="equipment-table-facility">' + FACILITIES[id].name + "</td>";
      EQUIPMENTS.forEach(function (eq) {
        var checked = equipmentSelections[id] && equipmentSelections[id][eq.id] ? "checked" : "";
        var inputId = "equip-" + id + "-" + eq.id;
        html += "<td>" + '<div class="chk equip-chk-wrap">' + '<input type="checkbox" class="equip-chk" id="' + inputId + '" data-facility="' + id + '" data-equip="' + eq.id + '" ' + checked + ">" + '<label for="' + inputId + '"></label>' + "</div>" + "</td>";
      });
      html += "</tr>";
    });
    $equipBody.html(html);
  }

  $(document).on("change", ".equip-chk", function () {
    var fId = $(this).data("facility");
    var eId = $(this).data("equip");
    if (!equipmentSelections[fId]) equipmentSelections[fId] = {};
    equipmentSelections[fId][eId] = $(this).is(":checked");
    renderCostTable($(".datepicker-input").val());
  });

  /* ---------- 예상 대관비용 표 ---------- */
  function equipmentNamesFor(id) {
    var names = [];
    EQUIPMENTS.forEach(function (eq) {
      if (equipmentSelections[id] && equipmentSelections[id][eq.id]) names.push(eq.name);
    });
    return names.length ? names.join(", ") : "-";
  }

  function equipmentCostFor(id) {
    var total = 0;
    EQUIPMENTS.forEach(function (eq) {
      if (equipmentSelections[id] && equipmentSelections[id][eq.id]) {
        total += eq.price || 0;
      }
    });
    return total;
  }

  function renderCostTable(dateStr) {
    var startHRaw = parseInt($('#startHourSelect input[type="hidden"]').val(), 10);
    var startMRaw = parseInt($('#startMinSelect input[type="hidden"]').val(), 10);
    var durRaw = parseInt($('#durationSelect input[type="hidden"]').val(), 10); // "2시간"처럼 텍스트가 섞여도 앞 숫자만 뽑음
    var endTxt = $("#endTimeView").val();

    if (dateStr && startTouched && durationTouched && !isNaN(startHRaw) && !isNaN(durRaw)) {
      var dateLabel = dateStr;
      var parts = dateStr.split("-");
      if (parts.length === 3) {
        var yy = parseInt(parts[0], 10);
        var mm = parseInt(parts[1], 10);
        var dd = parseInt(parts[2], 10);
        if (!isNaN(yy) && !isNaN(mm) && !isNaN(dd)) {
          var fullYear = yy < 100 ? 2000 + yy : yy;
          var d = new Date(fullYear, mm - 1, dd);
          var days = ["일", "월", "화", "수", "목", "금", "토"];
          dateLabel = d.getFullYear() + "년 " + mm + "월 " + dd + "일 (" + days[d.getDay()] + ")";
        }
      }

      var startLabel = String(startHRaw).padStart(2, "0") + ":" + String(isNaN(startMRaw) ? 0 : startMRaw).padStart(2, "0");
      var endLabel = endTxt.replace("시 ", ":").replace("분", "");

      $costDate.text(dateLabel + " · " + startLabel + " ~ " + endLabel + " (" + durRaw + "시간)");
    } else {
      $costDate.text("");
    }

    var html = "";
    var total = 0;

    selectedFacilities.forEach(function (id) {
      var rate = FACILITIES[id].rate;
      var equipCost = equipmentCostFor(id);
      var subtotal = rate + equipCost;
      total += subtotal;

      html += "<tr>";
      html += "<td>" + FACILITIES[id].name + "</td>";
      html += "<td>" + rate.toLocaleString() + "원</td>";
      html += '<td class="left">' + equipmentNamesFor(id) + "</td>";
      html += '<td>' + subtotal.toLocaleString() + "원</td>";
      html += "</tr>";
    });

    $costBody.html(html);
    $costTotalLabel.text("총 대관료 (" + selectedFacilities.length + "개 시설)");
    $costTotal.text(total.toLocaleString() + "원");
  }

  /* ---------- 이전단계 / 다음단계 ---------- */
  $("#prevStepBtn").on("click", function (e) {
    e.preventDefault();
    var go = confirm("이 페이지를 벗어나면 신청내역이 저장되지 않습니다. 이동하시겠습니까?");
    if (go) window.location.href = $(this).attr("href");
  });

  $("#nextStepBtn").on("click", function (e) {
    e.preventDefault();
    if (!availabilityChecked) {
      alert("이용가능여부 확인 후 다음 단계로 진행할 수 있습니다.");
      return;
    }
    /* 실제로는 여기서 선택 내용을 서버 또는 세션에 저장해야 합니다. */
    window.location.href = $(this).attr("href");
  });

  /* ---------- 초기 실행 ---------- */
  renderFacilityAccordion();
  renderHourOptions();
  syncFacilityListHeight();
  updateEndTime(); // 페이지 로드시 아직 아무것도 안 골랐으니 빈 값으로 초기화

  $(window).on("resize", syncFacilityListHeight);
}
