
var assert = require("assert")
    , chai = require("chai")
	, _ = require('underscore')
    , expect = chai.expect
    , tm = require('../../src/launchpad')
    ;
    
describe("Taskmanager Events", function() {

	it('should listen to a backbone event on namespace will create', function(done){
		var event = require('../../src/nodeevent').emitter;
		event.once('taskmanager::namespace::willCreate', function(event){
			done();
		});
		tm.createNamespace('foo');
	});

	it('should listen to a backbone event on namespace did create', function(done){
		var event = require('../../src/nodeevent').emitter;
		event.once('taskmanager::namespace::didCreated', function(event){
			done();
		});
		tm.createNamespace('bar');
	});

		
});
