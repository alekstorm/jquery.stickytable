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
          $stickyHead.add($stickyInsct).css({
            opacity: 1,
            top: $stickyWrap.scrollTop()
          });
        } else {
          // When top of wrapping parent is in view
          $stickyHead.add($stickyInsct).css({
            opacity: 0,
            top: 0
          });
        }
      } else {
        // If it is not overflowing (basic layout)
        // Position sticky header based on viewport scrollTop
        if($(window).scrollTop() > $this.offset().top && $(window).scrollTop() < $this.offset().top + $this.outerHeight() - allowance) {
          // When top of viewport is in the table itself
          $stickyHead.add($stickyInsct).css({
            opacity: 1,
            top: $(window).scrollTop() - $this.offset().top
          });
        } else {
          // When top of viewport is above or below table
          $stickyHead.add($stickyInsct).css({
            opacity: 0,
            top: 0
          });
        }
      }
    };
    function repositionStickyCol() {
      if($stickyWrap.scrollLeft() > 0) {
        // When left of wrapping parent is out of view
        $stickyCol.add($stickyInsct).css({
          opacity: 1,
          left: $stickyWrap.scrollLeft()
        });
      } else {
        // When left of wrapping parent is in view
        $stickyCol
        .css({ opacity: 0 })
        .add($stickyInsct).css({ left: 0 });
      }
    };

    setWidths();

    $this.parent('.sticky-wrap').scroll(td.throttle(250, function() {
      repositionStickyHead();
      repositionStickyCol();
    }));

    $(window)
    .load(setWidths)
    .resize(td.debounce(250, function () {
      setWidths();
      repositionStickyHead();
      repositionStickyCol();
    }))
    .scroll(td.throttle(250, repositionStickyHead));
  }
}));
