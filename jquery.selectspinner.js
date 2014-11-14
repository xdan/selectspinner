/**
 * @preserve jQuery selectspinner plugin v1.0.0
 * @homepage http://xdsoft.net/jqplugins/selectspinner/
 * (c) 2014, Chupurnov Valeriy <chupurnov@gmail.com>.
 */
/*global document,window,jQuery,setTimeout,clearTimeout,console*/
(function ($) {
	'use strict';
	var	ARROWUP = 38,
		ARROWDOWN = 40,
		ENTER = 13,
		TAB = 9,
		ESC = 27,
		default_options  = {
			classes: ['xdsoft_pretty'],
			dropDownMaxHeight: 200,
			autoopen: false,
			dropdown: true,
			wheel: true,
			dragAndDropSpin: true,
			longSpin: true
		};
	function isScalar(mixed_var) {
		return (/boolean|number|string/)
			.test(typeof mixed_var);
	}
	function selectSpinner() {
		var opened = false,
			inited = false,
			enteredString = '',
			enteredTimer = 0,
			me = {
				input: null,
				list: [],
				options: false,
				find: function (str) {
					if (str) {
						str = str.toLowerCase();
						var i, value, title;
						for (i = 0; i < me.list.length; i += 1) {
							value = (isScalar(me.list[i]) || !me.list[i].value) ? me.list[i]+'' : me.list[i].value+'';
							title = (isScalar(me.list[i]) || !me.list[i].title) ? value : me.list[i].title+'';
							if (title.toLowerCase().substr(0, str.length) === str) {
								me.dropdown.find('div.xdsoft_item').removeClass('active');
								me.dropdown.find('div.xdsoft_item').eq(i).addClass('active');
								me.val(value);
								me.dropdown.trigger('recalscroll.xdsoft');
								return false;
							}
						}
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
					var i;
					if (value !== undefined) {
						$(me.input).val(value);
						me.selector.find('span').text($(me.input).find('option:selected').length ? $(me.input).find('option:selected').text() : $(me.input).find('option').eq(0).text());
						$(me.input).trigger('change');
					}
					return $(me.input).val();
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
					if (opened || !me.options.dropdown) {
						return;
					}
					me.dropdown
						.show()
						.trigger('resize_scroll.xdsoft_scroller');
					opened = true;
					me.spins.eq(0).focus();
					me.spins.eq(0).trigger('focus');
					setTimeout(function () {
						$([document.body, window]).on('mousedown.xdsoft', function arguments_callee() {
							me.close();
							$([document.body, window]).off('mousedown.xdsoft', arguments_callee);
						});
					}, 10);
				},
				updateSelect: function () {
					var val = me.val(), i = 0, options = [], value, title;
					$(me.input).empty();
					for (i = 0; i < me.list.length; i += 1) {
						value = (isScalar(me.list[i]) || !me.list[i].value) ? me.list[i] : me.list[i].value;
						title = (isScalar(me.list[i]) || !me.list[i].title) ? value : me.list[i].title;
						options.push('<option value="' + value + '">' + title + '</option>');
					}
					$(me.input)
						.html(options.join(''));
					me.val(val);
				},
				updateList: function (list) {
					if (list && $.isArray(list)) {
						me.list = $.extend(true, [], list);
						me.updateSelect();
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
						me.updateSelect();
					} else {
						return;
					}
				},
				update: function (list) {
					if (list && $.isArray(list)) {
						me.updateList(list);
					}
					var i, items = [], value, title, val;
					val = me.val();
					for (i = 0; i < me.list.length; i += 1) {
						value = (isScalar(me.list[i]) || !me.list[i].value) ? me.list[i] : me.list[i].value;
						title = (isScalar(me.list[i]) || !me.list[i].title) ? value : me.list[i].title;
						items.push('<div class="xdsoft_item" data-value="' + encodeURIComponent(value) + '">' + title + '</div>');
					}
					me.dropdown.find('.xdsoft_list')
						.html(items.join(''));
					me.dropdown.trigger('resize_scroll.xdsoft_scroller');
					me.val(val);
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
				setOptions: function (options) {
					me.options = $.extend(true, {}, me.options || default_options, options);
				},
				init:  function (options) {
					if (inited || !me.input) {
						return;
					}
					me.setOptions(options);
					inited = true;

					me.selectspinner = $('<div class="xdsoft_selectspinner"></div>');
					me.selector = $('<div class="xdsoft_selector"><span>value</span></div>');
					me.dropdown = $('<div class="xdsoft_chooser"><div class="xdsoft_list"></div></div>');
					me.spinner = $('<div class="xdsoft_spinner xdsoft_noselect"><button type="button"></button><button type="button" tabindex="-1"></button></div>');
					me.spins = me.spinner.find('button');
					me.selectspinner.addClass(me.options.classes.join(' '));
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
							event.preventDefault();
							event.stopPropagation();
						});

					var btn,
						btnInterval,
						start = {x: 0, y: 0},
						second = {x: 0, y: 0},
						btnActive = false;

					function btnSpinner() {
						if (btnActive) {
							me.next($(btn).index());
							var delta = Math.abs(second.y - start.y);
							if (me.options.longSpin) {
								btnInterval = setTimeout(btnSpinner, (300 - delta) > 0 ? 300 - delta : 0);
							}
						} else {
							clearTimeout(btnInterval);
							btnActive = false;
						}
					}
					if (me.options.dragAndDropSpin) {
						$([window, document.body])
							.on('mousemove.xdsoftbutton', function (event) {
								if (btnActive) {
									second.y = event.clientY;
								}
							})
							.on('mouseup.xdsoftbutton', function (event) {
								btnActive = false;
							});
					}
					me.spins
						.on('mousedown', function (event) {
							clearTimeout(btnInterval);
							btn = this;
							$(btn).focus();
							second.y = start.y = event.clientY;
							btnActive = true;
							btnSpinner();
							event.preventDefault();
							event.stopPropagation();
						})
						.on('focus', function (event) {
							me.selectspinner.addClass('active');
							if (me.options.autoopen) {
								me.open();
							}
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
							case ESC:
							case TAB:
								me.close();
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
					if (me.dropdown.xdsoftScroller) {
						me.dropdown.xdsoftScroller();
					}
					if (me.options.wheel) {
						me.selectspinner.on('mousewheel', function (event) {
							me.next(event.deltaY);
							return false;
						});
					}
					$(me.input)
						.after(me.selectspinner);
					me.selectspinner
						.append(me.input);
				}
			};
		return me;
	}
	$.fn.selectSpinner = $.fn.selectspinner = function (options, second) {
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
				selectspinner.init(options);
			}
		});
	};
	$.fn.selectspinner.defaults = default_options;
}(jQuery));
/**
 * Query Scroller plugin v1.0.1
 * homepage https://github.com/xdan/xdsoftScroller
 * Licensed under the MIT License (LICENSE.txt).
 * Version: 1.0.1
 */
(function($){'use strict';$.fn.xdsoftScroller=function(g){return this.each(function(){var f=$(this),pointerEventToXY=function(e){var a={x:0,y:0},touch;if(e.type==='touchstart'||e.type==='touchmove'||e.type==='touchend'||e.type==='touchcancel'){touch=e.originalEvent.touches[0]||e.originalEvent.changedTouches[0];a.x=touch.clientX;a.y=touch.clientY}else if(e.type==='mousedown'||e.type==='mouseup'||e.type==='mousemove'||e.type==='mouseover'||e.type==='mouseout'||e.type==='mouseenter'||e.type==='mouseleave'){a.x=e.clientX;a.y=e.clientY}return a},move=0,timebox,parentHeight,height,scrollbar,scroller,maximumOffset=100,start=false,startY=0,startTop=0,h1=0,touchStart=false,startTopScroll=0,calcOffset=function(){};if(g==='hide'){f.find('.xdsoft_scrollbar').hide();return}if(!$(this).hasClass('xdsoft_scroller_box')){timebox=f.children().eq(0);parentHeight=f[0].clientHeight;height=timebox[0].offsetHeight;scrollbar=$('<div class="xdsoft_scrollbar"></div>');scroller=$('<div class="xdsoft_scroller"></div>');scrollbar.append(scroller);f.addClass('xdsoft_scroller_box').append(scrollbar);calcOffset=function calcOffset(a){var b=pointerEventToXY(a).y-startY+startTopScroll;if(b<0){b=0}if(b+scroller[0].offsetHeight>h1){b=h1-scroller[0].offsetHeight}f.trigger('scroll_element.xdsoft_scroller',[maximumOffset?b/maximumOffset:0])};scroller.on('touchstart.xdsoft_scroller mousedown.xdsoft_scroller',function(a){if(!parentHeight){f.trigger('resize_scroll.xdsoft_scroller',[g])}startY=pointerEventToXY(a).y;startTopScroll=parseInt(scroller.css('margin-top'),10);h1=scrollbar[0].offsetHeight;if(a.type==='mousedown'){if(document){$(document.body).addClass('xdsoft_noselect')}$([document.body,window]).on('mouseup.xdsoft_scroller',function arguments_callee(){$([document.body,window]).off('mouseup.xdsoft_scroller',arguments_callee).off('mousemove.xdsoft_scroller',calcOffset).removeClass('xdsoft_noselect')});$(document.body).on('mousemove.xdsoft_scroller',calcOffset)}else{touchStart=true}a.stopPropagation();a.preventDefault()}).on('touchmove',function(a){if(touchStart){a.preventDefault();calcOffset(a)}}).on('touchend touchcancel',function(a){touchStart=false;startTopScroll=0});f.on('scroll_element.xdsoft_scroller',function(a,b){if(!parentHeight){f.trigger('resize_scroll.xdsoft_scroller',[b,true])}b=b>1?1:(b<0||isNaN(b))?0:b;scroller.css('margin-top',maximumOffset*b);setTimeout(function(){timebox.css('marginTop',-parseInt((timebox[0].offsetHeight-parentHeight)*b,10))},10)}).on('resize_scroll.xdsoft_scroller',function(a,b,c){var d,sh;parentHeight=f[0].clientHeight;height=timebox[0].offsetHeight;d=parentHeight/height;sh=d*scrollbar[0].offsetHeight;if(d>=1){scroller.hide()}else{scroller.show();scroller.css('height',parseInt(sh>10?sh:10,10));maximumOffset=scrollbar[0].offsetHeight-scroller[0].offsetHeight;if(c!==true){f.trigger('scroll_element.xdsoft_scroller',[b||Math.abs(parseInt(timebox.css('marginTop'),10))/(height-parentHeight)])}}});f.on('mousewheel',function(a){var b=Math.abs(parseInt(timebox.css('marginTop'),10));b=b-(a.deltaY*20);if(b<0){b=0}f.trigger('scroll_element.xdsoft_scroller',[b/(height-parentHeight)]);a.stopPropagation();return false});f.on('touchstart',function(a){start=pointerEventToXY(a);startTop=Math.abs(parseInt(timebox.css('marginTop'),10))});f.on('touchmove',function(a){if(start){a.preventDefault();var b=pointerEventToXY(a);f.trigger('scroll_element.xdsoft_scroller',[(startTop-(b.y-start.y))/(height-parentHeight)])}});f.on('touchend touchcancel',function(a){start=false;startTop=0})}f.trigger('resize_scroll.xdsoft_scroller',[g])})}}(jQuery));
/*! Copyright (c) 2013 Brandon Aaron (http://brandon.aaron.sh)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version: 3.1.12
 *
 * Requires: jQuery 1.2.2+
 */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a:a(jQuery)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})});
