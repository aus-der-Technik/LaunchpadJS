
var assert = require("assert")
    , chai = require("chai")
	, _ = require('underscore')
    , expect = chai.expect
    , tm = require('../../src/launchpad')
    ;

describe("Taskmanager implizit namespace", function() {

	after(function(done){		
		var nslist = tm.listNamespaces();
		_.each(nslist, function(nsname){
			var ns = tm.getNamespace(nsname);
			ns.abort();
		});
		done();
	});

	it("should be created with task", function (done) {
		var task = tm.addTask('mainqueue', tm.priority.IMMEDIATELY, function(scope, next){
			next();
		});
		expect(task).to.be.ok;
		expect(task).to.have.property('status');
		expect(task.status).to.be.above(0);
		expect(task).to.have.property('namespace');
		expect(task.namespace).to.have.property('name');
		expect(task.namespace.name).to.be.equals('mainqueue');
		expect(task.namespace).to.have.property('status');
		expect(task.namespace.status).to.be.equals(1);
		expect(task).to.have.property('priority');
		expect(task.priority).to.be.equal(tm.priority.IMMEDIATELY);
		
		// check namespace
		var ns = task.namespace;
		expect(ns).to.have.property('count');
		expect(ns.count).to.be.equals(1);
		
		// task count
		//expect(tm.taskCount()).to.be.equals(1);
		var err = ns.abort();
		expect(err).to.be.null;
		expect(tm.taskCount()).to.be.equals(0);
		done();
	});
		
});
