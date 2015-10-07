/**
 * Plugin temporary.offcanvas
 * A jQuery plugin for creating easy off canvas from out the screen
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
 * @version  1.0
 * @depend   jquery
 * @depend   jquery.transit
 * @optional jquery.easing
 *
 */
 
(function($){

	$.fn.offcanvas = function(option, callback){
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
			easing: 'linear',
			toggleButton: '',
			fixedPosition: true,
			pushAndPull: false,
			tapToClose: false,
			swipeToClose: false,
			onBeforeOpen: function(){},
			onOpen: function(){},
			onBeforeClose: function(){},
			onClose: function(){}
		},
		option = $.extend({}, defaults, option),
		parent = this,
		_isOpen = false,
		_isClose = true,
		isOverlay = false,
		move = {},
		size = _calPixel(option.size),
		offset = _calPixel(option.offset),
		css = _cssInit();
				
		var canvas = $('<div>').addClass(option.canvasClass).css( css );
		
		if(option.content instanceof jQuery)
			option.content.appendTo(canvas);
		else
			canvas.html(option.content);
		
		if(parent.css('position') === 'static')
			parent.css('position','relative');
			
		parent.append(canvas);
		
		if(option.tapToClose || option.swipeToClose){
			isOverlay = true;
			var overlay = $('<div>', {
				'class': 'canvas-overlay',
				css: {
					width: '100%',
					height: '100%',
					position: 'fixed',
					top: 0,
					cursor: 'pointer'
				}
			}).hide();
			
			if(! option.fixedPosition ){
				overlay.css('position', 'absolute');
			}
			
			canvas.before(overlay);
			
			if(option.tapToClose){
				overlay.on('click', function(){
					_close.call(parent);
				} );
			}
			
			if(option.swipeToClose){
				overlay[0].addEventListener('touchstart', function(e){
					var touchobj = e.changedTouches[0];
					dist = { x:0, y:0 };
					startX = touchobj.pageX;
					startY = touchobj.pageY;
					e.preventDefault();

				}, false);
				
				overlay[0].addEventListener('touchmove', function(e){
					e.preventDefault(); // prevent scrolling when inside DIV
				}, false);
				
				overlay[0].addEventListener('touchend', function(e){
					var touchobj = e.changedTouches[0];
					var threshold = 110;
					dist.x = touchobj.pageX - startX;
					dist.y = touchobj.pageY - startY;
					switch (option.position){
						/* swipe right */
						case 'left':
							if(	dist.x > 0 &&
								dist.y < threshold &&
								dist.y > -threshold ){
								_close();
							}
							break;
						/* swipe down */
						case 'up':
							if(dist.y > 0 && 
								dist.x < threshold &&
								dist.x > -threshold ){
								_close();
							}
							break;
						/* swipe left */
						case 'right':
							if(	dist.x < 0 && 
								dist.y < threshold &&
								dist.y > -threshold ){
								_close();
							}
							break;
						/* swipe up */
						case 'down':
							if(	dist.y < 0 && 
								dist.x < threshold &&
								dist.x > -threshold ){
								_close();
							}
							break;
					}
					e.preventDefault();

				}, false);
			}
		}
		
		if(typeof callback === 'function')
			callback(canvas);
		
		/*
			methods
		*/
		this.open    = _open;
		this.close   = _close;
		this.isOpen  = false;
		this.isClose = true;
		this.destroy = _destroy;
		
		/* Private Functions */
		function _open(callback){
			option.onBeforeOpen.call(canvas); /* Event: before loaded */
			if(this.isClose){
				if(option.pushAndPull){
					canvas.siblings().transition(move.on, option.duration, option.easing);
				}
				
				if(isOverlay)
					overlay.show();
					
				canvas.transition(move.on, option.duration, option.easing, function(){
					option.onOpen.call(canvas);
					if(typeof callback === 'function')
						callback.call(canvas);
				});
				
				this.isOpen  = true;
				this.isClose = false;
			}
		}
		
		
		function _close(callback){
			option.onBeforeClose.call(canvas);
			if(this.isOpen){
				if(option.pushAndPull){
					canvas.siblings().transition(move.off, option.duration, option.easing);
				}
				
				if(isOverlay)
					overlay.hide();
					
				canvas.transition(move.off, option.duration, option.easing, function(){
					option.onClose.call(canvas);
					if(typeof callback === 'function')
						callback.call(canvas);
				});
				this.isOpen  = false;
				this.isClose = true;
			}
		}
		if(option.toggleButton instanceof jQuery){
			option.toggleButton.on('click' ,function(e){
				if(parent.isClose){
					$(this).addClass('active');
					parent.open();
				} else {
					$(this).removeClass('active');
					parent.close();
				}
				return false;
			});
		}
		function _destroy(){
			canvas.remove();
		}
		/* recalculate pixel from percentage unit by its parent */
		function _calPixel(val){
			return ( (/%$/).test(val) ) ? parent.outerWidth() * parseInt(val) / 100 : parseInt(val);
		}
		
		function _cssInit(){
			var cssObj = {
				position: 'fixed',
				padding: option.canvasPadding,
				boxSizing: 'border-box',
				MozBoxSizing: 'border-box',
				webkitBoxSizing: 'border-box',
				overflow: 'auto'
			};
			
			if(! option.fixedPosition ){
				parent.css('overflow','hidden');
				cssObj.position = 'absolute';
			}
			
			switch( option.position ){
				case 'top':
					cssObj.top = -size;
					cssObj.height = size;
					cssObj.left = 0;
					cssObj.width = '100%';
					move = {on: {y: size + offset}, off: {y: 0}};
					break;
				case 'bottom':
					cssObj.bottom = -size;
					cssObj.height = size;
					cssObj.left = 0;
					cssObj.width = '100%';
					move = {on: {y: -(size + offset)}, off: {y: 0}};
					break;
				case 'left':
					cssObj.top = 0;
					cssObj.height = '100%';
					cssObj.left = -size;
					cssObj.width = size;
					move = {on: {x: size + offset}, off: {x: 0}};
					break;
				case 'right':
					cssObj.top = 0;
					cssObj.height = '100%';
					cssObj.right = -size;
					cssObj.width = size;
					move = {on: {x: -(size + offset)}, off: {x: 0}};
					break;
			}
			return cssObj
		}
		
		return this;
		
	};
	
 })(jQuery);