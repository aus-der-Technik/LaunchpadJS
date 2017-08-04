
if ( typeof exports !== 'undefined' ) {
	var events = require('events')
		;

	var eventEmitter = new events.EventEmitter();

	/**
	 * @class
	 * @constructor
	 * Event - A application wide event emitter
	 *
	 */
	var Event = module.exports = {
	
		/**
		 * @var emitter Use this event emitter to throw application wide event
		 */
		emitter: eventEmitter
	
	};
}
