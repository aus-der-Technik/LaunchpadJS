
var assert = require("assert")
    , chai = require("chai")
	, _ = require('underscore')
    , expect = chai.expect
    , tm = require('../../src/launchpad')
    ;
    
describe("Taskmanager", function() {
	it("should be initializable", function (done) {
		expect(tm).to.be.ok;
		done();
	});
	
	it("should have priorities", function (done) {
		expect(tm.priority).to.be.a('object');
		expect(tm.priority).to.have.property('IMMEDIATELY');
		expect(tm.priority).to.have.property('FOREGROUND');
		expect(tm.priority).to.have.property('BACKGROUND');
		done();
	});
	
});
