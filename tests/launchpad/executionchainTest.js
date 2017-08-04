
var assert = require("assert")
    , chai = require("chai")
	, _ = require('underscore')
    , expect = chai.expect
    , tm = require('../../src/launchpad')
    ;

describe("Taskmanager's execution chain", function() {

	before(function(done){
		var nslist = tm.listNamespaces();
		_.each(nslist, function(nsname){
			var ns = tm.getNamespace(nsname);
			ns.abort();
		});
		nslist = tm.listNamespaces();
		done();
	});

	it("should be like dokumented in first chapter", function (done) {
		var endCounter = 0;
		var startCounter = 0;
		var globalExecuterLog = []; 
		var collectResults = function(){
			endCounter++;
			if(endCounter == startCounter){
				expect(globalExecuterLog).to.be.eql(['G', 'C', 'Y', 'L']);
				done();
			}
		}
		
		startCounter++;
		var greenqueue = tm.createNamespace('green');
		greenqueue.onFinish(function(scope){
			expect(scope).to.have.property('chain');
			expect(scope.chain).to.be.a('array');
			expect(scope.chain).to.have.length(1);
			expect(scope.chain[0]).to.be.equals('1');
			globalExecuterLog.push('G');
			collectResults();
			
		});
		tm.addTask(greenqueue, tm.priority.IMMEDIATELY, function(scope, next){
			if(!scope.chain){ scope.chain = []; }
			scope.chain.push('1');
			next();
		});
		
		startCounter++;
		var cyanqueue = tm.createNamespace('cyan');
		cyanqueue.onFinish(function(scope){
			expect(scope).to.have.property('chain');
			expect(scope.chain).to.be.a('array');
			expect(scope.chain).to.have.length(2);
			expect(scope.chain[0]).to.be.equals('1');
			expect(scope.chain[1]).to.be.equals('2');
			globalExecuterLog.push('C');
			collectResults();	
		});	
		tm.addTask(cyanqueue, tm.priority.BACKGROUND, function(scope, next){
			if(!scope.chain){ scope.chain = []; }
			scope.chain.push('1');
			next();
		});
		tm.addTask(cyanqueue, tm.priority.BACKGROUND, function(scope, next){
			if(!scope.chain){ scope.chain = []; }
			scope.chain.push('2');
			next();
		
		});
		
		startCounter++;
		var lilaqueue = tm.createNamespace('lila');
		lilaqueue.onFinish(function(scope){
			expect(scope).to.have.property('chain');
			expect(scope.chain).to.be.a('array');
			expect(scope.chain).to.have.length(3);
			expect(scope.chain[0]).to.be.equals('1');
			expect(scope.chain[1]).to.be.equals('2');
			expect(scope.chain[2]).to.be.equals('3');
			globalExecuterLog.push('L');
			collectResults();
		});
		tm.addTask(lilaqueue, tm.priority.BACKGROUND, function(scope, next){
			if(!scope.chain){ scope.chain = []; }
			scope.chain.push('1');
			next();
		});
		tm.addTask(lilaqueue, tm.priority.IMMEDIATELY, function(scope, next){
			if(!scope.chain){ scope.chain = []; }
			scope.chain.push('2');
			next();
		});
		tm.addTask(lilaqueue, tm.priority.BACKGROUND, function(scope, next){
			if(!scope.chain){ scope.chain = []; }
			scope.chain.push('3');
			next();
		});
		
		startCounter++;
		var yellowqueue = tm.createNamespace('yellow');
		yellowqueue.onFinish(function(scope){
			expect(scope).to.have.property('chain');
			expect(scope.chain).to.be.a('array');
			expect(scope.chain).to.have.length(2);
			expect(scope.chain[0]).to.be.equals('1');
			expect(scope.chain[1]).to.be.equals('2');
			globalExecuterLog.push('Y');
			collectResults();	
		});
		tm.addTask(yellowqueue, tm.priority.IMMEDIATELY, function(scope, next){
			if(!scope.chain){ scope.chain = []; }
			scope.chain.push('1');
			next();
		});
		tm.addTask(yellowqueue, tm.priority.FOREGROUND, function(scope, next){
			if(!scope.chain){ scope.chain = []; }
			scope.chain.push('2');
			next();
		});
		
		lilaqueue.start(); //<-- different order.
		greenqueue.start();
		cyanqueue.start();
		yellowqueue.start();
		
	});
		
});
