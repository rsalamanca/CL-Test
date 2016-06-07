/*a simple function to click next link
a timer will call this function, and the rotation will begin*/
function rotate() {
    $('#next').click();
}

function resetSlides(container,item_width) {
   //and adjust the container so current is in the frame
   container.css({
      'left': -1 * item_width
   });
}

function buttonClickAction(e,item_width,container,elm,next,previous){		   
        
   if (container.is(':animated')) {
      return false;
   }
   //previous Button
   if (e.target.id == previous) {
      container.stop().animate({
         'left': 0
      }, 1500, function () {
         container.find(elm + ':first').before(container.find(elm + ':last'));
         resetSlides(container,item_width);
      });
   }
   
   //next Button
   if (e.target.id == next) {
      container.stop().animate({
         'left': item_width * -2
      }, 1500, function () {
         container.find(elm + ':last').after(container.find(elm + ':first'));
         resetSlides(container,item_width);
      });
   }
   
   //prevents from going to the top of the page
   e.preventDefault();

   //cancel the link behavior  
   return false;
}

$(document).ready(function(){
   //rotation speed and timer
   
   var speed = 150000;
    
   var run = setInterval(rotate, speed);
   var slides = $('.slide');
   var container = $('#slidess ul');
   var elm = container.find(':first-child').prop("tagName");
   var item_width = $('#carousel').width();
   var previous = 'prev'; //id of previous button
   var next = 'next'; //id of next button
   slides.width(item_width); //set the slides to the correct pixel width
   container.parent().width(item_width);
   container.width(slides.length * item_width); //set the slides container to the correct total width
   container.find(elm + ':first').before(container.find(elm + ':last'));
   resetSlides(container,item_width);
    
   $(window).resize(function () {
      $('#slidess').width($('#carousel').width());
      $('#slidess ul').css({left:$('#carousel').width()*(-1)});
      $('#slidess ul').width($('#carousel').width()*$('.slide').length);
      $('.slide').width($('#carousel').width());
      
      item_width = $('#carousel').width();
		   
      $('#buttons a').click(function (e) {
         buttonClickAction(e,item_width,container,elm,next,previous);
      });
   });

   //if user clicked on prev button
   $('#buttons a').click(function (e) {
      buttonClickAction(e,item_width,container,elm,next,previous);
   });

   //if mouse hover, pause the auto rotation, otherwise rotate it    
   container.parent().mouseenter(function () {
      clearInterval(run);
   }).mouseleave(function () {
      run = setInterval(rotate, speed);
   });
});