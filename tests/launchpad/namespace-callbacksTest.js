
var assert = require("assert")
    , chai = require("chai")
	, _ = require('underscore')
    , expect = chai.expect
    , tm = require('../../src/launchpad')
    ;

describe("Taskmanagers Namespace Callbacks", function() {

	after(function(done){
		var nslist = tm.listNamespaces();
		_.each(nslist, function(nsname){
			var ns = tm.getNamespace(nsname);
			ns.abort();
		});
		done();
	});

	it("should be called at startup", function (done) {
		var globalcheck = [];
		
		var namespace = tm.createNamespace('startuptest');
		namespace.onStart(function(){
			expect(globalcheck).to.be.a('array');
			expect(globalcheck).to.have.length(0);
			done();
		});
		
		tm.addTask(namespace, function(scope, next){
			globalcheck.push("intask");
			next()
		});
		namespace.start();
	});
	
	it("should be called at finish", function (done) {
		var globalcheck = [];
		
		var namespace = tm.createNamespace('finishtest');
		namespace.onFinish(function(){
			expect(globalcheck).to.be.a('array');
			expect(globalcheck).to.have.length(1);
			done();
		});
		
		tm.addTask(namespace, function(scope, next){
			globalcheck.push("intask");
			next()
		});
		namespace.start();
	});	
	
	it("should be called before a task starts", function (done) {
		var globalcheck = [];
		
		var namespace = tm.createNamespace('beforetest');
		namespace.beforeTask(function(scope, task){
			expect(globalcheck).to.be.a('array');
			expect(globalcheck).to.have.length(0);

			expect(scope.mem).to.be.undefined;
			done();
		});
		
		tm.addTask(namespace, function(scope, next){
			globalcheck.push("intask");
			if(!scope.mem){ scope.mem = Array(); }
			scope.mem.push("intask");
			next();
		});
		namespace.start();
	});	
	
	it("should be called before a task starts", function (done) {
		var globalcheck = [];
		
		var namespace = tm.createNamespace('aftertest');
		namespace.afterTask(function(scope, task){
			expect(globalcheck).to.be.a('array');
			expect(globalcheck).to.have.length(1);

			expect(scope.mem).to.be.a('array');
			expect(scope.mem).to.have.length(1);
			done();
		});
		
		tm.addTask(namespace, function(scope, next){
			globalcheck.push("intask");
			if(!scope.mem){ scope.mem = Array(); }
			scope.mem.push("intask");
			next();
		});
		namespace.start();
	});		
		
});
