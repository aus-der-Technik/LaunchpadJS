
var should = chai.should();
var expect = chai.expect;

describe("Taskmanager Abort Namespace", function() {

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

	it("should be remove all 🚀 ", function (done) {
		require(['launchpad'], function(tm) {
			console.log("_>", tm);
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
	
	
});
