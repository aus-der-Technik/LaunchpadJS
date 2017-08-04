
var should = chai.should();
var expect = chai.expect;

describe("Taskmanager's Namespace", function() {

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

	it("should accept a new namespace", function (done) {
		require(['launchpad'], function(tm) {
			var ns = tm.createNamespace('testspace');
			expect(ns.constructor.name).not.to.be.a('Error');
			var nslist = tm.listNamespaces();
			expect(nslist).to.be.a('array');
			expect(nslist).to.have.length(1);
			
			ns = tm.createNamespace('foospace');
			expect(ns.constructor.name).not.to.be.a('Error');
			nslist = tm.listNamespaces();
			expect(nslist).to.be.a('array');
			expect(nslist).to.have.length(2);
			
			expect(nslist).to.include('testspace');
			expect(nslist).to.include('foospace');
			
			done();
		});
	});
	
	it("should not accept a second namespace with same name", function (done) {
		require(['launchpad'], function(tm) {
			var ns = tm.createNamespace('barspace');
			expect(ns.constructor.name).not.to.be.a('Error');
			var nslist = tm.listNamespaces();
			expect(nslist).to.be.a('array');
			expect(nslist).to.have.length(3);
			
			ns = tm.createNamespace('barspace');
			expect(ns.constructor.name).not.to.be.a('Error');
			nslist = tm.listNamespaces();
			expect(nslist).to.be.a('array');
			expect(nslist).to.have.length(3);
			
			done();
		});
	});

	it("should abort a namespaces", function (done) {
		require(['launchpad'], function(tm) {
			var ns = tm.createNamespace('lastspace');
			expect(ns.constructor.name).not.to.be.a('Error');
			var nslist = tm.listNamespaces();
			expect(nslist).to.be.a('array');

			nslist = tm.listNamespaces();
			expect(nslist).to.be.a('array');
			expect(nslist).to.have.length(4);
			
			ns.abort();
			nslist = tm.listNamespaces();
			expect(nslist).to.have.length(3);

			done();
		});
	});
	
	it("should get a namespaces", function (done) {
		require(['launchpad'], function(tm) {
			var ns = tm.createNamespace('getnamespace');
			expect(ns.constructor.name).not.to.be.a('Error');

			var nstest = tm.getNamespace('getnamespace');
			expect(nstest).to.be.equal(nstest);
			expect(nstest.name).to.be.equal(nstest.name);
			
			ns.abort();
			done();
		});
	});		
});
