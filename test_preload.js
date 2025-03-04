$(document).ready(function() {
  $(".color .quote").readmore({
    speed: 100,
    collapsedHeight: 170,
    moreLink: '<a href="#">Show More...</a>',
    lessLink: '', // Removes the "Show Less" button
    afterToggle: function(trigger, element, expanded) {
      if (expanded) {
        $(trigger).remove(); // Removes the button after expanding
      }
    }
  });
});
