
var assert = require("assert")
    , chai = require("chai")
	, _ = require('underscore')
    , expect = chai.expect
    , tm = require('../../src/launchpad')
    ;

describe("Taskmanager Abort Namespace", function() {

	after(function(done){
		var nslist = tm.listNamespaces();
		_.each(nslist, function(nsname){
			var ns = tm.getNamespace(nsname);
			ns.abort();
		});
		done();
	});

	it("should be remove all 🚀 ", function (done) {
		
		var namespace = tm.createNamespace('aborttest');
		tm.addTask(namespace, function(scope, next){
			next()
		});
		
		expect(tm.taskCount()).to.be.equals(1);
		expect(tm.listNamespaces().length).to.be.equals(1);
		
		namespace.abort();
		
		expect(tm.taskCount()).to.be.equals(0);
		expect(tm.listNamespaces().length).to.be.equals(0);
		done();
	});
	
	
});
