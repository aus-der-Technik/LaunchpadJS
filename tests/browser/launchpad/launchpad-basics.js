
var should = chai.should();
var expect = chai.expect;

describe("Taskmanager", function() {
	it("should be initializable", function (done) {
		require(['launchpad'], function(tm) {
			expect(tm).to.be.ok;
			done();
		});
	});
	
	it("should have priorities", function (done) {
		require(['launchpad'], function(tm) {
			expect(tm.priority).to.be.a('object');
			expect(tm.priority).to.have.property('IMMEDIATELY');
			expect(tm.priority).to.have.property('FOREGROUND');
			expect(tm.priority).to.have.property('BACKGROUND');
			done();
		});
	});
	
});
