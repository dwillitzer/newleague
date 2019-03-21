"use strict";
(function($) {
$.ourDiffScroll = function() { // specific to the Our Difference section, for effect
	var // elements
	section = $('#difference'),
	bgIm = section.children('img').first(),
	secTitle = section.children('h1').first(),
	para = section.children('p'),
	// positions
	secTop = section.offset().top,
	titleTop = secTitle.offset().top - parseInt(secTitle.css('margin-top').slice(0,-2)), // top doesn't count margin
	paraTop = para.first().offset().top - parseInt(para.css('margin-top').slice(0,-2)),
	visibleOffset = para.first().offset().top - secTop,
	dist = para.last().offset().top - para.first().offset().top,
	secHeight = bgIm.outerHeight(true) + dist - parseInt(section.css('padding-top').slice(0,-2)),
	setFixed = false, // to ensure that it doesn't change settings with a leftover throttled event outside the fixed region
	paraPos = [];

	section.css('height',secHeight);

	para.each(function(index) {
		paraPos[index] = $(this).offset().top;
	});

	para.not(':first').fadeTo(0,0);

	var setFixedPos = function() { // horizontal positioning for smaller viewports
		if(setFixed) {
			secTitle.css('left',section.offset().left-$(window).scrollLeft());
			para.css('left',section.offset().left-$(window).scrollLeft());
			bgIm.css('left',section.offset().left-$(window).scrollLeft()+section.outerWidth(true)-bgIm.outerWidth(true));
		}
	}

	var scroller = function() { // sets opacity based on position
		setFixedPos();
		para.each(function(index) {
			var op = Math.max(0,150-Math.min(150,Math.abs(visibleOffset -
				(paraPos[index]-$(window).scrollTop()))));
			$(this).fadeTo(0,op/100);
		});
	}

	// Our Difference section scrolling
	$.waypoints.settings.scrollThrottle = 1; // removes the lag
	section.waypoint(function(direction) { // top edge
		if(direction=="up") { // resets to normal flow
			$(window).off('scroll',scroller);
			setFixed = false;
			$(window).off('resize',setFixedPos);
			secTitle.css({'position':'relative','top':0,'left':0,'right':'auto'});
			para.css({'position':'relative','top':0,'left':0,'right':'auto'});
			para.not(':first').fadeTo(0,0);
			para.first().fadeTo(0,1);
			bgIm.css({'position':'absolute','top':0,'left':'auto','right':0});
		} else { // fixes the elements in place
			var secHeight = bgIm.outerHeight(true) + dist - parseInt(section.css('padding-top').slice(0,-2));
			section.css('height',secHeight); // for Safari
			secTitle.css({'position':'fixed','top':titleTop-secTop});
			para.css({'position':'fixed','top':paraTop-secTop});
			bgIm.css({'position':'fixed','top':0,'right':'auto'});
			setFixed = true;
			setFixedPos();
			$(window).on('scroll',$.throttle(10,scroller));
			$(window).on('resize',$.throttle(100,setFixedPos));
		}
	},{
		offset: 0,
		continuous: true
	});
	section.next().waypoint(function(direction) { // bottom edge
		if(direction=="down") { // resets to normal flow
			$(window).off('scroll',scroller);
			setFixed = false;
			$(window).off('resize',setFixedPos);
			secTitle.css({'position':'relative','top':dist,'left':0,'right':'auto'});
			para.css({'position':'relative','top':0,'left':0,'right':'auto'});
			para.not(':last').fadeTo(0,0);
			para.last().fadeTo(0,1);
			bgIm.css({'position':'absolute','top':dist,'left':'auto','right':0});
		} else { // fixes the elements in place
			secTitle.css({'position':'fixed','top':titleTop-secTop});
			para.css({'position':'fixed','top':paraTop-secTop});
			bgIm.css({'position':'fixed','top':0,'right':'auto'});
			setFixed = true;
			setFixedPos();
			$(window).on('scroll',$.throttle(10,scroller));
			$(window).on('resize',$.throttle(100,setFixedPos));
		}
	},{
		offset: bgIm.outerHeight(true),
		continuous: true
	});
}

$.horizontalSections = function() { // for left/right navigable horizontal elements
	var sections = $('.hscroll_wrap');
	$('.forward').css('display','block');

	sections.each(function(index) { // for each set of elements...
		var scroller = $(this).children('.hscroll').first(),
		subsecs = scroller.children('.hsec'),
		secWidth = $(this).outerWidth(true),
		scrollTime = 250, // ms
		forward = $(this).children('.forward'),
		back = $(this).children('.back');

		subsecs.css({ // sets them all side by side, with only one visible
			'position':'absolute',
			'top': 0,
			'left': function(index) {return index*secWidth;}
		});
		scroller.css({'height':subsecs.first().outerHeight(true),'overflow':'hidden'});

		forward.on('click',function() {
			var newPos = 1 - Math.round(subsecs.first().position().left/secWidth); // first element starts at 0, moves negatively for each position forward, add 1 for new position
			if (newPos >= subsecs.length-1) {
				$(this).css('display','none');
			}
			back.css('display','block');
			scroller.animate({'height':$(subsecs[newPos]).outerHeight(true)},scrollTime,'easeInOutExpo');

			subsecs.each(function(index) {
				$(this).animate({'left':(index-newPos)*secWidth},scrollTime,'easeInOutExpo');
			});
		});

		back.on('click',function() {
			var newPos = -1 - Math.round(subsecs.first().position().left/secWidth); // first element starts at 0, moves negatively for each position forward, minus 1 for new position
			if (newPos <= 0) {
				$(this).css('display','none');
			}
			forward.css('display','block');
			scroller.animate({'height':$(subsecs[newPos]).outerHeight(true)},scrollTime,'easeInOutExpo');

			subsecs.each(function(index) {
				$(this).animate({'left':(index-newPos)*secWidth},scrollTime,'easeInOutExpo');
			});
		});
	});
}


$(document).ready(function(){

	// highlight nav menu elements based on position
	$('.section').waypoint(function(direction){
		// default hover state reset
		$('#nav a').css('color','#666').hover(
			function(){
				$(this).css('color','#39c');
			},
			function(){
				$(this).css('color','#666');
		});
		// the current section's item
		if(direction=="up") {
			$('#nav [href="#'+this.id+'"]').parent().prev().children().css(
				'color','#39c').hover(function(){$(this).css('color','#39c')});
		} else {
			$('#nav [href="#'+this.id+'"]').css(
				'color','#39c').hover(function(){$(this).css('color','#39c')});
		}
	},{
		offset: '20%',
		continuous: false
	});



	// smooth scrolling to each section
	$('[href^="#"]').on('click',function(event) {
		event.preventDefault(); //web.archive.org/web/20150804095427/http://normal/ link disabled
		$.scrollTo($(event.target).attr('href'),500,{easing: 'easeInOutExpo'});
	});


	$.ourDiffScroll();

	$.horizontalSections();

	$('#inquiries .mailto').attr('href', 'mailto:support@newleague.co');

	// form processing
	$('#joinform').validate({
		submitHandler: function(form) {
			$(form).ajaxSubmit({
				success: function() {
					var thanks = $('<div>').addClass('thanks');
					$('<h4>').text('Thank You!').appendTo(thanks);
					$('<p>').text(
						'We look forward to evaluating your input and the opportunity. ' +
						'Look for us to contact you in the next few days.').appendTo(thanks);

					$('#join p').remove();
					$('#joinform').replaceWith(thanks);
				}
			});
		}
	});
	/*$('#inquiryform').validate({
		submitHandler: function(form) {
			$(form).ajaxSubmit({
				success: function() {
					$('#inquiryform').replaceWith('<div>Thanks for submitting!<div>')
				}
			});
		}
	});*/
});})(jQuery)
jQuery(document).ready(function($) {
  $('a[href^="#"]').bind('click.smoothscroll',function (e) {
    e.preventDefault();
    var target = this.hash,
        $target = $(target);

    $('html, body').stop().animate( {
      'scrollTop': $target.offset().top-40
    }, 900, 'swing', function () {
      window.location.hash = target;
    } );
  } );
} );
/*
     FILE ARCHIVED ON 09:54:27 Aug 04, 2015 AND RETRIEVED FROM THE
     INTERNET ARCHIVE ON 22:01:09 Aug 11, 2017.
     JAVASCRIPT APPENDED BY WAYBACK MACHINE, COPYRIGHT INTERNET ARCHIVE.

     ALL OTHER CONTENT MAY ALSO BE PROTECTED BY COPYRIGHT (17 U.S.C.
     SECTION 108(a)(3)).
*/
