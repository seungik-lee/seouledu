document.addEventListener("DOMContentLoaded", function () {
  initializeCommonFeatures();
});

/* 공통 기능들 초기화 */
function initializeCommonFeatures() {
  setGnbMaxHeight();
  setGnbDep1MinWidth();
  bindNavEvents();
  initHeaderInvert();
  initSelectBox();
  initLnbAccordion();
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
  initMapTableWrap();
  initRowEdit();
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

/* 헤더 .inner 에 wide 가 HTML 에 처음부터 고정으로 붙어 있는 헤더인지 (처음 한 번만 기록)
   - 고정 wide 헤더(서브페이지 등)는 호버/리사이즈로 wide 를 떼지 않고, 그렇지 않은 헤더(메인)만 호버 때 wide 를 붙였다 뗌
   - overlay(투명) 헤더는 항상 고정 wide 가 아닌 것으로 취급 */
function isFixedWide($header) {
  if ($header.data("fixedWide") === undefined) {
    $header.data("fixedWide", !$header.hasClass("overlay") && $header.find(".inner").hasClass("wide"));
  }
  return $header.data("fixedWide");
}

function bindNavEvents() {
  $("header").each(function () {
    isFixedWide($(this)); // 호버로 wide 가 토글되기 전에 최초 상태를 기록
  });
  $("header .inner #gnb > ul > li.dep1").off();
  $("header .inner #gnb").off();
  $("header .inner #gnb > ul > li.dep1 > a").off();
  $("header .menu").off();

  function bindDep1Accordion($header) {
    $header.find(".inner #gnb > ul > li.dep1 > a").on("click", function (event) {
      if (
        $(this).hasClass("single_depth") ||
        $(this).parent(".dep1").hasClass("dir_menu") ||
        $(this).parent(".dep1").hasClass("one")
      ) {
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

  function bindDep1MidHover($header) {
    $header.find(".inner #gnb > ul > li.dep1").hover(
      function () {
        if ($("body").hasClass("menu-open") && !$header.hasClass("overlay")) return;
        var $this = $(this);
        $header.find(".inner #gnb").addClass("on");
        $header.find(".inner #gnb > ul > li.dep1").not($this).removeClass("on");
        $this.addClass("on");
        $this.children(".dep2-wrap").stop().fadeIn(300);
      },
      function () {
        if ($("body").hasClass("menu-open")) return;
        var $this = $(this);
        $this.removeClass("on");
        $header.find(".inner #gnb").removeClass("on");
        $this.children(".dep2-wrap").stop().fadeOut(100);
      },
    );
  }

  $("header").each(function () {
    var $header = $(this);
    var w = window.innerWidth;

    if (w > 1450) {
      // 1451px 이상: 기존 mega-menu(wide) hover 동작 — 그대로
      $header.find(".inner #gnb > ul > li.dep1").hover(function () {
        if ($("body").hasClass("menu-open") && !$header.hasClass("overlay")) return;
        var $this = $(this);
        if (!isFixedWide($header) || !$("body").hasClass("sub")) {
          $header.find(".inner").addClass("wide");
        }
        $header.find(".inner #gnb").addClass("on");
        $header.find(".inner #gnb > ul > li.dep1").not($this).removeClass("on");
        $this.addClass("on");
        $header.find(".inner #gnb > ul > li.dep1 > .dep2-wrap").stop().fadeIn(900);
      });

      $header.find(".inner #gnb").mouseleave(function () {
        if ($("body").hasClass("menu-open")) return;
        if (!isFixedWide($header) && !$("body").hasClass("sub")) {
          $header.find(".inner").removeClass("wide");
        }
        $(this).removeClass("on");
        $header.find(".inner #gnb > ul > li.dep1").removeClass("on");
        $header.find(".inner #gnb > ul > li.dep1 > .dep2-wrap").stop().fadeOut(100);
      });
    } else if (w > 1240) {
      // 1241~1450px: 평상시엔 hover로 해당 dep2만 노출 (메뉴버튼으로 열리면 아래에서 아코디언으로 전환)
      bindDep1MidHover($header);
    } else {
      // 1240px 이하(모바일): 클릭 아코디언
      bindDep1Accordion($header);
    }

    $header.find(".menu").on("click", function (e) {
      var ww = window.innerWidth;

      if (!$(this).hasClass("close")) {
        $(this).addClass("close");
        $(".quick-menu").hide();

        if (ww > 1450) {
          $("body").addClass("menu-open");
          $header.find(".inner").addClass("wide");
          $header.find(".inner #gnb").addClass("on");
          $header.find(".inner #gnb > ul > li.dep1 > .dep2-wrap").stop().fadeIn(100);
        } else if (ww > 1240) {
          $("body").addClass("menu-open");
          // 메뉴버튼으로 열렸을 때는 hover를 끄고 아코디언으로 전환
          $header.find(".inner #gnb > ul > li.dep1").off("mouseenter mouseleave");
          bindDep1Accordion($header);
        } else {
          $("body").addClass("menu-open");
        }
      } else {
        e.preventDefault();
        $(this).removeClass("close");
        $(".quick-menu").show();

        if (ww > 1450) {
          $("body").removeClass("menu-open");
          if ($("body").hasClass("main")) {
            $header.find(".inner").removeClass("wide");
          }
          $header.find(".inner #gnb").removeClass("on");
          $header.find(".inner #gnb > ul > li.dep1").removeClass("on");
          $header.find(".inner #gnb > ul > li.dep1 > .dep2-wrap").stop().fadeOut(100);
        } else if (ww > 1240) {
          $("body").removeClass("menu-open");
          $header.find(".inner #gnb > ul > li.dep1 > a").off("click");
          $header.find(".inner #gnb > ul > li.dep1").removeClass("open on");
          $header.find(".inner #gnb > ul > li.dep1 > .dep2-wrap").stop().hide();
          bindDep1MidHover($header);
        } else {
          $("body").removeClass("menu-open");
        }
      }
    });
  });
}

/* 로그인 선택 : header .util .login-sel 의 로그인 버튼을 누르면 회원 유형 목록이 열림 (유아부) */
$(document).on("click", "header .login-sel > .login", function (e) {
  e.preventDefault();
  $(this).closest(".login-sel").toggleClass("open");
});
$(document).on("click", function (e) {
  if (!$(e.target).closest(".login-sel").length) $(".login-sel").removeClass("open");
});
$(document).on("keydown", function (e) {
  if (e.key === "Escape") $(".login-sel").removeClass("open");
});

$(window).on("resize", function () {
  $("body").removeClass("menu-open");
  $("header .menu").removeClass("close");
  $("header #gnb, header #gnb > ul > li.dep1").removeClass("on");

  $("header").each(function () {
    var $header = $(this);

    if (isFixedWide($header)) {
      return;
    }

    if ($header.hasClass("overlay")) {
      $header.find(".inner").removeClass("wide");
      $header.find(".inner #gnb > ul > li.dep1 > .dep2-wrap").stop(true).hide();
      return;
    }

    $header.find(".inner").removeClass("wide");
  });

  setGnbMaxHeight();
  setGnbDep1MinWidth();
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

/* GNB dep1 최소폭: dep1 자신 또는 dep2/dep3 중 가장 긴 것 이하로 줄어들지 않도록 고정 */
function setGnbDep1MinWidth() {
  $("header").each(function () {
    $(this)
      .find("#gnb > ul > li.dep1")
      .each(function () {
        var $dep1 = $(this);
        var $link = $dep1.children("a");
        var $dep2Wrap = $dep1.children(".dep2-wrap");

        var $text = $link.children("span").first();
        var dep1TextWidth;
        if ($text.length) {
          dep1TextWidth = $text.outerWidth();
        } else {
          var padLeft = parseFloat($link.css("padding-left")) || 0;
          var padRight = parseFloat($link.css("padding-right")) || 0;
          dep1TextWidth = $link.outerWidth() - padLeft - padRight;
        }

        var dep2Width = 0;
        if ($dep2Wrap.length) {
          $dep2Wrap.css({ display: "block", visibility: "hidden" });
          dep2Width = $dep2Wrap.outerWidth();
          $dep2Wrap.css({ display: "none", visibility: "" });
        }

        $dep1[0].style.setProperty("--dep1-text-w", dep1TextWidth + "px");
        $dep1[0].style.setProperty("--dep2-w", dep2Width + "px");
      });
  });
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

        var isSearchWrap = $wrap.closest(".search-wrap").length > 0;
        var finalWidth = isSearchWrap ? listWidth + 40 : listWidth > labelWidth ? listWidth + 20 : labelWidth;

        if ($wrap.hasClass("mw")) {
          finalWidth = Math.max(finalWidth, 200);
        }

        $label.css("width", finalWidth + "px");
      }
    });
  }

  calcWidth();
  window.__recalcSelectBoxWidth = calcWidth;

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
    var dv = $(this).data("value"); /* data-value="0" 같은 0 값도 그대로 넣음. 값이 없거나 빈 문자열이면 예전처럼 항목 글자를 넣음 */
    $input.val(dv != null && dv !== "" ? dv : text);

    $listWr.stop().slideUp(150);
    setTimeout(function () {
      $label.removeClass("open");
    }, 150);
  });
}

function initLnbAccordion() {
  var $lnb = $("#lnb");
  if (!$lnb.length) return;

  $lnb.off("click.lnbAccordion keydown.lnbAccordion");

  // 현재 보고 있는 페이지가 dep2 안에 있으면, 그 dep1은 처음부터 열어둠
  $lnb.find("li.dep1").each(function () {
    var $dep1 = $(this);
    var $dep2 = $dep1.children("ul.dep2");
    if ($dep2.length && $dep2.find("a.cur, li.on").length) {
      $dep1.addClass("open");
      $dep2.show();
    }
  });

  function toggle($dep1) {
    var $dep2 = $dep1.children("ul.dep2");
    if (!$dep2.length) return;

    var isOpen = $dep1.hasClass("open");

    $lnb
      .find("li.dep1.open")
      .not($dep1)
      .each(function () {
        $(this).removeClass("open").children("ul.dep2").stop().slideUp(250);
      });

    if (isOpen) {
      $dep1.removeClass("open");
      $dep2.stop().slideUp(250);
    } else {
      $dep1.addClass("open");
      $dep2.stop().slideDown(250);
    }
  }

  $lnb.on("click.lnbAccordion", "li.dep1 > a", function () {
    toggle($(this).closest("li.dep1"));
  });

  // href 없는 a는 기본적으로 키보드 포커스/Enter가 안 되니 직접 챙김
  $lnb.find("li.dep1 > a").attr("tabindex", "0");
  $lnb.on("keydown.lnbAccordion", "li.dep1 > a", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle($(this).closest("li.dep1"));
    }
  });
}

function initFamilySite() {
  $(".familysite p").on("click", function () {
    var $wrap = $(this).closest(".familysite");
    var $p = $wrap.find("> p");
    var $list = $wrap.find(".site-list-wr");

    if ($p.hasClass("open")) {
      $list.stop().slideUp(150);
      setTimeout(function () {
        $p.removeClass("open");
      }, 150);
    } else {
      $p.addClass("open");
      setTimeout(function () {
        $list.stop().slideDown(150);
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

/* 탭 상태는 주소의 ?tab=xxx 로 관리한다 (initTab / initMoveTab 공통) — 폼 전송·새로고침 후에도 보던 탭 유지
   ※ #해시는 브라우저가 해당 id 위치로 스크롤시키므로 쓰지 않음 */
function getTabParam() {
  return new URLSearchParams(window.location.search).get("tab");
}

function setTabParam(tab) {
  const params = new URLSearchParams(window.location.search);
  params.set("tab", tab);
  history.replaceState(null, "", window.location.pathname + "?" + params.toString() + window.location.hash);
}

function initTab() {
  const isMainPage = $("#wrap").length === 0;

  function activateTab($clickedLi, updateUrl) {
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
    $tabCont.filter("#" + target).addClass("on");

    if (window.__recalcSelectBoxWidth) window.__recalcSelectBoxWidth();

    if (updateUrl && target && !isMainPage) {
      setTabParam(target);
    }
  }

  $(".tab-wrap li").on("click", function () {
    activateTab($(this), true);
  });

  function openTabFromQuery() {
    if (isMainPage) return;

    const target = getTabParam();
    if (!target) return;

    const $li = $('.tab-wrap li[data-tab="' + target + '"]');
    if ($li.length) {
      activateTab($li, false);
    }
  }

  openTabFromQuery();
  window.addEventListener("popstate", openTabFromQuery);
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
  const isMainPage = $("#wrap").length === 0;

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

    // ✅ 탭 전환 (클래스 방식 → ID 방식). initTab과 동일하게 주소의 ?tab=xxx 로 상태 유지
    function activateTab(tab, updateUrl) {
      var $btn = $btns.filter('[data-tab="' + tab + '"]');
      if (!$btn.length) return;

      $btns.removeClass("active");
      $btn.addClass("active");
      moveIndicator($btn);

      $tabCont.removeClass("on");
      $tabCont.filter("#" + tab).addClass("on");

      // 숨겨져 있던 탭 안의 셀렉트 폭 재계산 (initSelectBox가 숨김 상태에서 0으로 계산해 찌그러지는 문제 방지)
      if (window.__recalcSelectBoxWidth) window.__recalcSelectBoxWidth();

      if (updateUrl && !isMainPage) setTabParam(tab);
    }

    // 주소의 ?tab=xxx 가 있으면 해당 탭으로 시작 (폼 전송/새로고침 후에도 보던 탭 유지)
    var paramTab = isMainPage ? null : getTabParam();
    if (paramTab && $btns.filter('[data-tab="' + paramTab + '"]').length) {
      $btns.removeClass("active").filter('[data-tab="' + paramTab + '"]').addClass("active");
      $tabCont.removeClass("on").filter("#" + paramTab).addClass("on");
      if (window.__recalcSelectBoxWidth) window.__recalcSelectBoxWidth();
    }

    // 초기 위치 세팅 (transition 없이)
    $indicator.css("transition", "none");
    moveIndicator($btns.filter(".active"));
    setTimeout(function () {
      $indicator.css("transition", "");
    }, 50);

    $btns.on("click", function () {
      activateTab($(this).data("tab"), true);
    });

    // 화면 크기 변경(버튼 크기가 달라지는 반응형 구간)·폰트 로딩 후 인디케이터 위치/너비 재계산
    function resetIndicator() {
      $indicator.css("transition", "none");
      moveIndicator($btns.filter(".active"));
      setTimeout(function () {
        $indicator.css("transition", "");
      }, 50);
    }
    $(window).on("resize load", resetIndicator);

    // 뒤로가기/앞으로가기 시 주소의 ?tab=xxx 반영
    window.addEventListener("popstate", function () {
      var t = getTabParam();
      if (t) activateTab(t, false);
    });
  });
}

/* 행 단위 인라인 수정 : .edit-table 안에서 수정 → 해당 행의 .view 가 .edit(입력 필드)로 전환, 취소/저장 시 복귀 */
function initRowEdit() {
  function rowFields($tr, cb) {
    $tr.children("td").each(function () {
      var $td = $(this);
      var $view = $td.children(".view");
      var $edit = $td.children(".edit");
      if (!$view.length || !$edit.length || $td.find(".btn-wrap").length) return;
      cb($view, $edit);
    });
  }

  function editValue($edit) {
    var $lb = $edit.find(".select-label p");
    return $lb.length ? $lb.text().trim() : $edit.find("input[type=text]").val();
  }

  // 수정 : 보기 → 입력 필드
  $(document).on("click", ".edit-table .row-edit", function () {
    $(this).closest("tr").addClass("is-editing");
    // 숨겨져 있던 셀렉트는 폭이 0으로 계산되어 있으므로 열린 뒤 재계산
    if (window.__recalcSelectBoxWidth) window.__recalcSelectBoxWidth();
  });

  // 취소 : 입력 필드를 보기 값으로 되돌리고 닫기
  $(document).on("click", ".edit-table .row-cancel", function () {
    var $tr = $(this).closest("tr");
    rowFields($tr, function ($view, $edit) {
      var v = $view.text().trim();
      var $lb = $edit.find(".select-label p");
      if ($lb.length) {
        $lb.text(v).removeClass("placeholder");
        $edit.find(".select-box-wrap input[type=hidden]").val(v);
      } else {
        $edit.find("input[type=text]").val(v === "-" ? "" : v);
      }
    });
    $tr.removeClass("is-editing");
  });

  // 저장 : 입력값을 보기 영역에 반영하고 닫기 (실제 저장은 서버 연동 시 처리)
  $(document).on("click", ".edit-table .row-save", function () {
    var $tr = $(this).closest("tr");
    rowFields($tr, function ($view, $edit) {
      var v = editValue($edit);
      if (!v) v = "-";
      var $status = $view.find(".status");
      if ($status.length) {
        $status.text(v).toggleClass("lightblue", v === "활동중").toggleClass("dgray", v !== "활동중");
      } else {
        $view.text(v);
      }
    });
    $tr.removeClass("is-editing");
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
    // 숨겨져 있던 팝업 안의 셀렉트는 폭이 0으로 계산되어 있으므로 열린 뒤 재계산
    if (window.__recalcSelectBoxWidth) window.__recalcSelectBoxWidth();
  }

  function closePopup($popup) {
    $popup.removeClass("active");
    var $wrap = $popup.closest(".layer-popup-wrap");
    // 다른 팝업이 아직 열려 있으면(팝업 위 팝업) 딤/스크롤 잠금 유지
    if (!$wrap.find(".layer-popup.active").length) {
      $wrap.removeClass("active");
      unlockScroll();
    }
  }

  window.openLayerPopup = openPopup;

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
    var $wrap = $(this).closest("dd, .input-wrap.col");
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
    // 팝업 검색 버튼은 .input-btn-wrap 안, 페이지 검색 필드는 .input-wrap 안에 있을 수 있음
    $targetInput = $(this).closest(".input-btn-wrap, .input-wrap").find("input[type='text']").first();

    // 같은 줄(.radio-input-wrap / .radio-row)의 radio 만 연동 (없으면 연동 안 함)
    // ※ 위로 끝까지 올라가며 찾으면 표/폼 안의 다른 radio 그룹까지 선택되어 값이 바뀜
    $targetRadio = $(this).closest(".radio-input-wrap, .radio-row").find("input[type='radio']");
  });

  $(document).on("click", ".lp-search-list p", function (e) {
    if (!$targetInput || !$targetInput.length) return;

    // 선택 버튼이 있는 목록(.pick) : 접수완료 등으로 선택불가(.disabled)인 항목은 무시하고, [선택] 버튼을 눌렀을 때만 선택됨
    if ($(this).closest(".lp-search-list").hasClass("pick")) {
      if ($(this).hasClass("disabled") || !$(e.target).closest(".btn-pick").length) return;
    }

    // ✅ 라디오 먼저 체크 → input 활성화
    if ($targetRadio && $targetRadio.length) {
      $targetRadio.prop("checked", true).trigger("change");
    }

    // ✅ 활성화된 후 값 삽입
    $targetInput.val($(this).attr("data-value") || $(this).text().trim());

    $targetInput = null;
    $targetRadio = null;

    var $lp = $(this).closest(".lp-search");
    var $wrap = $lp.closest(".layer-popup-wrap");
    $lp.removeClass("active");
    // 본당 검색 팝업 아래에 다른 팝업이 열려 있으면 유지
    if (!$wrap.find(".layer-popup.active").length) {
      $wrap.removeClass("active");
      $("html, body").css("overflow", "");
    }
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
        spaceBetween: 16,
        autoHeight: true,
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
      if (window.innerWidth <= 768) {
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
    var min = parseInt($wrap.data("min"), 10);
    if (isNaN(min)) min = 1;
    var max = parseInt($wrap.data("max"), 10);
    if (isNaN(max)) max = 999;
    var val = parseInt($input.val(), 10);
    if (isNaN(val)) val = min;

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
  var $fixLabel = $side.find(".year-num .fix");

  function buildDecadesFromDOM() {
    var decades = {};
    $page.find(".history-body .tab-cont").each(function () {
      var tabId = $(this).attr("id");
      var years = [];
      $(this)
        .find(".history-group[data-year]")
        .each(function () {
          var full = $(this).data("year") + "";
          years.push({ full: full, century: full.slice(0, 2), short: full.slice(-2) });
        });
      decades[tabId] = years;
    });
    return decades;
  }

  var decades = buildDecadesFromDOM();

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
    decades[tabId].forEach(function (item) {
      $rollList.append('<li data-year="' + item.full + '">' + item.short + "</li>");
    });
    setActiveIndex(0, true);
  }

  function updateFixLabel(idx) {
    var $li = $rollList.find("li").eq(idx);
    var full = $li.attr("data-year") || "";
    if (full.length === 4) {
      $fixLabel.text(full.slice(0, 2));
    }
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

    updateFixLabel(idx);
  }

  /* 현재 활성 tab-cont 안의 연도 그룹이 뷰포트 상단 부근에 들어오면 그 인덱스로 롤 이동 */
  function initHistoryScroll() {
    if (!("IntersectionObserver" in window)) return;

    var $groups = $page.find(".history-group[data-year]");
    var intersecting = new Set();

    function pickActive() {
      for (var i = 0; i < $groups.length; i++) {
        if (!intersecting.has($groups[i])) continue;

        var $group = $($groups[i]);
        if (!$group.closest(".tab-cont").hasClass("on")) continue;

        var year = $group.data("year") + "";
        var idx = $rollList.find('li[data-year="' + year + '"]').index();
        if (idx > -1) setActiveIndex(idx, false);
        return;
      }
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            intersecting.add(entry.target);
          } else {
            intersecting.delete(entry.target);
          }
        });
        pickActive();
      },
      { root: null, rootMargin: "-29% 0px -70% 0px", threshold: 0 },
    );

    $groups.each(function () {
      observer.observe(this);
    });

    // 옵저버 밴드를 건너뛰는 순간이동(Home/End, 제스처) 대응 - 페이지 최상단/최하단 근처면 강제로 맨 앞/맨 끝 연도로
    function checkScrollExtremes() {
      var scrollY = window.scrollY || window.pageYOffset;
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollY <= 2) {
        setActiveIndex(0, false);
      } else if (scrollY >= maxScroll - 2) {
        setActiveIndex($rollList.find("li").length - 1, false);
      }
    }

    $(window).on("scroll", checkScrollExtremes);
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

    function update() {
      var topOffset = getTopOffset();
      var pageTop = $page.offset().top - 80;
      var scrollY = $(window).scrollTop();
      var start = pageTop - topOffset;
      var realPageTop = $page.offset().top;
      var isBottomChk = $page.find(".history-body").hasClass("bottom-chk");

      if (scrollY <= start) {
        $side.removeClass("is-fixed is-bottom").css({ top: "", left: "", paddingTop: "" });
      } else if (isBottomChk) {
        var $body = $page.find(".history-body");
        var bodyBottom = $body.offset().top + $body.outerHeight();
        var dockTop = bodyBottom - realPageTop - sideH;
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

  var initialTabId = $page.find(".history-body .tab-cont.on").attr("id") || Object.keys(decades)[0];
  renderRollList(initialTabId);

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
      window.showToast(FACILITIES[id].name + "은(는) " + FACILITIES[conflict].name + "과(와) 동일일시 중복대관이 불가합니다.", "warning");
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
      window.showToast("시설을 먼저 선택해 주세요.", "warning");
      return;
    }
    var date = $(".datepicker-input").val();
    if (!date) {
      window.showToast("대관일자를 선택해 주세요.", "warning");
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
      html += "<td>" + subtotal.toLocaleString() + "원</td>";
      html += "</tr>";
    });

    $costBody.html(html);
    $costTotalLabel.text("총 대관료 (" + selectedFacilities.length + "개 시설)");
    $costTotal.text(total.toLocaleString() + "원");
  }

  /* ---------- 이전단계 / 다음단계 ---------- */
  /* 이전단계 : 링크 이동은 막고, 확인 팝업(.layer-popup[data-popup="popupLeaveConfirm"])의 [예]를 누르면 이동
     (#prevStepBtn 에 data-popup="popupLeaveConfirm" data-confirm-msg="문구" 를 달아 두며, 팝업이 없는 페이지는 바로 이동) */
  $("#prevStepBtn").on("click", function (e) {
    e.preventDefault();
    if (!$(".layer-popup[data-popup='popupLeaveConfirm']").length) window.location.href = $(this).attr("href");
  });
  $(document).on("click", ".layer-popup[data-popup='popupLeaveConfirm'] .confirm-yes", function () {
    window.location.href = $("#prevStepBtn").attr("href");
  });

  $("#nextStepBtn").on("click", function (e) {
    e.preventDefault();
    if (!availabilityChecked) {
      window.showToast("이용가능여부 확인 후 다음 단계로 진행할 수 있습니다.", "warning");
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

function initMapTableWrap() {
  $(".map-table-wrap").each(function () {
    var $wrap = $(this);
    var $tbody = $wrap.find(".table-wrap table tbody");
    var $dataEl = $wrap.find(".district-data");
    var allData = $dataEl.length ? JSON.parse($dataEl.text()) : {};
    var colCount = $wrap.find(".table-wrap table thead th").length || 1;
    var fixedRows = parseInt($wrap.attr("data-rows"), 10);
    var maxRows;
    if (!isNaN(fixedRows) && fixedRows > 0) {
      maxRows = fixedRows;
    } else {
      maxRows = 0;
      Object.keys(allData).forEach(function (key) {
        if (allData[key].length > maxRows) maxRows = allData[key].length;
      });
    }

    function renderTable(name) {
      var rows = name ? allData[name] || [] : [];
      var emptyRow = new Array(colCount).fill("");

      $tbody.empty();
      for (var i = 0; i < maxRows; i++) {
        var row = rows[i] || emptyRow;
        $tbody.append(
          "<tr>" +
            row
              .map(function (cell) {
                return "<td>" + cell + "</td>";
              })
              .join("") +
            "</tr>",
        );
      }
    }

    $wrap.find(".pin-wrap [data-district]").on("click", function () {
      var name = $(this).data("district");

      $wrap.find(".pin-wrap [data-district]").removeClass("on");
      $(this).addClass("on");

      renderTable(name);
    });

    renderTable(null);
  });
}

/* =========================================================
   파일 첨부 (.file-upload-wrap) : 파일선택 버튼 / 드래그 & 드롭
   - 구조 : .file-upload-wrap > button.file-btn + .file-name + input.file-input[hidden]
   - input[accept] 에 확장자(.pdf,.hwp ...)가 있으면 확장자를 검사하고,
     맞지 않으면 data-alert 문구(없으면 기본 문구)로 알린 뒤 선택을 취소
   - 파일이 여러 개면 파일명을 ', ' 로 이어서 표시, 선택 해제 시 처음 문구로 복원
   - 드래그 & 드롭 : .file-drop 으로 감싼 영역에서 동작 (.dragover 클래스로 강조)
========================================================= */
(function () {
  $(document).on("click", ".file-upload-wrap .file-btn", function () {
    $(this).siblings(".file-input").trigger("click");
  });

  $(document).on("change", ".file-upload-wrap .file-input", function () {
    var $name = $(this).siblings(".file-name");
    if ($name.data("default") === undefined) $name.data("default", $name.text());

    var accept = ($(this).attr("accept") || "")
      .split(",")
      .map(function (s) {
        return s.trim().toLowerCase();
      })
      .filter(function (s) {
        return s.charAt(0) === ".";
      });

    if (accept.length && this.files.length) {
      var ok = true;
      $.each(this.files, function (_, f) {
        var idx = f.name.lastIndexOf(".");
        var ext = idx < 0 ? "" : f.name.slice(idx).toLowerCase();
        if ($.inArray(ext, accept) < 0) ok = false;
      });
      if (!ok) {
        window.showToast($(this).data("alert") || "허용되지 않는 파일 형식입니다.", "warning");
        this.value = "";
        $name.text($name.data("default"));
        return;
      }
    }

    var names = $.map(this.files, function (f) {
      return f.name;
    }).join(", ");
    $name.text(names || $name.data("default"));
  });

  $(document).on("dragover dragenter", ".file-drop", function (e) {
    e.preventDefault();
    $(this).addClass("dragover");
  });

  $(document).on("dragleave drop", ".file-drop", function (e) {
    e.preventDefault();
    $(this).removeClass("dragover");
    if (e.type === "drop") {
      var dt = e.originalEvent.dataTransfer;
      var $in = $(this).find(".file-input");
      if (dt && dt.files.length && $in.length) {
        $in[0].files = dt.files;
        $in.trigger("change");
      }
    }
  });
})();
/* =========================================================
   비밀번호 확인 팝업 (.layer-popup 안의 .pw-confirm)
   - 입력값이 팝업의 data-pw 와 다르면 data-alert(없으면 기본 문구)로 알리고 입력값을 비움
   - 같으면 data-href 로 이동 (data-pw / data-href 는 개발 시 서버 검증으로 대체)
========================================================= */
(function () {
  function confirmPw($popup) {
    var $in = $popup.find("input[type='password']");
    if ($in.val() !== String($popup.data("pw"))) {
      window.showToast($popup.data("alert") || "비밀번호가 다릅니다.", "error");
      $in.val("").trigger("focus");
      return;
    }
    if ($popup.data("href")) location.href = $popup.data("href");
  }

  $(document).on("click", ".layer-popup .pw-confirm", function () {
    confirmPw($(this).closest(".layer-popup"));
  });

  $(document).on("keydown", ".layer-popup input[type='password']", function (e) {
    if (e.key === "Enter" && $(this).closest(".layer-popup").find(".pw-confirm").length) {
      e.preventDefault();
      confirmPw($(this).closest(".layer-popup"));
    }
  });
})();

/* 숫자만 입력 (input.num) : 숫자가 아닌 문자는 입력되는 즉시 제거 */
$(document).on("input", "input.num", function () {
  var v = this.value.replace(/\D/g, "");
  if (v !== this.value) this.value = v;
});

/* =========================================================
   인쇄 버튼 ([data-print])
   - data-print 만 있으면 페이지 전체를 인쇄
   - data-print=".선택자" 이면 그 영역만 인쇄 (예: 레이어팝업 안의 청구서 영역)
     대상과 그 부모들에 .print-keep, 나머지 형제 요소에 .print-hide 를 잠시 붙이고
     인쇄가 끝나면(afterprint) 모두 제거 — 인쇄용 스타일은 components.css 의 @media print
========================================================= */
$(document).on("click", "[data-print]", function (e) {
  e.preventDefault();
  var sel = $(this).attr("data-print");
  var $target = sel ? $(sel).first() : $();
  if (!$target.length) {
    window.print();
    return;
  }

  var $chain = $target.parents().addBack();
  $chain.addClass("print-keep");
  $chain.each(function () {
    $(this).siblings().addClass("print-hide");
  });
  $target.addClass("print-target");

  function cleanup() {
    $(".print-keep, .print-hide, .print-target").removeClass("print-keep print-hide print-target");
    window.removeEventListener("afterprint", cleanup);
  }
  window.addEventListener("afterprint", cleanup);
  window.print();
});

/* =========================================================
   토스트 메시지 / 확인 팝업 / 새로고침
   - showToast("문구", "종류", 시간) : 화면 가운데에 문구를 잠깐 보여줌 (기본 1.5초, 토스트 바깥 영역을 누르면 바로 닫힘). 종류 : (생략)=기본 / info / success / warning / error / confusing
       시간(선택) : 보여줄 시간(ms). 문구가 길면 늘려서 사용 예) showToast("긴 문구", "info", 3000)
   - [data-toast-msg="문구" data-toast-type="종류" data-toast-time="3000"] : 누르면 그 문구를 토스트로 보여줌 (data-toast-time 은 선택, ms 단위. 확인 팝업의 data-toast 에도 같이 사용 가능)
   - 확인 팝업 : 트리거 버튼에 data-popup="팝업이름" data-confirm-msg="줄1|줄2" data-toast="완료 문구" 를 달면
       팝업(.layer-popup.confirm)의 .confirm-msg 에 문구를 넣어 열고('|' 는 줄바꿈),  data-toast-type 으로 토스트 종류를 정함,
       팝업의 .confirm-yes 를 누르면 팝업(딤 포함)을 닫고 data-toast 문구를 토스트로 보여줌 (실제 처리는 개발 쪽에서 연결)
   - [data-reload] : 누르면 페이지를 새로고침
========================================================= */
window.showToast = function (msg, type, ms) {
  var $toast = $('<div class="toast" role="status"></div>').addClass(type || "").text(msg).appendTo("body");
  var closed = false;
  var showTimer = setTimeout(function () {
    $toast.addClass("show");
  }, 10);
  var hideTimer = setTimeout(close, ms > 0 ? ms : 1500);

  function close() {
    if (closed) return;
    closed = true;
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    $toast.removeClass("show");
    setTimeout(function () {
      $toast.remove();
    }, 300);
  }
  $toast.data("born", Date.now()).data("close", close);
};

/* 토스트 바깥 영역을 누르면 바로 닫음 (토스트를 띄운 바로 그 클릭은 무시, 토스트 자체를 누른 경우도 무시) */
$(document).on("click", function (e) {
  $(".toast").each(function () {
    var $t = $(this);
    if (Date.now() - $t.data("born") < 100) return;
    var r = this.getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) return;
    if ($t.data("close")) $t.data("close")();
  });
});

(function () {
  var $lastTrigger = null;

  $(document).on("click", "[data-toast-msg]", function () {
    window.showToast($(this).attr("data-toast-msg"), $(this).attr("data-toast-type"), Number($(this).attr("data-toast-time")));
  });

  $(document).on("click", "[data-confirm-msg]", function () {
    $lastTrigger = $(this);
    var $popup = $(".layer-popup[data-popup='" + $(this).attr("data-popup") + "']");
    var lines = String($(this).attr("data-confirm-msg")).split("|");
    $popup.find(".confirm-msg").empty();
    $.each(lines, function (i, line) {
      if (i) $popup.find(".confirm-msg").append("<br>");
      $popup.find(".confirm-msg").append(document.createTextNode(line));
    });
  });

  $(document).on("click", ".layer-popup .confirm-yes", function () {
    $(this).closest(".layer-popup").find(".head .close").first().trigger("click");
    var msg = $lastTrigger && $lastTrigger.attr("data-toast");
    if (msg) window.showToast(msg, $lastTrigger.attr("data-toast-type"), Number($lastTrigger.attr("data-toast-time")));
  });

  $(document).on("click", "[data-reload]", function (e) {
    e.preventDefault();
    location.reload();
  });
})();

/* =========================================================
   약관 동의 : [data-agree-btn] 버튼을 누를 때 페이지의 input[data-agree] 체크박스가 모두 체크되어 있어야 이동
   - 체크되지 않은 항목이 있으면 이동을 막고 그 항목의 data-agree-msg 문구를 경고 토스트로 보여줌
========================================================= */
$(document).on("click", "[data-agree-btn]", function (e) {
  var $unchecked = $("input[data-agree]").not(":checked").first();
  if (!$unchecked.length) return;
  e.preventDefault();
  window.showToast($unchecked.attr("data-agree-msg") || "필수 항목에 동의해 주세요.", "warning");
});

/* =========================================================
   명단 작성 : .roster-row 안에 입력된 값이 하나라도 있으면 .filled 를 붙여 입력 행 색을 바꿈
   - 색은 .roster-group.boy / .girl 에 따라 CSS 에서 결정
========================================================= */
(function () {
  function refreshRow($row) {
    var filled = false;
    $row.find("input[type='text'], input[type='hidden']").each(function () {
      if ($(this).val().replace(/\s+/g, "") !== "") filled = true;
    });
    $row.toggleClass("filled", filled);
  }

  $(document).on("input change", ".roster-row input", function () {
    refreshRow($(this).closest(".roster-row"));
  });

  // 학년 셀렉트 : 선택 처리(hidden 값 갱신) 이후 갱신
  $(document).on("click", ".roster-row .select-box-list-wr li", function () {
    var $row = $(this).closest(".roster-row");
    setTimeout(function () {
      refreshRow($row);
    }, 0);
  });

  $(function () {
    $(".roster-row").each(function () {
      refreshRow($(this));
    });
  });
})();

/* =========================================================
   선택 값 자동 입력 : .select-box-wrap[data-fill="입력칸 선택자"]
   - 같은 .input-wrap 안의 입력칸에 선택한 옵션의 data-value 를 넣고 읽기 전용으로 만듦
   - data-value 가 비어 있는 옵션(직접입력)을 고르면 입력칸을 비우고 직접 입력할 수 있게 함
   - 예) 이메일 도메인 선택 : 신청 > 자원봉사 신청서
========================================================= */
$(document).on("click", ".select-box-wrap[data-fill] .select-box-list-wr li", function () {
  var $wrap = $(this).closest(".select-box-wrap");
  var $target = $wrap.closest(".input-wrap").find($wrap.attr("data-fill")).first();
  var value = $(this).attr("data-value") || "";

  $wrap.find("input[type='hidden']").val(value);
  if (!$target.length) return;

  $target.val(value).prop("readonly", value !== "");
  if (value === "") $target.trigger("focus");
});


/* =========================================================
   필수 입력 검사 : [data-validate-btn] 버튼을 누르면 페이지의 [data-req] 항목을 위에서부터 차례로 검사
   - 이동은 먼저 막고, 비어 있거나 형식이 맞지 않는 첫 항목의 문구를 경고 토스트(warning)로 보여준 뒤 그 항목으로 이동
   - 모두 통과하면 버튼의 href 로 이동 (href 가 비어 있으면 아무것도 하지 않음)
   - 버튼에 data-after-popup="팝업이름" 이 있으면 통과 후 바로 이동하지 않고 그 팝업을 먼저 열며, 팝업의 [확인](.confirm-yes)을 누르면 href 로 이동 ([취소]는 팝업만 닫음)
   - data-req="미입력 문구" : input(text·password·hidden·file)은 값이 있어야 하고, 라디오·체크박스 묶음(컨테이너)은 하나 이상 체크되어야 함
   - data-req-pattern="정규식" data-req-pattern-msg="문구" : 값이 있을 때 형식을 추가로 검사 (선택)
   - 선택 상자(.select-box-wrap)는 내부 hidden input 에 data-req 를 달아 둠
========================================================= */
$(document).on("click", "[data-validate-btn]", function (e) {
  e.preventDefault();

  var fail = null;
  $("[data-req]").each(function () {
    var $el = $(this);
    var msg = "";
    var filled;

    if ($el.is("input[type='file']")) {
      filled = !!($el[0].files && $el[0].files.length);
    } else if ($el.is("input")) {
      filled = String($el.val()).trim() !== "";
    } else {
      filled = $el.find("input:checked").length > 0;
    }

    if (!filled) {
      msg = $el.attr("data-req");
    } else if ($el.attr("data-req-pattern") && !new RegExp($el.attr("data-req-pattern")).test(String($el.val()).trim())) {
      msg = $el.attr("data-req-pattern-msg") || $el.attr("data-req");
    }

    if (msg) {
      fail = { $el: $el, msg: msg };
      return false;
    }
  });

  if (fail) {
    window.showToast(fail.msg, "warning");
    if (fail.$el.is("input[type='text'], input[type='password']")) {
      fail.$el.trigger("focus");
    } else {
      var $row = fail.$el.closest(".row, section");
      if ($row.length) $row[0].scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  var href = $(this).attr("href");
  var afterPopup = $(this).attr("data-after-popup");
  if (afterPopup && window.openLayerPopup) {
    $(".layer-popup[data-popup='" + afterPopup + "']").data("go", href || "");
    window.openLayerPopup(afterPopup);
    return;
  }
  if (href) window.location.href = href;
});

/* 검사를 통과한 뒤 안내 팝업을 먼저 보여주는 경우 : 팝업의 [확인](.confirm-yes)을 누르면 버튼의 href 로 이동 */
$(document).on("click", ".layer-popup[data-popup] .confirm-yes", function () {
  var go = $(this).closest(".layer-popup").data("go");
  if (go) window.location.href = go;
});


/* =========================================================
   등록파일 삭제 : .registered[data-req-after="문구"] 안의 .file-del (X) 버튼
   - 이미 등록한 첨부파일 표시를 지우고, 같은 .file-upload-wrap 의 파일 입력칸을 필수(data-req)로 바꿈
     (삭제하면 새 파일을 반드시 등록해야 하므로 필수 입력 검사에서 문구로 안내)
   - 실제 파일 삭제 처리는 개발 쪽에서 연결
========================================================= */
$(document).on("click", ".registered .file-del", function () {
  var $registered = $(this).closest(".registered");
  var $input = $registered.closest(".file-upload-wrap").find(".file-input");
  var msg = $registered.attr("data-req-after");

  if (msg) $input.attr("data-req", msg);
  $registered.remove();
  window.showToast("등록파일을 삭제했습니다. 새 파일을 등록해 주세요.", "info");
});


/* =========================================================
   선택 초기화 : .select-box-wrap[data-reset]
   - 선택 상자의 처음 안내 문구(예: "숙소 선택")를 목록 맨 위 항목(li.reset)으로 자동 추가
   - 이 항목을 누르면 아무것도 선택하지 않은 처음 상태로 되돌림 (안내 문구 표시, 숨은 입력값은 빈 값)
   - 항목 이름은 선택 상자의 처음 안내 문구이며, 처음부터 값이 선택돼 있으면 data-reset="학년" 처럼 문구를 지정할 수 있음
   - 선택 사항인 선택 상자에만 data-reset 을 달고, 필수 항목에는 달지 않음
========================================================= */
$(function () {
  $(".select-box-wrap[data-reset]").each(function () {
    var $wrap = $(this);
    var text = $wrap.attr("data-reset") || $wrap.find(".select-label p").first().text(); /* data-reset="문구" 로 항목 이름을 따로 줄 수 있음(처음에 값이 선택돼 있는 선택 상자용) */
    $wrap.data("resetText", text);
    $wrap.find(".select-box-list-wr ul").first().prepend('<li class="reset" data-value=""><p></p></li>');
    $wrap.find("li.reset p").text(text);
  });
});

$(document).on("click", ".select-box-wrap[data-reset] li.reset", function () {
  var $wrap = $(this).closest(".select-box-wrap");
  /* 선택 상자 공통 처리(값 저장)가 먼저 실행된 뒤 처음 상태로 덮어씀 */
  setTimeout(function () {
    $wrap.find(".select-label p").first().text($wrap.data("resetText")).addClass("placeholder");
    $wrap.find("input[type='hidden']").val("").trigger("change");
  }, 0);
});


/* =========================================================
   약관·규정 버전 선택 : .rule-top 의 버전 선택 상자(.select-box-wrap)
   - 선택한 항목의 data-value(YYYYMMDD)와 같은 data-version 의 .rule-ver 블록만 보이고(.on), 상단 시행일자(.rule-date)가 그 날짜로 바뀜
   - 현행 버전 항목에는 data-current 를 달며, 현행이 아닌 버전을 고르면 이전 버전 안내(.rule-old-note)가 나타남
   - 실제 서비스에서는 버전별 내용을 서버에서 불러와 .rule-ver 에 넣어야 함 (개발 필요)
========================================================= */
$(document).on("click", ".rule-top .select-box-list-wr li", function () {
  var $li = $(this);
  var value = String($li.attr("data-value") || "");
  var $wrap = $li.closest(".cont-wrap");
  var $ver = $wrap.find(".rule-ver[data-version='" + value + "']");
  if (!$ver.length) return;

  $wrap.find(".rule-ver").removeClass("on");
  $ver.addClass("on");

  if (/^\d{8}$/.test(value)) {
    $wrap.find(".rule-date").text("시행일자 : " + value.slice(0, 4) + "년 " + Number(value.slice(4, 6)) + "월 " + Number(value.slice(6, 8)) + "일");
  }
  $wrap.find(".rule-old-note").prop("hidden", $li.is("[data-current]"));
});


/* =========================================================
   목차 이동 : .rule-toc 안의 링크(href="#아이디")를 누르면 해당 영역으로 부드럽게 스크롤
   - 고정 헤더에 가려지지 않도록 헤더 높이만큼 띄워서 멈춤
========================================================= */
$(document).on("click", ".rule-toc a[href^='#']", function (e) {
  var $target = $($(this).attr("href"));
  if (!$target.length) return;
  e.preventDefault();
  window.scrollTo({ top: $target.offset().top - $("header").outerHeight() - 20, behavior: "smooth" });
});
