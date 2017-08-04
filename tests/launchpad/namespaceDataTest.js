
var assert = require("assert")
    , chai = require("chai")
	, _ = require('underscore')
    , expect = chai.expect
    , tm = require('../../src/launchpad')
    ;

describe("Taskmanager namespace data", function() {

	after(function(done){		
		var nslist = tm.listNamespaces();
		_.each(nslist, function(nsname){
			var ns = tm.getNamespace(nsname);
			ns.abort();
		});
		done();
	});

	it("should be set from outside", function (done) {
		var ns = tm.createNamespace('mainqueue');
		expect(ns).to.be.ok;
		expect(ns).to.have.property('setData');
		ns.setData({foo: 'bar'});
		
		var taskFn = function(scope, next){
			expect(scope).to.be.ok;
			expect(scope).to.have.property('foo');
			expect(scope.foo).to.be.equals('bar');
			done();
		};
		
		tm.addTask(ns, taskFn);
		ns.start();
		
	});
		
});
