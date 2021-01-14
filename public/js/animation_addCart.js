let count = 0;
//if add to cart btn clicked
$('body').on('click', "#addToCart",function (){
  let cart = $('.icon-cart');
  // find the img of that card which button is clicked by user
  let imgtodrag = $('.course_image').find("img").eq(0);
  if (imgtodrag) {
    // duplicate the img
    var imgclone = imgtodrag.clone().offset({
      top: imgtodrag.offset().top,
      left: imgtodrag.offset().left
    }).css({
      'opacity': '0.8',
      'position': 'absolute',
      'height': '150px',
      'width': '150px',
      'z-index': '100'
    }).appendTo($('body')).animate({
      'top': cart.offset().top + 10,
      'left': cart.offset().left + 10,
      'width': 75,
      'height': 75
    }, 1000, 'easeInOutExpo');

    imgclone.animate({
      'width': 0,
      'height': 0
    }, function(){
      $(this).detach()
    });
  }
});
