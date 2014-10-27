/**
 * @preserve jQuery selectspinner plugin v2.3.9
 * @homepage http://xdsoft.net/jqplugins/selectspinner/
 * (c) 2014, Chupurnov Valeriy.
 */
/*global document,window,jQuery,setTimeout,clearTimeout,console*/
(function ($) {
	'use strict';
	// fix for ie8
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function (obj, start) {
			var i, j;
			for (i = (start || 0), j = this.length; i < j; i += 1) {
				if (this[i] === obj) { return i; }
			}
			return -1;
		};
	}
	var ARROWLEFT = 37,
		ARROWRIGHT = 39,
		ARROWUP = 38,
		ARROWDOWN = 40,
		ENTER = 13,
		TAB = 9,
		default_options  = {
			dropDownMaxHeight: 200,
			dropdown:false
		};


	$.fn.xdsoftScroller = function (percent) {
		return this.each(function () {
			var timeboxparent = $(this),
				pointerEventToXY = function (e) {
					var out = {x: 0, y: 0},
						touch;
					if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
						touch  = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
						out.x = touch.clientX;
						out.y = touch.clientY;
					} else if (e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove' || e.type === 'mouseover' || e.type === 'mouseout' || e.type === 'mouseenter' || e.type === 'mouseleave') {
						out.x = e.clientX;
						out.y = e.clientY;
					}
					return out;
				},
				move = 0,
				timebox,
				parentHeight,
				height,
				scrollbar,
				scroller,
				maximumOffset = 100,
				start = false,
				startY = 0,
				startTop = 0,
				h1 = 0,
				touchStart = false,
				startTopScroll = 0,
				calcOffset = function () {};
			if (percent === 'hide') {
				timeboxparent.find('.xdsoft_scrollbar').hide();
				return;
			}
			if (!$(this).hasClass('xdsoft_scroller_box')) {
				timebox = timeboxparent.children().eq(0);
				parentHeight = timeboxparent[0].clientHeight;
				height = timebox[0].offsetHeight;
				scrollbar = $('<div class="xdsoft_scrollbar"></div>');
				scroller = $('<div class="xdsoft_scroller"></div>');
				scrollbar.append(scroller);

				timeboxparent.addClass('xdsoft_scroller_box').append(scrollbar);
				calcOffset = function calcOffset(event) {
					var offset = pointerEventToXY(event).y - startY + startTopScroll;
					if (offset < 0) {
						offset = 0;
					}
					if (offset + scroller[0].offsetHeight > h1) {
						offset = h1 - scroller[0].offsetHeight;
					}
					timeboxparent.trigger('scroll_element.xdsoft_scroller', [maximumOffset ? offset / maximumOffset : 0]);
				};

				scroller
					.on('touchstart.xdsoft_scroller mousedown.xdsoft_scroller', function (event) {
						if (!parentHeight) {
							timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percent]);
						}

						startY = pointerEventToXY(event).y;
						startTopScroll = parseInt(scroller.css('margin-top'), 10);
						h1 = scrollbar[0].offsetHeight;

						if (event.type === 'mousedown') {
							if (document) {
								$(document.body).addClass('xdsoft_noselect');
							}
							$([document.body, window]).on('mouseup.xdsoft_scroller', function arguments_callee() {
								$([document.body, window]).off('mouseup.xdsoft_scroller', arguments_callee)
									.off('mousemove.xdsoft_scroller', calcOffset)
									.removeClass('xdsoft_noselect');
							});
							$(document.body).on('mousemove.xdsoft_scroller', calcOffset);
						} else {
							touchStart = true;
							event.stopPropagation();
							event.preventDefault();
						}
					})
					.on('touchmove', function (event) {
						if (touchStart) {
							event.preventDefault();
							calcOffset(event);
						}
					})
					.on('touchend touchcancel', function (event) {
						touchStart =  false;
						startTopScroll = 0;
					});

				timeboxparent
					.on('scroll_element.xdsoft_scroller', function (event, percentage) {
						if (!parentHeight) {
							timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percentage, true]);
						}
						percentage = percentage > 1 ? 1 : (percentage < 0 || isNaN(percentage)) ? 0 : percentage;

						scroller.css('margin-top', maximumOffset * percentage);

						setTimeout(function () {
							timebox.css('marginTop', -parseInt((timebox[0].offsetHeight - parentHeight) * percentage, 10));
						}, 10);
					})
					.on('resize_scroll.xdsoft_scroller', function (event, percentage, noTriggerScroll) {
						var percent, sh;
						parentHeight = timeboxparent[0].clientHeight;
						height = timebox[0].offsetHeight;
						percent = parentHeight / height;
						sh = percent * scrollbar[0].offsetHeight;
						if (percent > 1) {
							scroller.hide();
						} else {
							scroller.show();
							scroller.css('height', parseInt(sh > 10 ? sh : 10, 10));
							maximumOffset = scrollbar[0].offsetHeight - scroller[0].offsetHeight;
							if (noTriggerScroll !== true) {
								timeboxparent.trigger('scroll_element.xdsoft_scroller', [percentage || Math.abs(parseInt(timebox.css('marginTop'), 10)) / (height - parentHeight)]);
							}
						}
					});

				timeboxparent.on('mousewheel', function (event) {
					var top = Math.abs(parseInt(timebox.css('marginTop'), 10));

					top = top - (event.deltaY * 20);
					if (top < 0) {
						top = 0;
					}

					timeboxparent.trigger('scroll_element.xdsoft_scroller', [top / (height - parentHeight)]);
					event.stopPropagation();
					return false;
				});

				timeboxparent.on('touchstart', function (event) {
					start = pointerEventToXY(event);
					startTop = Math.abs(parseInt(timebox.css('marginTop'), 10));
				});

				timeboxparent.on('touchmove', function (event) {
					if (start) {
						event.preventDefault();
						var coord = pointerEventToXY(event);
						timeboxparent.trigger('scroll_element.xdsoft_scroller', [(startTop - (coord.y - start.y)) / (height - parentHeight)]);
					}
				});

				timeboxparent.on('touchend touchcancel', function (event) {
					start = false;
					startTop = 0;
				});
			}
			timeboxparent.trigger('resize_scroll.xdsoft_scroller', [percent]);
		});
	};

	function selectSpinner() {
		var opened = false,
			inited = false,
			enteredString = '',
			enteredTimer = 0,
			me = {	
				input: null,
				list: [],
				find: function (str) {
					if (str) {
						str = str.toLowerCase();
						me.dropdown.find('div.xdsoft_item').each(function () {
							var value = decodeURIComponent($(this).data('value'));
							if (value.toLowerCase().substr(0, str.length) === str) {
								me.dropdown.find('div.xdsoft_item').removeClass('active');
								$(this).addClass('active');
								me.val(value);
								me.dropdown.trigger('recalscroll.xdsoft');
								return false;
							}
						});
					}
				},
				next: function (nextfollow) {
					var next = nextfollow ? 'next' : 'prev', active;
					active = me.dropdown.find('div.xdsoft_item.active');
					if (active.length) {
						active.removeClass('active');
						if (active[next]().length) {
							active[next]().addClass('active');
						} else {
							me.dropdown.find('div.xdsoft_item').eq(nextfollow ? 0 : -1).addClass('active');
						}
					} else {
						me.dropdown.find('div.xdsoft_item').eq(nextfollow ? 0 : -1).addClass('active');
					}
					me.dropdown.trigger('recalscroll.xdsoft');
					active = me.dropdown.find('div.xdsoft_item.active').eq(0);
					me.val(active.data('value'));
				},
				val: function (value) {
					if (value !== undefined) {
						$(me.input).val(value);
						me.selector.find('span').text($(me.input).val());
						$(me.input).trigger('change');
					}
				},
				toggle: function () {
					if (!opened) {
						this.open();
					} else {
						this.close();
					}
				},
				close: function () {
					if (!opened) {
						return;
					}
					me.dropdown
						.hide();
					opened = false;
					$([document.body, window]).off('mousedown.xdsoft');
				},
				open: function () {
					if (opened || !this.options.dropdown) {
						return;
					}
					me.dropdown
						.show()
						.trigger('resize_scroll.xdsoft_scroller');
					opened = true;
					me.spins.focus();
					setTimeout(function() {
						$([document.body, window]).on('mousedown.xdsoft', function arguments_callee() {
							me.close();
							$([document.body, window]).off('mousedown.xdsoft', arguments_callee);
						});
					}, 10);
				},
				updateList: function (list) {
					if (list && $.isArray(list)) {
						me.list = $.extend(true, [], list);
						return;
					}
					if ($(me.input).is('select')) {
						$(me.input).find('option').each(function () {
							me.list.push({
								value: $(this).attr('value') || $(this).html(),
								title: $(this).html()
							});
						});
					} else if (me.options.list && $.isArray(me.options.list)) {
						me.list = $.extend(true, [], me.options.list);
					} else {
						return;
					}
				},
				update: function (list) {
					if (list && $.isArray(list)) {
						me.list = $.extend(true, [], list);
					}
					var i, items = [], value, title;
					for (i = 0; i < me.list.length; i += 1) {
						value = ($.type(me.list[i]) === 'string' || !me.list[i].value) ? me.list[i] : me.list[i].value;
						title = ($.type(me.list[i]) === 'string' || !me.list[i].title) ? value : me.list[i].title;
						items.push('<div class="xdsoft_item" data-value="' + encodeURIComponent(value) + '">' + title + '</div>');
					}
					me.dropdown
						.html('<div>' + items.join('') + '</div>')
						.trigger('resize_scroll.xdsoft_scroller');
				},
				destroy: function () {
					if (me.input && $(me.input).data('selectspinner')) {
						$(me.input)
							.data('selectspinner', null)
							.show();
						me.selectspinner
								.after($(me.input))
								.empty()
								.remove();
					}
				},
				init:  function (options) {
					if (inited || !me.input) {
						return;
					}
					me.options = $.extend(me, {}, default_options, options);
					inited = true;

					me.selectspinner = $('<div class="xdsoft_selectspinner"></div>');
					me.selector = $('<div class="xdsoft_selector"><span>value</span></div>');
					me.dropdown = $('<div class="xdsoft_chooser"></div>');
					me.spinner = $('<div class="xdsoft_spinner xdsoft_noselect"><button type="button"></button><button type="button" tabindex="-1"></button></div>');
					me.spins = me.spinner.find('button');

					me.updateList();
					me.update();
					me.dropdown
						.on('recalscroll.xdsoft', function () {
							var active = me.dropdown.find('div.xdsoft_item.active').eq(0),
								top,
								actHght,
								hght;
							if (opened) {
								top = active.position().top;
								actHght = active.outerHeight(true);
								hght = me.dropdown.height();

								if (top < 0 || top + actHght > me.dropdown.height()) {
									me.dropdown.trigger('scroll_element.xdsoft_scroller', [
										(active.index(0) * actHght) / active.parent().height()
									]);
								}
							}
						})
						.on('mousemove', 'div.xdsoft_item', function () {
							if ($(this).hasClass('active')) {
								return true;
							}
							me.dropdown.find('div.xdsoft_item').removeClass('active');
							$(this).addClass('active');
						})
						.on('mousedown', 'div.xdsoft_item', function (event) {
							me.dropdown.find('div.xdsoft_item').removeClass('active');
							$(this).addClass('active');
							me.val(decodeURIComponent($(this).data('value')));
							me.close();
							event.preventDefault();
							event.stopPropagation();
						});
					me.selectspinner
						.on('mousedown', function (event) {
							me.open();
							$(this).trigger('focus');
							//event.preventDefault();
							//event.stopPropagation();
						});

					var btn, btnInterval;
					function btnSpinner () {
						if ($(btn).is(':active')) {
							me.next($(btn).index());
							setTimeout(btnSpinner, 300);
						} else {
							clearTimeout(btnInterval);
						}
					};
					me.spins
						.on('mousedown', function (event) {
							clearTimeout(btnInterval);
							btn = this;
							clearInterval(btnSpinner);
							me.next($(btn).index());
							$(btn).focus();
							btnInterval = setTimeout(btnSpinner, 300);
							event.preventDefault();
							event.stopPropagation();
						})
						.on('focus', function (event) {
							me.selectspinner.addClass('active');
						})
						.on('blur', function (event) {
							me.selectspinner.removeClass('active');
						})
						.on('keydown', function (event) {
							var key = event.which, c;
							switch (key) {
							case ARROWUP:
							case ARROWDOWN:
								me.next(key === ARROWDOWN);
								break;
							case ENTER:
								me.toggle();
								break;
							case TAB:
								if ($(this).index()) {
									me.close();
								}
								break;
							default:
								c = String.fromCharCode(key);
								enteredString += c;
								clearTimeout(enteredTimer);
								me.find(enteredString);
								enteredTimer = setTimeout(function () {
									enteredString = '';
								}, 300);
							}
							console.log(key);
						});

					me.spinner.append([me.spin_up, me.spin_down]);
					me.selectspinner.append([me.dropdown, me.selector, me.spinner]);
					if (me.options.dropDownMaxHeight) {
						me.dropdown.css({
							maxHeight: me.options.dropDownMaxHeight + 'px'
						});
					}
					me.selector.find('span').css({
						'fontSize': $(me.input).css('fontSize'),
						'fontFamely': $(me.input).css('fontFamely'),
						'fontWigth': $(me.input).css('fontWigth'),
						'padding': $(me.input).css('padding'),
						'paddingLeft': '5px'
					});
					me.dropdown.xdsoftScroller();

					$(me.input)
						.after(me.selectspinner);
					me.selectspinner
						.append(me.input);

					me.selector.find('span').text($(me.input).val());
				}
			};
		return me;
	}
	$.fn.selectspinner = function (options, second) {
		return this.each(function () {
			var selectspinner = {};
			if (!$(this).data('selectspinner')) {
				selectspinner = selectSpinner();
				$(this).data('selectspinner', selectspinner);
				selectspinner.input = this;
			} else {
				selectspinner = $(this).data('selectspinner');
			}
			if ($.type(options) === 'string') {
				if (selectspinner[options]) {
					selectspinner[options](second);
				}
			} else {
				selectspinner.init();
			}
		});
	};
	$.fn.selectspinner.defaults = default_options;
}(jQuery));
(function () {
/*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version: 3.1.12
 *
 * Requires: jQuery 1.2.2+
 */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a:a(jQuery)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})});
}());