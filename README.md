#grunt-svn-workflow

[![Build Status: Linux](https://travis-ci.org/Esoul/grunt-svn-workflow.svg?branch=master)](https://travis-ci.org/Esoul/grunt-svn-workflow)
[![dependencies](https://david-dm.org/Esoul/grunt-svn-workflow.png)](http://david-dm.org/Esoul/grunt-svn-workflow)
[![NPM version](http://img.shields.io/npm/v/grunt-svn-workflow.svg)](https://www.npmjs.org/package/grunt-svn-workflow)

>用于实现跨平台的 SVN 操作自动化流程

帮助改进 SVN 目录操作的自动化流程。

example 目录给出了一个基于 SVN 项目的简单管理流程。

发布任务能够从一个 SVN 路径复制从上次打包到当前版本的日志，作为最新发布代码的日志。

在任务队列中可以设置一个提示作为中断任务的选择。

## For

用于管理那些还需要在 SVN 进行管理的项目。

## Prepare

安装 node, npm 环境。

确保 SVN 版本 >= 1.6 。

需要安装 SVN CLI, 设置语言版本为 english 。(Tortoise  SVN 安装时提供了同时安装 CLI 的选项)

## Quick Start

0. 登录 svn 仓库，为你的项目创建一个 svn 目录。

0. 在项目 svn 目录里面创建一个 tools 目录。

0. 在本地建立一个目录，用于部署你的项目。__注意：这个目录不能是 svn 目录。__

0. 将 tools 目录检出到本地项目目录中。

0. 将 example/tools 下的文件复制到你的项目目录中的 tools 文件夹下。
> 假设你的项目名称为 svn-workflow ，那么你此时的本地项目目录结构如图所示：
>
>![image](https://cloud.githubusercontent.com/assets/550449/5297160/0b58853c-7be7-11e4-888f-a6a567e61445.png)

0. 安装项目依赖的 npm 包，运行：
> 
> ```shell
> npm install -d
> ```



## Getting Started

1. 这个插件要求使用 Grunt `~0.4.0`
> 如果你还未使用过 [Grunt](http://gruntjs.com/)，请查阅 Grunt 说明：[Getting Started](http://gruntjs.com/getting-started)，这里解释了如何创建一个 [Gruntfile](http://gruntjs.com/sample-gruntfile) 以及如何安装和使用 grunt 插件。当你熟悉了这个流程，用这个命令来安装这个插件：
> 
> ```shell
> npm install grunt-svn-workflow --save-dev
> ```

1. 插件安装后，需要用这行 javascript 代码来启用插件：
> 
> ```js
> grunt.loadNpmTasks('grunt-svn-workflow');
> ```

1. 请参考示例文件来配置你的任务文件，也可以直接复制任务配置作为项目模板。


## svnConfig multitask
__用于配置 svn 根路径。如果是从本地 svn 路径来获取项目 svn 根路径，则其他任务执行前都需要先执行 `svnConfig` 任务。__

#### Task name type: `String`
Type: `String`
Default: `''`

如果不提供选项对象，只填写一个字符串，则此字符串直接作为项目的 svn 根路径。

__examples__

```js
grunt.initConfig({
	svnConfig : {
		project : 'https://svn.sinaapp.com/gruntsvnworkflow/1/svn-workflow/'
	}
});
```

#### from
Type: `String`

用于获取 svn 根路径的本地 svn 目录。

#### to
Type: `String`

最终我们需要定位的 svn 路径与本地目录 svn 路径的相对路径。

### Usage examples
```js
var $path = require('path');
grunt.initConfig({
	svnConfig : {
		project : {
			from : $path.resolve(__dirname, 'test/test/base'),
			to : '../'
		}
	}
});
```
假设本地目录 'test/test/base' 是一个 svn 目录，对应的 svn 目录是


## svnInit task
__Run this task with the `grunt svnInit` command.__

#### options.repository
Type: `String`

The repository url of project.

#### options.cwd
Type: `String`

The local path of the project.

#### map
Type: `Object`

Describe the SVN directory structure.

### Usage examples
```js
var path = require('path');

grunt.initConfig({
	svnConfig : {
		// Project svn repository path.
		repository : 'auto',
		// Project deploy path.
		projectDir : path.resolve(__dirname, '../'),
		// Project gruntfile directory.
		taskDir : 'tools'
	},
	svnInit : {
		options : {
			repository: '<%=svnConfig.repository%>',
			cwd: '<%=svnConfig.projectDir%>'
		},
		// Build pathes according to the map.
		map : {
			'dev' : {
				'branches' : 'folder',
				'tags' : 'folder',
				'trunk' : {
					'html' : 'folder',
					'css' : 'folder',
					'js' : 'folder'
				}
			},
			'online' : {
				'tags' : 'folder',
				'trunk' : 'folder'
			}
		}
	}
});
```
If you run the task : `grunt svnInit`, you will get the directory structure like this:

![image](https://cloud.githubusercontent.com/assets/550449/5297204/6d00973e-7be7-11e4-9dcb-08e3e07247ab.png)

## svnCheckout multitask
_Set your checkout options, then put the task in where you want._

#### options.repository
Type: `String`

The repository url of project.

#### options.cwd
Type: `String`

The local path of the project.

#### map
Type: `Object`

Describe the SVN directory mapping relationship with the local path.

### Usage examples
```js
var path = require('path');

grunt.initConfig({
	svnConfig : {
		// Project svn repository path.
		repository : 'auto',
		// Project deploy path.
		projectDir : path.resolve(__dirname, '../'),
		// Project gruntfile directory.
		taskDir : 'tools'
	},
	svnCheckout : {
		options : {
			repository: '<%=svnConfig.repository%>',
			cwd: '<%=svnConfig.projectDir%>'
		},
		deploy : {
			map : {
				'trunk' : 'dev/trunk',
				'dist' : 'online/trunk'
			}
		}
	}
});
```

## svnCommit multitask
_Set your commit options, then put the task in where you want._

#### options.repository
Type: `String`

The repository url of project.

#### options.cwd
Type: `String`

The local path of the project.

#### log
Type: `String` | `Function`

The commit log. Can be a function that return a log string.

#### logResource
Type: `String`

The commit task can copy logs from a svn path.
It's a relative path, will disable the "log" options.

#### svn
Type: `String`

SVN relative path to be commited.

#### src
Type: `String`

Local relative path to be commited.

### Usage examples
```js
var path = require('path');

grunt.initConfig({
	svnConfig : {
		// Project svn repository path.
		repository : 'auto',
		// Project deploy path.
		projectDir : path.resolve(__dirname, '../'),
		// Project gruntfile directory.
		taskDir : 'tools'
	},
	svnCommit : {
		options : {
			repository: '<%=svnConfig.repository%>',
			cwd: '<%=svnConfig.projectDir%>'
		},
		withoutLog : {
			svn : 'online/trunk',
			src : 'trunk'
		},
		useStrLog : {
			log : 'custom log.'
			svn : 'online/trunk',
			src : 'trunk'
		},
		useFunction : {
			log : function(){
				return 'custom log ' + Date.now();
			},
			svn : 'online/trunk',
			src : 'trunk'
		},
		online : {
			logResource : 'dev/trunk',
			svn : 'online/trunk',
			src : 'tools/temp/online'
		}
	}
});
```

## svnTag multitask
_Set your tag options, then put the task in where you want._

#### options.repository
Type: `String`

The repository url of project.

#### options.cwd
Type: `String`

The local path of the project.

#### dev
Type: `String`

Local relative path for development.

#### devSvn
Type: `String`

Repository relative url for development.

#### devTag
Type: `String`

Tag repository relative url for development.

#### online
Type: `String`

Local relative path for publishing.

#### onlineSvn
Type: `String`

Repository relative url for publishing.

#### onlineTag
Type: `String`

Tag repository relative url for publishing.

### Usage examples
```js
var path = require('path');

grunt.initConfig({
	svnConfig : {
		// Project svn repository path.
		repository : 'auto',
		// Project deploy path.
		projectDir : path.resolve(__dirname, '../'),
		// Project gruntfile directory.
		taskDir : 'tools'
	},
	svnTag : {
		options : {
			repository: '<%=svnConfig.repository%>',
			cwd: '<%=svnConfig.projectDir%>'
		},
		common : {
			dev : 'tools/temp/trunk',
			devSvn : 'dev/trunk',
			devTag : 'dev/tags',
			online : 'tools/temp/online',
			onlineSvn : 'online/trunk',
			onlineTag : 'online/tags'
		}
	}
});
```

## confirm multitask
_Create a simple task and put it in the task queue, to generate a confirm prompt in the running task._

#### msg
Type: `String`

The message of prompts.

### Usage examples
```js
grunt.initConfig({
	confirm : {
		distribute : {
			msg : 'publish ?'
		}
	}
});
```

## example

The full gruntfile example:

```js
var path = require('path');

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Clean files for example publish.
		clean: {
			beforePublish: [
				'temp'
			]
		},
		// Copy files for example publish.
		copy: {
			forPublish: {
				expand : true,
				cwd : 'temp/trunk/',
				src : '**/*',
				dest : 'temp/online/'
			}
		},
		confirm : {
			distribute : {
				msg : 'publish ?'
			}
		},
		svnConfig : {
			// Project svn repository path.
			repository : 'auto',
			// Project deploy path.
			projectDir : path.resolve(__dirname, '../'),
			// Project gruntfile directory.
			taskDir : 'tools'
		},
		svnInit : {
			options : {
				repository: '<%=svnConfig.repository%>',
				cwd: '<%=svnConfig.projectDir%>'
			},
			// Build pathes according to the map.
			map : {
				'dev' : {
					'branches' : 'folder',
					'tags' : 'folder',
					'trunk' : {
						'html' : 'folder',
						'css' : 'folder',
						'js' : 'folder'
					}
				},
				'online' : {
					'tags' : 'folder',
					'trunk' : 'folder'
				}
			}
		},
		svnCheckout : {
			options : {
				repository: '<%=svnConfig.repository%>',
				cwd: '<%=svnConfig.projectDir%>'
			},
			deploy : {
				map : {
					'trunk' : 'dev/trunk',
					'dist' : 'online/trunk'
				}
			},
			prepare : {
				map : {
					'tools/temp/online':'online/trunk',
					'tools/temp/trunk' : 'dev/trunk'
				}
			}
		},
		svnCommit : {
			options : {
				repository: '<%=svnConfig.repository%>',
				cwd: '<%=svnConfig.projectDir%>'
			},
			online : {
				logResource : 'dev/trunk',
				svn : 'online/trunk',
				src : 'tools/temp/online'
			}
		},
		svnTag : {
			options : {
				repository: '<%=svnConfig.repository%>',
				cwd: '<%=svnConfig.projectDir%>'
			},
			common : {
				dev : 'tools/temp/trunk',
				devSvn : 'dev/trunk',
				devTag : 'dev/tags',
				online : 'tools/temp/online',
				onlineSvn : 'online/trunk',
				onlineTag : 'online/tags'
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-svn-workflow');

	grunt.registerTask(
		'deploy',
		'Checkout the workingcopy according to the folder map.',
		[
			'svnConfig',
			'svnCheckout:deploy'
		]
	);

	grunt.registerTask(
		'publish',
		'Pack and compress files, then distribute.',
		[
			'clean:beforePublish',
			'svnConfig',
			'svnCheckout:prepare',

			//Add your other tasks here, such as copy, uglify, clean and so on.
			'copy:forPublish',

			'confirm:distribute',
			'svnCommit:online',
			'svnTag'
		]
	);

	// By default, deploy the workingcopy.
	grunt.registerTask('default', [
		'deploy'
	]);

};

```

## Release History

 * 2015-08-18   v0.2.0   重大更新，移除 svnTag 任务，添加 svnCopy 任务，更新各个任务使用方式
 * 2015-04-01   v0.1.2   为 svnCommit 任务添加 log 选项
 * 2014-12-09   v0.1.1   解决任务执行时会发生偶然的报错的问题
 * 2014-12-04   v0.1.0   发布第一个正式版本，基于Grunt 0.4.0




