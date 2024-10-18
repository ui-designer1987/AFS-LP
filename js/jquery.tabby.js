/*! tabby - v0.5.0 - 2015-02-09
* https://github.com/SubZane/tabby
* Copyright (c) 2015 Andreas Norman; Licensed MIT */
(function ($) {
	// Change this to your plugin name.
	var pluginName = 'tabby';

	/**
	 * Plugin object constructor.
	 * Implements the Revealing Module Pattern.
	 */
	function Plugin(element, options) {
		// References to DOM and jQuery versions of element.
		var el = element;
		var $el = $(element);
		var tabbyContent = $el.data('for');
		var hash = window.location.hash;

		// Extend default options with those supplied by user.
		options = $.extend({}, $.fn[pluginName].defaults, options);

		/**
		 * Initialize plugin.
		 */
		function init() {
			hook('onInit');
			attachEvents();
			if (hash.length > 0) {
				openTabFromHash(hash);
			} else {
				openActiveTab();
			}
		}

		function openActiveTab() {
			var targetTab = $el.find('a[data-target].active').data('target');
			showTabContent(targetTab);
		}

		function openTabFromHash(hash) {
			var dehashed = hash.replace('#','');
			if (!$el.find('a[data-target="'+dehashed+'"]').hasClass('active')) {
				$el.find('a[data-target="'+dehashed+'"]').trigger('click');
			}
		}

		function attachEvents() {
			$el.on('click', 'a[data-target]', function(e) {
				window.location.hash = '#'+$(this).data('target');
				e.preventDefault();
				switchTab($(this).data('target'));
			});

			$(window).on('popstate', function (e) {
				e.preventDefault();
				openTabFromHash(window.location.hash);
			});
		}

		function switchTab(tab) {
			$el.find('a').removeClass('active');
			$el.find('a[data-target="'+tab+'"]').addClass('active');
			showTabContent(tab);
		}

		function showTabContent(tab) {
			$('#'+tabbyContent+' div[data-tab]').hide();
			$tab = $('#'+tabbyContent+' div[data-tab="'+tab+'"]');
			if ($tab.attr('data-ajaxcontent')) {
				$tab.load($tab.data('ajaxcontent'), function() {
					hook('onAjaxContentLoaded');
					$tab.show();
					hook('onTabShow');
				});
			} else {
				$tab.show();
				hook('onTabShow');
			}

		}

		/**
		 * Get/set a plugin option.
		 * Get usage: $('#el').tabby('option', 'key');
		 * Set usage: $('#el').tabby('option', 'key', value);
		 */
		function option(key, val) {
			if (val) {
				options[key] = val;
			} else {
				return options[key];
			}
		}

		/**
		 * Destroy plugin.
		 * Usage: $('#el').tabby('destroy');
		 */
		function destroy() {
			// Iterate over each matching element.
			$el.each(function () {
				var el = this;
				var $el = $(this);

				// Add code to restore the element to its original state...

				hook('onDestroy');
				// Remove Plugin instance from the element.
				$el.removeData('plugin_' + pluginName);
			});
		}

		/**
		 * Callback hooks.
		 * Usage: In the defaults object specify a callback function:
		 * hookName: function() {}
		 * Then somewhere in the plugin trigger the callback:
		 * hook('hookName');
		 */
		function hook(hookName) {
			if (options[hookName] !== undefined) {
				// Call the user defined function.
				// Scope is set to the jQuery element we are operating on.
				options[hookName].call(el);
			}
		}

		// Initialize the plugin instance.
		init();

		// Expose methods of Plugin we wish to be public.
		return {
			option: option,
			destroy: destroy,
		};
	}

	/**
	 * Plugin definition.
	 */
	$.fn[pluginName] = function (options) {
		// If the first parameter is a string, treat this as a call to
		// a public method.
		if (typeof arguments[0] === 'string') {
			var methodName = arguments[0];
			var args = Array.prototype.slice.call(arguments, 1);
			var returnVal;
			this.each(function () {
				// Check that the element has a plugin instance, and that
				// the requested public method exists.
				if ($.data(this, 'plugin_' + pluginName) && typeof $.data(this, 'plugin_' + pluginName)[methodName] === 'function') {
					// Call the method of the Plugin instance, and Pass it
					// the supplied arguments.
					returnVal = $.data(this, 'plugin_' + pluginName)[methodName].apply(this, args);
				} else {
					throw new Error('Method ' + methodName + ' does not exist on jQuery.' + pluginName);
				}
			});
			if (returnVal !== undefined) {
				// If the method returned a value, return the value.
				return returnVal;
			} else {
				// Otherwise, returning 'this' preserves chainability.
				return this;
			}
			// If the first parameter is an object (options), or was omitted,
			// instantiate a new instance of the plugin.
		} else if (typeof options === 'object' || !options) {
			return this.each(function () {
				// Only allow the plugin to be instantiated once.
				if (!$.data(this, 'plugin_' + pluginName)) {
					// Pass options to Plugin constructor, and store Plugin
					// instance in the elements jQuery data object.
					$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
				}
			});
		}
	};

	// Default plugin options.
	// Options can be overwritten when initializing plugin, by
	// passing an object literal, or after initialization:
	// $('#el').tabby('option', 'key', value);
	$.fn[pluginName].defaults = {
		onInit: function () {},
		onLoad: function () {},
		onTabShow: function () {},
		onAjaxContentLoaded: function () {},
		onDestroy: function () {}
	};

})(jQuery);
