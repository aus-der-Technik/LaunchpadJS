/**
 * LaunchpadJS - Eventsystems
 *
 */
 
(function( root, factory ) {
    // Wrapper
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        try {
	        define('eventSystemWrapper', [ 'underscore', 'backbone' ], factory );
	    } catch(e) {
	        define('eventSystemWrapper', [ 'underscore'], factory );
	    }
    } else if ( typeof exports !== 'undefined' ) {
        // Node/CommonJS
        module.exports = factory( require('underscore' ), undefined );
    } else {
        // Browser globals
        factory( root._, null );
    }
}( this, function( _, Backbone ) {

	var eventTypes = {
		"None": 0,
		"Backbone": 1,
		"Node": 2
	};
	var eventType = null;
	var event = null;

	if(typeof Backbone !== 'undefined' ){
		eventType = eventTypes.Backbone;
		event = Backbone.Events;
	} else if(typeof process !== 'undefined' && typeof exports !== 'undefined') {
		eventType = eventTypes.Node;
		var EventEmitter = require('./nodeevent');
		event = EventEmitter.emitter;
	} else {
		eventType = eventTypes.None;	
		event = {};
		event.trigger = function(){
			console.log("No eventemitter for ", arguments);
		}
	}
	
	return {
		trigger: function(/* ...args */){
			switch (eventType) {
				case 1: 
					//event.trigger(...args);
					event.trigger(arguments[0], arguments[1])
					break;
				case 2:
					//event.emit(...args);
					event.emit(arguments[0], arguments[1])
					break;
				default:
					return null;
			}
		}
	}

}));
