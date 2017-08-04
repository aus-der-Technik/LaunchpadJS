
var assert = require("assert")
    , chai = require("chai")
	, _ = require('underscore')
    , expect = chai.expect
    , tm = require('../../src/launchpad')
    ;

describe("Taskmanager onError", function() {

	after(function(done){
		var nslist = tm.listNamespaces();
		_.each(nslist, function(nsname){
			var ns = tm.getNamespace(nsname);
			ns.abort();
		});
		done();
	});

	it("should be thown when taskFn reports an error", function (done) {
		
		var namespace = tm.createNamespace('reporterror');
		namespace.onError(function(err){
			expect(err).not.to.be.null
			done();
		});
		
		tm.addTask(namespace, function(scope, next){
			next(new Error('Something went wrong'));
		});
		namespace.start();
	});

	it("should be thown when taskFn throws an error", function (done) {
		
		var namespace = tm.createNamespace('throwerror');
		namespace.onError(function(err){
			expect(err).not.to.be.null
			done();
		});
		
		tm.addTask(namespace, function(scope, next){
			throw new Error('Something went wrong');
			next();
		});
		namespace.start();
	});

});
