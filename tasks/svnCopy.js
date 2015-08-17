var $tools = require('../utils/tools');
var $cmdSeries = require('../utils/cmdSeries');
var $askFor = require('ask-for');

module.exports = function(grunt){

	var $async = grunt.util.async;

	grunt.registerMultiTask(
		'svnCopy',
		'Copy svn folders',
		function(){
			var done = this.async();
			var conf = this.options();
			var data = this.data;
			var target = this.target;

			var title = 'task svnCopy' + (target ? ':' + target : '');

			var options = Object.keys(conf).reduce(function(obj, key){
				obj[key] = data[key] || conf[key] || '';
				return obj;
			}, {});

			this.requires(['svnConfig']);

			var regHttpPrev = (/^http\w*\:\/\//);
			var pathFrom = regHttpPrev.test(data.from) ? data.from : $tools.join(options.repository, data.from);
			var pathTo = regHttpPrev.test(data.to) ? data.to : $tools.join(options.repository, data.to);

			var copyLogs = [];
			copyLogs.push('Copy from ' + pathFrom);
			
			var folderName = pathFrom.split(/[\/\\]+/).pop();
			var rename = data.rename || '';
			var regBrace = (/\{([^\{\}]+)\}/g);

			var jobs = [];
			var info = {};
			info.name = folderName;

			jobs.push(function(callback){

				var commands = [];

				commands.push({
					cmd : 'svn',
					args : ['info', pathTo]
				});

				// If pathTo not exists, create it
				commands.push(function(error, result, code){
					var json = result.stdout.split(/\n/g).reduce(function(obj, str){
						var index = str.indexOf(':');
						var key = str.substr(0, index).trim().toLowerCase();
						var value = str.substr(index + 1).trim();
						obj[key] = value;
						return obj;
					}, {});

					var cmd = {};

					if(json.url){
						cmd = {
							cmd : 'echo',
							args : ['Check svn path exists.']
						};
					}else{
						grunt.log.writeln('The svn path', pathTo, 'not exist. ');
						grunt.log.writeln('Auto create svn path', pathTo, '.');
						cmd.cmd = 'svn';
						cmd.args = [
							'mkdir',
							pathTo,
							'--parents',
							'-m',
							'Create svn path by ' + title
						];
						cmd.opts = {
							stdio : 'inherit'
						};
					}

					return cmd;
				});

				// Get log from last revision for pathFrom
				commands.push(function(error, result, code){
					if(error){
						grunt.log.errorlns(error).error();
						grunt.fatal([title, 'get svn path', pathTo, 'error!'].join(' '));
					}else{
						grunt.log.writeln('Get log from', pathFrom);
					}
					return {
						cmd : 'svn',
						args : ['log', pathFrom, '-l', '1', '--xml']
					};
				});

				// Get log and revision from CLI
				$cmdSeries(grunt, commands, {
					complete : function(error, result, code){
						if(error){
							grunt.log.errorlns(error).error();
							grunt.fatal([title, 'get prev revision error!'].join(' '));
						}else{
							// Get revision
							var revision = '';
							var vRegResult = (/revision="(\d+)"/).exec(result.stdout);
							if(vRegResult && vRegResult[1]){
								revision = vRegResult[1];
							}
							if(revision){
								grunt.log.writeln('Prev revision is ' + revision);
								info.revision = revision;
							}else{
								grunt.fatal('Can not get prev revision');
							}

							copyLogs.push('revision : ' + revision);

							// Get log
							var log = '';
							var logReg = (/<msg>([\w\W]*?)<\/msg>/g);
							var logRegResult = logReg.exec(result.stdout);
							if(logRegResult && logRegResult[1]){
								log = logRegResult[1];
							}

							if(log){
								log = log.replace(/\r\n/g, '\n');
							}else{
								log = 'Copy by ' + title;
							}

							copyLogs.push(log);
						}

						callback();
					}
				});

			});

			var braceResults = (function(){
				var results = [];
				var result;
				while((result = regBrace.exec(data.rename)) && result[1]){
					results.push(result[1]);
				}
				return results;
			})();

			if(braceResults.indexOf('ask') >= 0){
				jobs.push(function(callback){
					var question = data.question || 'Input message for task svnCopy:' + target + '\n';
					$askFor([question], function(spec) {
						info.ask = spec[question];
						callback();
					});
				});
			}

			jobs.push(function(callback){
				var strLog = copyLogs.join('\n');
				if(!rename){
					rename = info.revision;
				}else{
					rename = $tools.substitute(rename, info);
				}
				grunt.log.writeln('Rename the copy folder:');
				grunt.log.writeln(rename);

				var commands = [];

				var targetPath = $tools.join(pathTo, rename);
				grunt.log.writeln(['svn copy', pathFrom, targetPath].join(' '));

				// Copy svn folder
				commands.push({
					cmd : 'svn',
					args : ['copy', pathFrom, targetPath, '-m', strLog],
					opts : {
						stdio : 'inherit'
					}
				});

				$cmdSeries(grunt, commands, {
					complete : function(error, result, code){
						if(error){
							grunt.log.errorlns(error).error();
							grunt.fatal([title, 'copy svn folder error!'].join(' '));
						}
						callback();
					}
				});

			});

			$async.series(jobs, function(){
				grunt.log.ok(title, 'completed.');
				done();
			});
		}
	);
};
