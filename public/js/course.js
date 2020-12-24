/* JS Document */

/******************************

[Table of Contents]

1. Vars and Inits
2. Set Header
3. Init Menu
4. Init Header Search
5. Init Tabs
6. Init Accordions
7. Init Dropdowns


******************************/

$(document).ready(function()
{
	"use strict";

	/* 

	1. Vars and Inits

	*/

	var header = $('.header');
	var menuActive = false;
	var menu = $('.menu');
	var burger = $('.hamburger');

	setHeader();

	$(window).on('resize', function()
	{
		setHeader();
	});

	$(document).on('scroll', function()
	{
		setHeader();
	});

	initMenu();
	initHeaderSearch();
	initTabs();
	initAccordions();
	initDropdowns();

	/* 

	2. Set Header

	*/

	function setHeader()
	{
		if($(window).scrollTop() > 100)
		{
			header.addClass('scrolled');
		}
		else
		{
			header.removeClass('scrolled');
		}
	}

	/* 

	3. Init Menu

	*/

	function initMenu()
	{
		if($('.menu').length)
		{
			var menu = $('.menu');
			if($('.hamburger').length)
			{
				burger.on('click', function()
				{
					if(menuActive)
					{
						closeMenu();
					}
					else
					{
						openMenu();

						$(document).one('click', function cls(e)
						{
							if($(e.target).hasClass('menu_mm'))
							{
								$(document).one('click', cls);
							}
							else
							{
								closeMenu();
							}
						});
					}
				});
			}
		}
	}

	function openMenu()
	{
		menu.addClass('active');
		menuActive = true;
	}

	function closeMenu()
	{
		menu.removeClass('active');
		menuActive = false;
	}

	/* 

	4. Init Header Search

	*/

	function initHeaderSearch()
	{
		if($('.search_button').length)
		{
			$('.search_button').on('click', function()
			{
				if($('.header_search_container').length)
				{
					$('.header_search_container').toggleClass('active');
				}
			});
		}
	}

	/* 

	5. Init Tabs

	*/

	function initTabs()
	{
		if($('.tab').length)
		{
			$('.tab').on('click', function()
			{
				$('.tab').removeClass('active');
				$(this).addClass('active');
				var clickedIndex = $('.tab').index(this);

				var panels = $('.tab_panel');
				panels.removeClass('active');
				$(panels[clickedIndex]).addClass('active');
			});
		}
	}

	/* 

	6. Init Accordions

	*/

	function initAccordions()
	{
		if($('.accordion').length)
		{
			var accs = $('.accordion');

			accs.each(function()
			{
				var acc = $(this);

				if(acc.hasClass('active'))
				{
					var panel = $(acc.next());
					var panelH = panel.prop('scrollHeight') + "px";
					
					if(panel.css('max-height') == "0px")
					{
						panel.css('max-height', panel.prop('scrollHeight') + "px");
					}
					else
					{
						panel.css('max-height', "0px");
					} 
				}

				acc.on('click', function()
				{
					if(acc.hasClass('active'))
					{
						acc.removeClass('active');
						var panel = $(acc.next());
						var panelH = panel.prop('scrollHeight') + "px";
						
						if(panel.css('max-height') == "0px")
						{
							panel.css('max-height', panel.prop('scrollHeight') + "px");
						}
						else
						{
							panel.css('max-height', "0px");
						} 
					}
					else
					{
						acc.addClass('active');
						var panel = $(acc.next());
						var panelH = panel.prop('scrollHeight') + "px";
						
						if(panel.css('max-height') == "0px")
						{
							panel.css('max-height', panel.prop('scrollHeight') + "px");
						}
						else
						{
							panel.css('max-height', "0px");
						} 
					}
				});
			});
		}
	}

	/* 

	7. Init Dropdowns

	*/

	function initDropdowns()
	{
		if($('.dropdowns li').length)
		{
			var dropdowns = $('.dropdowns li');

			dropdowns.each(function()
			{
				var dropdown = $(this);
				if(dropdown.hasClass('has_children'))
				{
					if(dropdown.hasClass('active'))
					{
						var panel = $(dropdown.find('> ul'));
						var panelH = panel.prop('scrollHeight') + "px";

						if(panel.css('max-height') == "0px")
						{
							panel.css('max-height', panel.prop('scrollHeight') + "px");
						}
						else
						{
							panel.css('max-height', "0px");
						}
					}

					dropdown.find(' > .dropdown_item').on('click', function()
					{
						var panel = $(dropdown.find('> ul'));
						var panelH = panel.prop('scrollHeight') + "px";
						dropdown.toggleClass('active');

						if(panel.css('max-height') == "0px")
						{
							panel.css('max-height', panel.prop('scrollHeight') + "px");
						}
						else
						{
							panel.css('max-height', "0px");
						}
					});
				}
			});
		}
	}

});


// Rating.js
/* jQuery Star Rating Plugin
 * 
 * @Author
 * Copyright Nov 02 2010, Irfan Durmus - http://irfandurmus.com/
 *
 * @Version
 * 0.3b
 *
 * @License
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Visit the plugin page for more information.
 * http://irfandurmus.com/projects/jquery-star-rating-plugin/
 *
 */

(function($){
    $.fn.rating = function(callback){
        
        callback = callback || function(){};

        // each for all item
        this.each(function(i, v){
            
            $(v).data('rating', {callback:callback})
                .bind('init.rating', $.fn.rating.init)
                .bind('set.rating', $.fn.rating.set)
                .bind('hover.rating', $.fn.rating.hover)
                .trigger('init.rating');
        });
    };
    
    $.extend($.fn.rating, {
        init: function(e){
            var el = $(this),
                list = '',
                isChecked = null,
                childs = el.children(),
                i = 0,
                l = childs.length;
            
            for (; i < l; i++) {
                list = list + '<a class="star" title="' + $(childs[i]).val() + '" />';
                if ($(childs[i]).is(':checked')) {
                    isChecked = $(childs[i]).val();
                };
            };
            
            childs.hide();
            
            el
                .append('<div class="stars">' + list + '</div>')
                .trigger('set.rating', isChecked);
            
            $('a', el).bind('click', $.fn.rating.click);            
            el.trigger('hover.rating');
        },
        set: function(e, val) {
            var el = $(this),
                item = $('a', el),
                input = undefined;
            
            if (val) {
                item.removeClass('fullStar');
                
                input = item.filter(function(i){
                    if ($(this).attr('title') == val)
                        return $(this);
                    else
                        return false;
                });
                
                input
                    .addClass('fullStar')
                    .prevAll()
                    .addClass('fullStar');
            }
            
            return;
        },
        hover: function(e){
            var el = $(this),
                stars = $('a', el);
            
            stars.bind('mouseenter', function(e){
                // add tmp class when mouse enter
                $(this)
                    .addClass('tmp_fs')
                    .prevAll()
                    .addClass('tmp_fs');
                
                $(this).nextAll()
                    .addClass('tmp_es');
            });
            
            stars.bind('mouseleave', function(e){
                // remove all tmp class when mouse leave
                $(this)
                    .removeClass('tmp_fs')
                    .prevAll()
                    .removeClass('tmp_fs');
                
                $(this).nextAll()
                    .removeClass('tmp_es');
            });
        },
        click: function(e){
            e.preventDefault();
            var el = $(e.target),
                container = el.parent().parent(),
                inputs = container.children('input'),
                rate = el.attr('title');
                
            matchInput = inputs.filter(function(i){
                if ($(this).val() == rate)
                    return true;
                else
                    return false;
            });
            
            matchInput
                .prop('checked', true)
				.siblings('input').prop('checked', false);
            
            container
                .trigger('set.rating', matchInput.val())
                .data('rating').callback(rate, e);
        }
    });
    
})(jQuery);