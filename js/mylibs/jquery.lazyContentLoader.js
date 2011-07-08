(function($) {
	$.fn.extend({
		lazyContentLoader: function(options) {
			var defaults = {
				activeClass			: 'active',				// css class added to control/content containers when in active state
				controlItemClass	: 'controls',			// css class of control list items
				contentItemClass	: 'content'				// css class of content list items
			};
			var options = $.extend(defaults, options);


			return this.each(function() {
				var target = this,			// target object, containing list of controls and list of content (should have same number of <li>'s) - TODO: assert that?
					loadError = false;		// i'm still not using this for anything...sigh...
				target.options = options;

				// find & store control and content items as properties (lists) on target
				_initTargetLists();

				// if content URL is bound to the controls container, then only 1 external call is going to be made (likely, for ALL of the content - or ALL minus the initial panel, etc...that's up to the callback)
				var controlsContainer = $(target).find('ul.' + options.controlItemClass);
				if( controlsContainer.data('contentUrl') ) {
					_setupBindings(controlsContainer);
				}

				// iterate over control items and perform bindings, etc
				target.controlItems.each(function(index) {
					var that = $(this),
						controlIndex = index;	// this is ONLY used when ... ?

					// set index and target of remote content on the control item
					that.data('index', index);
					that.data('contentTarget', target.contentItems[index]);

					if(that.data('contentUrl')) {
						var targetContainer = $(that.data('contentTarget'));
						if(options.placeholder) {
							// this is lame
							targetContainer.html(options.placeholder);
						}
						_setupBindings(that);
					}

					that.bind(options.triggerAction, function(e) {
						// TODO: not really using loadError properly...should have error callback and graceful error situation handling (eg., ajax fails, do wha?)
						if(!loadError) {
							if(that.data('contentUrl')) {
								that.trigger('loadContent', {activatedByTrigger: true, idx: that.data('index')}).unbind('loadContent');
							} else if($(controlsContainer).data('contentUrl')) {
								$(controlsContainer).trigger('loadContent', {activatedByTrigger: true, idx: that.data('index')}).unbind('loadContent');
							} else if(options.callback) {
								// send the index, data & whether or not it was timer-based to the callback
								options.callback.call( this, that.data('index'), null, true);
							}
							_activateItems(that.data('index'));
						} else {
							// something went wrong?  oh snap, now what?
						}
					});
				});

				// if there's an action to bound our clear to, let's do it
				if(options.clearAction) {
					target.controlItems.each(function(index) {
						var that = $(this);
						that.bind(options.clearAction, function(e) {
							var clearActiveContentItem = target.contentItems[ that.data('index') ];
							// TODO: would it make sense to clear the control item here, too?
							$(clearActiveContentItem).removeClass(options.activeClass);
						});
					});
				}

				// why is this *here* ?  why, where else should it be?
				target.contentItems.each(function(index) {
					$(this).data('index', index);
				});
				
				/* ************************************************************************************ */

				// setup bindings...
				function _setupBindings(elem, event, index, wasUserActivated) {
					elem.bind('loadContent', function(e, d) {
						var indexClicked = elem.data('index')
											|| ((d!==undefined && d.idx!==undefined) ? d.idx : -1);	//TODO: -1 ???
						var wasUserActivated = (d!=undefined && d.activatedByTrigger) ;
						$.ajax({
							url: elem.data('contentUrl'),
							success: function( data ) {
								if(options.callback) {
									// send the index, data & whether or not it was timer-based to the callback
									options.callback.call( this, indexClicked, data, wasUserActivated);
								}
							},
							error: function( data, e ) {
								//TODO: add error callback
								loadError = true;
							}
						}).then(function() {
							// once is enough - success or not - so remove ... TODO: maybe once is NOT enough??
							elem.removeData('contentUrl');
						});
					});
					if(options.timedLoadingInterval) {
						setTimeout(function() {
							elem.trigger('loadContent').unbind('loadContent');
						}, (options.timedLoadingInterval));
					}
				}

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
