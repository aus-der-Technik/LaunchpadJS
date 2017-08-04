
/**
 * LaunchpadJS
 *
 */
(function( root, factory ) {
    // Wrapper
    if ( typeof define === 'function' && define.amd ) {
        // AMD
        define('lauchpad', [ 'underscore', 'eventSystemWrapper' ], factory );
    } else if ( typeof exports !== 'undefined' ) {
        // Node/CommonJS
        module.exports = factory( require('underscore'), require('./eventSystemWrapper') );
    } else {
        // Browser globals
        factory( root._, function(){ return { trigger: function(){} }; } );
    }
}( this, function( _, eventSystems ) {

    var that = moduleglobal = this;
    
    /* Namespace Status 
    //
    // A namespace can have 5 different status.
    // - Constructing is when tasks will be added and the namesapce is not ment to be 
    //   executed, yet.
    // - Ready is the status for when its done for execution.
    // - Running will be set when the first task is in execution.
    // - Finished will be set when the last task is done.
    // - and Error is the status for when something really bad is hold the namespace down 
    //   from execution.
    */
    var NSStatus = {
          CONSTRUCTING:     0
        , READY:            1
        , RUNNING:          2
        , FINISHED:         3
        , ERROR:            4
    };

    /* Task status
    //
    // a single task can have 7 status that describes the current state of the task.
    // - Stage is set when the task is added to a namespace, but the namespace is not 
    //   ready for execution.
    // - Ready is set when the whole namespace is ready and the task could be executed but 
    //   is not its turn and the task is not on the lauchpad at the moment.
    // - Launch will be set when the task is moved to the launchpad and will be executed 
    //   in the near future.
    // - Running is set when the task is in execution.
    // - Finished is set when the task is ready executed and do not produced an error.
    // - Aborted is set when a not executed task is aborted and will not be executed. This
    //   will happend when the namespace is going to an error state, or the consumer abort
    //   the namespace.
    // - and Error is the status for when something really bad is going on with the task.
    */
    var TASKStatus = {
          STAGE:            0
        , READY:            1
        , LAUNCH:           2
        , RUNNING:          3
        , FINISHED:         4
        , ABORTED:          5
        , ERROR:            6
    };
    
    /*
    // Namespace Object
    //
    // Every creation of a namespace will allocate a own namespace object with a namespace 
    // wide datastore (scope). Every task in that namespace can access the datastore.
    // 
    // Properties:
    //  - count Sum of all tasks in that namespace
    //  - left Sum of the tasks left in the namespace that are waiting for execution
    //  - running Sum of tasks in execution. Because the tasks in a namespace will always 
    //    run sequential, the `running` property can only be 0 or 1 
    //
    // Functions:
    //  - start Starts a pre-filled namespace and executes all tasks in that namespace.
    //  - abort Stops all tasks in that namespace.
    //  - halt Pause a Namespace and all its tasks that are not on the launchpad. 
    //  - resume Resumes all paused tasks in the namespace.
    //
    // Callback Functions
    //  - onStart Will be called when before the first task is moved to the launchpad.
    //  - onFinish Will be called when the last task is done and the scope will be 
    //    destroyed.
    //  - onError Will be called when a error occur on the namespace.
    //  - beforeTask Will be called every time before a task is going to run.
    //  - afterTask Will be called every time after a task has run.
    */
    var Namespace = function Namespace(){
        return {
              _status:      null
            , count:        0
            , left:         0
            , running:      0
            , data: {
        
            }
            , lastidx:      -1
            , name:         null
            , setData: function(data){
            	this.data = data;
            }
            , abort: function abort(){
                this.name = null;
                this.status = NSStatus.ABORTED;
                return null;
            }
            , start: function start(){
                if(this.status !== NSStatus.CONSTRUCTING){
                    return new Error(
                        'Only namespaces in state "Constructing" are able to start. Has: '
                        + this.status
                    );
                }
                this.status = NSStatus.READY;
            }
            , halt: function(){
                this.status = NSStatus.CONSTRUCTING;
            }
            , resume: function(){
                this.status = NSStatus.READY;
            }
            , onStart: function(fn){
                this._onStart = fn;
            }
            , onFinish: function(fn){
                this._onFinish = fn;
            }
            , onError: function(fn){
                this._onError = fn;
            }
            , beforeTask: function(fn){
                this._beforeTask = fn;
            }
            , afterTask: function(fn){
                this._afterTask = fn;
            }
        };
    };

    /*
    // Task Object
    //
    // Internally every Task is represented by it's own object.
    */ 
    var Task = function Task(){
        return {
              status: null
            , locked: false           
            , priority: null
            , namespace: null
            , fn: null
            , idx: null
        };
    };

    /*
    // TaskmanagerSingleton
    //
    // The task manager is a singleton that must be allocated only once in a lifetime. 
    // Therefore a createInstance() function will return the object.
    //
    // The Taskmanager has all functions to create a namespace, add a task to it and the
    // chains.
    // 
    // see the documentation and implementation details to get more information about how
    // to use the taskmanager in action.
    */
    var TaskmanagerSingleton = (function () {
    
        // a singleton instance of the Taskmanager
        var instance;
        
        // because this is done for backboneJS, the Taskmanager uses backbone events that
        // other modules and views can listen to it
        var event = moduleglobal.eventSystems;
        
        // Array of all active namespaces
        var namespaces = [];
        
        // Array of all active tasks
        var tasklist = [];
        
        // Creates a new instance of the TaskmanagerSingleton.
        function createInstance(eventsystem) {
            event = eventsystem;

            // dummy fn
            var fn = new function(){}();

            // is the taskmanager is running? The manager will stops working if the last 
            // task is finished executing. But the manager will starts working again if
            // a new namespace starts.          
            fn.isRunning = false; 
            
            // Predefined priority chains. It is possible to add more chains.
            fn.priority = {
                  'IMMEDIATELY':    0
                , 'FOREGROUND':     1
                , 'BACKGROUND':     2
            };
            
            /* 
             * Create a new namespace
             */
            fn.createNamespace = function(namespace){
                // should not be possible to create a second namespace with the same name
                cleanNamespaces();
                var isName = that._.findWhere(namespaces, {name: namespace});
                if(isName){
                    return Error('Namespace '+ namespace +' is already defined.');
                }
                
                // tell backbone that a new namespace will create
                event.trigger('taskmanager::namespace::willCreate', namespace);
                
                // Allocate a new namespace object and set the status
                var ns = new Namespace();
                ns._status = NSStatus.CONSTRUCTING;
                ns.name = namespace;
                
                // dynamic created computed properties for "status".
                // when the status of a namespace is changed, than tasks are related to 
                // that change, too. All business logic is done when the status changes
                // Also a few callback functions will triggered by a status change.
                Object.defineProperty(ns, "status", {
                    get: function(){
                        // just return the shadow property of the current status
                        return this._status;
                    },
                    set: function(val){
                        // set scope
                        var that = this;
                        // CONSTRUCTING -> READY (starts the namespace)
                        // if status change, change also tasks status!
                        if(this._status === NSStatus.CONSTRUCTING 
                            && val === NSStatus.READY){
                            var tasks = moduleglobal._.filter(tasklist, function(task){
                                return task.namespace == that;
                            });
                            // set task status
                            moduleglobal._.each(tasks, function(task){
                                if(task.status === TASKStatus.STAGE){
                                    task.status = TASKStatus.READY;
                                }
                            });
                            
                            if(fn.isRunning === false){
                                moduleglobal._.debounce(ExecutionLoop, 1)(); // enblock the chain
                            }
                        }
                        
                        // Trigger the Eventsystem
                        // execute onX-Functions
                        // READY -> RUNNING (onStart)
                        if(this._status === NSStatus.READY && val === NSStatus.RUNNING){
                            if(typeof this._onStart == 'function'){
                                this._onStart(this.data);
                            }                       
                        }
                        // RUNNING -> FINISHED (onFinish)
                        if(this._status === NSStatus.RUNNING && val === NSStatus.FINISHED){
                            if(typeof this._onFinish == 'function'){
                            	event.trigger('taskmanager::info::eventcount::willChange', tasklist.length);
                                this._onFinish(this.data);
                                event.trigger('taskmanager::info::eventcount::didChanged', tasklist.length);
                            }
                        }
                        // READY | RUNNING -> CONSTRUCTING (pause)
                        if((this._status === NSStatus.READY 
                            || this._status === NSStatus.RUNNING) 
                            && val === NSStatus.CONSTRUCTING) {
                            // all 🚀 in the namespace that are not ready, running or 
                            // launched must be staged again.
                            var tasks = moduleglobal._.filter(tasklist, function(task){
                                return task.namespace == that;
                            });
                            // set task status
                            moduleglobal._.each(tasks, function(task){
                                if(task.status === TASKStatus.READY){
                                    task.status = TASKStatus.STAGE;
                                }
                            });
                        }
                        
                        // set the shadow property to the new status
                        this._status = val;
                    }
                }); 
                
                // push the namespace to the global namespace array
                namespaces.push(ns);
                
                // tell backbone that the new namespace is created
                event.trigger('taskmanager::namespace::didCreated', namespace, ns);
                
                // returning the namespace to operate on it
                return ns;
            };
            
            /* 
             * Get a namespace object by its name
             * Sometimes you do not have the object from the returned value. You can get
             * it by name. This is convenient for filling a namespace in event-diven 
             * systems.
             */
            fn.getNamespace = function(namespace){
                cleanNamespaces();
                var ns = moduleglobal._.findWhere(namespaces, {name: namespace});
                return ns;
            };

            /* 
             * Get names of all current namespaces
             */         
            fn.listNamespaces = function(){
                cleanNamespaces();
                return moduleglobal._.map(namespaces, function(ns){ return ns.name; });
            };
            
            /*
             * Add a new task to a namespace. 
             * A namespace can be a string (name of the namespace) or a namespace object.
             * A optional priority chain can be set. 
             * The taskFn is a function with the envelope (scope, next). At the end of the
             * task it HAVE TO call next(err), otherwise the taskmanager hang.
             */
            fn.addTask = function(namespace, priority, taskFn){
                cleanNamespaces();
                
                var nsname = null; // when filled, start space after adding the task.
                if(typeof namespace === 'string'){
                    nsname = namespace;
                    namespace = this.getNamespace(namespace);
                    if(namespace == null){
                        // implizit create namespace
                        namespace = this.createNamespace(nsname);
                    } else {
                        nsname = null;  // reset to null if the ns is not created and must
                                        // not run automatically after task is added.
                    }
                }
                // swap variables if priority is not set.
                if(typeof priority === 'function' && taskFn == null){
                    taskFn = priority;
                    priority = this.priority.FOREGROUND; // default priority chain
                }
                
                event.trigger('taskmanager::task::willCreate', namespace.name, priority);
                
                // allocate a new task object
                var task = new Task();          
                task.status = TASKStatus.STAGE;
                task.priority = priority;
                task.namespace = namespace;
                task.fn = taskFn;
                task.idx = highestIndexInNamespace(namespace) +1;
                
                event.trigger('taskmanager::info::eventcount::willChange', tasklist.length);

                // increase the namespace counters
                task.namespace.count += 1;
                task.namespace.left += 1;
                
                // add task to global tasklist
                tasklist.push(task);

                event.trigger('taskmanager::task::didCreated', task);
                event.trigger('taskmanager::info::eventcount::didChanged', tasklist.length);

                // start when namespace is a single task and created implizit
                if(nsname !== null){
                    task.status = TASKStatus.READY;
                    namespace.start();
                }
                
                // returning the task object for further use
                return task;
            };
            
            /*
            //  Returns the count of tasks being in the global tasklist
            */
            fn.taskCount = function count(){
                cleanNamespaces();
                return tasklist.length;
            };
            
            // public functions
            return fn;
        }
        
        /*
        // cleanup namespaces without name. If a namespace get invalid, the name it's 
        // getting null. cleanNamespace will remove the namespaces and the associated tasks
        // from the global lists
        */
        function cleanNamespaces(){
            namespaces = that._.filter(namespaces, function(ns){ 
                if(ns.name == null){ ns = undefined; return false;}
                if(ns.status == NSStatus.FINISHED){ ns = undefined; return false;}
                if(ns.status == NSStatus.ABORTED){ ns = undefined; return false;}
                return ns.name != null; 
            });
            tasklist = that._.filter(
                  tasklist
                , function(task){ return task.namespace.name != null; });
        }
        
        /*
        // return the highest index number from tasks that are in a namespace
        // a new Task must be maxIndexNumber +1
        */
        function highestIndexInNamespace(namespace){
            if(typeof namespace !== 'string'){
                namespace = namespace.name;
            }
            var tasksinnamespace = that._.filter(tasklist, function(task){
                return task.namespace.name === namespace;
            });
            var max = that._.max(tasksinnamespace, function(task){ 
                if(task.namespace.name == namespace){
                    return task.idx;
                }
                return 0; 
            });
            max = max.idx;
            if(max == undefined){
                max = -1;
            }
            return max;
        }
        
        /*
        // ExecutionLoop
        //
        // This is the heard of the eventmanager. The ExecutionLoop executes all tasks 
        // in all namespaces in order of the logic: 
        //  - lower index before lower priority
        //  - lower priority first
        // It also handles task locks. 
        //
        // It will lopp as long as tasks are in the global list. When all tasks are done
        // it will stop the ExecutionLoop and the task manager.
        //
        */
        function ExecutionLoop(){
            if(tasklist.length <= 0){
                return;
            }
            
            // do never run without a instance
            if(!instance){
                return new Error("Can not run execution loop, because no instance is found");
            }

            // set the taskmanagers flag for active loop
            instance.isRunning = true;

            // the launchpad 🚀 is the array of task that will execute next.
            // the state of the task will go from READY to LAUNCH.
            var launchpad = Array(moduleglobal._.keys(instance.priority).length);
            launchpad = moduleglobal._.map(launchpad, function(position){ return null; });
            
            // Fn: load the launchpads free slots with new tasks
            var loadLaunchpad = function(){                                               // ! SIDEEFFECTS !
                for(var lot = 0; lot<launchpad.length; lot++){
                    if( launchpad[lot] == null ){
                        // get next task for priority-lot
                        launchpad[lot] = moduleglobal._.findWhere(tasklist, {                          // ! SIDEEFFECTS !
                              priority: lot
                            , status: TASKStatus.READY
                        });      
                        if(!launchpad[lot]){
                            continue;
                        } 
                        tasklist = moduleglobal._.without(tasklist, launchpad[lot]);                   // ! SIDEEFFECTS !
                        
                        // 🔒 should task be locked? 
                        if(launchpad[lot] 
                            && launchpad[lot].idx > launchpad[lot].namespace.lastidx +1){
                            launchpad[lot].locked = true;                                 // ! SIDEEFFECTS !
                        }
                        if(launchpad[lot]){
                            launchpad[lot].status = TASKStatus.LAUNCH;
                        }
                    } else {
                        // 🔓 recheck and release lock! 
                        if(launchpad[lot].idx <= launchpad[lot].namespace.lastidx +1){
                            launchpad[lot].locked = false;  
                        }
                    }
                }
            };
            // load the launchpads the first time
            loadLaunchpad();
            
            // Fn: swap the 🚀 on the launchpad with the next candidate in the priority 
            // chain
            var swapLaunchpad = function(lot){
                // check that the lot is present
                if(launchpad[lot] == null){
                    return;
                }
                
                // The 🚀 on the launchpads lot have to be in LAUNCH state
                if(launchpad[lot].status !== TASKStatus.LAUNCH){
                    return new Error("Status of task in lot "
                        + lot 
                        +" is not in LAUNCH state");
                }
                // release the states...
                launchpad[lot].status = TASKStatus.READY;
                launchpad[lot].locked = false;
                
                // park the task
                var parked = launchpad[lot];
                
                // get the next available 🚀 and bring it to the launchpad
                launchpad[lot] = moduleglobal._.findWhere(tasklist, {                                  // ! SIDEEFFECTS !
                      priority: lot
                    , status: TASKStatus.READY
                });

                // replace the copied task with the one from the launchpad
                for(var i=0; i<tasklist.length; i++){
                    if(tasklist[i] === launchpad[lot]){
                        tasklist[i] = parked;
                        break;  
                    }
                }
                
                // if its gone well, check the lock state.
                if(launchpad[lot]){
                    if(launchpad[lot].idx > launchpad[lot].namespace.lastidx +1){
                        launchpad[lot].locked = true;                                     // ! SIDEEFFECTS !
                    }
                    // and set the 🚀 to LAUNCH state.
                    launchpad[lot].status = TASKStatus.LAUNCH;
                }
            };
            
            /*
            // Fn: check for superlocks
            // Superlocks are present if all tasks on the launchpad are locked.
            */
            var isSuperlock = function(launchpad){
                var locks = moduleglobal._.pluck(launchpad, 'locked');
                var check = moduleglobal._.every(
                    locks
                    , function(locked){
                        if(locked === null || locked  === undefined){
                            return true;
                        }
                        return locked === true;
                    }
                );
                return check === true;
            };
            
            // check the current launchpad for superlocks and swap the tasks
            for(var lot = 0; lot < launchpad.length; lot++){
                if(isSuperlock(launchpad) == false){
                    break;
                }
                swapLaunchpad(lot);
            }
            
            /*
            // Execute next tasks. 
            */
            var executeNextTask = function(){
                if(instance.isRunning == false){
                    return;
                }
                // Check if the ExecutionLoop should end
                if(moduleglobal._.compact(launchpad).length === 0 
                    && moduleglobal._.compact(
                        moduleglobal._.where(
                              tasklist
                            , {status: TASKStatus.READY, locked: false}
                        )
                    ).length === 0){
                    instance.isRunning = false;
                    return;
                }
            
                // select only ready tasks
                var ready = moduleglobal._.filter(launchpad, function(task){
                    if(task == null){
                        return false;
                    }
                    return task.status === TASKStatus.LAUNCH
                        && task.locked === false;
                });
                
                // Rule: idx before priority!
                var minIdx = moduleglobal._.min(ready, function(task){
                    if(task == null){
                        return null;
                    }
                    return task.idx;
                });
                // get the tasks with the lowest prioriy
                var tasks = moduleglobal._.filter(ready, function(task){
                    return task.idx == minIdx.idx;
                });
                // task with priority is on slot 0 of the array. forget the rest for 
                // the moment, we'll come back later here.
                var executing = moduleglobal._.first(tasks);

                // check if the selection of the task works
                if(executing == null){
                    throw new Error('unresolved error: no executing task');
                }
                
                // set flags
                executing.namespace.status = NSStatus.RUNNING;
                executing.namespace.running += 1;
                executing.namespace.left -= 1;
                if(typeof executing.namespace._beforeTask === 'function'){
                    executing.namespace._beforeTask(executing.namespace.data, executing);
                }
                executing.status = TASKStatus.RUNNING;
                
                // Fn: Callback function to pass to the task.
                var next = function next(err){
                    // set task properties
                    if(err){
                        executing.status = TASKStatus.ERROR;
                        if(typeof executing.namespace._onError === 'function'){
                            executing.namespace._onError(err, executing);
                        }
                    } else {
                        executing.status = TASKStatus.FINISHED;
                    }
                    
                    if(typeof executing.namespace._afterTask === 'function'){
                        executing.namespace._afterTask(executing.namespace.data, executing);
                    }
                    
                    executing.namespace.lastidx = executing.idx;
                    
                    // set namespace properties
                    executing.namespace.running -= 1;
                    if(executing.namespace.running == 0 && executing.namespace.left == 0){
                        // recheck tasks!
                        var tasksfornamespace = moduleglobal._.filter(tasklist, function(task){
                            return task.namespace === executing.namespace;
                        });
                        if(tasksfornamespace.length == 0){
                            executing.namespace.status = NSStatus.FINISHED;
                        }
                    }
                    
                    // remove the task from launchpad 
                    launchpad = moduleglobal._.map(launchpad, function(task){                          // ! SIDEEFFECTS !
                        if(task === executing){
                            return null;
                        }
                        return task || null;
                    });                 
                    
                    // load, check, run
                    loadLaunchpad();
                    for(var lot = 0; lot < launchpad.length; lot++){
                        if(isSuperlock(launchpad) == false){
                            break;
                        }
                        swapLaunchpad(lot);
                    }
                    moduleglobal._.debounce(executeNextTask(), 10);
                    
                };

                // 🚀 
                try {
                    executing.fn(executing.namespace.data, next);
                } catch(err) {
                    next(err);
                }
                
            };

            // execute the first lauchpad
            event.trigger('taskmanager::info::eventcount::willChange', tasklist.length);
            moduleglobal._(moduleglobal._.compact(launchpad).length).times(
                executeNextTask
            );
            
            instance.isRunning = false;
            event.trigger('taskmanager::info::eventcount::didChanged', tasklist.length);
        }
 
        /*
        // public interface
        */
        return {
            getInstance: function (esystem) {
                moduleglobal.eventSystems = esystem;
                if (!instance) {
                    instance = createInstance(esystem);
                    
//                  var taskmanagerView = new TaskmanagerView({
// 
//                  });
                    
                }
                return instance;
            }
        };
        
    })();
        
    /**
     * Returns an instance of the manager
     *
     * @returns {object}
     */
    if (typeof define === 'function' && define.amd) {
        define('launchpad', ['underscore', 'eventSystemWrapper'], function(_, eventSystems) {
            that._ = _;
            that.eventSystems = eventSystems;
            return TaskmanagerSingleton.getInstance(that.eventSystems);
        });
    } else {
        return module.exports = function(_, eventSystems){
            that._ = _;
            that.eventSystems = eventSystems;
            return TaskmanagerSingleton.getInstance(that.eventSystems);
        }
    }
}.call(this)));
