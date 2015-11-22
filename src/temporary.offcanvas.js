/**
 * Plugin temporary.offcanvas
 * A javascript library for creating easy off canvas from out the screen
 *
 * http://temporarytrick.com/project/offcanvas/
 *
 * Copyright 2014, Siraphob Rhompo
 * Temporary•Trick
 * http://temporarytrick.com
 *
 * Licensed under GPL & MIT
 *
 * Released on: May 6, 2014
 * @version  2.0
 *
 */

/* global module, document, window, setTimeout, clearTimeout, Event */
(function (root, factory, define) {

	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof module === 'object' && module.exports) {
		module.exports = factory();
	} else {
		root.offcanvas = factory();
	}

}( this, function () {
	return function (containerId, options) {

		if (containerId === undefined) {
			throw 'containerId is required.';
		}

		var
			defaults = {
				debug: false,
				content: '',
				size: 0,
				position: 'right',
				canvasClass: 'temp-canvas-wrapper',
				canvasPadding: '15px',
				offset: 0,
				duration: 220,
				easing: 'ease',
				delay: 0,
				fixedPosition: true,
				pushAndPull: false,
				tapToClose: true,
				toggleButtonSelector: null
			},
			option = merge(defaults, options),
			elContainer = document.getElementById(containerId),
			elPageOverlay = null,
			elCanvas,
			move,
			poolingRate,
			isClose = true,
			isOpen  = false,
			beforeopenEvent  = new Event('beforeopen'),
			beforecloseEvent = new Event('beforeclose'),
			openEvent  = new Event('open'),
			closeEvent = new Event('close');

		/**
		 * Properties
		 */
		this.isOpen  = isOpen;
		this.isClose = isClose;

		/**
		 * Methods
		 */
		this.open    = open;
		this.close   = close;
		this.resize  = resize;
		this.destroy = destroy;
		this.on  = on;
		this.off = off;

		init();


		//////////////////////////////////////

		function destroy() {
			elContainer.removeChild(elCanvas);
		}


		function calculatePixel (val) {
			return ( (/%$/).test(val) ) ? Math.floor(elContainer.offsetWidth * parseInt(val) / 100) : parseInt(val);
		}


		function toPixel (point, minus) {
			minus = minus || false;
			return (minus) ? (-point) + 'px' : point + 'px';
		}
		
		
		function on (type, listener, useCapture) {
			useCapture = useCapture || false;
			elCanvas.addEventListener(type, listener, useCapture);
		}
		
		function off (type, listener ,useCapture) {
			useCapture = useCapture || false;
			elCanvas.removeEventListener(type, listener, useCapture);
		}


		function resize () {
			this.close();
			calculateSize(elCanvas, option.position, option.size);
			calculateMove(option.position, option.size, option.offset);
		}


		function bindButton (btn) {
			btn.addEventListener('click' ,function (e) {
				e.preventDefault();

				if(isClose){
					open();
				} else {
					close();
				}

				return false;
			}, false);
		}


		function open (callback) {

			if (!elCanvas || isOpen) {
				return;
			}

			if (option.pushAndPull) {
				transition(elContainer.firstChild, move.on, option.duration, option.easing, option.delay);
			}

			if (elPageOverlay) {
				elPageOverlay.show();
			}

			if (option.toggleButtonSelector) {
				addClass(document.querySelectorAll(option.toggleButtonSelector), 'active');
			}

			addClass(elCanvas, 'active');
			elCanvas.dispatchEvent(beforeopenEvent);
			transition(elCanvas, move.on, option.duration, option.easing, option.delay, function () {
				elCanvas.dispatchEvent(openEvent);
				
				if (typeof callback === 'function') {
					callback();
				}
				
			});

			isOpen  = true;
			isClose = false;
		}


		function close (callback) {

			if (!elCanvas || isClose) {
				return;
			}

			if (option.pushAndPull) {
				transition(elContainer.firstChild, move.off, option.duration, option.easing, option.delay);
			}

			if (elPageOverlay) {
				elPageOverlay.hide();
			}

			if (option.toggleButtonSelector) {
				removeClass(document.querySelectorAll(option.toggleButtonSelector + ' .active'), 'active');
			}

			removeClass(elCanvas, 'active');
			elCanvas.dispatchEvent(beforecloseEvent);
			transition(elCanvas, move.off, option.duration, option.easing, option.delay, function () {
				elCanvas.dispatchEvent(closeEvent);
				
				if (typeof callback === 'function') {
					callback();
				}
			
			});

			isOpen  = false;
			isClose = true;
		}
		
		
		function createCanvas (option) {

			var el = document.createElement('div');
			el.setAttribute('class', option.canvasClass);
			el.style.position  = (option.fixedPosition) ? 'fixed' : 'absolute';
			el.style.padding   = option.canvasPadding;
			el.style.boxSizing = 'border-box';
			el.style.overflow  = 'auto';

			calculateSize(el, option.position, option.size);

			return el;
		}
		
		
		function calculateSize (el, position, size) {
			size = calculatePixel(size);
			
			switch (position) {
			case 'top':
				el.style.height = toPixel(size);
				el.style.top    = toPixel(size, true);
				el.style.left   = 0;
				el.style.width  = '100%';
				break;
			case 'bottom':
				el.style.height = toPixel(size);
				el.style.bottom = toPixel(size, true);
				el.style.left   = 0;
				el.style.width  = '100%';
				break;
			case 'left':
				el.style.left   = toPixel(size, true);
				el.style.width  = toPixel(size);
				el.style.top    = 0;
				el.style.height = '100%';
				break;
			case 'right':
				el.style.width  = toPixel(size);
				el.style.right  = toPixel(size, true);
				el.style.top    = 0;
				el.style.height = '100%';
				break;
			}
			
		}


		function transition (el, move, duration, easing, delay, callback) {
			var x = move.x || 0;
			var y = move.y || 0;

			if (typeof callback === 'function') {
				var listener = function(e) {
					e.target.removeEventListener(e.type, listener, false);
					callback(el);
				};
				el.addEventListener('oanimationend animationend webkitAnimationEnd', listener, false);
			}

			el.style.transform = 'translate3d(0,0,0)';
			el.style.transitionProperty = 'transform';
			el.style.transitionDuration = duration + 'ms';
			el.style.transitionTimingFunction = easing;
			el.style.transitionDelay = delay;
			el.style.transform = 'translate3d(' + toPixel(x) + ', ' + toPixel(y) + ',0)';
		}


		function addClass (el, name) {
			var add = function (el, name) {
				var cl = el.getAttribute('class');
				el.setAttribute('class', cl + ' ' + name);
			};
			
			if (el.length) {
				for (var i = 0; i < el.length; ++i) {
					add(el[i], name);
				}
			} else {
				add(el, name);
			}
			
		}


		function removeClass (el, name) {
			var remove = function (el, name) {
				var cl = el.getAttribute('class');
				el.setAttribute('class', cl.replace(name, '').trim());
			};
			
			if (el.length) {
				for (var i = 0; i < el.length; ++i) {
					remove(el[i], name);
				}
			} else {
				remove(el, name);
			}
			
		}


		function calculateMove (position, size, offset) {
			size = calculatePixel(size);

			switch (position) {
			case 'top':
				move = {on: {y: size + offset}, off: {y: 0}};
				break;
			case 'bottom':
				move = {on: {y: -(size + offset)}, off: {y: 0}};
				break;
			case 'left':
				move = {on: {x: size + offset}, off: {x: 0}};
				break;
			case 'right':
				move = {on: {x: -(size + offset)}, off: {x: 0}};
				break;
			}

		}


		function merge(obj1, obj2){
			var obj3 = {};
			var attrname;

			for (attrname in obj1) {
				obj3[attrname] = obj1[attrname];
			}

			for (attrname in obj2) {
				obj3[attrname] = obj2[attrname];
			}

			return obj3;
		}


		function createPageOverlay () {
			var el = document.createElement('div');
			el.setAttribute('class', 'temp-pageOverlay');
			el.style.width    = '100%';
			el.style.height   = '100%';
			el.style.position = (option.fixedPosition) ? 'fixed' : 'absolute';
			el.style.top      = '0';
			el.style.cursor   = 'pointer';
			el.style.display  = 'none';

			el.show = function () {
				this.style.display = 'block';
			};
			el.hide = function () {
				this.style.display = 'none';
			};

			return el;
		}


		function init () {
			calculateMove(option.position, option.size, option.offset);
			elCanvas = createCanvas(option);
			elCanvas.innerHTML = option.content;

			if (elContainer.style.position !== 'absolute') {
				elContainer.style.position = 'relative';
			}

			if(! option.fixedPosition ){
				elContainer.style.overflow = 'hidden';
			}

			elContainer.appendChild(elCanvas);

			if (option.tapToClose) {

				elPageOverlay = createPageOverlay();
				elContainer.insertBefore(elPageOverlay, elCanvas);

				elPageOverlay.addEventListener('click', function () {
					close();
				});

			}

			var btnNodeList = document.querySelectorAll(option.toggleButtonSelector);

			if (btnNodeList.length) {
				for (var i = 0; i < btnNodeList.length; ++i) {
					bindButton(btnNodeList[i]);
				}
			}

			if ((/%$/).test(option.size)) {
				window.addEventListener('resize', function () {

					if (poolingRate) {
						clearTimeout(poolingRate);
					}

					poolingRate = setTimeout(function () {
						resize();
					}, 250);

				}, false);
			}

		}

	};

} ));
