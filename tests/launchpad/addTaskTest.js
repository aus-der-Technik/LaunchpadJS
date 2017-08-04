
var assert = require("assert")
    , chai = require("chai")
	, _ = require('underscore')
    , expect = chai.expect
    , tm = require('../../src/launchpad')
    ;

describe("Taskmanager add Task", function() {

	after(function(done){
		var nslist = tm.listNamespaces();
		_.each(nslist, function(nsname){
			var ns = tm.getNamespace(nsname);
			ns.abort();
		});
		done();
	});

	it("should be successful on two namespaces", function (done) {
		var mainqueue = tm.createNamespace('mainqueue');
		expect(mainqueue.name).to.be.equals('mainqueue');
		var screenqueue = tm.createNamespace('screenqueue');
		expect(screenqueue.name).to.be.equals('screenqueue');
		
		var task1 = tm.addTask(mainqueue, tm.priority.IMMEDIATELY, function(scope, next){
			next();
		});
		expect(task1.namespace.name).to.be.equals('mainqueue');
		
		var task2 = tm.addTask(mainqueue, tm.priority.BACKGROUND, function(scope, next){
			next();
		});
		expect(task2.namespace.name).to.be.equals('mainqueue');
		
		var task3 = tm.addTask(screenqueue, tm.priority.IMMEDIATELY, function(scope, next){
			next();
		});
		expect(task3.namespace.name).to.be.equals('screenqueue');
		
		expect(task1.idx).to.be.equals(0);
		expect(task2.idx).to.be.equals(1);
		expect(task1.idx).to.be.equals(0);
		
		expect(mainqueue.count).to.be.equals(2);
		expect(screenqueue.count).to.be.equals(1);

		mainqueue.start();
		
		expect(task1.status).to.be.above(0);
		expect(task2.status).to.be.above(0);
		expect(task3.status).to.be.equals(0);
		
		done();
	});
		
});
