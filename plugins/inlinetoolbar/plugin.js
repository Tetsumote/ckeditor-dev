/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

( function() {
	'use strict';

	/**
	 * Class representing view of inline toolbar, used by {@link CKEDITOR.ui.inlineToolbar}.
	 *
	 * @class
	 * @private
	 * @extends CKEDITOR.ui.balloonPanel
	 * @constructor Creates an inline toolbar view instance.
	 * @since 4.8
	 * @param {CKEDITOR.editor} editor The editor instance for which the toolbar is created.
	 * @param {Object} definition An object containing the toolbar definition. See {@link CKEDITOR.ui.balloonPanel}
	 * docs for an example definition.
	 */
	CKEDITOR.ui.inlineToolbarView = function( editor, definition ) {
		definition = CKEDITOR.tools.extend( definition || {}, {
			width: 'auto',
			triangleWidth: 10,
			triangleHeight: 10
		} );
		CKEDITOR.ui.balloonPanel.call( this, editor, definition );

		/**
		 * Listeners registered by this toolbar view.
		 *
		 * @private
		 */
		this._listeners = [];
	};

	/**
	 * Class representing instance of inline toolbar.
	 *
	 *		// Following example will show an inline toolbar on any selection change. The toolbar is anchored to the
	 *		// last element in selection, assuming that editor variable is an instance of CKEDITOR.editor.
	 *		editor.on( 'instanceReady', function() {
	 *			var toolbar = new CKEDITOR.ui.inlineToolbar( editor );
	 *
	 *			toolbar.addItems( {
	 *				link: new CKEDITOR.ui.button( {
	 *					command: 'link'
	 *				} ),
	 *				unlink: new CKEDITOR.ui.button( {
	 *					command: 'unlink'
	 *				} )
	 *			} );
	 *
	 *			editor.on( 'selectionChange', function( evt ) {
	 *				var lastElement = evt.data.path.lastElement;
	 *
	 *				if ( lastElement ) {
	 *					toolbar.attach( lastElement );
	 *				}
	 *			} );
	 *		} );
	 *
	 * @class
	 * @constructor Creates an inline toolbar instance.
	 * @since 4.8
	 * @param {CKEDITOR.editor} editor The editor instance for which the toolbar is created.
	 * @param {Object} definition An object containing the panel definition. See {@link CKEDITOR.ui.balloonPanel}
	 * docs for an example definition.
	 */
	CKEDITOR.ui.inlineToolbar = function( editor, definition ) {
		/**
		 * View instance of inline toolbar.
		 *
		 * @private
		 * @property {CKEDITOR.ui.inlineToolbarView}
		 */
		this._view = new CKEDITOR.ui.inlineToolbarView( editor, definition );

		/**
		 * Menu items added to inline toolbar.
		 *
		 * @private
		 * @property {CKEDITOR.ui.button[]/CKEDITOR.ui.richCombo[]}
		 */
		this._items = [];
	};

	/**
	 * Displays the inline toolbar, pointing it to the `element`.
	 *
	 * @param {CKEDITOR.dom.element} element The element to which the panel is attached.
	 * @param {Boolean} [hidden=false] Do not show inline toolbar after attach.
	 * @member CKEDITOR.ui.inlineToolbar
	 */
	CKEDITOR.ui.inlineToolbar.prototype.attach = function( element, hidden ) {
		this._view.renderItems( this._items );
		this._view.attach( element, {
			focusElement: false,
			show: !hidden
		} );
	};

	/**
	 * Show inline toolbar.
	 *
	 * @member CKEDITOR.ui.inlineToolbar
	 */
	CKEDITOR.ui.inlineToolbar.prototype.show = function() {
		this._view.show();
	};

	/**
	 * Hide inline toolbar.
	 *
	 * @member CKEDITOR.ui.inlineToolbar
	 */
	CKEDITOR.ui.inlineToolbar.prototype.hide = function() {
		this._view.hide();
	};

	/**
	 * Adds an item to the inline toolbar.
	 *
	 * @param {String} name The menu item name.
	 * @param {CKEDITOR.ui.button/CKEDITOR.ui.richCombo} element Instance of ui element.
	 */
	CKEDITOR.ui.inlineToolbar.prototype.addItem = function( name, element ) {
		this._items[ name ] = element;
	};

	/**
	 * Adds one or more items to the inline toolbar.
	 *
	 * @param {Object} elements Object where keys are used as itemName and corresponding values as definition for a {@link #addItem} call.
	 */
	CKEDITOR.ui.inlineToolbar.prototype.addItems = function( elements ) {
		for ( var itemName in elements ) {
			this.addItem( itemName, elements[ itemName ] );
		}
	};

	/**
	 * Retrieves a particular menu item from the inline toolbar.
	 *
	 * @param {String} name The name of the desired menu item.
	 * @returns {CKEDITOR.ui.button/CKEDITOR.ui.richCombo}
	 */
	CKEDITOR.ui.inlineToolbar.prototype.getItem = function( name ) {
		return this._items[ name ];
	};

	/**
	 * Removes a particular menu item from the inline toolbar.
	 *
	 * @param {String} name The name of the item menu to be deleted.
	 */
	CKEDITOR.ui.inlineToolbar.prototype.deleteItem = function( name ) {
		if ( this._items[ name ] ) {
			delete this._items[ name ];
		}
	};

	/**
	 * Hides the toolbar and removes it from the DOM.
	 */
	CKEDITOR.ui.inlineToolbar.prototype.destroy = function() {
		this._pointedElement = null;
		this._view.destroy();
	};

	/**
	 * Class representing inline toolbar context in the editor.
	 *
	 * @class
	 * @constructor Creates an inline toolbar context instance.
	 * @since 4.8
	 * @param {CKEDITOR.editor} editor The editor instance for which the toolbar is created.
	 * @param {Object} options Options object passed in {@link CKEDITOR.editor.plugins.inlinetoolbar#create} method.
	 */
	function Context( editor, options ) {
		this.editor = editor;

		this.options = options;

		this.toolbar = new CKEDITOR.ui.inlineToolbar( editor );

		this._attachListeners();
	}

	Context.prototype = {
		/**
		 * Set up and create inline toolbar.
		 *
		 * @param {Object} params Configuration object for inline toolbar context.
		 * @param {String} params.buttons Names of the elements that should be available in inline toolbar.
		 * @param {String} params.context ACF rules that describes focused elements that should have inline toolbar
		 */
		context: function( params ) {
			if ( !params ) {
				return;
			}

			if ( params.buttons ) {
				params.buttons = params.buttons.split( ',' );
				CKEDITOR.tools.array.forEach( params.buttons, function( name ) {
					this.toolbar.addItem( name, this.editor.ui.create( name ) );
				}, this );
			}
			if ( params.context ) {
				params.context = params.context.split( ',' );
				this.filters = [];
				CKEDITOR.tools.array.forEach( params.context, function( rule ) {
					this.filters.push( new CKEDITOR.filter( rule ) );
				}, this );
			}
			return this.toolbar;
		},

		/**
		 * Destroy inline toolbar context
		 */
		destroy: function() {

			if ( this.toolbar ) {
				this.toolbar.destroy();
			}
		},

		/**
		 * Function to be called in order to check whether inline toolbar visibility should change.
		 *
		 * @param {CKEDITOR.dom.elementPath} path
		 */
		refresh: function( path ) {
			var visibility = false;

			if ( this.options.refresh ) {
				visibility = this.options.refresh( this.editor, path || this.editor.elementPath() );
			} else if ( this.options.widgets ) {
				visibility = this._hasWidgetFocused();
			}

			if ( visibility ) {
				this.toolbar.show();
			} else {
				this.toolbar.hide();
			}
		},

		/**
		 * Checks if any of `options.widgets` widgets is currently focused.
		 *
		 * @private
		 * @returns {Boolean}
		 */
		_hasWidgetFocused: function() {
			var widgetNames = this.options.widgets,
				curWidgetName = this.editor.widgets && this.editor.widgets.focused && this.editor.widgets.focused.name;

			return CKEDITOR.tools.array.indexOf( widgetNames, curWidgetName ) !== -1;
		},

		/**
		 * Registers all the needed listeners, like {@link CKEDITOR.editor#selectionChange} listener.
		 *
		 * @private
		 */
		_attachListeners: function() {
			this.editor.on( 'destroy', function() {
				this.destroy();
			}, this );

			this.editor.on( 'selectionChange', function() {
				this.refresh();
			}, this );
		}
	};

	var pluginInit = false;
	CKEDITOR.plugins.add( 'inlinetoolbar', {
		requires: 'balloonpanel',
		onLoad: function() {
			// Load fallback styles.
			CKEDITOR.document.appendStyleSheet( this.path + 'skins/default.css' );

			CKEDITOR.document.appendStyleSheet( this.path + 'skins/' + CKEDITOR.skinName + '/inlinetoolbar.css' );
		},

		/**
		 * Create new inline toolbar
		 *
		 * @since 4.8
		 * @class CKEDITOR.plugins.inlinetoolbar.create
		 * @constructor Creates a class instance.
		 */
		create: function( params, editor ) {
			if ( !params ) {
				return;
			}

			this.toolbar = new CKEDITOR.ui.inlineToolbar( editor );

			if ( params.buttons ) {
				params.buttons = params.buttons.split( ',' );
				CKEDITOR.tools.array.forEach( params.buttons, function( name ) {
					if ( editor.ui.items[ name ] ) {
						this.toolbar.addItem( name, new CKEDITOR.ui.button( {
							command: editor.ui.items[ name ].command,
							label: editor.ui.items[ name ].label
						} ) );
					}
				} );
			}

			return this;
		},

		init: function( editor ) {
			// editor.inlineToolbar = new Context( editor );

			/**
			 * Set of instance-specific public APIs exposed by Inline Toolbar plugin.
			 *
			 * @class
	 		 * @singleton
			 * @member CKEDITOR.editor.plugins
			 */
			editor.plugins.inlinetoolbar = {
				/**
				 * @param {Object} options Config object for Inline Toolbar.
				 * @param {String[]} options.widgets An array of widget names that should trigger this toolbar.
				 * @returns {CKEDITOR.plugins.inlinetoolbar.context} A context object created for this inline toolbar configuration.
				 */
				create: function( options ) {
					return new CKEDITOR.plugins.inlinetoolbar.context( editor, options );
				}
			};

			// Awful hack for overwriting prototypes of inilineToolbarView (#1142).
			if ( pluginInit ) {
				return;
			}
			pluginInit = true;
			CKEDITOR.ui.inlineToolbarView.prototype = CKEDITOR.tools.extend( {}, CKEDITOR.ui.balloonPanel.prototype );

			/**
			 * Build inline toolbar DOM representation.
			 *
			 * @member CKEDITOR.ui.inlineToolbarView
			 */
			CKEDITOR.ui.inlineToolbarView.prototype.build = function() {
				CKEDITOR.ui.balloonPanel.prototype.build.call( this );
				this.parts.panel.addClass( 'cke_inlinetoolbar' );
				this.parts.title.remove();
				this.parts.close.remove();
			};

			CKEDITOR.ui.inlineToolbarView.prototype.show = function() {
				if ( this.rect.visible ) {
					return;
				}
				var editable = this.editor.editable();
				this._detachListeners();

				this._listeners.push( this.editor.on( 'resize', function() {
					this.attach( this._pointedElement, {
						focusElement: false
					} );
				}, this ) );
				this._listeners.push( editable.attachListener( editable.getDocument(), 'scroll', function() {
					this.attach( this._pointedElement, {
						focusElement: false
					} );
				}, this ) );
				CKEDITOR.ui.balloonPanel.prototype.show.call( this );
			};

			CKEDITOR.ui.inlineToolbarView.prototype.hide = function() {
				this._detachListeners();
				CKEDITOR.ui.balloonPanel.prototype.hide.call( this );
			};

			CKEDITOR.ui.inlineToolbarView.prototype._getAlignments = function( elementRect, panelWidth, panelHeight ) {
				var filter = [ 'top hcenter', 'bottom hcenter' ],
					alignments = CKEDITOR.ui.balloonPanel.prototype._getAlignments.call( this, elementRect, panelWidth, panelHeight );
				for ( var a in alignments ) {
					if ( CKEDITOR.tools.indexOf( filter, a ) === -1 ) {
						delete alignments[ a ];
					}
				}
				return alignments;
			};

			/**
			 * Detaches all listeners.
			 *
			 * @private
			 * @member CKEDITOR.ui.inlineToolbarView
			 */
			CKEDITOR.ui.inlineToolbarView.prototype._detachListeners = function() {
				if ( this._listeners.length ) {
					CKEDITOR.tools.array.forEach( this._listeners, function( listener ) {
						listener.removeListener();
					} );
					this._listeners = [];
				}
			};

			CKEDITOR.ui.inlineToolbarView.prototype.destroy = function() {
				CKEDITOR.ui.balloonPanel.prototype.destroy.call( this );
				this._detachListeners();
			};

			/**
			 * Renders provided UI elements inside of the view.
			 *
			 * @member CKEDITOR.ui.inlineToolbarView
			 * @param {CKEDITOR.ui.button[]/CKEDITOR.ui.richCombo[]} items Array of UI elements objects.
			 */
			CKEDITOR.ui.inlineToolbarView.prototype.renderItems = function( items ) {
				var output = [],
					keys = CKEDITOR.tools.objectKeys( items ),
					groupStarted = false;

				CKEDITOR.tools.array.forEach( keys, function( itemKey ) {

					// If next element to render is richCombo and we have already opened group we have to close it.
					if ( CKEDITOR.ui.richCombo && items[ itemKey ] instanceof CKEDITOR.ui.richCombo && groupStarted ) {
						groupStarted = false;
						output.push( '</span>' );
					} else if ( !( CKEDITOR.ui.richCombo && items[ itemKey ] instanceof CKEDITOR.ui.richCombo ) && !groupStarted ) {
						// If we have closed group and element that is not richBox we have to open group.
						groupStarted = true;
						output.push( '<span class="cke_toolgroup">' );
					}

					// Now we can render element.
					items[ itemKey ].render( this.editor, output );
				}, this );

				// We have to check if last group is closed.
				if ( groupStarted ) {
					output.push( '</span>' );
				}

				this.parts.content.setHtml( output.join( '' ) );
			};

			/**
			 * @inheritdoc CKEDITOR.ui.balloonPanel#attach
			 * @member CKEDITOR.ui.inlineToolbarView
			 */
			CKEDITOR.ui.inlineToolbarView.prototype.attach = function( element, options ) {

				/**
				 * DOM element used by inline toolbar to attach to.
				 *
				 * @private
				 */
				this._pointedElement = element;
				CKEDITOR.ui.balloonPanel.prototype.attach.call( this, element, options );
			};
		}
	} );



	/**
	 * Static API exposed by the [Inline Toolbar](https://ckeditor.com/cke4/addon/inlinetoolbar) plugin.
	 *
	 * @class
	 * @singleton
	 */
	CKEDITOR.plugins.inlinetoolbar = {
		context: Context
	};
}() );
