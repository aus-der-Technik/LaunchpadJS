
var assert = require("assert")
    , chai = require("chai")
	, _ = require('underscore')
    , expect = chai.expect;

describe('Taskmanager', function () {
	
    it('should have a instance property', function (done) {
        var taskmanager = require('../src/launchpad');
        expect(taskmanager).to.be.ok;
        expect(taskmanager).to.have.property('isRunning');
        expect(taskmanager).to.have.property('priority');
        expect(taskmanager).to.have.property('createNamespace');
        expect(taskmanager).to.have.property('getNamespace');
        expect(taskmanager).to.have.property('listNamespaces');
        expect(taskmanager).to.have.property('addTask');
        expect(taskmanager).to.have.property('taskCount');
        done();
    });
    
});
