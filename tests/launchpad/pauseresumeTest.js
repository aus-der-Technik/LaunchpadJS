
var assert = require("assert")
    , chai = require("chai")
	, _ = require('underscore')
    , expect = chai.expect
    , tm = require('../../src/launchpad')
    ;

describe("Taskmanager Namespace pause", function() {

	after(function(done){
		var nslist = tm.listNamespaces();
		_.each(nslist, function(nsname){
			var ns = tm.getNamespace(nsname);
			ns.abort();
		});
		done();
	});

	it("should paused when marked", function (done) {
		var marker = null;
		
		var pausesnamespace = tm.createNamespace('paused-namespace');
		pausesnamespace.onFinish(function(){
			expect(marker).to.be.true;
			done();
		});
		tm.addTask(pausesnamespace, function(scope, next){
			setTimeout(next, 200);
		});
		
		var runningnamespace = tm.createNamespace('running-namespace');
		tm.addTask(runningnamespace, function(scope, next){
			marker = true;
			setTimeout(next, 100);
		});
		
		runningnamespace.start();
		pausesnamespace.start();
		pausesnamespace.halt();
		
		setTimeout(function(){
			pausesnamespace.resume(); 
		}, 500);
	});

});
