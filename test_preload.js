 document.addEventListener('DOMContentLoaded', function() {
      if (typeof Readmore === 'undefined') {
        console.error('Readmore.js is not loaded. Please check the script source.');
        return;
      }

      var quotes = document.querySelectorAll('.color .quote');
      quotes.forEach(function(quote) {
        new Readmore(quote, {
          speed: 100,
          collapsedHeight: 100,
          heightMargin: 16,
          moreLink: '<a href="#">Read more</a>',
          lessLink: '<a href="#">Close</a>',
          embedCSS: true,
          blockCSS: 'display: block; width: 100%;',
        });
      });
    });
