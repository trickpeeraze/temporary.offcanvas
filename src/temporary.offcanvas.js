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

/* global module, document */
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
			_this = this,
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
				toggleButtonSelector: null,
				onBeforeOpen: function(){},
				onOpen: function(){},
				onBeforeClose: function(){},
				onClose: function(){}
			},
			option = merge(defaults, options),
			elContainer = document.getElementById(containerId),
			elPageOverlay = null,
			size   = calculatePixel(option.size),
			offset = calculatePixel(option.offset),
			move = initMove(option.position, size, offset),
			elCanvas = createCanvas(option, size, move);

		init();

		/**
		 * Properties
		 */
		this.isOpen  = false;
		this.isClose = true;

		/**
		 * Methods
		 */
		this.open = function (callback) {

			if (!elCanvas) {
				return;
			}

			callback = callback || option.onOpen;
			option.onBeforeOpen(elCanvas, elContainer); /* Event: before loaded */

			if (this.isClose) {

				if(option.pushAndPull){
					transition(elContainer.firstChild, move.on, option.duration, option.easing, option.delay);
				}

				if (elPageOverlay) {
					elPageOverlay.show();
				}

				elCanvas.open(callback);

				this.isOpen  = true;
				this.isClose = false;
			}

		};


		this.close = function (callback) {

			if (!elCanvas) {
				return;
			}

			callback = callback || option.onClose;
			option.onBeforeClose(elCanvas, elContainer);

			if (this.isOpen) {

				if (option.pushAndPull) {
					transition(elContainer.firstChild, move.off, option.duration, option.easing, option.delay);
				}

				if (elPageOverlay) {
					elPageOverlay.hide();
				}

				elCanvas.close(callback);

				this.isOpen  = false;
				this.isClose = true;
			}

		};


		this.destroy = function () {
			elContainer.removeChild(elCanvas);
		};

		/**
		 * Functions
		 */
		function init () {
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
					_this.close();
				});

			}

			var btnNodeList = document.querySelectorAll(option.toggleButtonSelector);

			if (btnNodeList.length) {
				for (var i = 0; i < btnNodeList.length; ++i) {
					bindButton(btnNodeList[i]);
				}
			}

		}


		/* recalculate pixel from percentage unit by its elContainer */
		function calculatePixel (val) {
			return ( (/%$/).test(val) ) ? elContainer.offsetWidth * parseInt(val) / 100 : parseInt(val);
		}


		function bindButton (btn) {
			btn.addEventListener('click' ,function (e) {
				e.preventDefault();

				if(_this.isClose){
					_this.open();
				} else {
					_this.close();
				}

				return false;
			}, false);
		}


		function createCanvas (option, size, move) {

			var el = document.createElement('div');
			el.setAttribute('class', option.canvasClass);
			el.style.position  = (option.fixedPosition) ? 'fixed' : 'absolute';
			el.style.padding   = option.canvasPadding;
			el.style.boxSizing = 'border-box';
			el.style.overflow  = 'auto';

			switch (option.position) {
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

			el.open = function (callback) {
				addClass(this, 'active');

				if (option.toggleButtonSelector) {
					addClass(document.querySelectorAll(option.toggleButtonSelector), 'active');
				}

				transition(this, move.on, option.duration, option.easing, option.delay, callback);
			};

			el.close = function (callback) {
				removeClass(this, 'active');

				if (option.toggleButtonSelector) {
					removeClass(document.querySelectorAll(option.toggleButtonSelector), 'active');
				}

				transition(this, move.off, option.duration, option.easing, option.delay, callback);
			};

			return el;
		}


		function toPixel (point, minus) {
			minus = minus || false;
			return (minus) ? (-point) + 'px' : point + 'px';
		}


		function transition (el, move, duration, easing, delay, callback) {
			var x = move.x || 0;
			var y = move.y || 0;

			if (typeof callback === 'function') {
				el.addEventListener('oanimationend animationend webkitAnimationEnd', function(e) {
					e.target.removeEventListener(e.type, arguments.callee);
					callback(el);
				}, false);
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


		function initMove (position, size, offset) {
			var move;

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

			return move;
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

	};

} ));
