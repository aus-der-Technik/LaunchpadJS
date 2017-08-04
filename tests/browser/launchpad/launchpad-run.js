
var should = chai.should();
var expect = chai.expect;

describe("Taskmanager run", function() {

	after(function(done){
		require(['launchpad'], function(tm) {
			var nslist = tm.listNamespaces();
			_.each(nslist, function(nsname){
				var ns = tm.getNamespace(nsname);
				ns.abort();
			});
			done();
		});
	});

	it("should run single task instantly", function (done) {
		require(['launchpad'], function(tm) {
			var taskFn = function(scope, next){
				expect(scope).to.be.ok;
				expect(next).to.be.a('function');
				next();
				done();
			}

			var task = tm.addTask('testfn', tm.priority.FOREGROUND, taskFn);
			
			expect(tm).to.be.ok;
			expect(task).to.be.ok;
		});
	});
		
});
