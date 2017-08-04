

module.exports = function(grunt) {
    var conf = {
        buildDir: 'build',
        targetDir: 'target',
        tmpDir: 'tmp',
        distDir: 'dist'
    };
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // create empty target dirs
        mkdir: {
            all: {
                options: {
                    create: [conf.buildDir, conf.targetDir, conf.tmpDir, conf.distDir]
                }
            }
        },
        
        clean: {
            all: {
                src: [conf.buildDir, conf.targetDir, conf.tmpDir]
            },
            
            build: {
                src: [conf.buildDir]
            },
            
            dist: {
                src: [
                      conf.buildDir
                    , conf.targetDir
                    , conf.distDir
                    , conf.tmpDir
                    , './components'
                    , './node_modules'
                ]
            }
        },      

        requirejs: {
            compile: {
                options: {
                    baseUrl: 'src',
                    mainConfigFile: 'config.js',
                    include: [
                          '../components/requirejs/require.js'
                        , 'launchpad'
                        , 'eventSystemWrapper'
                        , 'nodeevent'
                    ],
                    out: conf.buildDir +'/launchpad.js',
                    optimize: "none",
                    stubModules: ['backbone', 'jquery', 'underscore'],
                    skipModuleInsertion: true
                }
            }
        },
        
        replace: {
            build: {
                src: [conf.buildDir +'/launchpad.js'],
                dest: conf.buildDir +'/launchpad.js',
                replacements: [{
                    from: 'define(\'underscore\',{});',
                    to: ''
                },{
                    from: 'define(\'jquery\',{});',
                    to: ''
                },{
                    from: 'define(\'backbone\',{});',
                    to: ''
                }]
            }
        },  
    
        uglify: {
            options: {

            },
            dist: {
                src: conf.buildDir +'/launchpad.js',
                dest: conf.targetDir +'/launchpad.min.js'
            }
        },
        
        eslint: {
            target: [
                    'src/launchpad.js'
                  , 'src/eventSystemWrapper.js'
                  , 'src/nodeevent.js'
            ],
            options: {
                outputFile: 'tmp/checkstyle.xml',
                format: 'checkstyle'
            }       
        },
        
        copyto: {
            target: {
                files: [
                    {
                        cwd: conf.targetDir,
                        src: [
                             'launchpad.min.js'
                        ]
                        , dest: conf.distDir + '/'
                        , expand: true
                    }
                ]
            },
            build: {
                files: [
                    {
                        cwd: conf.buildDir,
                        src: [
                             'launchpad.js'
                        ]
                        , dest: conf.distDir + '/'
                        , expand: true
                    }
                ]
            }
            
        }        
    });

    require('load-grunt-tasks')(grunt);
    
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-copy-to');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.registerTask('default', [
          'clean:build'
        , 'mkdir'
        , 'eslint'
        , 'requirejs'
        , 'replace'
        , 'uglify'
        , 'copyto'
        , 'clean:build'
    ]);
};
