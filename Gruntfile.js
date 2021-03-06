/*
 * grunt-svn-workflow
 * http://gruntjs.com/
 *
 * Copyright (c) 2014 Tony Liang [pillar0514@gmail.com]
 * Licensed under the MIT license.
 */
var $path = require('path');
var $readline = require('readline');
var $tools = require('./utils/tools');

module.exports = function(grunt) {

	//test svn account:
	//id : svn_workflow@sina.cn
	//password : test123

	var timeStamp = Date.now();

	grunt.initConfig({
		projectDir : $path.resolve(__dirname, 'test'),
		timeStamp : timeStamp,
		jshint: {
			all: [
				'Gruntfile.js',
				'tasks/**/*.js',
				'<%= nodeunit.svnConfig %>'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		confirm : {
			distribute : {
				msg : 'publish ?'
			}
		},
		svnConfig : {
			// 项目 svn 根目录
			project : 'https://svn.sinaapp.com/gruntsvnworkflow/1/svn-workflow/',
			// 如果配置项是一个对象，则通过 from, to 获取 svn 根路径
			test : {
				// 用于获取 svn 根路径的本地 svn 目录
				from : $path.resolve(__dirname, 'test/test/base'),
				// 最终我们需要定位的 svn 路径与本地 svn 目录 svn 路径的相对路径
				to : '../'
			},
			fn : {
				// 用于获取 svn 根路径的本地 svn 目录
				from : $path.resolve(__dirname, 'test/test/base'),
				// 最终我们需要定位的 svn 路径与本地 svn 目录 svn 路径的相对路径
				to : function(url){
					return url.replace(/base$/, '');
				}
			}
		},
		svnInit : {
			options : {
				// 用于存放创建目录临时文件的本地路径
				cwd: '<%=projectDir%>/test',
				// 需要进行初始化的目标 svn 路径
				repository: '<%=svnConfig.test%>'
			},
			test : {
				// 需要进行初始化的目标 svn 路径，这里的 repository 属性会覆盖 options 对应属性
				repository: '<%=svnConfig.project%>/test',
				// 根据这个 map 对象来创建初始化文件夹
				map : {
					'svninit' : {
						'inner' : 'folder'
					}
				}
			}
		},
		svnCheckout : {
			options : {
				// 本地根目录
				cwd: '<%=projectDir%>',
				// svn 根路径
				repository: '<%=svnConfig.project%>'
			},
			test : {
				// 子选项与 options 同名的选项会覆盖 options 提供的选项
				repository : '<%=svnConfig.test%>',
				// 根据这个 map 对象来检出目录
				// 均为 key : value 格式
				// key 为相对于本地根目录的相对路径
				// value 为相对于 svn 跟路径的相对路径
				map : {
					'test/checkout' : 'checkout'
				}
			}
		},
		svnCommit : {
			options : {
				// 用于提交文件的本地路径根目录
				cwd: '<%=projectDir%>',
				// 用于提交文件的 svn 跟路径
				repository: '<%=svnConfig.test%>'
			},
			test_normal : {
				// 提交问件时填充的日志
				log : '<%=timeStamp%>_normal',
				// 相对于 svn 跟路径的相对路径
				svn : 'commit/normal',
				// 相对于本地根目录的相对目录，用于提交的文件存储在这里
				src : 'test/commit/normal'
			},
			test_log_from_fn : {
				// 提交问件时填充的日志可以是一个函数的返回值
				log : function(){
					return 'svncommit_timestamp_' + timeStamp + '_fn';
				},
				svn : 'commit/fn',
				src : 'test/commit/fn'
			},
			test_log_from_svn : {
				// 如果用中括号包裹，可以提供一个相对于 svn 根路径的相对路径
				// 该目标 svn 路径的日志将会被复制作为提交日志
				// 如果地址不是绝对路径，则自动根据 repository 属性计算 svn 路径
				// 仅复制大于提交 svn 路径当前版本号的日志
				log : '[commit/fn]',
				svn : 'commit/svn',
				src : 'test/commit/svn'
			},
			test_log_from_ask : {
				// 如果希望人工填入日志，log 属性中需要存在 {ask}
				question : 'Input the custom log for svnCommit:test_log_from_ask',
				log : '<%=timeStamp%>_{ask}',
				svn : 'commit/ask',
				src : 'test/commit/ask'
			}
		},
		svnCopy : {
			options : {
				repository: '<%=svnConfig.test%>'
			},
			test_normal : {
				from : 'commit/normal',
				to : 'copy'
			},
			test_fn : {
				from : 'commit/normal',
				to : 'copy',
				rename : function(info){
					grunt.verbose.writeln('svnCopy:test_fn rename fn get para:', info);
					return 'svncopy_timestamp_' + timeStamp + '_fn';
				}
			},
			test_tpl : {
				from : 'commit/normal',
				to : 'copy',
				rename : '<%=timeStamp%>_{name}_{revision}'
			},
			test_ask : {
				from : 'commit/normal',
				to : 'copy',
				question : 'Input the branch name:',
				rename : '<%=timeStamp%>_{ask}'
			},
			test_fnask : {
				from : 'commit/normal',
				to : 'copy',
				question : 'Input the branch_fn name:',
				rename : function(info){
					return timeStamp + '_fn_{ask}';
				}
			}
		},
		testResult : true,
		nodeunit: {
			result : ['test/test_result.js'],
			grunt : ['test/grunt_test.js'],
			svnConfig: ['test/svnConfig_test.js'],
			svnInit : ['test/svnInit_test.js'],
			svnCheckout : ['test/svnCheckout_test.js'],
			svnCommit : ['test/svnCommit_test.js'],
			svnCopy : ['test/svnCopy_test.js']
		}
	});

	// Actually load this plugin's task(s).
	grunt.loadTasks('tasks');

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');

	//unit test for svnConfig
	grunt.registerTask(
		'svn-test-svnConfig-prepare',
		'svn-test-svnConfig-prepare',
		function(){
			var done = this.async();
			var srcPath = $path.resolve('./test/test/base/');
			var svnPath = $tools.join(
				grunt.config.get('svnConfig.project'),
				'test/base'
			);

			grunt.file.delete(srcPath);

			grunt.util.spawn({
				cmd : 'svn',
				args : ['checkout', svnPath, srcPath],
				opts : {
					stdio : 'inherit'
				}
			}, function(error, result, code){
				done();
			});
		}
	);

	grunt.registerTask('svn-test-svnConfig', [
		'svn-test-svnConfig-prepare',
		'svnConfig',
		'nodeunit:svnConfig'
	]);

	//unit test for svnCheckout
	grunt.registerTask(
		'svn-test-svnCheckout-prepare', 
		'svn-test-svnCheckout-prepare',
		function(){
			var folderPath = $path.resolve('./test/test/checkout/');
			grunt.file.delete(folderPath);
		}
	);

	grunt.registerTask('svn-test-svnCheckout', [
		'svnConfig',
		'svn-test-svnCheckout-prepare',
		'svnCheckout:test',
		'nodeunit:svnCheckout'
	]);

	//unit test for svnInit
	grunt.registerTask(
		'svn-test-svnInit-prepare', 
		'svn-test-svnInit-prepare',
		function(){
			var done = this.async();
			var path = 'test/svninit';
			var svnPath = $tools.join(grunt.config.get('svnConfig.project'), 'test/svninit');
			grunt.verbose.writeln('svn delete ' + svnPath + ' -m "delete ' + path + '"');
			grunt.util.spawn({
				cmd: 'svn',
				args: ['delete', svnPath, '-m', '"delete ' + path + '"'],
				opts : {
					stdio : 'inherit'
				}
			}, function(err, result, code){
				grunt.verbose.writeln('The svn path: "' + svnPath + '" has been deleted!');
				done();
			});
		}
	);

	grunt.registerTask('svn-test-svnInit', [
		'svnConfig',
		'svn-test-svnInit-prepare',
		'svnInit:test',
		'nodeunit:svnInit'
	]);

	//unit test for svnCommit
	grunt.registerTask(
		'svn-test-svnCommit-prepare', 
		'svn-test-svnCommit-prepare',
		function(){
			var done = this.async();

			var srcPath = $path.resolve('./test/test/commit/');
			var svnPath = $tools.join(
				grunt.config.get('svnCommit.options.repository'),
				'commit'
			);

			grunt.util.spawn({
				cmd : 'svn',
				args : ['checkout', svnPath, srcPath]
			}, function(error, result, code){
				['ask', 'fn', 'svn', 'normal'].forEach(function(dir){
					var targetPath = $path.join(srcPath, dir, 'demo.js');
					grunt.file.write(targetPath, timeStamp);
				});
				done();
			});
		}
	);

	grunt.registerTask('svn-test-svnCommit', [
		'svnConfig',
		'svn-test-svnCommit-prepare',
		'svnCommit',
		'nodeunit:svnCommit'
	]);

	//unit test for svnCopy
	grunt.registerTask(
		'svn-test-svnCopy-prepare', 
		'svn-test-svnCopy-prepare',
		function(){
			var done = this.async();
			var path = 'test/copy';
			var svnPath = grunt.config.get('svnConfig.project') + 'test/copy';
			grunt.verbose.writeln('svn delete ' + svnPath + ' -m "delete ' + path + '"');
			grunt.util.spawn({
				cmd: 'svn',
				args: ['delete', svnPath, '-m', '"delete ' + path + '"'],
				opts : {
					stdio : 'inherit'
				}
			}, function(err, result, code){
				grunt.verbose.writeln('The svn path: "' + svnPath + '" has been deleted!');
				done();
			});
		}
	);

	grunt.registerTask('svn-test-svnCopy', [
		'svnConfig',
		'svn-test-svnCopy-prepare',
		'svnCopy',
		'nodeunit:svnCopy'
	]);

	// Get test result step by step.
	grunt.registerTask('svn-test', [
		'jshint',
		'svn-test-svnConfig',
		'svn-test-svnInit',
		'svn-test-svnCheckout',
		'svn-test-svnCommit',
		'svn-test-svnCopy'
	]);

	var testOutputFile = $path.resolve('./test/test/result.js');

	grunt.registerTask(
		'svn-test-spawn', 
		'svn-test-spawn',
		function(){
			var done = this.async();

			var args = ['svn-test'];
			if(grunt.option('verbose')){
				args.push('--verbose');
			}
			var sp = grunt.util.spawn({
				cmd : 'grunt',
				grunt : true,
				args : args
			}, function(error, result, code){
				done();
			});

			var spawnTSCommit = '';
			var spawnTSCopy = '';

			grunt.file.write(testOutputFile, 'assertions passed');

			sp.stdout.on('data', function(data){
				var msg = data.toString().trim();
				console.log('> ' + msg);

				(function(){
					var rs = (/svncommit_timestamp_(\d+)_fn/).exec(msg);
					if(rs && rs[1]){
						spawnTSCommit = rs[1];
						spawnTSCopy = rs[1];
					}
				})();

				(function(){
					var rs = (/svncopy_timestamp_(\d+)_fn/).exec(msg);
					if(rs && rs[1]){
						spawnTSCopy = rs[1];
					}
				})();

				(function(){
					var regRevision = (/^task\ssvnCopy\:test_fn\sprevious\s+revision\s+is\s+(\d+)$/i);
					var rs = regRevision.exec(msg);
					if(rs && rs[1]){
						var outputFile = $path.resolve('./test/test/copy_revision.js');
						grunt.file.write(outputFile, rs[1]);
					}
				})();

				if(msg.indexOf('Input the custom log for svnCommit:test_log_from_ask') >= 0){
					spawnTSCommit = spawnTSCommit || timeStamp;
					sp.stdin.write(spawnTSCommit + '_ask\n');
				}

				if(msg.indexOf('Input the branch name:') >= 0){
					spawnTSCopy = spawnTSCopy || timeStamp;
					sp.stdin.write(spawnTSCopy + '_ask\n');
				}

				if(msg.indexOf('Input the branch_fn name:') >= 0){
					spawnTSCopy = spawnTSCopy || timeStamp;
					sp.stdin.write(spawnTSCopy + '_ask\n');
				}

				if(msg.indexOf('assertions failed') >= 0 || msg.indexOf('Fatal error') >= 0){
					grunt.config.set('testResult', false);
					grunt.file.write(testOutputFile, 'assertions failed');
				}
			});
		}
	);

	grunt.registerTask('test', [
		'svn-test-svnConfig-prepare',
		'svn-test-spawn'
	]);

	grunt.registerTask('test-result', [
		'nodeunit:result'
	]);

	// By default, lint and run all tests.
	grunt.registerTask('default', [
		'test-result'
	]);

};


