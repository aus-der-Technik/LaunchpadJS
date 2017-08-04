
var assert = require("assert")
    , chai = require("chai")
	, _ = require('underscore')
    , expect = chai.expect
    , tm = require('../../src/launchpad')
    ;

describe("Taskmanager run", function() {

	after(function(done){
		var nslist = tm.listNamespaces();
		_.each(nslist, function(nsname){
			var ns = tm.getNamespace(nsname);
			ns.abort();
		});
		done();
	});

	it("should run single task instantly", function (done) {
		
		var taskFn = function(scope, next){
			expect(scope).to.be.ok;
			expect(next).to.be.a('function');
			next();
			done();
		}

		var task = tm.addTask('testfn', tm.priority.FOREGROUND, taskFn);
		expect(task).to.be.ok;
	});
		
});
