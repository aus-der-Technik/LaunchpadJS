
var should = chai.should();
var expect = chai.expect;

describe("Taskmanager Events", function() {

	it('should listen to a backbone event on namespace will create', function(done){
		require(['backbone', 'launchpad'], function(Backbone, tm) {
			var event = Backbone.Events;
			event.once('taskmanager::namespace::willCreate', function(event){
				done();
			});
			tm.createNamespace('foo');
			
		});
	});

	it('should listen to a backbone event on namespace did create', function(done){
		require(['backbone', 'launchpad'], function(Backbone, tm) {
			var event = Backbone.Events;
			event.once('taskmanager::namespace::didCreated', function(event){
				done();
			});
			tm.createNamespace('bar');
			
		});
	});

		
});
