(function($) {
	$.fn.extend({
		lazyContentLoader: function(options) {
			var defaults = {
				activeClass			: 'active',				// css class added to control/content containers when in active state
				controlItemClass	: 'controls',			// css class of control list items
				contentItemClass	: 'content',			// css class of content list items
				usePlaceholder		: true					// put placeholder html in content area while remote content is being fetched
				//placeholder		: '/images/loading.gif'	// path to placeholder img - this gotta go
				//timedLoadingInterval
			};
			var options = $.extend(defaults, options);


			return this.each(function() {
				var target = this;
				target.options = options;

				// find & store control and content items as properties (lists) on target
				_initTargetLists();

				// iterate over control items and perform bindings, etc
				target.controlItems.each(function(index) {
					var that = $(this),
						loadError = false,		// i'm still not using this for anything...sigh...
						controlIndex = index;	// this is ONLY used when 

					// set index and target of remote content on the control item
					that.data('index', index);
					that.data('contentTarget', target.contentItems[index]);

					if(that.data('contentUrl')) {
						var targetContainer = $(that.data('contentTarget'));
						if(options.usePlaceholder) {
							// this is lame
							targetContainer.html(options.placeholder);
						}
						that.bind('loadContent', function(e, d) {
							$.ajax({
								url: that.data('contentUrl'),
								success: function( data ) {
									if(options.callback) {
										// send the index, data & whether or not it was timer-based to the callback
										options.callback.call( this, that.data('index'), data, (d!=undefined && d.activatedByTrigger) );
									}
								},
								error: function( data ) {
//									targetContainer.hide().html("");	//TODO: DON'T DO THIS!!!  add error callback
									loadError = true;
								}
							}).then(function() {
								// once is enough - success or not - so remove ... TODO: maybe once is NOT enough??
								that.removeData('contentUrl');

								// hacky much?
								if(d!=undefined && d.activatedByTrigger) {
									_activateItems(that.data('index'));
								}
							});
						});
					}

					that.bind(options.triggerAction, function(e) {
						if(!loadError && that.data('contentUrl')) {
							$(this).trigger('loadContent', {activatedByTrigger: true}).unbind('loadContent');
						} else {
							_activateItems(that.data('index'));
							options.callback.call( this, that.data('index'), null, true);	// no data to pass, and wasn't timer based (was action based), so last arg is true
						}
					});
					// if there's an action to bound our clear to, let's do it
					if(options.clearAction) {
						that.bind(options.clearAction, function(e) {
							var clearActiveContentItem = target.contentItems[ that.data('index') ];
							// TODO: would it make sense to clear the control item here, too?
							$(clearActiveContentItem).removeClass(options.activeClass);
						});
					}
					if(options.timedLoadingInterval) {
						setTimeout(function() {
							that.trigger('loadContent').unbind('loadContent');
						}, (options.timedLoadingInterval*(controlIndex+1)));
					}
				});

				target.contentItems.each(function(index) {
					$(this).data('index', index);
				});

				// fetch/re-fetch (re-fetch???) our control & content list
				function _initTargetLists() {
					target.controlItems = $(target).find('ul.' + options.controlItemClass + '>li');
					target.contentItems = $(target).find('ul.' + options.contentItemClass + '>li');
				};

				// add our active CSS class to the now active control/content panel
				function _activateItems(index) {
					// need these fresh, as we may have just created/replaced/updated, etc, them
					_initTargetLists();

					// loop over all control items and remove the active class
					target.controlItems.each(function(index) {
						$(this).removeClass(options.activeClass);
					});
					// loop over all content items and remove the active class
					target.contentItems.each(function(index) {
						$(this).removeClass(options.activeClass);
					});
					// add active class to action item and its corresponding content item
					$( target.controlItems[index] ).addClass(options.activeClass);
					$( target.contentItems[index] ).addClass(options.activeClass);
				};

			});
		}
	});
})(jQuery);
