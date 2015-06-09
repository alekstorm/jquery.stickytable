;(function (factory) {
if(typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = factory(require('jquery'), require('throttle-debounce'));
} else if (typeof define === 'function' && define.amd) {
  define(['jquery', 'throttle-debounce'], function($) { return factory($, $); });
} else {
  factory(jQuery, jQuery);
}
}(function ($, td) {
  $.fn.stickyTable = function () {
    var $this = $(this);
    // Add class, remove margins, reset width and wrap table
    $this
    .addClass('sticky-enabled')
    .wrap('<div class="sticky-wrap" />');

    if ($this.hasClass('overflow-y')) {
      $this.removeClass('overflow-y').parent().addClass('overflow-y');
    }

    // Create new sticky table head
    $this.after('<table class="sticky-thead" />');

    // If <tbody> contains <th>, then we create sticky column and intersect
    if ($this.find('tbody th').length > 0) {
      $this.after('<table class="sticky-col" /><table class="sticky-intersect" />');
    }

    // Create shorthand for things
    var $stickyHead  = $(this).siblings('.sticky-thead'),
      $stickyCol   = $(this).siblings('.sticky-col'),
      $stickyInsct = $(this).siblings('.sticky-intersect'),
      $stickyWrap  = $(this).parent('.sticky-wrap');

    $stickyHead.append($this.find('thead').clone());

    $stickyCol
    .append($this.find('thead, tbody').clone())
      .find('thead th:gt(0)').remove()
      .end()
      .find('tbody td').remove();

    $stickyInsct.html('<thead><tr><th>'+$this.find('thead th:first-child').html()+'</th></tr></thead>');

    // Set widths
    function setWidths() {
      $this
      .find('thead th').each(function (i) {
        $stickyHead.find('th').eq(i).width($(this).width());
      })
      .end()
      .find('tr').each(function (i) {
        $stickyCol.find('tr').eq(i).height($(this).height());
      });

      // Set width of sticky table head
      $stickyHead.width($this.width());

      // Set width of sticky table col
      $stickyCol.find('th').add($stickyInsct.find('th')).width($this.find('thead th').width())
    };

    function repositionStickyHead() {
      var allowance = 0;
      // Calculate allowance
      $this.find('tbody tr:lt(3)').each(function () {
        allowance += $(this).height();
      });
      
      // Set fail safe limit (last three row might be too tall)
      // Set arbitrary limit at 0.25 of viewport height, or you can use an arbitrary pixel value
      if(allowance > $(window).height()*0.25) {
        allowance = $(window).height()*0.25;
      }
      
      // Add the height of sticky header
      allowance += $stickyHead.height();

      // Check if wrapper parent is overflowing along the y-axis
      if($this.height() > $stickyWrap.height()) {
        // If it is overflowing (advanced layout)
        // Position sticky header based on wrapper scrollTop()
        if($stickyWrap.scrollTop() > 0) {
          // When top of wrapping parent is out of view
          $stickyWrap.addClass('sticky-head-scrolled');
          $stickyHead.add($stickyInsct).css({
            top: $stickyWrap.scrollTop()
          });
        } else {
          // When top of wrapping parent is in view
          $stickyWrap.removeClass('sticky-head-scrolled');
          $stickyHead.add($stickyInsct).css({
            top: 0
          });
        }

      } else {

        if( $(window).scrollTop() > $('.sticky-wrap').offset().top ) {
          $stickyWrap.addClass('sticky-head-scrolled');
          // If Window.scrollTop is above the StickyWrap, then execute
          if( $('.sticky-wrap').scrollLeft() > 0 ) {

            $('.sticky-wrap .sticky-thead').css({
              position: 'fixed',
              top: 0
            });

            $('.sticky-wrap .sticky-intersect').css({
              position: 'fixed',
              top: 0,
              left: 0
            });

            $('.sticky-wrap .sticky-thead').css({
              left: -$('.sticky-wrap').scrollLeft()
            });

          } else {
            $stickyHead.add($stickyInsct).css({
              position: 'fixed',
              top: 0,
              left: 0
            });
          }

        } else {

          $('.sticky-wrap').removeClass('sticky-head-scrolled');

          if($('.sticky-wrap .sticky-thead').css('position') === 'fixed') {
            
            $('.sticky-wrap .sticky-thead').css({
              position: 'absolute',
              top: 0,
              left: 0
            });

            $('.sticky-wrap .sticky-intersect').css({
              position: 'absolute',
              top: 0,
              left: $('.sticky-wrap').scrollLeft()
            });
            
          } 

          $stickyHead.add($stickyInsct).css({
            position: 'absolute',
            top: 0
          });          

        }
      }
    }
    

    function repositionStickyCol() {
      if($stickyWrap.scrollLeft() > 0) {
        // When left of wrapping parent is out of view
        $stickyWrap.addClass('sticky-col-scrolled');

        if($stickyHead.css('position') === "fixed" && $stickyWrap.scrollLeft() > 0) {
          $stickyHead.css({
            left: 0
          });
        }

        $stickyCol.add($stickyInsct).css({
          position: 'absolute',
          left: $stickyWrap.scrollLeft()
        });

        $stickyInsct.css({
          position: 'absolute',
          top: $(window).scrollTop() - $this.offset().top
        });

        $stickyHead.css({
          position: 'absolute',
          top: $(window).scrollTop() - $this.offset().top
        });

        if( $(window).scrollTop() < $this.offset().top ) {

          $stickyHead.css({
            position: 'absolute',
            top: 0
          });

          $stickyInsct.css({
            position: 'absolute',
            top: 0
          });
        }

      } else {
        // When left of wrapping parent is in view
        $stickyWrap.removeClass('sticky-col-scrolled');
        $stickyCol
        .add($stickyInsct).css({ left: 0 });
      }
    };

    var previousVerticalScroll = 0;
    $(window).scroll(function(e) {

      var currentVerticalPos = $(window).scrollTop();
      var currentHorizontalPos = $(window).scrollLeft();

      if( currentHorizontalPos == previousHorizontalScroll ) {
        // Vertical scrolling on Window
        repositionStickyHead();
      }
      previousVerticalScroll = currentVerticalPos;
    });


    var previousHorizontalScroll = 0;
    $stickyWrap.scroll(function() {
        var stickyWrapScrollLeft = $stickyWrap.scrollLeft();
        if (previousHorizontalScroll != stickyWrapScrollLeft) {
            // Horizonal scrolling in sticky-wrap
            repositionStickyCol();
        }
        previousHorizontalScroll = stickyWrapScrollLeft;
    });

    setWidths();
    
  }
}));