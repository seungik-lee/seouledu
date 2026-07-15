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

  // 항목 선택 시 p에 텍스트 반영 후 닫기
  $(document).on("click", ".select-box-wrap .select-box-list-wr li", function () {
    var $wrap = $(this).closest(".select-box-wrap");
    var $p = $wrap.find("> p");
    var $listWr = $wrap.find(".select-box-list-wr");

    $p.text($(this).text());
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
