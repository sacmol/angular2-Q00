/*! http://mths.be/placeholder v2.1.1 by @mathias */
(function(factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function($) {

	// Opera Mini v7 doesn't support placeholder although its DOM seems to indicate so
	var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]';
	var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
	var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini;
	var valHooks = $.valHooks;
	var propHooks = $.propHooks;
	var hooks;
	var placeholder;

	if (isInputSupported && isTextareaSupported) {

		placeholder = $.fn.placeholder = function() {
			return this;
		};

		placeholder.input = placeholder.textarea = true;

	} else {

		var settings = {};

		placeholder = $.fn.placeholder = function(options) {

			var defaults = {customClass: 'placeholder'};
			settings = $.extend({}, defaults, options);

			var $this = this;
			$this
				.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
				.not('.'+settings.customClass)
				.bind({
					'focus.placeholder': clearPlaceholder,
					'blur.placeholder': setPlaceholder
				})
				.data('placeholder-enabled', true)
				.trigger('blur.placeholder');
			return $this;
		};

		placeholder.input = isInputSupported;
		placeholder.textarea = isTextareaSupported;

		hooks = {
			'get': function(element) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value;
				}

				return $element.data('placeholder-enabled') && $element.hasClass(settings.customClass) ? '' : element.value;
			},
			'set': function(element, value) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value = value;
				}

				if (!$element.data('placeholder-enabled')) {
					return element.value = value;
				}
				if (value === '') {
					element.value = value;
					// Issue #56: Setting the placeholder causes problems if the element continues to have focus.
					if (element != safeActiveElement()) {
						// We can't use `triggerHandler` here because of dummy text/password inputs :(
						setPlaceholder.call(element);
					}
				} else if ($element.hasClass(settings.customClass)) {
					clearPlaceholder.call(element, true, value) || (element.value = value);
				} else {
					element.value = value;
				}
				// `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
				return $element;
			}
		};

		if (!isInputSupported) {
			valHooks.input = hooks;
			propHooks.value = hooks;
		}
		if (!isTextareaSupported) {
			valHooks.textarea = hooks;
			propHooks.value = hooks;
		}

		$(function() {
			// Look for forms
			$(document).delegate('form', 'submit.placeholder', function() {
				// Clear the placeholder values so they don't get submitted
				var $inputs = $('.'+settings.customClass, this).each(clearPlaceholder);
				setTimeout(function() {
					$inputs.each(setPlaceholder);
				}, 10);
			});
		});

		// Clear placeholder values upon page reload
		$(window).bind('beforeunload.placeholder', function() {
			$('.'+settings.customClass).each(function() {
				this.value = '';
			});
		});

	}

	function args(elem) {
		// Return an object of element attributes
		var newAttrs = {};
		var rinlinejQuery = /^jQuery\d+$/;
		$.each(elem.attributes, function(i, attr) {
			if (attr.specified && !rinlinejQuery.test(attr.name)) {
				newAttrs[attr.name] = attr.value;
			}
		});
		return newAttrs;
	}

	function clearPlaceholder(event, value) {
		var input = this;
		var $input = $(input);
		if (input.value == $input.attr('placeholder') && $input.hasClass(settings.customClass)) {
			if ($input.data('placeholder-password')) {
				$input = $input.hide().nextAll('input[type="password"]:first').show().attr('id', $input.removeAttr('id').data('placeholder-id'));
				// If `clearPlaceholder` was called from `$.valHooks.input.set`
				if (event === true) {
					return $input[0].value = value;
				}
				$input.focus();
			} else {
				input.value = '';
				$input.removeClass(settings.customClass);
				input == safeActiveElement() && input.select();
			}
		}
	}

	function setPlaceholder() {
		var $replacement;
		var input = this;
		var $input = $(input);
		var id = this.id;
		if (input.value === '') {
			if (input.type === 'password') {
				if (!$input.data('placeholder-textinput')) {
					try {
						$replacement = $input.clone().attr({ 'type': 'text' });
					} catch(e) {
						$replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
					}
					$replacement
						.removeAttr('name')
						.data({
							'placeholder-password': $input,
							'placeholder-id': id
						})
						.bind('focus.placeholder', clearPlaceholder);
					$input
						.data({
							'placeholder-textinput': $replacement,
							'placeholder-id': id
						})
						.before($replacement);
				}
				$input = $input.removeAttr('id').hide().prevAll('input[type="text"]:first').attr('id', id).show();
				// Note: `$input[0] != input` now!
			}
			$input.addClass(settings.customClass);
			$input[0].value = $input.attr('placeholder');
		} else {
			$input.removeClass(settings.customClass);
		}
	}

	function safeActiveElement() {
		// Avoid IE9 `document.activeElement` of death
		// https://github.com/mathiasbynens/jquery-placeholder/pull/99
		try {
			return document.activeElement;
		} catch (exception) {}
	}

}));

/*!
Waypoints - 3.1.1
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/
(function() {
  'use strict'

  var keyCounter = 0
  var allWaypoints = {}

  /* http://imakewebthings.com/waypoints/api/waypoint */
  function Waypoint(options) {
    if (!options) {
      throw new Error('No options passed to Waypoint constructor')
    }
    if (!options.element) {
      throw new Error('No element option passed to Waypoint constructor')
    }
    if (!options.handler) {
      throw new Error('No handler option passed to Waypoint constructor')
    }

    this.key = 'waypoint-' + keyCounter
    this.options = Waypoint.Adapter.extend({}, Waypoint.defaults, options)
    this.element = this.options.element
    this.adapter = new Waypoint.Adapter(this.element)
    this.callback = options.handler
    this.axis = this.options.horizontal ? 'horizontal' : 'vertical'
    this.enabled = this.options.enabled
    this.triggerPoint = null
    this.group = Waypoint.Group.findOrCreate({
      name: this.options.group,
      axis: this.axis
    })
    this.context = Waypoint.Context.findOrCreateByElement(this.options.context)

    if (Waypoint.offsetAliases[this.options.offset]) {
      this.options.offset = Waypoint.offsetAliases[this.options.offset]
    }
    this.group.add(this)
    this.context.add(this)
    allWaypoints[this.key] = this
    keyCounter += 1
  }

  /* Private */
  Waypoint.prototype.queueTrigger = function(direction) {
    this.group.queueTrigger(this, direction)
  }

  /* Private */
  Waypoint.prototype.trigger = function(args) {
    if (!this.enabled) {
      return
    }
    if (this.callback) {
      this.callback.apply(this, args)
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/destroy */
  Waypoint.prototype.destroy = function() {
    this.context.remove(this)
    this.group.remove(this)
    delete allWaypoints[this.key]
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/disable */
  Waypoint.prototype.disable = function() {
    this.enabled = false
    return this
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/enable */
  Waypoint.prototype.enable = function() {
    this.context.refresh()
    this.enabled = true
    return this
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/next */
  Waypoint.prototype.next = function() {
    return this.group.next(this)
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/previous */
  Waypoint.prototype.previous = function() {
    return this.group.previous(this)
  }

  /* Private */
  Waypoint.invokeAll = function(method) {
    var allWaypointsArray = []
    for (var waypointKey in allWaypoints) {
      allWaypointsArray.push(allWaypoints[waypointKey])
    }
    for (var i = 0, end = allWaypointsArray.length; i < end; i++) {
      allWaypointsArray[i][method]()
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/destroy-all */
  Waypoint.destroyAll = function() {
    Waypoint.invokeAll('destroy')
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/disable-all */
  Waypoint.disableAll = function() {
    Waypoint.invokeAll('disable')
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/enable-all */
  Waypoint.enableAll = function() {
    Waypoint.invokeAll('enable')
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/refresh-all */
  Waypoint.refreshAll = function() {
    Waypoint.Context.refreshAll()
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/viewport-height */
  Waypoint.viewportHeight = function() {
    return window.innerHeight || document.documentElement.clientHeight
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/viewport-width */
  Waypoint.viewportWidth = function() {
    return document.documentElement.clientWidth
  }

  Waypoint.adapters = []

  Waypoint.defaults = {
    context: window,
    continuous: true,
    enabled: true,
    group: 'default',
    horizontal: false,
    offset: 0
  }

  Waypoint.offsetAliases = {
    'bottom-in-view': function() {
      return this.context.innerHeight() - this.adapter.outerHeight()
    },
    'right-in-view': function() {
      return this.context.innerWidth() - this.adapter.outerWidth()
    }
  }

  window.Waypoint = Waypoint
}())
;(function() {
  'use strict'

  function requestAnimationFrameShim(callback) {
    window.setTimeout(callback, 1000 / 60)
  }

  var keyCounter = 0
  var contexts = {}
  var Waypoint = window.Waypoint
  var oldWindowLoad = window.onload

  /* http://imakewebthings.com/waypoints/api/context */
  function Context(element) {
    this.element = element
    this.Adapter = Waypoint.Adapter
    this.adapter = new this.Adapter(element)
    this.key = 'waypoint-context-' + keyCounter
    this.didScroll = false
    this.didResize = false
    this.oldScroll = {
      x: this.adapter.scrollLeft(),
      y: this.adapter.scrollTop()
    }
    this.waypoints = {
      vertical: {},
      horizontal: {}
    }

    element.waypointContextKey = this.key
    contexts[element.waypointContextKey] = this
    keyCounter += 1

    this.createThrottledScrollHandler()
    this.createThrottledResizeHandler()
  }

  /* Private */
  Context.prototype.add = function(waypoint) {
    var axis = waypoint.options.horizontal ? 'horizontal' : 'vertical'
    this.waypoints[axis][waypoint.key] = waypoint
    this.refresh()
  }

  /* Private */
  Context.prototype.checkEmpty = function() {
    var horizontalEmpty = this.Adapter.isEmptyObject(this.waypoints.horizontal)
    var verticalEmpty = this.Adapter.isEmptyObject(this.waypoints.vertical)
    if (horizontalEmpty && verticalEmpty) {
      this.adapter.off('.waypoints')
      delete contexts[this.key]
    }
  }

  /* Private */
  Context.prototype.createThrottledResizeHandler = function() {
    var self = this

    function resizeHandler() {
      self.handleResize()
      self.didResize = false
    }

    this.adapter.on('resize.waypoints', function() {
      if (!self.didResize) {
        self.didResize = true
        Waypoint.requestAnimationFrame(resizeHandler)
      }
    })
  }

  /* Private */
  Context.prototype.createThrottledScrollHandler = function() {
    var self = this
    function scrollHandler() {
      self.handleScroll()
      self.didScroll = false
    }

    this.adapter.on('scroll.waypoints', function() {
      if (!self.didScroll || Waypoint.isTouch) {
        self.didScroll = true
        Waypoint.requestAnimationFrame(scrollHandler)
      }
    })
  }

  /* Private */
  Context.prototype.handleResize = function() {
    Waypoint.Context.refreshAll()
  }

  /* Private */
  Context.prototype.handleScroll = function() {
    var triggeredGroups = {}
    var axes = {
      horizontal: {
        newScroll: this.adapter.scrollLeft(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left'
      },
      vertical: {
        newScroll: this.adapter.scrollTop(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up'
      }
    }

    for (var axisKey in axes) {
      var axis = axes[axisKey]
      var isForward = axis.newScroll > axis.oldScroll
      var direction = isForward ? axis.forward : axis.backward

      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey]
        var wasBeforeTriggerPoint = axis.oldScroll < waypoint.triggerPoint
        var nowAfterTriggerPoint = axis.newScroll >= waypoint.triggerPoint
        var crossedForward = wasBeforeTriggerPoint && nowAfterTriggerPoint
        var crossedBackward = !wasBeforeTriggerPoint && !nowAfterTriggerPoint
        if (crossedForward || crossedBackward) {
          waypoint.queueTrigger(direction)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
      }
    }

    for (var groupKey in triggeredGroups) {
      triggeredGroups[groupKey].flushTriggers()
    }

    this.oldScroll = {
      x: axes.horizontal.newScroll,
      y: axes.vertical.newScroll
    }
  }

  /* Private */
  Context.prototype.innerHeight = function() {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportHeight()
    }
    /*eslint-enable eqeqeq */
    return this.adapter.innerHeight()
  }

  /* Private */
  Context.prototype.remove = function(waypoint) {
    delete this.waypoints[waypoint.axis][waypoint.key]
    this.checkEmpty()
  }

  /* Private */
  Context.prototype.innerWidth = function() {
    /*eslint-disable eqeqeq */
    if (this.element == this.element.window) {
      return Waypoint.viewportWidth()
    }
    /*eslint-enable eqeqeq */
    return this.adapter.innerWidth()
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-destroy */
  Context.prototype.destroy = function() {
    var allWaypoints = []
    for (var axis in this.waypoints) {
      for (var waypointKey in this.waypoints[axis]) {
        allWaypoints.push(this.waypoints[axis][waypointKey])
      }
    }
    for (var i = 0, end = allWaypoints.length; i < end; i++) {
      allWaypoints[i].destroy()
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-refresh */
  Context.prototype.refresh = function() {
    /*eslint-disable eqeqeq */
    var isWindow = this.element == this.element.window
    /*eslint-enable eqeqeq */
    var contextOffset = this.adapter.offset()
    var triggeredGroups = {}
    var axes

    this.handleScroll()
    axes = {
      horizontal: {
        contextOffset: isWindow ? 0 : contextOffset.left,
        contextScroll: isWindow ? 0 : this.oldScroll.x,
        contextDimension: this.innerWidth(),
        oldScroll: this.oldScroll.x,
        forward: 'right',
        backward: 'left',
        offsetProp: 'left'
      },
      vertical: {
        contextOffset: isWindow ? 0 : contextOffset.top,
        contextScroll: isWindow ? 0 : this.oldScroll.y,
        contextDimension: this.innerHeight(),
        oldScroll: this.oldScroll.y,
        forward: 'down',
        backward: 'up',
        offsetProp: 'top'
      }
    }

    for (var axisKey in axes) {
      var axis = axes[axisKey]
      for (var waypointKey in this.waypoints[axisKey]) {
        var waypoint = this.waypoints[axisKey][waypointKey]
        var adjustment = waypoint.options.offset
        var oldTriggerPoint = waypoint.triggerPoint
        var elementOffset = 0
        var freshWaypoint = oldTriggerPoint == null
        var contextModifier, wasBeforeScroll, nowAfterScroll
        var triggeredBackward, triggeredForward

        if (waypoint.element !== waypoint.element.window) {
          elementOffset = waypoint.adapter.offset()[axis.offsetProp]
        }

        if (typeof adjustment === 'function') {
          adjustment = adjustment.apply(waypoint)
        }
        else if (typeof adjustment === 'string') {
          adjustment = parseFloat(adjustment)
          if (waypoint.options.offset.indexOf('%') > - 1) {
            adjustment = Math.ceil(axis.contextDimension * adjustment / 100)
          }
        }

        contextModifier = axis.contextScroll - axis.contextOffset
        waypoint.triggerPoint = elementOffset + contextModifier - adjustment
        wasBeforeScroll = oldTriggerPoint < axis.oldScroll
        nowAfterScroll = waypoint.triggerPoint >= axis.oldScroll
        triggeredBackward = wasBeforeScroll && nowAfterScroll
        triggeredForward = !wasBeforeScroll && !nowAfterScroll

        if (!freshWaypoint && triggeredBackward) {
          waypoint.queueTrigger(axis.backward)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
        else if (!freshWaypoint && triggeredForward) {
          waypoint.queueTrigger(axis.forward)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
        else if (freshWaypoint && axis.oldScroll >= waypoint.triggerPoint) {
          waypoint.queueTrigger(axis.forward)
          triggeredGroups[waypoint.group.id] = waypoint.group
        }
      }
    }

    for (var groupKey in triggeredGroups) {
      triggeredGroups[groupKey].flushTriggers()
    }

    return this
  }

  /* Private */
  Context.findOrCreateByElement = function(element) {
    return Context.findByElement(element) || new Context(element)
  }

  /* Private */
  Context.refreshAll = function() {
    for (var contextId in contexts) {
      contexts[contextId].refresh()
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/context-find-by-element */
  Context.findByElement = function(element) {
    return contexts[element.waypointContextKey]
  }

  window.onload = function() {
    if (oldWindowLoad) {
      oldWindowLoad()
    }
    Context.refreshAll()
  }

  Waypoint.requestAnimationFrame = function(callback) {
    var requestFn = window.requestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      requestAnimationFrameShim
    requestFn.call(window, callback)
  }
  Waypoint.Context = Context
}())
;(function() {
  'use strict'

  function byTriggerPoint(a, b) {
    return a.triggerPoint - b.triggerPoint
  }

  function byReverseTriggerPoint(a, b) {
    return b.triggerPoint - a.triggerPoint
  }

  var groups = {
    vertical: {},
    horizontal: {}
  }
  var Waypoint = window.Waypoint

  /* http://imakewebthings.com/waypoints/api/group */
  function Group(options) {
    this.name = options.name
    this.axis = options.axis
    this.id = this.name + '-' + this.axis
    this.waypoints = []
    this.clearTriggerQueues()
    groups[this.axis][this.name] = this
  }

  /* Private */
  Group.prototype.add = function(waypoint) {
    this.waypoints.push(waypoint)
  }

  /* Private */
  Group.prototype.clearTriggerQueues = function() {
    this.triggerQueues = {
      up: [],
      down: [],
      left: [],
      right: []
    }
  }

  /* Private */
  Group.prototype.flushTriggers = function() {
    for (var direction in this.triggerQueues) {
      var waypoints = this.triggerQueues[direction]
      var reverse = direction === 'up' || direction === 'left'
      waypoints.sort(reverse ? byReverseTriggerPoint : byTriggerPoint)
      for (var i = 0, end = waypoints.length; i < end; i += 1) {
        var waypoint = waypoints[i]
        if (waypoint.options.continuous || i === waypoints.length - 1) {
          waypoint.trigger([direction])
        }
      }
    }
    this.clearTriggerQueues()
  }

  /* Private */
  Group.prototype.next = function(waypoint) {
    this.waypoints.sort(byTriggerPoint)
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints)
    var isLast = index === this.waypoints.length - 1
    return isLast ? null : this.waypoints[index + 1]
  }

  /* Private */
  Group.prototype.previous = function(waypoint) {
    this.waypoints.sort(byTriggerPoint)
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints)
    return index ? this.waypoints[index - 1] : null
  }

  /* Private */
  Group.prototype.queueTrigger = function(waypoint, direction) {
    this.triggerQueues[direction].push(waypoint)
  }

  /* Private */
  Group.prototype.remove = function(waypoint) {
    var index = Waypoint.Adapter.inArray(waypoint, this.waypoints)
    if (index > -1) {
      this.waypoints.splice(index, 1)
    }
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/first */
  Group.prototype.first = function() {
    return this.waypoints[0]
  }

  /* Public */
  /* http://imakewebthings.com/waypoints/api/last */
  Group.prototype.last = function() {
    return this.waypoints[this.waypoints.length - 1]
  }

  /* Private */
  Group.findOrCreate = function(options) {
    return groups[options.axis][options.name] || new Group(options)
  }

  Waypoint.Group = Group
}())
;(function() {
  'use strict'

  var $ = window.jQuery
  var Waypoint = window.Waypoint

  function JQueryAdapter(element) {
    this.$element = $(element)
  }

  $.each([
    'innerHeight',
    'innerWidth',
    'off',
    'offset',
    'on',
    'outerHeight',
    'outerWidth',
    'scrollLeft',
    'scrollTop'
  ], function(i, method) {
    JQueryAdapter.prototype[method] = function() {
      var args = Array.prototype.slice.call(arguments)
      return this.$element[method].apply(this.$element, args)
    }
  })

  $.each([
    'extend',
    'inArray',
    'isEmptyObject'
  ], function(i, method) {
    JQueryAdapter[method] = $[method]
  })

  Waypoint.adapters.push({
    name: 'jquery',
    Adapter: JQueryAdapter
  })
  Waypoint.Adapter = JQueryAdapter
}())
;(function() {
  'use strict'

  var Waypoint = window.Waypoint

  function createExtension(framework) {
    return function() {
      var waypoints = []
      var overrides = arguments[0]

      if (framework.isFunction(arguments[0])) {
        overrides = framework.extend({}, arguments[1])
        overrides.handler = arguments[0]
      }

      this.each(function() {
        var options = framework.extend({}, overrides, {
          element: this
        })
        if (typeof options.context === 'string') {
          options.context = framework(this).closest(options.context)[0]
        }
        waypoints.push(new Waypoint(options))
      })

      return waypoints
    }
  }

  if (window.jQuery) {
    window.jQuery.fn.waypoint = createExtension(window.jQuery)
  }
  if (window.Zepto) {
    window.Zepto.fn.waypoint = createExtension(window.Zepto)
  }
}())
;
/*!
Waypoints Infinite Scroll Shortcut - 3.1.1
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/
(function() {
  'use strict'

  var $ = window.jQuery
  var Waypoint = window.Waypoint

  /* http://imakewebthings.com/waypoints/shortcuts/infinite-scroll */
  function Infinite(options) {
    this.options = $.extend({}, Infinite.defaults, options)
    this.container = this.options.element
    if (this.options.container !== 'auto') {
      this.container = this.options.container
    }
    this.$container = $(this.container)
    this.$more = $(this.options.more)

    if (this.$more.length) {
      this.setupHandler()
      this.waypoint = new Waypoint(this.options)
    }
  }

  /* Private */
  Infinite.prototype.setupHandler = function() {
    this.options.handler = $.proxy(function() {
      this.options.onBeforePageLoad()
      this.destroy()
      this.$container.addClass(this.options.loadingClass)

      $.get($(this.options.more).attr('href'), $.proxy(function(data) {
        var $data = $($.parseHTML(data))
        var $newMore = $data.find(this.options.more)

        var $items = $data.find(this.options.items)
        if (!$items.length) {
          $items = $data.filter(this.options.items)
        }

        this.$container.append($items)
        this.$container.removeClass(this.options.loadingClass)

        if (!$newMore.length) {
          $newMore = $data.filter(this.options.more)
        }
        if ($newMore.length) {
          this.$more.replaceWith($newMore)
          this.$more = $newMore
          this.waypoint = new Waypoint(this.options)
        }
        else {
          this.$more.remove()
        }

        this.options.onAfterPageLoad()
      }, this))
    }, this)
  }

  /* Public */
  Infinite.prototype.destroy = function() {
    if (this.waypoint) {
      this.waypoint.destroy()
    }
  }

  Infinite.defaults = {
    container: 'auto',
    items: '.infinite-item',
    more: '.infinite-more-link',
    offset: 'bottom-in-view',
    loadingClass: 'infinite-loading',
    onBeforePageLoad: $.noop,
    onAfterPageLoad: $.noop
  }

  Waypoint.Infinite = Infinite
}())
;
/*global jQuery */
/*jshint browser:true */
/*!
* FitVids 1.1
*
* Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
* Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
* Released under the WTFPL license - http://sam.zoy.org/wtfpl/
*
*/

(function( $ ){

  "use strict";

  $.fn.fitVids = function( options ) {
    var settings = {
      customSelector: null
    };

    if(!document.getElementById('fit-vids-style')) {
      // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
      var head = document.head || document.getElementsByTagName('head')[0];
      var css = '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
      var div = document.createElement('div');
      div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';
      head.appendChild(div.childNodes[1]);
    }

    if ( options ) {
      $.extend( settings, options );
    }

    return this.each(function(){
      var selectors = [
        "iframe[src*='player.vimeo.com']",
        "iframe[src*='youtube.com']",
        "iframe[src*='youtube-nocookie.com']",
        "iframe[src*='kickstarter.com'][src*='video.html']",
        "object",
        "embed"
      ];

      if (settings.customSelector) {
        selectors.push(settings.customSelector);
      }

      var $allVideos = $(this).find(selectors.join(','));
      $allVideos = $allVideos.not("object object"); // SwfObj conflict patch

      $allVideos.each(function(){
        var $this = $(this);
        if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) { return; }
        var height = ( this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))) ) ? parseInt($this.attr('height'), 10) : $this.height(),
            width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
            aspectRatio = height / width;
        if(!$this.attr('id')){
          var videoID = 'fitvid' + Math.floor(Math.random()*999999);
          $this.attr('id', videoID);
        }
        $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100)+"%");
        $this.removeAttr('height').removeAttr('width');
      });
    });
  };
// Works with either jQuery or Zepto
})( window.jQuery || window.Zepto );

/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 */
(function(root, factory) {

  /* CommonJS */
  if (typeof exports == 'object')  module.exports = factory()

  /* AMD module */
  else if (typeof define == 'function' && define.amd) define(factory)

  /* Browser global */
  else root.Spinner = factory()
}
(this, function() {
  "use strict";

  var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */
    , animations = {} /* Animation rules keyed by their name */
    , useCssAnimations /* Whether to use CSS animations or setTimeout */

  /**
   * Utility function to create elements. If no tag name is given,
   * a DIV is created. Optionally properties can be passed.
   */
  function createEl(tag, prop) {
    var el = document.createElement(tag || 'div')
      , n

    for(n in prop) el[n] = prop[n]
    return el
  }

  /**
   * Appends children and returns the parent.
   */
  function ins(parent /* child1, child2, ...*/) {
    for (var i=1, n=arguments.length; i<n; i++)
      parent.appendChild(arguments[i])

    return parent
  }

  /**
   * Insert a new stylesheet to hold the @keyframe or VML rules.
   */
  var sheet = (function() {
    var el = createEl('style', {type : 'text/css'})
    ins(document.getElementsByTagName('head')[0], el)
    return el.sheet || el.styleSheet
  }())

  /**
   * Creates an opacity keyframe animation rule and returns its name.
   * Since most mobile Webkits have timing issues with animation-delay,
   * we create separate rules for each line/segment.
   */
  function addAnimation(alpha, trail, i, lines) {
    var name = ['opacity', trail, ~~(alpha*100), i, lines].join('-')
      , start = 0.01 + i/lines * 100
      , z = Math.max(1 - (1-alpha) / trail * (100-start), alpha)
      , prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase()
      , pre = prefix && '-' + prefix + '-' || ''

    if (!animations[name]) {
      sheet.insertRule(
        '@' + pre + 'keyframes ' + name + '{' +
        '0%{opacity:' + z + '}' +
        start + '%{opacity:' + alpha + '}' +
        (start+0.01) + '%{opacity:1}' +
        (start+trail) % 100 + '%{opacity:' + alpha + '}' +
        '100%{opacity:' + z + '}' +
        '}', sheet.cssRules.length)

      animations[name] = 1
    }

    return name
  }

  /**
   * Tries various vendor prefixes and returns the first supported property.
   */
  function vendor(el, prop) {
    var s = el.style
      , pp
      , i

    prop = prop.charAt(0).toUpperCase() + prop.slice(1)
    for(i=0; i<prefixes.length; i++) {
      pp = prefixes[i]+prop
      if(s[pp] !== undefined) return pp
    }
    if(s[prop] !== undefined) return prop
  }

  /**
   * Sets multiple style properties at once.
   */
  function css(el, prop) {
    for (var n in prop)
      el.style[vendor(el, n)||n] = prop[n]

    return el
  }

  /**
   * Fills in default values.
   */
  function merge(obj) {
    for (var i=1; i < arguments.length; i++) {
      var def = arguments[i]
      for (var n in def)
        if (obj[n] === undefined) obj[n] = def[n]
    }
    return obj
  }

  /**
   * Returns the line color from the given string or array.
   */
  function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length]
  }

  // Built-in defaults

  var defaults = {
    lines: 12,            // The number of lines to draw
    length: 7,            // The length of each line
    width: 5,             // The line thickness
    radius: 10,           // The radius of the inner circle
    rotate: 0,            // Rotation offset
    corners: 1,           // Roundness (0..1)
    color: '#000',        // #rgb or #rrggbb
    direction: 1,         // 1: clockwise, -1: counterclockwise
    speed: 1,             // Rounds per second
    trail: 100,           // Afterglow percentage
    opacity: 1/4,         // Opacity of the lines
    fps: 20,              // Frames per second when using setTimeout()
    zIndex: 2e9,          // Use a high z-index by default
    className: 'spinner', // CSS class to assign to the element
    top: '50%',           // center vertically
    left: '50%',          // center horizontally
    position: 'absolute'  // element position
  }

  /** The constructor */
  function Spinner(o) {
    this.opts = merge(o || {}, Spinner.defaults, defaults)
  }

  // Global defaults that override the built-ins:
  Spinner.defaults = {}

  merge(Spinner.prototype, {

    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target b calling
     * stop() internally.
     */
    spin: function(target) {
      this.stop()

      var self = this
        , o = self.opts
        , el = self.el = css(createEl(0, {className: o.className}), {position: o.position, width: 0, zIndex: o.zIndex})

      css(el, {
        left: o.left,
        top: o.top
      })
        
      if (target) {
        target.insertBefore(el, target.firstChild||null)
      }

      el.setAttribute('role', 'progressbar')
      self.lines(el, self.opts)

      if (!useCssAnimations) {
        // No CSS animation support, use setTimeout() instead
        var i = 0
          , start = (o.lines - 1) * (1 - o.direction) / 2
          , alpha
          , fps = o.fps
          , f = fps/o.speed
          , ostep = (1-o.opacity) / (f*o.trail / 100)
          , astep = f/o.lines

        ;(function anim() {
          i++;
          for (var j = 0; j < o.lines; j++) {
            alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

            self.opacity(el, j * o.direction + start, alpha, o)
          }
          self.timeout = self.el && setTimeout(anim, ~~(1000/fps))
        })()
      }
      return self
    },

    /**
     * Stops and removes the Spinner.
     */
    stop: function() {
      var el = this.el
      if (el) {
        clearTimeout(this.timeout)
        if (el.parentNode) el.parentNode.removeChild(el)
        this.el = undefined
      }
      return this
    },

    /**
     * Internal method that draws the individual lines. Will be overwritten
     * in VML fallback mode below.
     */
    lines: function(el, o) {
      var i = 0
        , start = (o.lines - 1) * (1 - o.direction) / 2
        , seg

      function fill(color, shadow) {
        return css(createEl(), {
          position: 'absolute',
          width: (o.length+o.width) + 'px',
          height: o.width + 'px',
          background: color,
          boxShadow: shadow,
          transformOrigin: 'left',
          transform: 'rotate(' + ~~(360/o.lines*i+o.rotate) + 'deg) translate(' + o.radius+'px' +',0)',
          borderRadius: (o.corners * o.width>>1) + 'px'
        })
      }

      for (; i < o.lines; i++) {
        seg = css(createEl(), {
          position: 'absolute',
          top: 1+~(o.width/2) + 'px',
          transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
          opacity: o.opacity,
          animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1/o.speed + 's linear infinite'
        })

        if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {top: 2+'px'}))
        ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
      }
      return el
    },

    /**
     * Internal method that adjusts the opacity of a single line.
     * Will be overwritten in VML fallback mode below.
     */
    opacity: function(el, i, val) {
      if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
    }

  })


  function initVML() {

    /* Utility function to create a VML tag */
    function vml(tag, attr) {
      return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
    }

    // No CSS transforms but VML support, add a CSS rule for VML elements:
    sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

    Spinner.prototype.lines = function(el, o) {
      var r = o.length+o.width
        , s = 2*r

      function grp() {
        return css(
          vml('group', {
            coordsize: s + ' ' + s,
            coordorigin: -r + ' ' + -r
          }),
          { width: s, height: s }
        )
      }

      var margin = -(o.width+o.length)*2 + 'px'
        , g = css(grp(), {position: 'absolute', top: margin, left: margin})
        , i

      function seg(i, dx, filter) {
        ins(g,
          ins(css(grp(), {rotation: 360 / o.lines * i + 'deg', left: ~~dx}),
            ins(css(vml('roundrect', {arcsize: o.corners}), {
                width: r,
                height: o.width,
                left: o.radius,
                top: -o.width>>1,
                filter: filter
              }),
              vml('fill', {color: getColor(o.color, i), opacity: o.opacity}),
              vml('stroke', {opacity: 0}) // transparent stroke to fix color bleeding upon opacity change
            )
          )
        )
      }

      if (o.shadow)
        for (i = 1; i <= o.lines; i++)
          seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

      for (i = 1; i <= o.lines; i++) seg(i)
      return ins(el, g)
    }

    Spinner.prototype.opacity = function(el, i, val, o) {
      var c = el.firstChild
      o = o.shadow && o.lines || 0
      if (c && i+o < c.childNodes.length) {
        c = c.childNodes[i+o]; c = c && c.firstChild; c = c && c.firstChild
        if (c) c.opacity = val
      }
    }
  }

  var probe = css(createEl('group'), {behavior: 'url(#default#VML)'})

  if (!vendor(probe, 'transform') && probe.adj) initVML()
  else useCssAnimations = vendor(probe, 'animation')

  return Spinner

}));

/*!
 * jquery-timepicker v1.8.2 - A jQuery timepicker plugin inspired by Google Calendar. It supports both mouse and keyboard navigation.
 * Copyright (c) 2015 Jon Thornton - http://jonthornton.github.com/jquery-timepicker/
 * License: MIT
 */


(function (factory) {
    if (typeof exports === "object" && exports &&
        typeof module === "object" && module && module.exports === exports) {
        // Browserify. Attach to jQuery module.
        factory(require("jquery"));
    } else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['jquery'], factory);
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {
	var _baseDate = _generateBaseDate();
	var _ONE_DAY = 86400;
	var _lang = {
		am: 'am',
		pm: 'pm',
		AM: 'AM',
		PM: 'PM',
		decimal: '.',
		mins: 'mins',
		hr: 'hr',
		hrs: 'hrs'
	};

	var methods = {
		init: function(options)
		{
			return this.each(function()
			{
				var self = $(this);

				// pick up settings from data attributes
				var attributeOptions = [];
				for (var key in $.fn.timepicker.defaults) {
					if (self.data(key))  {
						attributeOptions[key] = self.data(key);
					}
				}

				var settings = $.extend({}, $.fn.timepicker.defaults, attributeOptions, options);

				if (settings.lang) {
					_lang = $.extend(_lang, settings.lang);
				}

				settings = _parseSettings(settings);
				self.data('timepicker-settings', settings);
				self.addClass('ui-timepicker-input');

				if (settings.useSelect) {
					_render(self);
				} else {
					self.prop('autocomplete', 'off');
					if (settings.showOn) {
						for (i in settings.showOn) {
							self.on(settings.showOn[i]+'.timepicker', methods.show);
						}
					}
					self.on('change.timepicker', _formatValue);
					self.on('keydown.timepicker', _keydownhandler);
					self.on('keyup.timepicker', _keyuphandler);
					if (settings.disableTextInput) {
						self.on('keypress.timepicker', function(e) { e.preventDefault(); });
					}

					_formatValue.call(self.get(0));
				}
			});
		},

		show: function(e)
		{
			var self = $(this);
			var settings = self.data('timepicker-settings');

			if (e) {
				e.preventDefault();
			}

			if (settings.useSelect) {
				self.data('timepicker-list').focus();
				return;
			}

			if (_hideKeyboard(self)) {
				// block the keyboard on mobile devices
				self.blur();
			}

			var list = self.data('timepicker-list');

			// check if input is readonly
			if (self.prop('readonly')) {
				return;
			}

			// check if list needs to be rendered
			if (!list || list.length === 0 || typeof settings.durationTime === 'function') {
				_render(self);
				list = self.data('timepicker-list');
			}

			if (_isVisible(list)) {
				return;
			}

			self.data('ui-timepicker-value', self.val());
			_setSelected(self, list);

			// make sure other pickers are hidden
			methods.hide();

			// position the dropdown relative to the input
			list.show();
			var listOffset = {};

			if (settings.orientation.match(/r/)) {
				// right-align the dropdown
				listOffset.left = self.offset().left + self.outerWidth() - list.outerWidth() + parseInt(list.css('marginLeft').replace('px', ''), 10);
			} else {
				// left-align the dropdown
				listOffset.left = self.offset().left + parseInt(list.css('marginLeft').replace('px', ''), 10);
			}

			var verticalOrientation;
			if (settings.orientation.match(/t/)) {
				verticalOrientation = 't';
			} else if (settings.orientation.match(/b/)) {
				verticalOrientation = 'b';
			} else if ((self.offset().top + self.outerHeight(true) + list.outerHeight()) > $(window).height() + $(window).scrollTop()) {
				verticalOrientation = 't';
			} else {
				verticalOrientation = 'b';
			}

			if (verticalOrientation == 't') {
				// position the dropdown on top
				list.addClass('ui-timepicker-positioned-top');
				listOffset.top = self.offset().top - list.outerHeight() + parseInt(list.css('marginTop').replace('px', ''), 10);
			} else {
				// put it under the input
				list.removeClass('ui-timepicker-positioned-top');
				listOffset.top = self.offset().top + self.outerHeight() + parseInt(list.css('marginTop').replace('px', ''), 10);
			}

			list.offset(listOffset);

			// position scrolling
			var selected = list.find('.ui-timepicker-selected');

			if (!selected.length) {
				if (_getTimeValue(self)) {
					selected = _findRow(self, list, _time2int(_getTimeValue(self)));
				} else if (settings.scrollDefault) {
					selected = _findRow(self, list, settings.scrollDefault());
				}
			}

			if (selected && selected.length) {
				var topOffset = list.scrollTop() + selected.position().top - selected.outerHeight();
				list.scrollTop(topOffset);
			} else {
				list.scrollTop(0);
			}

			// prevent scroll propagation
			if(settings.stopScrollPropagation) {
				$(document).on('wheel.ui-timepicker', '.ui-timepicker-wrapper', function(e){
					e.preventDefault();
					var currentScroll = $(this).scrollTop();
					$(this).scrollTop(currentScroll + e.originalEvent.deltaY);
				});
			}

			// attach close handlers
			$(document).on('touchstart.ui-timepicker mousedown.ui-timepicker', _closeHandler);
			$(window).on('resize.ui-timepicker', _closeHandler);
			if (settings.closeOnWindowScroll) {
				$(document).on('scroll.ui-timepicker', _closeHandler);
			}

			self.trigger('showTimepicker');

			return this;
		},

		hide: function(e)
		{
			var self = $(this);
			var settings = self.data('timepicker-settings');

			if (settings && settings.useSelect) {
				self.blur();
			}

			$('.ui-timepicker-wrapper').each(function() {
				var list = $(this);
				if (!_isVisible(list)) {
					return;
				}

				var self = list.data('timepicker-input');
				var settings = self.data('timepicker-settings');

				if (settings && settings.selectOnBlur) {
					_selectValue(self);
				}

				list.hide();
				self.trigger('hideTimepicker');
			});

			return this;
		},

		option: function(key, value)
		{
			return this.each(function(){
				var self = $(this);
				var settings = self.data('timepicker-settings');
				var list = self.data('timepicker-list');

				if (typeof key == 'object') {
					settings = $.extend(settings, key);

				} else if (typeof key == 'string' && typeof value != 'undefined') {
					settings[key] = value;

				} else if (typeof key == 'string') {
					return settings[key];
				}

				settings = _parseSettings(settings);

				self.data('timepicker-settings', settings);

				if (list) {
					list.remove();
					self.data('timepicker-list', false);
				}

				if (settings.useSelect) {
					_render(self);
				}
			});
		},

		getSecondsFromMidnight: function()
		{
			return _time2int(_getTimeValue(this));
		},

		getTime: function(relative_date)
		{
			var self = this;

			var time_string = _getTimeValue(self);
			if (!time_string) {
				return null;
			}

			var offset = _time2int(time_string);
			if (offset === null) {
				return null;
			}

			if (!relative_date) {
				relative_date = new Date();
			}

			// construct a Date with today's date, and offset's time
			var time = new Date(relative_date);
			time.setHours(offset / 3600);
			time.setMinutes(offset % 3600 / 60);
			time.setSeconds(offset % 60);
			time.setMilliseconds(0);

			return time;
		},

		setTime: function(value)
		{
			var self = this;
			var settings = self.data('timepicker-settings');

			if (settings.forceRoundTime) {
				var prettyTime = _roundAndFormatTime(_time2int(value), settings)
			} else {
				var prettyTime = _int2time(_time2int(value), settings);
			}

			if (value && prettyTime === null && settings.noneOption) {
				prettyTime = value;
			}

			_setTimeValue(self, prettyTime);
			if (self.data('timepicker-list')) {
				_setSelected(self, self.data('timepicker-list'));
			}

			return this;
		},

		remove: function()
		{
			var self = this;

			// check if this element is a timepicker
			if (!self.hasClass('ui-timepicker-input')) {
				return;
			}

			var settings = self.data('timepicker-settings');
			self.removeAttr('autocomplete', 'off');
			self.removeClass('ui-timepicker-input');
			self.removeData('timepicker-settings');
			self.off('.timepicker');

			// timepicker-list won't be present unless the user has interacted with this timepicker
			if (self.data('timepicker-list')) {
				self.data('timepicker-list').remove();
			}

			if (settings.useSelect) {
				self.show();
			}

			self.removeData('timepicker-list');

			return this;
		}
	};

	// private methods

	function _isVisible(elem)
	{
		var el = elem[0];
		return el.offsetWidth > 0 && el.offsetHeight > 0;
	}

	function _parseSettings(settings)
	{
		if (settings.minTime) {
			settings.minTime = _time2int(settings.minTime);
		}

		if (settings.maxTime) {
			settings.maxTime = _time2int(settings.maxTime);
		}

		if (settings.durationTime && typeof settings.durationTime !== 'function') {
			settings.durationTime = _time2int(settings.durationTime);
		}

		if (settings.scrollDefault == 'now') {
			settings.scrollDefault = function() {
				return settings.roundingFunction(_time2int(new Date()), settings);
			}
		} else if (settings.scrollDefault && typeof settings.scrollDefault != 'function') {
			var val = settings.scrollDefault;
			settings.scrollDefault = function() {
				return settings.roundingFunction(_time2int(val), settings);
			}
		} else if (settings.minTime) {
			settings.scrollDefault = function() {
				return settings.roundingFunction(settings.minTime, settings);
			}
		}

		if ($.type(settings.timeFormat) === "string" && settings.timeFormat.match(/[gh]/)) {
			settings._twelveHourTime = true;
		}

		if (settings.showOnFocus === false && settings.showOn.indexOf('focus') != -1) {
			settings.showOn.splice(settings.showOn.indexOf('focus'), 1);
		}

		if (settings.disableTimeRanges.length > 0) {
			// convert string times to integers
			for (var i in settings.disableTimeRanges) {
				settings.disableTimeRanges[i] = [
					_time2int(settings.disableTimeRanges[i][0]),
					_time2int(settings.disableTimeRanges[i][1])
				];
			}

			// sort by starting time
			settings.disableTimeRanges = settings.disableTimeRanges.sort(function(a, b){
				return a[0] - b[0];
			});

			// merge any overlapping ranges
			for (var i = settings.disableTimeRanges.length-1; i > 0; i--) {
				if (settings.disableTimeRanges[i][0] <= settings.disableTimeRanges[i-1][1]) {
					settings.disableTimeRanges[i-1] = [
						Math.min(settings.disableTimeRanges[i][0], settings.disableTimeRanges[i-1][0]),
						Math.max(settings.disableTimeRanges[i][1], settings.disableTimeRanges[i-1][1])
					];
					settings.disableTimeRanges.splice(i, 1);
				}
			}
		}

		return settings;
	}

	function _render(self)
	{
		var settings = self.data('timepicker-settings');
		var list = self.data('timepicker-list');

		if (list && list.length) {
			list.remove();
			self.data('timepicker-list', false);
		}

		if (settings.useSelect) {
			list = $('<select />', { 'class': 'ui-timepicker-select' });
			var wrapped_list = list;
		} else {
			list = $('<ul />', { 'class': 'ui-timepicker-list' });

			var wrapped_list = $('<div />', { 'class': 'ui-timepicker-wrapper', 'tabindex': -1 });
			wrapped_list.css({'display':'none', 'position': 'absolute' }).append(list);
		}

		if (settings.noneOption) {
			if (settings.noneOption === true) {
				settings.noneOption = (settings.useSelect) ? 'Time...' : 'None';
			}

			if ($.isArray(settings.noneOption)) {
				for (var i in settings.noneOption) {
					if (parseInt(i, 10) == i){
						var noneElement = _generateNoneElement(settings.noneOption[i], settings.useSelect);
						list.append(noneElement);
					}
				}
			} else {
				var noneElement = _generateNoneElement(settings.noneOption, settings.useSelect);
				list.append(noneElement);
			}
		}

		if (settings.className) {
			wrapped_list.addClass(settings.className);
		}

		if ((settings.minTime !== null || settings.durationTime !== null) && settings.showDuration) {
			var stepval = typeof settings.step == 'function' ? 'function' : settings.step;
			wrapped_list.addClass('ui-timepicker-with-duration');
			wrapped_list.addClass('ui-timepicker-step-'+settings.step);
		}

		var durStart = settings.minTime;
		if (typeof settings.durationTime === 'function') {
			durStart = _time2int(settings.durationTime());
		} else if (settings.durationTime !== null) {
			durStart = settings.durationTime;
		}
		var start = (settings.minTime !== null) ? settings.minTime : 0;
		var end = (settings.maxTime !== null) ? settings.maxTime : (start + _ONE_DAY - 1);

		if (end < start) {
			// make sure the end time is greater than start time, otherwise there will be no list to show
			end += _ONE_DAY;
		}

		if (end === _ONE_DAY-1 && $.type(settings.timeFormat) === "string" && settings.show2400) {
			// show a 24:00 option when using military time
			end = _ONE_DAY;
		}

		var dr = settings.disableTimeRanges;
		var drCur = 0;
		var drLen = dr.length;

		var stepFunc = settings.step;
		if (typeof stepFunc != 'function') {
			stepFunc = function() {
				return settings.step;
			}
		}

		for (var i=start, j=0; i <= end; j++, i += stepFunc(j)*60) {
			var timeInt = i;
			var timeString = _int2time(timeInt, settings);

			if (settings.useSelect) {
				var row = $('<option />', { 'value': timeString });
				row.text(timeString);
			} else {
				var row = $('<li />');
				row.data('time', (timeInt <= 86400 ? timeInt : timeInt % 86400));
				row.text(timeString);
			}

			if ((settings.minTime !== null || settings.durationTime !== null) && settings.showDuration) {
				var durationString = _int2duration(i - durStart, settings.step);
				if (settings.useSelect) {
					row.text(row.text()+' ('+durationString+')');
				} else {
					var duration = $('<span />', { 'class': 'ui-timepicker-duration' });
					duration.text(' ('+durationString+')');
					row.append(duration);
				}
			}

			if (drCur < drLen) {
				if (timeInt >= dr[drCur][1]) {
					drCur += 1;
				}

				if (dr[drCur] && timeInt >= dr[drCur][0] && timeInt < dr[drCur][1]) {
					if (settings.useSelect) {
						row.prop('disabled', true);
					} else {
						row.addClass('ui-timepicker-disabled');
					}
				}
			}

			list.append(row);
		}

		wrapped_list.data('timepicker-input', self);
		self.data('timepicker-list', wrapped_list);

		if (settings.useSelect) {
			if (self.val()) {
				list.val(_roundAndFormatTime(_time2int(self.val()), settings));
			}

			list.on('focus', function(){
				$(this).data('timepicker-input').trigger('showTimepicker');
			});
			list.on('blur', function(){
				$(this).data('timepicker-input').trigger('hideTimepicker');
			});
			list.on('change', function(){
				_setTimeValue(self, $(this).val(), 'select');
			});

			_setTimeValue(self, list.val(), 'initial');
			self.hide().after(list);
		} else {
			var appendTo = settings.appendTo;
			if (typeof appendTo === 'string') {
				appendTo = $(appendTo);
			} else if (typeof appendTo === 'function') {
				appendTo = appendTo(self);
			}
			appendTo.append(wrapped_list);
			_setSelected(self, list);

			list.on('mousedown', 'li', function(e) {

				// hack: temporarily disable the focus handler
				// to deal with the fact that IE fires 'focus'
				// events asynchronously
				self.off('focus.timepicker');
				self.on('focus.timepicker-ie-hack', function(){
					self.off('focus.timepicker-ie-hack');
					self.on('focus.timepicker', methods.show);
				});

				if (!_hideKeyboard(self)) {
					self[0].focus();
				}

				// make sure only the clicked row is selected
				list.find('li').removeClass('ui-timepicker-selected');
				$(this).addClass('ui-timepicker-selected');

				if (_selectValue(self)) {
					self.trigger('hideTimepicker');

					list.on('mouseup.timepicker', 'li', function(e) {
						list.off('mouseup.timepicker');
						wrapped_list.hide();
					});
				}
			});
		}
	}

	function _generateNoneElement(optionValue, useSelect)
	{
		var label, className, value;

		if (typeof optionValue == 'object') {
			label = optionValue.label;
			className = optionValue.className;
			value = optionValue.value;
		} else if (typeof optionValue == 'string') {
			label = optionValue;
		} else {
			$.error('Invalid noneOption value');
		}

		if (useSelect) {
			return $('<option />', {
					'value': value,
					'class': className,
					'text': label
				});
		} else {
			return $('<li />', {
					'class': className,
					'text': label
				}).data('time', value);
		}
	}

	function _roundAndFormatTime(seconds, settings)
	{
		seconds = settings.roundingFunction(seconds, settings);
		if (seconds !== null) {
			return _int2time(seconds, settings);
		}
	}

	function _generateBaseDate()
	{
		return new Date(1970, 1, 1, 0, 0, 0);
	}

	// event handler to decide whether to close timepicker
	function _closeHandler(e)
	{
		var target = $(e.target);
		var input = target.closest('.ui-timepicker-input');
		if (input.length === 0 && target.closest('.ui-timepicker-wrapper').length === 0) {
			methods.hide();
			$(document).unbind('.ui-timepicker');
			$(window).unbind('.ui-timepicker');
		}
	}

	function _hideKeyboard(self)
	{
		var settings = self.data('timepicker-settings');
		return ((window.navigator.msMaxTouchPoints || 'ontouchstart' in document) && settings.disableTouchKeyboard);
	}

	function _findRow(self, list, value)
	{
		if (!value && value !== 0) {
			return false;
		}

		var settings = self.data('timepicker-settings');
		var out = false;
		var value = settings.roundingFunction(value, settings);

		// loop through the menu items
		list.find('li').each(function(i, obj) {
			var jObj = $(obj);
			if (typeof jObj.data('time') != 'number') {
				return;
			}

			if (jObj.data('time') == value) {
				out = jObj;
				return false;
			}
		});

		return out;
	}

	function _setSelected(self, list)
	{
		list.find('li').removeClass('ui-timepicker-selected');

		var timeValue = _time2int(_getTimeValue(self), self.data('timepicker-settings'));
		if (timeValue === null) {
			return;
		}

		var selected = _findRow(self, list, timeValue);
		if (selected) {

			var topDelta = selected.offset().top - list.offset().top;

			if (topDelta + selected.outerHeight() > list.outerHeight() || topDelta < 0) {
				list.scrollTop(list.scrollTop() + selected.position().top - selected.outerHeight());
			}

			selected.addClass('ui-timepicker-selected');
		}
	}


	function _formatValue(e, origin)
	{
		if (this.value === '' || origin == 'timepicker') {
			return;
		}

		var self = $(this);

		if (self.is(':focus') && (!e || e.type != 'change')) {
			return;
		}

		var settings = self.data('timepicker-settings');
		var seconds = _time2int(this.value, settings);

		if (seconds === null) {
			self.trigger('timeFormatError');
			return;
		}

		var rangeError = false;
		// check that the time in within bounds
		if (settings.minTime !== null && seconds < settings.minTime) {
			rangeError = true;
		} else if (settings.maxTime !== null && seconds > settings.maxTime) {
			rangeError = true;
		}

		// check that time isn't within disabled time ranges
		$.each(settings.disableTimeRanges, function(){
			if (seconds >= this[0] && seconds < this[1]) {
				rangeError = true;
				return false;
			}
		});

		if (settings.forceRoundTime) {
			seconds = settings.roundingFunction(seconds, settings);
		}

		var prettyTime = _int2time(seconds, settings);

		if (rangeError) {
			if (_setTimeValue(self, prettyTime, 'error')) {
				self.trigger('timeRangeError');
			}
		} else {
			_setTimeValue(self, prettyTime);
		}
	}

	function _getTimeValue(self)
	{
		if (self.is('input')) {
			return self.val();
		} else {
			// use the element's data attributes to store values
			return self.data('ui-timepicker-value');
		}
	}

	function _setTimeValue(self, value, source)
	{
		if (self.is('input')) {
			self.val(value);

			var settings = self.data('timepicker-settings');
			if (settings.useSelect && source != 'select' && source != 'initial') {
				self.data('timepicker-list').val(_roundAndFormatTime(_time2int(value), settings));
			}
		}

		if (self.data('ui-timepicker-value') != value) {
			self.data('ui-timepicker-value', value);
			if (source == 'select') {
				self.trigger('selectTime').trigger('changeTime').trigger('change', 'timepicker');
			} else if (source != 'error') {
				self.trigger('changeTime');
			}

			return true;
		} else {
			self.trigger('selectTime');
			return false;
		}
	}

	/*
	*  Keyboard navigation via arrow keys
	*/
	function _keydownhandler(e)
	{
		var self = $(this);
		var list = self.data('timepicker-list');

		if (!list || !_isVisible(list)) {
			if (e.keyCode == 40) {
				// show the list!
				methods.show.call(self.get(0));
				list = self.data('timepicker-list');
				if (!_hideKeyboard(self)) {
					self.focus();
				}
			} else {
				return true;
			}
		}

		switch (e.keyCode) {

			case 13: // return
				if (_selectValue(self)) {
					methods.hide.apply(this);
				}

				e.preventDefault();
				return false;

			case 38: // up
				var selected = list.find('.ui-timepicker-selected');

				if (!selected.length) {
					list.find('li').each(function(i, obj) {
						if ($(obj).position().top > 0) {
							selected = $(obj);
							return false;
						}
					});
					selected.addClass('ui-timepicker-selected');

				} else if (!selected.is(':first-child')) {
					selected.removeClass('ui-timepicker-selected');
					selected.prev().addClass('ui-timepicker-selected');

					if (selected.prev().position().top < selected.outerHeight()) {
						list.scrollTop(list.scrollTop() - selected.outerHeight());
					}
				}

				return false;

			case 40: // down
				selected = list.find('.ui-timepicker-selected');

				if (selected.length === 0) {
					list.find('li').each(function(i, obj) {
						if ($(obj).position().top > 0) {
							selected = $(obj);
							return false;
						}
					});

					selected.addClass('ui-timepicker-selected');
				} else if (!selected.is(':last-child')) {
					selected.removeClass('ui-timepicker-selected');
					selected.next().addClass('ui-timepicker-selected');

					if (selected.next().position().top + 2*selected.outerHeight() > list.outerHeight()) {
						list.scrollTop(list.scrollTop() + selected.outerHeight());
					}
				}

				return false;

			case 27: // escape
				list.find('li').removeClass('ui-timepicker-selected');
				methods.hide();
				break;

			case 9: //tab
				methods.hide();
				break;

			default:
				return true;
		}
	}

	/*
	*	Time typeahead
	*/
	function _keyuphandler(e)
	{
		var self = $(this);
		var list = self.data('timepicker-list');
		var settings = self.data('timepicker-settings');

		if (!list || !_isVisible(list) || settings.disableTextInput) {
			return true;
		}

		switch (e.keyCode) {

			case 96: // numpad numerals
			case 97:
			case 98:
			case 99:
			case 100:
			case 101:
			case 102:
			case 103:
			case 104:
			case 105:
			case 48: // numerals
			case 49:
			case 50:
			case 51:
			case 52:
			case 53:
			case 54:
			case 55:
			case 56:
			case 57:
			case 65: // a
			case 77: // m
			case 80: // p
			case 186: // colon
			case 8: // backspace
			case 46: // delete
				if (settings.typeaheadHighlight) {
					_setSelected(self, list);
				} else {
					list.hide();
				}
				break;
		}
	}

	function _selectValue(self)
	{
		var settings = self.data('timepicker-settings');
		var list = self.data('timepicker-list');
		var timeValue = null;

		var cursor = list.find('.ui-timepicker-selected');

		if (cursor.hasClass('ui-timepicker-disabled')) {
			return false;
		}

		if (cursor.length) {
			// selected value found
			timeValue = cursor.data('time');
		}

		if (timeValue !== null) {
			if (typeof timeValue != 'string') {
				timeValue = _int2time(timeValue, settings);
			}

			_setTimeValue(self, timeValue, 'select');
		}

		return true;
	}

	function _int2duration(seconds, step)
	{
		seconds = Math.abs(seconds);
		var minutes = Math.round(seconds/60),
			duration = [],
			hours, mins;

		if (minutes < 60) {
			// Only show (x mins) under 1 hour
			duration = [minutes, _lang.mins];
		} else {
			hours = Math.floor(minutes/60);
			mins = minutes%60;

			// Show decimal notation (eg: 1.5 hrs) for 30 minute steps
			if (step == 30 && mins == 30) {
				hours += _lang.decimal + 5;
			}

			duration.push(hours);
			duration.push(hours == 1 ? _lang.hr : _lang.hrs);

			// Show remainder minutes notation (eg: 1 hr 15 mins) for non-30 minute steps
			// and only if there are remainder minutes to show
			if (step != 30 && mins) {
				duration.push(mins);
				duration.push(_lang.mins);
			}
		}

		return duration.join(' ');
	}

	function _int2time(seconds, settings)
	{
		if (seconds === null) {
			return null;
		}

		var time = new Date(_baseDate.valueOf() + (seconds*1000));

		if (isNaN(time.getTime())) {
			return null;
		}

		if ($.type(settings.timeFormat) === "function") {
			return settings.timeFormat(time);
		}

		var output = '';
		var hour, code;
		for (var i=0; i<settings.timeFormat.length; i++) {

			code = settings.timeFormat.charAt(i);
			switch (code) {

				case 'a':
					output += (time.getHours() > 11) ? _lang.pm : _lang.am;
					break;

				case 'A':
					output += (time.getHours() > 11) ? _lang.PM : _lang.AM;
					break;

				case 'g':
					hour = time.getHours() % 12;
					output += (hour === 0) ? '12' : hour;
					break;

				case 'G':
					hour = time.getHours();
					if (seconds === _ONE_DAY) hour = 24;
					output += hour;
					break;

				case 'h':
					hour = time.getHours() % 12;

					if (hour !== 0 && hour < 10) {
						hour = '0'+hour;
					}

					output += (hour === 0) ? '12' : hour;
					break;

				case 'H':
					hour = time.getHours();
					if (seconds === _ONE_DAY) hour = 24;
					output += (hour > 9) ? hour : '0'+hour;
					break;

				case 'i':
					var minutes = time.getMinutes();
					output += (minutes > 9) ? minutes : '0'+minutes;
					break;

				case 's':
					seconds = time.getSeconds();
					output += (seconds > 9) ? seconds : '0'+seconds;
					break;

				case '\\':
					// escape character; add the next character and skip ahead
					i++;
					output += settings.timeFormat.charAt(i);
					break;

				default:
					output += code;
			}
		}

		return output;
	}

	function _time2int(timeString, settings)
	{
		if (timeString === '') return null;
		if (!timeString || timeString+0 == timeString) return timeString;

		if (typeof(timeString) == 'object') {
			return timeString.getHours()*3600 + timeString.getMinutes()*60 + timeString.getSeconds();
		}

		timeString = timeString.toLowerCase().replace(/[\s\.]/g, '');

		// if the last character is an "a" or "p", add the "m"
		if (timeString.slice(-1) == 'a' || timeString.slice(-1) == 'p') {
			timeString += 'm';
		}

		var ampmRegex = '(' +
			_lang.am.replace('.', '')+'|' +
			_lang.pm.replace('.', '')+'|' +
			_lang.AM.replace('.', '')+'|' +
			_lang.PM.replace('.', '')+')?';

		// try to parse time input
		var pattern = new RegExp('^'+ampmRegex+'([0-2]?[0-9])\\W?([0-5][0-9])?\\W?([0-5][0-9])?'+ampmRegex+'$');

		var time = timeString.match(pattern);
		if (!time) {
			return null;
		}

		var hour = parseInt(time[2]*1, 10);
		var ampm = time[1] || time[5];
		var hours = hour;

		if (hour <= 12 && ampm) {
			var isPm = (ampm == _lang.pm || ampm == _lang.PM);

			if (hour == 12) {
				hours = isPm ? 12 : 0;
			} else {
				hours = (hour + (isPm ? 12 : 0));
			}
		}

		var minutes = ( time[3]*1 || 0 );
		var seconds = ( time[4]*1 || 0 );
		var timeInt = hours*3600 + minutes*60 + seconds;

		// if no am/pm provided, intelligently guess based on the scrollDefault
		if (hour < 12 && !ampm && settings && settings._twelveHourTime && settings.scrollDefault) {
			var delta = timeInt - settings.scrollDefault();
			if (delta < 0 && delta >= _ONE_DAY / -2) {
				timeInt = (timeInt + (_ONE_DAY / 2)) % _ONE_DAY;
			}
		}

		return timeInt;
	}

	function _pad2(n) {
		return ("0" + n).slice(-2);
	}

	// Plugin entry
	$.fn.timepicker = function(method)
	{
		if (!this.length) return this;
		if (methods[method]) {
			// check if this element is a timepicker
			if (!this.hasClass('ui-timepicker-input')) {
				return this;
			}
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if(typeof method === "object" || !method) { return methods.init.apply(this, arguments); }
		else { $.error("Method "+ method + " does not exist on jQuery.timepicker"); }
	};
	// Global defaults
	$.fn.timepicker.defaults = {
		className: null,
		minTime: null,
		maxTime: null,
		durationTime: null,
		step: 30,
		showDuration: false,
		showOnFocus: true,
		showOn: ['click', 'focus'],
		timeFormat: 'g:ia',
		scrollDefault: null,
		selectOnBlur: false,
		disableTextInput: false,
		disableTouchKeyboard: false,
		forceRoundTime: false,
		roundingFunction: function(seconds, settings) {
			if (seconds === null) {
				return null;
			} else {
				var offset = seconds % (settings.step*60); // step is in minutes

				if (offset >= settings.step*30) {
					// if offset is larger than a half step, round up
					seconds += (settings.step*60) - offset;
				} else {
					// round down
					seconds -= offset;
				}

				return seconds;
			}
		},
		appendTo: 'body',
		orientation: 'l',
		disableTimeRanges: [],
		closeOnWindowScroll: false,
		typeaheadHighlight: true,
		noneOption: false,
		show2400: false,
		stopScrollPropagation: false
	};
}));

/*
 * debouncedresize: special jQuery event that happens once after a window resize
 *
 * latest version and complete README available on Github:
 * https://github.com/louisremi/jquery-smartresize
 *
 * Copyright 2012 @louis_remi
 * Licensed under the MIT license.
 *
 * This saved you an hour of work?
 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
 */
(function($) {

var $event = $.event,
  $special,
  resizeTimeout;

$special = $event.special.debouncedresize = {
  setup: function() {
    $( this ).on( "resize", $special.handler );
  },
  teardown: function() {
    $( this ).off( "resize", $special.handler );
  },
  handler: function( event, execAsap ) {
    // Save the context
    var context = this,
      args = arguments,
      dispatch = function() {
        // set correct event type
        event.type = "debouncedresize";
        $event.dispatch.apply( context, args );
      };

    if ( resizeTimeout ) {
      clearTimeout( resizeTimeout );
    }

    execAsap ?
      dispatch() :
      resizeTimeout = setTimeout( dispatch, $special.threshold );
  },
  threshold: 150
};

})(jQuery);

/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2006, 2014 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (arguments.length > 1 && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));

/**
 * stacktable.js
 * Author & copyright (c) 2012: John Polacek
 * CardTable by: Justin McNally (2015)
 * Dual MIT & GPL license
 *
 * Page: http://johnpolacek.github.com/stacktable.js
 * Repo: https://github.com/johnpolacek/stacktable.js/
 *
 * jQuery plugin for stacking tables on small screens
 *
 */
;(function($) {
  $.fn.cardtable = function(options) {
    var $tables = this,
        defaults = {id:'stacktable small-only',hideOriginal:true,headIndex:0},
        settings = $.extend({}, defaults, options);

    // checking the "headIndex" option presence... or defaults it to 0
    if(options && options.headIndex)
      headIndex = options.headIndex;
    else
      headIndex = 0;

    return $tables.each(function() {
      $table = $(this);
      if ($table.hasClass('stacktable')) {
        return;
      }
      var table_css = $table.prop('class');
      var $stacktable = $('<div></div>');
      if (typeof settings.myClass !== 'undefined') $stacktable.addClass(settings.myClass);
      var markup = '';


      $caption = $table.find("caption").clone();
      $topRow = $table.find('tr').eq(0);

      // using rowIndex and cellIndex in order to reduce ambiguity
      $table.find('tbody tr').each(function(rowIndex,value) {

        var $tr = $(this);
        // declaring headMarkup and bodyMarkup, to be used for separately head and body of single records
        headMarkup = '';
        bodyMarkup = '';
        tr_class = $tr.prop('class');
        // for the first row, "headIndex" cell is the head of the table
        // for the other rows, put the "headIndex" cell as the head for that row
        // then iterate through the key/values

        var theadHtml = [];

        $table.find('thead th').each(function(index) {
          theadHtml.push($(this).html());
        });

        $tr.find('td,th').each(function(cellIndex,value) {
          var $el = $(this);
          if ($el.html() !== ''){
            bodyMarkup += '<tr class="' + tr_class +'">';
            if (theadHtml[cellIndex]){
              bodyMarkup += '<td class="st-key">'+theadHtml[cellIndex]+'</td>';
            } else {
              bodyMarkup += '';
            }

            bodyMarkup += '<td class="' + (!theadHtml[cellIndex] && cellIndex === 0 ? 'st-key' : 'st-val') + ' '+$el.prop('class')  +'">'+$el.html()+'</td>';
            bodyMarkup += '</tr>';
          }
        });

        markup += '<table class=" '+ table_css +' '+settings.id+'"><tbody>' + headMarkup + bodyMarkup + '</tbody></table>';
      });

      $table.find('tfoot tr td').each(function(rowIndex,value) {
        if ($.trim($(value).text()) !== '') {
          markup += '<table class="'+ table_css + ' ' +settings.id+'"><tbody><tr><td>' + $(value).html() + '</td></tr></tbody></table>';
        }
      });

      $stacktable.prepend($caption);
      $stacktable.append($(markup));
      $table.before($stacktable);
      if (!settings.hideOriginal) $table.show();
    });
  };

}(jQuery));

/*
 * Swipe 2.0
 *
 * Brad Birdsall
 * Copyright 2013, MIT License
 *
*/

function Swipe(container, options) {

  "use strict";

  // utilities
  var noop = function() {}; // simple no operation function
  var offloadFn = function(fn) { setTimeout(fn || noop, 0) }; // offload a functions execution

  // check browser capabilities
  var browser = {
    addEventListener: !!window.addEventListener,
    touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
    transitions: (function(temp) {
      var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
      for ( var i in props ) if (temp.style[ props[i] ] !== undefined) return true;
      return false;
    })(document.createElement('swipe'))
  };

  // quit if no root element
  if (!container) return;
  var element = container.children[0];
  var slides, slidePos, width, length;
  options = options || {};
  var index = parseInt(options.startSlide, 10) || 0;
  var speed = options.speed || 300;
  options.continuous = options.continuous !== undefined ? options.continuous : true;

  function setup() {

    // cache slides
    slides = element.children;
    length = slides.length;

    // set continuous to false if only one slide
    if (slides.length < 2) options.continuous = false;

    //special case if two slides
    if (browser.transitions && options.continuous && slides.length < 3) {
      element.appendChild(slides[0].cloneNode(true));
      element.appendChild(element.children[1].cloneNode(true));
      slides = element.children;
    }

    // create an array to store current positions of each slide
    slidePos = new Array(slides.length);

    // determine width of each slide
    width = container.getBoundingClientRect().width || container.offsetWidth;

    element.style.width = (slides.length * width) + 'px';

    // stack elements
    var pos = slides.length;
    while(pos--) {

      var slide = slides[pos];

      slide.style.width = width + 'px';
      slide.setAttribute('data-index', pos);

      if (browser.transitions) {
        slide.style.left = (pos * -width) + 'px';
        move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
      }

    }

    // reposition elements before and after index
    if (options.continuous && browser.transitions) {
      move(circle(index-1), -width, 0);
      move(circle(index+1), width, 0);
    }

    if (!browser.transitions) element.style.left = (index * -width) + 'px';

    container.style.visibility = 'visible';

  }

  function prev() {

    if (options.continuous) slide(index-1);
    else if (index) slide(index-1);

  }

  function next() {

    if (options.continuous) slide(index+1);
    else if (index < slides.length - 1) slide(index+1);

  }

  function circle(index) {

    // a simple positive modulo using slides.length
    return (slides.length + (index % slides.length)) % slides.length;

  }

  function slide(to, slideSpeed) {

    // do nothing if already on requested slide
    if (index == to) return;

    if (browser.transitions) {

      var direction = Math.abs(index-to) / (index-to); // 1: backward, -1: forward

      // get the actual position of the slide
      if (options.continuous) {
        var natural_direction = direction;
        direction = -slidePos[circle(to)] / width;

        // if going forward but to < index, use to = slides.length + to
        // if going backward but to > index, use to = -slides.length + to
        if (direction !== natural_direction) to =  -direction * slides.length + to;

      }

      var diff = Math.abs(index-to) - 1;

      // move all the slides between index and to in the right direction
      while (diff--) move( circle((to > index ? to : index) - diff - 1), width * direction, 0);

      to = circle(to);

      move(index, width * direction, slideSpeed || speed);
      move(to, 0, slideSpeed || speed);

      if (options.continuous) move(circle(to - direction), -(width * direction), 0); // we need to get the next in place

    } else {

      to = circle(to);
      animate(index * -width, to * -width, slideSpeed || speed);
      //no fallback for a circular continuous if the browser does not accept transitions
    }

    index = to;
    offloadFn(options.callback && options.callback(index, slides[index]));
  }

  function move(index, dist, speed) {

    translate(index, dist, speed);
    slidePos[index] = dist;

  }

  function translate(index, dist, speed) {

    var slide = slides[index];
    var style = slide && slide.style;

    if (!style) return;

    style.webkitTransitionDuration =
    style.MozTransitionDuration =
    style.msTransitionDuration =
    style.OTransitionDuration =
    style.transitionDuration = speed + 'ms';

    style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
    style.msTransform =
    style.MozTransform =
    style.OTransform = 'translateX(' + dist + 'px)';

  }

  function animate(from, to, speed) {

    // if not an animation, just reposition
    if (!speed) {

      element.style.left = to + 'px';
      return;

    }

    var start = +new Date;

    var timer = setInterval(function() {

      var timeElap = +new Date - start;

      if (timeElap > speed) {

        element.style.left = to + 'px';

        if (delay) begin();

        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

        clearInterval(timer);
        return;

      }

      element.style.left = (( (to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';

    }, 4);

  }

  // setup auto slideshow
  var delay = options.auto || 0;
  var interval;

  function begin() {

    interval = setTimeout(next, delay);

  }

  function play() {

    delay = options.auto || 0;
    interval = setTimeout(next, delay);

  }

  function stop() {

    delay = 0;
    clearTimeout(interval);

  }


  // setup initial vars
  var start = {};
  var delta = {};
  var isScrolling;

  // setup event capturing
  var events = {

    handleEvent: function(event) {

      switch (event.type) {
        case 'touchstart': this.start(event); break;
        case 'touchmove': this.move(event); break;
        case 'touchend': offloadFn(this.end(event)); break;
        case 'webkitTransitionEnd':
        case 'msTransitionEnd':
        case 'oTransitionEnd':
        case 'otransitionend':
        case 'transitionend': offloadFn(this.transitionEnd(event)); break;
        case 'resize': offloadFn(setup); break;
      }

      if (options.stopPropagation) event.stopPropagation();

    },
    start: function(event) {

      var touches = event.touches[0];

      // measure start values
      start = {

        // get initial touch coords
        x: touches.pageX,
        y: touches.pageY,

        // store time to determine touch duration
        time: +new Date

      };

      // used for testing first move event
      isScrolling = undefined;

      // reset delta and end measurements
      delta = {};

      // attach touchmove and touchend listeners
      element.addEventListener('touchmove', this, false);
      element.addEventListener('touchend', this, false);

    },
    move: function(event) {

      // ensure swiping with one touch and not pinching
      if ( event.touches.length > 1 || event.scale && event.scale !== 1) return

      if (options.disableScroll) event.preventDefault();

      var touches = event.touches[0];

      // measure change in x and y
      delta = {
        x: touches.pageX - start.x,
        y: touches.pageY - start.y
      }

      // determine if scrolling test has run - one time test
      if ( typeof isScrolling == 'undefined') {
        isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
      }

      // if user is not trying to scroll vertically
      if (!isScrolling) {

        // prevent native scrolling
        event.preventDefault();

        // stop slideshow
        stop();

        // increase resistance if first or last slide
        if (options.continuous) { // we don't add resistance at the end

          translate(circle(index-1), delta.x + slidePos[circle(index-1)], 0);
          translate(index, delta.x + slidePos[index], 0);
          translate(circle(index+1), delta.x + slidePos[circle(index+1)], 0);

        } else {

          delta.x =
            delta.x /
              ( (!index && delta.x > 0               // if first slide and sliding left
                || index == slides.length - 1        // or if last slide and sliding right
                && delta.x < 0                       // and if sliding at all
              ) ?
              ( Math.abs(delta.x) / width + 1 )      // determine resistance level
              : 1 );                                 // no resistance if false

          // translate 1:1
          translate(index-1, delta.x + slidePos[index-1], 0);
          translate(index, delta.x + slidePos[index], 0);
          translate(index+1, delta.x + slidePos[index+1], 0);
        }

      }

    },
    end: function(event) {

      // measure duration
      var duration = +new Date - start.time;

      // determine if slide attempt triggers next/prev slide
      var isValidSlide =
            Number(duration) < 250               // if slide duration is less than 250ms
            && Math.abs(delta.x) > 20            // and if slide amt is greater than 20px
            || Math.abs(delta.x) > width/2;      // or if slide amt is greater than half the width

      // determine if slide attempt is past start and end
      var isPastBounds =
            !index && delta.x > 0                            // if first slide and slide amt is greater than 0
            || index == slides.length - 1 && delta.x < 0;    // or if last slide and slide amt is less than 0

      if (options.continuous) isPastBounds = false;

      // determine direction of swipe (true:right, false:left)
      var direction = delta.x < 0;

      // if not scrolling vertically
      if (!isScrolling) {

        if (isValidSlide && !isPastBounds) {

          if (direction) {

            if (options.continuous) { // we need to get the next in this direction in place

              move(circle(index-1), -width, 0);
              move(circle(index+2), width, 0);

            } else {
              move(index-1, -width, 0);
            }

            move(index, slidePos[index]-width, speed);
            move(circle(index+1), slidePos[circle(index+1)]-width, speed);
            index = circle(index+1);

          } else {
            if (options.continuous) { // we need to get the next in this direction in place

              move(circle(index+1), width, 0);
              move(circle(index-2), -width, 0);

            } else {
              move(index+1, width, 0);
            }

            move(index, slidePos[index]+width, speed);
            move(circle(index-1), slidePos[circle(index-1)]+width, speed);
            index = circle(index-1);

          }

          options.callback && options.callback(index, slides[index]);

        } else {

          if (options.continuous) {

            move(circle(index-1), -width, speed);
            move(index, 0, speed);
            move(circle(index+1), width, speed);

          } else {

            move(index-1, -width, speed);
            move(index, 0, speed);
            move(index+1, width, speed);
          }

        }

      }

      // kill touchmove and touchend event listeners until touchstart called again
      element.removeEventListener('touchmove', events, false)
      element.removeEventListener('touchend', events, false)

    },
    transitionEnd: function(event) {

      if (parseInt(event.target.getAttribute('data-index'), 10) == index) {

        if (delay) begin();

        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

      }

    }

  }

  // trigger setup
  setup();

  // start auto slideshow if applicable
  if (delay) begin();


  // add event listeners
  if (browser.addEventListener) {

    // set touchstart event on element
    if (browser.touch) element.addEventListener('touchstart', events, false);

    if (browser.transitions) {
      element.addEventListener('webkitTransitionEnd', events, false);
      element.addEventListener('msTransitionEnd', events, false);
      element.addEventListener('oTransitionEnd', events, false);
      element.addEventListener('otransitionend', events, false);
      element.addEventListener('transitionend', events, false);
    }

    // set resize event on window
    window.addEventListener('resize', events, false);

  } else {

    window.onresize = function () { setup() }; // to play nice with old IE

  }

  // expose the Swipe API
  return {
    setup: function() {

      setup();

    },
    slide: function(to, speed) {

      // cancel slideshow
      stop();

      slide(to, speed);

    },
    prev: function() {

      // cancel slideshow
      stop();

      prev();

    },
    next: function() {

      // cancel slideshow
      stop();

      next();

    },
    play: function() {

      // start slideshow
      play();

    },
    stop: function() {

      // cancel slideshow
      stop();

    },
    getPos: function() {

      // return current index position
      return index;

    },
    getNumSlides: function() {

      // return total number of slides
      return length;
    },
    kill: function() {

      // cancel slideshow
      stop();

      // reset element
      element.style.width = '';
      element.style.left = '';

      // reset slides
      var pos = slides.length;
      while(pos--) {

        var slide = slides[pos];
        slide.style.width = '';
        slide.style.left = '';

        if (browser.transitions) translate(pos, 0, 0);

      }

      // removed event listeners
      if (browser.addEventListener) {

        // remove current event listeners
        element.removeEventListener('touchstart', events, false);
        element.removeEventListener('webkitTransitionEnd', events, false);
        element.removeEventListener('msTransitionEnd', events, false);
        element.removeEventListener('oTransitionEnd', events, false);
        element.removeEventListener('otransitionend', events, false);
        element.removeEventListener('transitionend', events, false);
        window.removeEventListener('resize', events, false);

      }
      else {

        window.onresize = null;

      }

    }
  }

}


if ( window.jQuery || window.Zepto ) {
  (function($) {
    $.fn.Swipe = function(params) {
      return this.each(function() {
        $(this).data('Swipe', new Swipe($(this)[0], params));
      });
    }
  })( window.jQuery || window.Zepto )
}

/*!
 * Trend 0.1.0
 *
 * Fail-safe TransitionEnd event for jQuery.
 *
 * Adds a new "trend" event that can be used in browsers that don't
 * support "transitionend".
 *
 * NOTE: Only supports being bound with "jQuery.one".
 *
 * Copyright 2014, Pixel Union - http://pixelunion.net
 * Released under the MIT license
 */
;(function($){

  // Prefixed transitionend event names
  var transitionEndEvents =
    "webkitTransitionEnd " +
    "otransitionend " +
    "oTransitionEnd " +
    "msTransitionEnd " +
    "transitionend";

  // Prefixed transition duration property names
  var transitionDurationProperties = [
    "transition-duration",
    "-moz-transition-duration",
    "-webkit-transition-duration",
    "-ms-transition-duration",
    "-o-transition-duration",
    "-khtml-transition-duration"
  ];

  // Parses a CSS duration value into milliseconds.
  var parseDuration = function(s) {
    s = s.replace(/\s/, "");
    var v = window.parseFloat(s);

    return s.match(/[^m]s$/i)
      ? v * 1000
      : v;
  };

  // Get the transition duration for an element, as specified by CSS.
  // Returns a value in milliseconds.
  var getTransitionDuration = function(el) {
    var duration = 0;

    for (var i = 0; i < transitionDurationProperties.length; i++) {
      // Get raw CSS value
      var value = el.css(transitionDurationProperties[i]);
      if (!value) continue;

      // Multiple transitions--pick the longest
      if (value.indexOf(",") !== -1) {
        var values = value.split(",");
        var durations = (function(){
          var results = [];
          for (var i = 0; i < values.length; i++) {
            var duration = parseDuration(values[i]);
            results.push(duration);
          }
          return results;
        })();

        duration = Math.max.apply(Math, durations);
      }

      // Single transition
      else {
        duration = parseDuration(value);
      }

      // Accept first vaue
      break;
    }

    return duration;
  };

  $.event.special.transitionEnd = {
    // Triggers an event handler when an element is done transitioning.
    //
    // Handles browsers that don't support transitionend by adding a
    // timeout with the transition duration.
    add: function(handleObj) {
      var el = $(this);
      var fired = false;

      // Mark element as being in transition
      el.data("trend", true);

      // Calculate a fallback duration. + 20 because some browsers fire
      // timeouts faster than transitionend.
      var duration = getTransitionDuration(el) + 20;

      var cb = function(e) {
        // transitionend events can be sent for each property. Let's just
        // skip all but the first. Also handles the timeout callback.
        if (fired) return;

        // Child elements that also have transitions can be fired before we
        // complete. This will catch and ignore those. Unfortunately, we'll
        // have to rely on the timeout in these cases.
        if (e && e.srcElement !== el[0]) return;

        // Mark element has not being in transition
        el.data("trend", false);

        // Callback
        fired = true;
        if (handleObj.handler) handleObj.handler();
      };

      el.one(transitionEndEvents, cb);
      el.data("trend-timeout", window.setTimeout(cb, duration));
    },

    remove: function(handleObj) {
      var el = $(this);
      el.off(transitionEndEvents);
      window.clearTimeout(el.data("trend-timeout"));
    }
  };

})(jQuery);
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function Ajax() {
    var onEvent = {};

    function get(url, options) {
        var ajaxOptions = {
            cache: false
        };
        $.get(url, ajaxOptions).then(function(data) {
            if (options.onSuccess) {
                options.onSuccess.call(undefined, data, options.onSuccessArg);
                if (onEvent.success) {
                    onEvent.success.call();
                }
            }
        }, function() {
            if (options.onError) {
                options.onError.call(undefined, options.onErrorArg);
            }
        });
    }

    function on(eventType, onEventFunction) {
        onEvent[eventType] = onEventFunction;
    }

    return {
        get: get,
        on: on
    };
}

module.exports = Ajax;

},{}],2:[function(require,module,exports){
'use strict';

function CollapseParent() {
    var selector = '.js-collapse-parent';

    function eventListeners() {
        fdr.$doc.on('click', selector, function(e) {
            e.preventDefault();
            var $parent = $(this).parent();
            $parent.slideUp('fast');

        });
    }

    eventListeners();

}

module.exports = CollapseParent;

},{}],3:[function(require,module,exports){
'use strict';

function FitToWindow() {
    var selector = '.js-fit-to-window';

    function setMaxHeights($elements) {
        var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        $elements.each(function() {
            var $element = $(this);
            var offset = $element.data('fit-to-window-offset') || 0;

            $element.css('max-height', (windowHeight - offset) + 'px');
        });
    }

    function eventListeners() {
        fdr.$win.bind('debouncedresize', function() {
            setMaxHeights($(selector));
        });
    }

    eventListeners();
    setMaxHeights($(selector));

}

module.exports = FitToWindow;

},{}],4:[function(require,module,exports){
'use strict';

function InfiniteScroll() {
    // This module uses Waypoints infinite scroll: http://imakewebthings.com/waypoints/shortcuts/infinite-scroll/

    var containerSelector = '.js-infinite-scroll';
    var $container;
    var $footer;
    var linkSelector = '.js-infinite-link';
    var pagerSelector = '.search-result__pager';
    var itemSelector = '.js-infinite-item';
    var replaceStateSelector = 'a';
    var infinite;
    var itemCount = 0;
    var spinnerOpts = {
        lines: 11,
        length: 12,
        width: 7,
        radius: 16,
        color: '#009fe4',
        top: '90%',
        left: '50%'
    };
    var errorTimeout;
    var timeoutAfter = 10000;
    var spinnerContainer;

    function onError() {
        if (infinite) {
            infinite.destroy();
            $(pagerSelector).show();
            spinnerContainer.spinner.stop();
            $footer.show();
        }
    }

    function onBeforePageLoaded() {

        if (spinnerContainer.spinner) {
            spinnerContainer.spinner.stop();
        }

        spinnerContainer.spinner = new Spinner(spinnerOpts).spin(spinnerContainer);

        // Stop listening to infinite scroll if request times out (errorTimeout is cleared after successful requests)
        errorTimeout = setTimeout(function() {
            onError();
        }, timeoutAfter);
    }

    function setItemCount() {
        itemCount = $container.find(itemSelector).length;
    }

    function onPageLoaded() {
        clearTimeout(errorTimeout);

        spinnerContainer.spinner.stop();

        setItemCount();
        if ($(linkSelector).length === 0) {
            $footer.show();
        }
    }

    function setup() {
        $container = $(containerSelector);
        var $link = $(linkSelector);
        var containerHasInfiniteScroll = $container.data('has-infinite-scroll');
        var appendSpin = !!$container.data('append-spin');

        if (!containerHasInfiniteScroll && infinite) {
            // Destroy infinite scroll if it is not in the dom any more + show the footer
            infinite.destroy();
            $footer.show();
        }

        if ($container.length > 0 && $link.length > 0 && !containerHasInfiniteScroll) {
            // Init infinite scroll if there is a container with a more link that is not allready inited + hide the footer

            var $spinnerContainer;

            if (appendSpin) {
                spinnerOpts.top = '30%';
                $spinnerContainer = $('<div style="height: 100px; position: relative;"></div>');

                $(pagerSelector).after($spinnerContainer);
            }

            spinnerContainer = appendSpin ? $spinnerContainer[0] : $(containerSelector)[0];

            setItemCount();
            infinite = new Waypoint.Infinite({
                element: $container.get(0),
                items: itemSelector,
                more: linkSelector,
                onBeforePageLoad: onBeforePageLoaded,
                onAfterPageLoad: onPageLoaded
            });
            $container.data('has-infinite-scroll', true);
            $footer.hide();
        }
    }

    function eventListeners() {
        // Setup infinite scroll after ajax requests that are made
        fdr.ajax.on('success', setup);

        // Replace state to allow browser back btn after clicking on an item
        fdr.$doc.on('click', replaceStateSelector, function() {
            var $target = $(this);
            if (itemCount && history && history.replaceState && !$target.is('[href^="javascript:"]') && !$target.is('[href^="#"]') && !$target.hasClass('js-turbo-link')) {
                var url = document.URL;
                history.replaceState({}, undefined, fdr.utils.uriSetOrUpdateQueryParam(url, 'pageLength', itemCount));
            }
        });
    }

    if ($(containerSelector).length > 0) {
        $footer = $('.site-footer');

        setup();
        eventListeners();
    }

}

module.exports = InfiniteScroll;

},{}],5:[function(require,module,exports){
'use strict';

function ScrollToAnchor() {
    var selector = '.js-scroll-to-anchor';

    function eventListeners() {
        fdr.$doc.on('click', selector, function(e) {
            e.preventDefault();

            var $anchor = $($(e.currentTarget).attr('href'));

            if ($anchor.length) {
                $('html, body').animate({ scrollTop: $anchor.offset().top });
                if ($anchor.hasClass('js-slidedown-wrapper')) {
                    if (!$anchor.hasClass('is-active')) {
                        $anchor.find('.js-slidedown-toggle:first').click();
                    }
                }
            }
        });
    }

    eventListeners();

}

module.exports = ScrollToAnchor;

},{}],6:[function(require,module,exports){
'use strict';

function ScrollToTop() {
    var selector = '.js-scroll-to-top';

    function eventListeners() {
        fdr.$doc.on('click', selector, function() {
            $('html, body').animate({ scrollTop: 0 });
        });
    }

    eventListeners();

}

module.exports = ScrollToTop;

},{}],7:[function(require,module,exports){
'use strict';

var SlidedownState = require('../modules/slidedown-state');

function ShowHide() {

    var MAX_STATE_STEPS = 2;
    var slidedownState = SlidedownState(MAX_STATE_STEPS);
    var defaultDuration = 200;

    var wrapperSelector = '.js-slidedown-wrapper';
    var slidedownSelector = '.js-slidedown';
    var groupSelector = '.js-slidedown-group';
    var toggleSelector = '.js-slidedown-toggle';
    var nextSelector = '.js-slidedown-next';
    var anchorSelector = '.js-slidedown-anchor';
    var showSelector = '.js-slidedown-show';
    var showOnceSelector = '.js-slidedown-show-once';
    var hideOnShowSelector = '.js-slidedown-hide-on-show';
    var hideSelector = '.js-slidedown-hide';
    var openClassName = 'js-slidedown-open';
    var lazyRenderSrcSelector = '[data-src]';
    var updatehistoryDataSetting = 'update-history';

    function getDuration($el) {
        var duration = $el.data('duration');
        return typeof (duration) === 'number' ? duration : defaultDuration;
    }

    function getContainer($el) {
        return $el.closest(wrapperSelector);
    }

    function getChild($container, selector) {
        return $container.find(selector + ':first');
    }

    function close($el) {
        var $container = getContainer($el);
        var $showHide = getChild($container, slidedownSelector);

        slidedownState.clear();

        $container.removeClass(openClassName + ' ' + fdr.helperClass.isActive);

        $showHide.css({display: 'block'}).slideUp(getDuration($showHide), function() {
            Waypoint.refreshAll();
        }).attr('aria-hidden', true);

        $container.find(toggleSelector).attr('aria-expanded', false);

        if ($container.find(showSelector).length) {
            $container.find(showSelector).focus();
        }

        if (!$showHide.length) {
            Waypoint.refreshAll();
        }
    }

    function getGroup($el) {
        var containers = $el.parents(wrapperSelector);
        var groups = $el.parents(groupSelector);

        return groups.length === containers.length ? $el.closest(groupSelector) : [];
    }

    function open($el) {

        var $group = getGroup($el);

        // If the item belongs to a group
        // - Close the current open item
        // - Make sure the new item is inside the viewport by calculating the offset once the current item is closed
        if ($group.length > 0) {

            var $openEl = $group.find('.' + openClassName + ' ' + toggleSelector);

            // If the group that the element belongs to has any open items
            if ($openEl.length) {

                // Find the first level of wrappers. Exclude any potential nested items
                var $wrappers = $group.find(wrapperSelector);
                var $nested = $wrappers.find(wrapperSelector);
                $wrappers = $wrappers.not($nested);

                var index = $wrappers.index($el.closest(wrapperSelector));
                var currentScrollTop = fdr.$win.scrollTop();

                // Calculate the new scrollTop for the item by:
                // - Adding the height of a toggle times the index of the item
                // - Getting the first items offset
                var offsetTop = $wrappers.eq(0).offset().top;
                var toggleHeight = $wrappers.eq(0).find(toggleSelector).outerHeight();
                var scrollTop = offsetTop + ( toggleHeight * index );

                if (currentScrollTop > scrollTop) {

                    fdr.isScrolling = true;
                    var offset = 0;

                    if (!fdr.$html.hasClass('site-header-hidden') && $('.site-top.js-hide-on-scroll').length > 0) {
                        offset = $('.site-header').height();
                    }

                    $('html, body').animate({scrollTop: scrollTop - offset}, function() {
                        fdr.isScrolling = false;
                    });

                }

                close($openEl);

            }

        }

        var $container = getContainer($el);
        var $showHide = getChild($container, slidedownSelector);
        var $hideElement = getChild($container, hideSelector);
        var containerId = $container.attr('id');

        $container.find(hideOnShowSelector).hide().attr('aria-hidden', true);
        $showHide.slideDown(getDuration($showHide), function() {
            Waypoint.refreshAll();
        }).attr('aria-hidden', false);
        $container.addClass(openClassName + ' ' + fdr.helperClass.isActive);
        $container.find(lazyRenderSrcSelector).each(function() {
            var $img = $(this);
            $img.attr('src', $img.data('src')).removeData('src');
        });

        $container.find(toggleSelector).attr('aria-expanded', true);

        if ($el.data(updatehistoryDataSetting) && $el.attr('href') && Modernizr.history) {
            if ($el.attr('href') !== 'javascript:' && $el.attr('href') !== '#') {
                history.replaceState({}, $el.text(), $el.attr('href'));
            }
        }

        if ($hideElement.length) {

            if ($container.find(hideSelector + ', ' + slidedownSelector).index($container.find($hideElement)) && $showHide.find('a, input, textarea, button').length) {
                $container.attr('tabindex', '-1').css({'outline': 'none'}).focus();
            } else {
                $container.find(hideSelector).focus();
            }

        } else if ($el.hasClass(showSelector.slice(1))) {
            $showHide.attr('tabindex', '-1').css({'outline': 'none'}).focus();
        }

        if (!$showHide.length) {
            Waypoint.refreshAll();
        }

        slidedownState.save(containerId);

    }

    function tryOpenState() {

        var state = slidedownState.fetch();

        if (state && state.charAt(0) !== '!') {
            try {
                var $match = $('#' + state);
                if ($match.length === 1) {
                    open($match);
                }
            } catch (error) {
                return false;
            }

        }

    }

    function setup() {
        tryOpenState();
    }

    function eventListeners() {
        fdr.$doc.on('click keypress', toggleSelector, function(e) {
            e.preventDefault();

            var $el = $(this);

            if (e.type === 'keypress') {
                if (e.charCode === window.fdr.keyCode.ENTER) {
                    $el.trigger('click');
                }
                return false;
            }

            // Suppress click even if the browser doesn't support pointer events CSS
            if ((window.getComputedStyle && window.getComputedStyle(this).getPropertyValue('pointer-events') === 'none') || (this.currentStyle && this.currentStyle['pointer-events'] === 'none')) {
                return;
            }

            if (getChild(getContainer($el), slidedownSelector).is(':visible')) {
                close($el);
            } else {
                open($el);
            }
        });
        fdr.$doc.on('click', showSelector, function(e) {
            e.preventDefault();
            open($(this));
        });
        fdr.$doc.on('click focus', showOnceSelector, function(e) {
            e.preventDefault();
            var $this = $(this);
            $this.removeClass(showOnceSelector);
            open($this);
        });
        fdr.$doc.on('click', hideSelector, function(e) {
            e.preventDefault();
            close($(this));
        });

        fdr.$doc.on('click simulatedClick', nextSelector, function(e, cb) {
            var $container = $(e.currentTarget).parents(wrapperSelector).eq(0);
            var $next = $container.next(wrapperSelector);

            if ($next.length) {

                setTimeout(function() {
                    $('html, body').animate({
                        scrollTop: $container.offset().top + $next.height()
                    }, 250);

                    open($next.find(toggleSelector));

                    if (cb) {
                        cb();
                    }

                }, 10);

            }

        });

        fdr.$doc.on('click', anchorSelector, function(e) {
            e.preventDefault();

            var $el = $($(e.currentTarget).attr('href'));

            $('html, body').animate({
                scrollTop: $el.offset().top
            }, 250);

            open($el);
        });

        if (Modernizr.history) {
            fdr.$win.get(0).onpopstate = function() {
                tryOpenState();
            };
        }
    }

    setup();
    eventListeners();

}

module.exports = ShowHide;

},{"../modules/slidedown-state":18}],8:[function(require,module,exports){
'use strict';

function Utils() {
    var cookiePath = '/';

    function getCookie(name) {
        return $.cookie(name);
    }

    function setCookie(name, value, expires) {
        expires = expires || 30; // Set to 30 days if no expiration is set
        $.cookie(name, value, { expires: expires, path: cookiePath });
    }

    function deleteCookie(name) {
        $.removeCookie(name, { path: cookiePath });
    }

    function uriGetQueryParam(uri, param) {
        var re = new RegExp('([?&])' + param + '=.*?(&|$)', 'i');
        var separator = uri.indexOf('?') !== -1 ? '&' : '?';

        if (uri.match(re)) {
            return uri.replace(re, '$1' + param + '=' + '$2');
        } else {
            return uri + separator + param + '=';
        }
    }

    function uriSetOrUpdateQueryParam(uri, param, value) {
        var re = new RegExp('([?&])' + param + '=.*?(&|$)', 'i');
        var separator = uri.indexOf('?') !== -1 ? '&' : '?';

        if (uri.match(re)) {
            return uri.replace(re, '$1' + param + '=' + value + '$2');
        } else {
            return uri + separator + param + '=' + value;
        }
    }

    return {
        getCookie: getCookie,
        setCookie: setCookie,
        deleteCookie: deleteCookie,
        uriGetQueryParam: uriGetQueryParam,
        uriSetOrUpdateQueryParam: uriSetOrUpdateQueryParam
    };
}

module.exports = Utils;

},{}],9:[function(require,module,exports){
'use strict';

window.fdr = window.fdr || {
        $doc: $(document),
        $win: $(window),
        $html: $('html'),
        $body: $('body'),
        keyCode: {
            ENTER: 13,
            ESCAPE: 27,
            UP: 38,
            DOWN: 40
        },
        helperClass: {
            isOpen: 'is-open',
            isAnimating: 'is-animating',
            isActive: 'is-active',
            isLoading: 'is-loading',
            isInvalid: 'is-invalid',
            isEnabled: 'is-enabled'
        },
        version: require('../../version').version
    };

$(function() {

    var utils = require('./base/utils');
    var ajax = require('./base/ajax');
    var slidedown = require('./base/slidedown');
    var collapseParent = require('./base/collapse-parent');
    var scrollToTop = require('./base/scroll-to-top');
    var scrollToAnchor = require('./base/scroll-to-anchor');
    var infiniteScroll = require('./base/infinite-scroll');
    var fitToWindow = require('./base/fit-to-window');

    var map = require('./modules/map');
    var turboLink = require('./modules/turbo-link');
    var carousel = require('./modules/carousel');
    var navigationSelect = require('./modules/navigation-select');
    var popover = require('./modules/popover');
    var collapsingTable = require('./modules/collapsning-table');
    var explanationPopover = require('./modules/popover-explanation');
    var socialShare = require('./modules/social-share');
    var cardTable = require('./modules/card-table');
    var modal = require('./modules/modal');
    var takeover = require('./modules/takeover');

    // Expose
    fdr.utils = utils();
    fdr.ajax = ajax();
    fdr.map = map();
    fdr.collapsingTable = collapsingTable();
    fdr.takeover = takeover();

    // Init
    slidedown();
    collapseParent();
    scrollToTop();
    scrollToAnchor();
    turboLink();
    carousel();
    infiniteScroll();
    navigationSelect();
    fitToWindow();
    popover();
    explanationPopover();
    socialShare();
    cardTable();

    fdr.modal = modal();
    window.fdr = fdr;

});

},{"../../version":22,"./base/ajax":1,"./base/collapse-parent":2,"./base/fit-to-window":3,"./base/infinite-scroll":4,"./base/scroll-to-anchor":5,"./base/scroll-to-top":6,"./base/slidedown":7,"./base/utils":8,"./modules/card-table":10,"./modules/carousel":11,"./modules/collapsning-table":12,"./modules/map":13,"./modules/modal":14,"./modules/navigation-select":15,"./modules/popover":17,"./modules/popover-explanation":16,"./modules/social-share":19,"./modules/takeover":20,"./modules/turbo-link":21}],10:[function(require,module,exports){
'use strict';

function CardTable() {

    var cardTableApplied = false;

    function applyCardTable() {
        if (!cardTableApplied && fdr.$win.width() < 600) {
            $('.js-cardtable').cardtable({ myClass: 'u-visible-xs' });
            cardTableApplied = true;
        }
    }

    function eventListeners() {

        fdr.$win.bind('debouncedresize', function() {
            applyCardTable();
        });
    }

    applyCardTable();
    eventListeners();

}

module.exports = CardTable;

},{}],11:[function(require,module,exports){
'use strict';

function Carousel() {
    // This module uses SwipeJS: https://github.com/thebird/Swipe

    var carouselSelector = '.carousel';
    var itemSelector = '.carousel__item';
    var paginationItemSelector = '.carousel__pagination-item';
    var pauseSelector = '.js-carousel-pause';
    var gotoSelector = '[data-slide-to]';
    var prevSelector = '[data-slide="prev"]';
    var nextSelector = '[data-slide="next"]';
    var $carousels = [];

    function setPagination($carousel, index) {
        $carousel.find(paginationItemSelector).removeClass(fdr.helperClass.isActive);
        $carousel.find(paginationItemSelector + ':nth-child(' + (index + 1) + ')').addClass(fdr.helperClass.isActive);
    }

    function renderPagination($carousel) {
        if ($carousel.slideCount > 1 && $carousel.data('pagination') !== false) {
            var paginationHtml = '<ul class="carousel__pagination">';
            for (var i = 0; i < $carousel.slideCount; i++) {
                paginationHtml += '<li class="carousel__pagination-item"><a href="javascript:;" class="carousel__pagination-link" data-slide-to="' + i + '">' + (i + 1) + '</a></li>';
            }
            paginationHtml += '</ul>';
            paginationHtml += '<div class="carousel__pause js-carousel-pause"></div>';
            $carousel.append(paginationHtml);
            setPagination($carousel, 0);
        }
    }

    function getCarousel($child) {
        return $carousels[$child.closest(carouselSelector).data('carousel-index')];
    }

    function getItemIndex($carousel) {
        return ($carousel.slideCount + ($carousel.swipe.getPos() % $carousel.slideCount)) % $carousel.slideCount;
    }

    function setTabIndexes($slide) {

        var $carousel = getCarousel($slide);

        $carousel.find('a, button').not(gotoSelector).attr('tabindex', '-1');
        $slide.find('button').removeAttr('tabindex');
    }

    function slideChange(index, slide) {
        if (!isNaN(index)) {
            var $carousel = getCarousel($(slide));
            var itemIndex = getItemIndex($carousel);
            setPagination($carousel, itemIndex);
        }
    }

    function slideChanged(index, slide) {
        var $slide = $(slide);
        setTabIndexes($slide);
    }

    function eventListeners() {
        fdr.$doc.on('click', gotoSelector, function(e) {
            e.preventDefault();
            var $el = $(this);
            getCarousel($el).swipe.slide($el.data('slide-to'));
        });
        fdr.$doc.on('click', prevSelector, function(e) {
            e.preventDefault();
            var $el = $(this);
            getCarousel($el).swipe.prev();
        });
        fdr.$doc.on('click', nextSelector, function(e) {
            e.preventDefault();
            var $el = $(this);
            getCarousel($el).swipe.next();
        });
        fdr.$doc.on('click', pauseSelector, function(e) {
            e.preventDefault();
            var $el = $(this);
            var $carousel = getCarousel($el);

            $el.toggleClass(fdr.helperClass.isActive, !$carousel.paused);

            if ($carousel.paused) {
                $carousel.paused = false;
                if (!$carousel.hold) {
                    $carousel.swipe.play();
                }
            } else {
                $carousel.paused = true;
                if (!$carousel.hold) {
                    $carousel.swipe.stop();
                }
            }
        });

        // Check if device is touch or not, mouse event makes pause and play in touch to not work properly
        if (!Modernizr.touchevents) {

            fdr.$doc.on('mouseover', carouselSelector, function() {
                var $carousel = getCarousel($(this).children().first());

                // Pause carousel on mouseover if it has auto play and is not on the last slide (or if it is wrapped/continuous)
                if ($carousel.auto && ($carousel.wrap !== false || getItemIndex($carousel) + 1 < $carousel.slideCount)) {
                    $carousel.swipe.stop();
                    $carousel.hold = true;
                }
            });

            fdr.$doc.on('mouseout', carouselSelector, function() {
                var $carousel = getCarousel($(this).children().first());

                if ($carousel.hold && !$carousel.paused) {
                    $carousel.swipe.play();
                    $carousel.hold = false;
                }
            });

        }

    }

    function setup() {
        $(carouselSelector).each(function() {

            var $carousel = $(this);
            var options = {
                speed: 300,
                continuous: true,
                callback: function(index, elem) {
                    slideChange(index, elem);
                },
                transitionEnd: function(index, elem) {
                    slideChanged(index, elem);
                }
            };
            $carousel.slideCount = $carousel.find(itemSelector).length;

            if ($carousel.slideCount > 1) {
                if ($carousel.data('wrap') === false) {
                    options.continuous = false;
                    $carousel.wrap = false;
                }
                if ($carousel.data('interval')) {
                    options.auto = $carousel.data('interval');
                    $carousel.auto = options.auto;
                }

                $carousel.swipe = new Swipe($carousel.get(0), options);
                renderPagination($carousel);
                $carousel.data('carousel-index', $carousels.length);
                $carousels.push($carousel);
                setTabIndexes($carousel.find(itemSelector).first());

                eventListeners();
            } else {
                $carousel.css({ visibility: 'visible' });
            }
        });
    }

    setup();

}

module.exports = Carousel;

},{}],12:[function(require,module,exports){
'use strict';

function CollapsingTable() {

    var INITIATED_CLASS = 'js-collapsing-table--initiated';
    var tablesSelector = '.js-collapsing-table';
    var headingSelector = 'thead th';
    var rowSelector = 'tbody tr';
    var cellSelector = 'th, td';
    var toggleClassName = 'standard-table--collapsing__toggle';
    var hasLabelClassName = 'standard-table--collapsing__labeled-cell';

    function setup() {

        $(tablesSelector)
            .not('.' + INITIATED_CLASS)
            .each(function() {

                var $table = $(this);
                var headings = [];

                $table.addClass('standard-table--collapsing');
                $table.addClass(INITIATED_CLASS);

                $table.find(headingSelector).each(function() {
                    headings.push($(this).html());
                });

                $table.find(rowSelector).each(function() {
                    $(this).find(cellSelector).each(function(i) {
                        var $td = $(this);
                        if (i === 0) {
                            $td.addClass(toggleClassName);
                        }
                        if (headings.length > 0 && (i > 0 || headings[i].replace(/&nbsp;/g, '').replace(/ /g, ''))) {
                            $td.addClass(hasLabelClassName);
                            $td.wrapInner('<span class="standard-table--collapsing__cell-label" />');
                            $td.prepend('<span class="standard-table--collapsing__cell-label">' + headings[i] + '</span>');
                        }
                    });
                });

            });

    }

    function eventListeners() {
        fdr.$doc.on('click', '.' + toggleClassName, function(e) {
            e.preventDefault();
            var $this = $(this);
            var $tr = $this.closest('tr');

            $tr.toggleClass(fdr.helperClass.isOpen);
        });
    }

    setup();
    eventListeners();

    return {
        setup: setup
    };

}

module.exports = CollapsingTable;

},{}],13:[function(require,module,exports){
'use strict';

function Map() {
    var $elements = $('.js-map');
    var defaultZoom = 15;
    //var apiKey = 'AIzaSyDpVpUaS3HMWmHIj8Evf4Vf4uTZ3gColLI'; // See TODO below about api key

    function initMap($el, lat, lng) {
        var latLng = new window.google.maps.LatLng(lat, lng);

        var mapOptions = {
            center: latLng,
            zoom: defaultZoom
        };

        var map = new google.maps.Map($el.get(0), mapOptions);
        map.markers = [];

        $el.get(0).map = map;

        return map;
    }

    function getMap($el) {
        return $el.get(0).map;
    }

    function addMarker($el, lat, lng, title) {
        var map = getMap($el);

        if (!map) {
            map = initMap($el, lat, lng);
        }

        var latLng = new google.maps.LatLng(lat, lng);
        if (!title) {
            title = '';
        }
        var marker = new google.maps.Marker({
            position: latLng,
            map: map,
            title: title
        });

        map.markers.push(marker);
    }

    function apiLoaded() {
        $elements.each(function() {
            var $el = $(this);
            if ($el.data('marker-lat') && $el.data('marker-lng')) {
                addMarker($el, $el.data('marker-lat'), $el.data('marker-lng'), $el.data('marker-title'));
            }
        });

        fdr.$win.triggerHandler('fdr:mapapiloaded');
    }

    function ensureApi() {
        // Load maps api asoyncronously if it is not already loaded
        if (window.google && window.google.maps) {
            apiLoaded();
        } else {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=fdr.map.apiLoaded'; // TODO: It does not work with file protocol, but maybe we should use an api key later? &key=' + apiKey + '
            document.body.appendChild(script);
        }
    }

    function setup() {
        ensureApi();
    }

    if ($elements.length > 0) {
        setup();
    }

    function clearMarkers($el) {
        var map = getMap($el);

        if (map) {
            for (var i = 0; i < map.markers.length; i++) {
                map.markers[i].setMap(null);
            }
        }

        map.markers = [];
    }

    function focusMap($el, lat, lng) {
        var map = getMap($el);

        if (map) {
            var latLng = new google.maps.LatLng(lat, lng);

            map.setCenter(latLng);
            map.setZoom(defaultZoom);
        }
    }

    return {
        addMarker: addMarker,
        clearMarkers: clearMarkers,
        focusMap: focusMap,
        apiLoaded: apiLoaded
    };
}

module.exports = Map;

},{}],14:[function(require,module,exports){
'use strict';

function Modal() {
    var modalTrigger = '.js-trigger-modal';
    var modalCloseTrigger = '.js-trigger-modal-close';
    var modalSelector = '.modal';
    var modalBackdropSelector = '.modal-backdrop';
    var modalOpen = 'modal-open';
    var initialized = false;
    var $currentModal = null;

    function getModalHeight() {
        var winHeight = fdr.$win.height();

        return winHeight >= 1024 ? winHeight - 120 : (winHeight <= 768 ? winHeight - 50 : winHeight - 70);
    }

    function setModalPosition() {
        if ($currentModal) {

            if ($currentModal.hasClass('modal__content--iframe')) {
                $currentModal.css('height', getModalHeight());
            }

            var topPos = Math.max(fdr.$win.height() / 2 - $currentModal.outerHeight() / 2);
            $currentModal.css('top', topPos);
        }
    }

    function openModal(target, iframe, name) {

        // Because of the way iframes are handled on ios devices,
        // iframe modals on touch devices with max width of 1024 will
        // be opened in a new window for a better user experience
        if (iframe && Modernizr.touchevents && fdr.$win.width() <= 1024) {
            window.open(target);
            return;
        }

        var $modal;

        if (!initialized) {
            fdr.$body.append('<div class="modal-backdrop" />');
            initialized = true;
            fdr.$win.on('debouncedresize', setModalPosition);
        }

        var $backdrop = $(modalBackdropSelector);

        fdr.$body.addClass(modalOpen);
        $backdrop.css({display: 'block', opacity: 0});
        $backdrop.css({opacity: 0.2});

        if (iframe) {

            $modal = $('<div/>', {
                'class': 'modal modal--iframe'
            });

            var $modalContent = $('<div/>', {
                'class': 'modal__content'
            });

            var $closeBtn = $('<button/>', {
                'class': 'modal__close js-trigger-modal-close'
            });

            $closeBtn.append($('<span class="u-a11y-hide">Stäng</span>'));

            $closeBtn.append($('<span/>', {
                'class': 'modal__close-icon icon icon-close',
                'aria-hidden': 'true'
            }));

            $modalContent.append($closeBtn);
            $modal.append($modalContent);

            $currentModal = $modalContent;

            var iframeOpts = {
                'src': target,
                'width': '100%',
                'height': '100%'
            };

            if (name) {
                iframeOpts.name = name;
                delete iframeOpts.src;
            }

            var $iframe = $('<iframe/>', iframeOpts);

            fdr.$body.append($modal);
            $currentModal
                .addClass('modal__content--iframe')
                .append($iframe);
        } else {
            $modal = $(target);
            $currentModal = $modal.find('.modal__content');
        }

        $modal.css({display: 'block', opacity: 0});

        setModalPosition();

        $modal.css({opacity: 1});

    }

    function onModalTriggerClick(e) {
        e.preventDefault();

        var $elem = $(e.currentTarget);
        var target = $elem.attr('data-target');
        var iframe = $elem.attr('data-modal-type') === 'iframe';

        openModal(target, iframe);
    }

    function closeModal() {
        $currentModal = null;
        fdr.$body.removeClass(modalOpen);
        $(modalBackdropSelector).css('display', 'none');
        $(modalSelector).css('display', 'none');
        $('.modal--iframe').remove();
    }

    function eventListeners() {
        fdr.$doc.on('click', modalTrigger, onModalTriggerClick);
        fdr.$doc.on('click', modalCloseTrigger, closeModal);

        fdr.$html.on('keyup', function(e) {
            if (e.keyCode === fdr.keyCode.ESCAPE) {
                closeModal();
            }
        });
    }

    function init() {
        var $modalUrgent = $('.modal--urgent');

        eventListeners();

        if ($modalUrgent.length) {
            openModal($modalUrgent);
        }
    }

    init();

    return {
        open: openModal,
        close: closeModal
    };

}

module.exports = Modal;

},{}],15:[function(require,module,exports){
'use strict';

function NavigationSelect() {
    var $elements = $('.js-navigation-select');

    function onChange($el) {
        var href = $el.find(':selected').val();
        if (href) {
            document.location = href;
        }
    }

    function eventListeners() {
        $elements.on('change', function() {
            var $el = $(this);
            onChange($el);
        });
    }

    if ($elements.length > 0) {
        eventListeners();
    }

}

module.exports = NavigationSelect;

},{}],16:[function(require,module,exports){
'use strict';

function ExplanationPopover() {

    var selector = '.js-popover-explanation';
    var $popover = $('<div class="popover-explanation"></div>');

    function showExplanationPopover(e) {
        var $el = $(e.currentTarget);

        if (!e.currentTarget.titleAttr) {
            e.currentTarget.titleAttr = $el.attr('title');

            $el.removeAttr('title');
        }

        var heading = $el.text();
        heading = heading.charAt(0).toUpperCase() + heading.slice(1);
        var text = e.currentTarget.titleAttr;
        var relativePosition = e.currentTarget.getBoundingClientRect();
        var absolutePosition = $el.offset();

        $popover
            .empty()
            .append('<h3 class="popover-explanation__heading">' + heading + '</h3>\n' + '<p class="popover-explanation__text">' + text + '</p><span class="popover-explanation__tag"></span>');

        fdr.$body.append($popover);

        var top = {
            relative: relativePosition.top - $popover.outerHeight() - 20,
            absolute: absolutePosition.top - $popover.outerHeight() - 20
        };

        if (window.innerWidth < (absolutePosition.left + 265)) {
            var $popoverTag = $popover.find('.popover-explanation__tag');
            var leftBubble = absolutePosition.left;
            var newLeftBubble = window.innerWidth - 275;
            var newLeftTag = leftBubble - newLeftBubble;
            var posTag = $el.outerWidth() / 3;
            $popoverTag.css({ left: (newLeftTag + posTag )} );
            absolutePosition.left = newLeftBubble;
        }

        if (top.relative < 0) {
            $popover.addClass('popover-explanation--below');
            top.absolute = absolutePosition.top + $el.outerHeight() + 20;
        }

        $popover.css({
            left: absolutePosition.left,
            top: top.absolute,
            opacity: 1
        });
    }

    function hideExplanationPopover(e) {
        var $el = $(e.currentTarget);
        $popover.removeClass('popover-explanation--below');

        if (!(e.type === 'mouseleave' && $el.is(':focus'))) {
            $popover.css({opacity: 0}).one('transitionEnd', function() {
                $popover.empty().detach();
            });
        }
    }

    function tryHide(e) {
        var $el = $(e.target);
        if (!$el.hasClass('js-popover-explanation')) {
            hideExplanationPopover(e);
        }
    }

    function eventListeners() {
        fdr.$doc.on('mouseenter focus touchstart', selector, showExplanationPopover);
        fdr.$doc.on('mouseleave blur', selector, hideExplanationPopover);
        fdr.$doc.on('touchstart', tryHide);
    }

    eventListeners();

}

module.exports = ExplanationPopover;

},{}],17:[function(require,module,exports){
'use strict';

function Popover() {
    var popoverTrigger = '.js-trigger-popover';
    var template = '<div class="popover" role="tooltip"></div>';

    function openPopup($el) {
        var id = $el.attr('href');
        var content = $(id).html();
        var $popup = $(template);
        var offset = $el.offset();

        $popup[0].parentEl = $el[0];

        $popup.html(content);
        fdr.$body.append($popup);

        var popupWidth = $popup.width();

        $popup.css({
            top: offset.top + $el.height() + 5,
            left: Math.min(Math.max(5, offset.left + $el.width() / 2 - popupWidth / 2), fdr.$win.width() - popupWidth - 5)
        });

        $popup.addClass(fdr.helperClass.isActive);
    }

    function closePopups() {
        var $popovers = $('.popover');

        $popovers.each(function() {
            delete this.parentEl.open;
            $(this.parentEl).removeClass(fdr.helperClass.isOpen);

            $(this).one('transitionEnd', $.proxy(function() {
                $(this).remove();
            }, this)).removeClass(fdr.helperClass.isActive);
        });
    }

    function onPopoverTriggerClick(e) {
        e.preventDefault();
        e.stopPropagation();

        var el = e.currentTarget;
        var $el = $(el);

        el.open = !el.open;

        closePopups(); //Close any other open popups on the page

        if (el.open) {
            $el.addClass(fdr.helperClass.isOpen);
            openPopup($el);
        }
    }

    function eventListeners() {
        fdr.$doc.on('click.popover', popoverTrigger, onPopoverTriggerClick);
        fdr.$doc.on('click.popover', closePopups);
        fdr.$doc.on('click.popover', '.popover', function(e) {
            e.stopPropagation();
        });
    }

    eventListeners();

}

module.exports = Popover;

},{}],18:[function(require,module,exports){
'use strict';

/**
 * A helper for storing and fetching slidedown states
 * @param {number} maxSteps - The amount of page loads to keep the state before clearing
 * @returns {{save: save, fetch: fetch, clear: clearStorage}}
 * @constructor
 */
function SlidedownState(maxSteps) {

    maxSteps = typeof maxSteps === 'number' ? maxSteps : 2;

    var _STORAGE_KEY = 'SLIDEDOWN';
    var _URL = fdr.$win.get(0).location.pathname;

    /**
     * @typedef StorageItem
     * @type Object
     * @property {string} id - The id of the slidedown
     * @property {string} url - The url of the page
     * @property {number} count - The current count of how many times the slidedown has been fetched on another page
     */
    function StorageItem(id, url, count) {
        this.id = id;
        this.url = url;
        this.count = typeof count === 'number' ? count : 0;
    }

    /**
     * Returns the hash without slashes and the hash-character
     * @returns {string}
     */
    function getHash() {
        return fdr.$win.get(0).location.hash
            .replace(/\//g, '')
            .replace('#', '');
    }

    /**
     * Returns any item stored on the storage key in sessionStorage
     * @returns {StorageItem|boolean}
     */
    function getStorage() {

        if (!Modernizr.sessionstorage) {
            return false;
        }

        var item = sessionStorage.getItem(_STORAGE_KEY);

        if (item) {
            item = JSON.parse(item);
            return new StorageItem(item.id, item.url, item.count);
        } else {
            return false;
        }

    }

    /**
     * Save a value to sessionStorage. Will get saved with the current url
     * @param {StorageItem} storageItem - The item to store
     * @returns {boolean|void}
     */
    function setStorage(storageItem) {
        if (!Modernizr.sessionstorage) {
            return false;
        }
        sessionStorage.setItem(_STORAGE_KEY, JSON.stringify(storageItem));
    }

    /**
     * Clear the sessionStorage on the associated key
     * @returns {boolean|void}
     */
    function clearStorage() {
        if (!Modernizr.sessionstorage) {
            return false;
        }
        sessionStorage.removeItem(_STORAGE_KEY);
    }

    /**
     * Reset the counter to 0
     * @param {StorageItem} storageItem - The item to reset counter on
     */
    function resetStorageCount(storageItem) {
        storageItem.count = 0;
        setStorage(storageItem);
    }

    /**
     * Increment the count one step
     * @param {StorageItem} storageItem - The item to increment the counter on
     */
    function incrementStorageCount(storageItem) {
        storageItem.count += 1;
        setStorage(storageItem);
    }

    /**
     * Looks both in the hash and in sessionStorage for any value.
     * Hash takes precedence over sessionStorage.
     * When getting the value from sessionStorage, the current url must match the url that the value was stored on
     * If the url differs, this means we are on a new page, so increment the counter. When the counter reaches its max, clear the storage
     * @returns {string|boolean}
     */
    function fetch() {

        var hash = getHash();
        var storageItem = getStorage();
        var id = false;

        if (hash.length > 0) {
            id = hash;
        } else if (storageItem) {

            if (storageItem.url === _URL) {
                id = storageItem.id;
                resetStorageCount(storageItem);
            } else if (storageItem.count >= maxSteps) {
                clearStorage();
            } else {
                incrementStorageCount(storageItem);
            }

        }

        return id;

    }

    /**
     *
     * @param {string} value - The value to store
     */
    function save(value) {

        var currentItem = getStorage();

        if (!currentItem || currentItem.id !== value || currentItem.url !== _URL) {
            var storageItem = new StorageItem(value, _URL);
            setStorage(storageItem);
        }

    }

    return {
        save: save,
        fetch: fetch,
        clear: clearStorage
    };

}

module.exports = SlidedownState;

},{}],19:[function(require,module,exports){
'use strict';

function SocialShare() {

    var selectorFacebook = '.js-share-facebook';
    var selectorTwitter = '.js-share-twitter';
    var selectorEmail = '.js-share-email';

    function getUrl() {
        var canonicalUrl = $('link[rel="canonical"]').attr('href');

        return encodeURIComponent(canonicalUrl);
    }

    function getTitle() {
        var title = $('meta[property="og:title"]').attr('content');

        if (!title) {
            title = 'Folksam';
        }

        return encodeURIComponent(title);
    }

    function facebookShare(e) {
        e.preventDefault();

        window.open('https://www.facebook.com/sharer/sharer.php?u=' + getUrl(), '_blank', 'width=550, height=400');
    }

    function twitterShare(e) {
        e.preventDefault();

        window.open('https://twitter.com/intent/tweet?original_referer=' + getUrl() + '&amp;text=' + getTitle() + '&amp;tw_p=tweetbutton&amp;url=' + getUrl(), '_blank', 'width=550, height=470');
    }

    function emailShare(e) {

        var $target = $(e.target);
        var subject = $target.attr('data-subject');
        var message = $target.attr('data-message');

        if (!subject) { //support backwards compatible
            subject = 'Artikeltips från Folksam';
        }

        if (!message) { //support backwards compatible
            message = 'Jag vill tipsa dig om denna artikel från Folksam';
        }

        $(selectorEmail).attr('href', 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message) + '%3A%0D%0A%0D%0A' + getUrl());

    }

    function eventListeners() {
        fdr.$doc.on('click', selectorFacebook, facebookShare);
        fdr.$doc.on('click', selectorTwitter, twitterShare);
        fdr.$doc.on('click', selectorEmail, emailShare);
    }

    eventListeners();

}

module.exports = SocialShare;

},{}],20:[function(require,module,exports){
'use strict';

function Takeover() {

    var $toggle = $('.js-toggle-takeover');
    var toggleMenuClassName = 'js-toggle-takeover--menu';
    var $activeGroup = $('.takeover__nav-group.is-active');
    var firstGroupSelector = '.takeover__nav-group:first';
    var menuIsChecked = false;

    function focusInput($el, triggerdLink) {
        var $input = $el.find('.site-search__search-input:not(.tt-hint):eq(0)');

        if ($input.length) {
            var val = $input.val();

            if (val) {
                $input.val('').trigger('input').val(val).trigger('input');
            }
            $input[0].focus();

        } else if (triggerdLink.currentTarget.hasAttribute('data-focus')) {
            var $link = $el.find('.takeover__nav-link');

            $link[0].focus();
        }
    }

    function open(targetId, triggerdLink) {

        var $takeover = $('#' + targetId);

        $takeover.addClass(fdr.helperClass.isAnimating)[0].clientHeight; // jshint ignore:line
        $takeover
            .addClass(fdr.helperClass.isOpen)
            .attr('aria-hidden', false)
            .one('transitionEnd', function() {
                $takeover.removeClass(fdr.helperClass.isAnimating);
            });

        $toggle.addClass(fdr.helperClass.isOpen);
        fdr.$html.addClass('takeover-open ' + targetId);

        setTimeout(function() {
            focusInput($takeover, triggerdLink);
        }, 100);
    }

    function close($takeover) {

        $takeover = $takeover || $('.takeover.is-open');

        $takeover
            .addClass(fdr.helperClass.isAnimating)
            .removeClass(fdr.helperClass.isOpen).attr('aria-hidden', true)
            .one('transitionEnd', function() {
                $takeover.removeClass(fdr.helperClass.isAnimating);
            });

        $toggle.removeClass(fdr.helperClass.isOpen);
        fdr.$html.removeClass(function(index, css) {
            return (css.match(/(^|\s)takeover\S+/g) || []).join(' ');
        });
    }

    function checkMenuItems() {
        menuIsChecked = true;

        if ($activeGroup.length === 1 && $activeGroup.prev().length > 0) {
            $activeGroup.insertBefore(firstGroupSelector);
        }
    }

    function eventListeners() {
        $toggle.click(function(e) {
            e.preventDefault();

            var $currentTarget = $(e.currentTarget);
            var targetId = $currentTarget.data('id');
            var $targetTakeover = $('#' + targetId);

            if (!targetId || $targetTakeover.hasClass(fdr.helperClass.isOpen)) {
                close();
                return;
            }

            // Check menu items if we are opening the menu for the first time
            if ($currentTarget.hasClass(toggleMenuClassName) && !menuIsChecked) {
                checkMenuItems();
                setTimeout(function() {
                    open(targetId, e);
                }, 100);
            } else {
                open(targetId, e);
            }

        });

        fdr.$html.on('keyup', function(e) {
            if (e.keyCode === fdr.keyCode.ESCAPE) {
                close();
            }
        });
    }

    eventListeners();

    return {
        open: open,
        close: close
    };
}

module.exports = Takeover;

},{}],21:[function(require,module,exports){
'use strict';

function TurboLink() {
    var selector = '.js-turbo-link';
    var spinnerOpts = {
        lines: 11,
        length: 12,
        width: 7,
        radius: 16,
        color: '#000',
        top: '40px',
        left: '50%'
    };

    function buildMarkup(data, args) {

        var $el = args[0];
        var href = args[1];
        var targetSelector = $el.data('target');
        var $target = $(targetSelector);
        var target = $target[0];
        var $html = $('<div></div>').append(data);
        var pageTitle = $html.find('title').text();
        var content = $html.find(targetSelector).html();

        target.spinner.stop();

        $target.html(content).removeClass(fdr.helperClass.isLoading);
        $target.attr('aria-busy', false);

        if (Modernizr.history) {
            document.title = pageTitle;
            history.replaceState({}, pageTitle, href);
        }

        $(selector).filter('[data-target="' + targetSelector + '"]').removeClass(fdr.helperClass.isActive);
        $el.addClass(fdr.helperClass.isActive);
    }

    function ajaxFallback(href) {
        document.location = href;
    }

    function loadContent($el, href) {
        var $target = $($el.data('target'));
        var target = $target[0];

        if (!target) {
            $el.addClass(fdr.helperClass.isActive).siblings().removeClass(fdr.helperClass.isActive);
            return;
        }

        $target.attr('aria-busy', true);

        if (target.spinner) {
            target.spinner.stop();
        }

        target.spinner = new Spinner(spinnerOpts).spin(target);

        var options = {
            onSuccess: buildMarkup,
            onSuccessArg: [$el, href],
            onError: ajaxFallback,
            onErrorArg: href
        };
        fdr.ajax.get(href, options);
    }

    function onClick($el) {
        if ($el[0].tagName === 'SELECT') {
            return;
        }

        var href = $el.attr('href');
        var $target = $($el.data('target'));

        $target.addClass(fdr.helperClass.isLoading);

        if ($el.data('scroll-to-target') && fdr.$win.scrollTop() > $target.offset().top) {
            $('html, body').animate({ scrollTop: $target.offset().top - 100 });
        }

        loadContent($el, href);
    }

    function onChange($el) {

        var href = $el.val();
        $($el.data('target')).addClass(fdr.helperClass.isLoading);

        loadContent($el, href);
    }

    function eventListeners() {
        fdr.$doc.on('click', selector, function(e) {
            e.preventDefault();
            var $el = $(this);
            onClick($el);
        });

        fdr.$doc.on('change', selector, function(e) {
            e.preventDefault();
            var $el = $(this);
            onChange($el);
        });
    }

    eventListeners();

}

module.exports = TurboLink;

},{}],22:[function(require,module,exports){
module.exports={
    "version": "8.2.0"
}

},{}]},{},[9]);
