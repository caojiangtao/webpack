const webpack = require('webpack');
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const production = process.env.NODE_ENV === 'production';
const CleanPlugin = require('clean-webpack-plugin');
const autoprefixer = require('autoprefixer');


//生成新页面
var creatHtml =(name)=>{
	var newHtml = new HtmlWebpackPlugin({                        //根据模板插入css/js等生成最终HTML
	  	title:"TalkingBrain",
//	    favicon: './src/img/favicon.ico', //favicon路径
	   	filename:path.resolve(__dirname,'web/'+name+'.html'),    //生成的html存放路径，相对于 path
		template:'build/src/'+name+'.html',    //html模板路径
	    inject:true,    //允许插件修改哪些内容，包括head与body
	    cache:false,//false，如果为 true, 这是默认值，仅仅在文件修改之后才会发布文件。
		showErrors:true,//是否显示错误, 
		chunks:[name],//要注入的js入口 ,
		excludeChunks: ['dev-helper'],//排查不需要注入的模块
		xhtml:true,//是否自动毕业标签 默认false  
	    hash: production?true:false,   //为静态资源生成hash值
	     minify: {    //压缩HTML文件
	          removeComments:production?true:false,    //移除HTML中的注释
	          collapseWhitespace:production?true:false    //删除空白符与换行符
	      }
	});
	return newHtml;
};

//调试
var plugins = [
	  new CleanPlugin('web'),//清除目录
	  new webpack.BannerPlugin("极客前端出品\n river.cao"), //  编译文件加注释
	  creatHtml('index'), //生成新页面
	  creatHtml('list'),  //生成新页面
];
//生产
if (production) {
	 plugins = plugins.concat([
	 	new CleanPlugin('web'),
	 	new webpack.NoErrorsPlugin(),
	 	new webpack.optimize.OccurenceOrderPlugin(),//为组件分配ID，通过这个插件webpack可以分析和优先考虑使用最多的模块，并为它们分配最小的ID
	 	new webpack.optimize.MinChunkSizePlugin({ //合并小模块
            minChunkSize: 51200, // ~50kb
        }),
        new webpack.optimize.DedupePlugin(),//依赖去重
       	new webpack.BannerPlugin("极客前端出品\n river.cao"), //  编译文件加注释
	    new ExtractTextPlugin("static/index/css/main.css"),    //单独使用style标签加载css并设置其路径
        new webpack.optimize.UglifyJsPlugin({  //压缩丑化
            compress: {
                warnings: false,
            },
            output: {
                comments: false,
            },
            except: ['$super', '$', 'exports', 'require']
        }),
         new webpack.optimize.CommonsChunkPlugin({  // 提取公用js
              name: 'common', //提取依赖文件到我们这个文件
              filename: 'common.js',//公用依赖文件名称
              children: "body",// 在所有的子文件中查找公用的依赖文件
              minChunks: 2 // 有多少个文件共同依赖才提取出成为公用文件
          }),
	  	 creatHtml('index'), //生成新页面
	 	 creatHtml('list') //生成新页面
    ]);
}






module.exports = {
  devtool: 'inline-source-map',
  entry:{
  	index:__dirname + "/build/js/index.js",
  	list:__dirname + "/build/js/list.js"
  },
  output: {
    path: path.resolve(__dirname,"web"),
    filename: production?"js/[name].[hash:6].js":"js/[name].js"
//	publicPath: "web"
  },
  module:{
  	loaders:[
  		{
  			test:/\.js$/,
  			exclude:/node_modules/,
  			include: __dirname + '/build/',
  			loader: 'babel',
  			query: {
	         presets: ['es2015']
	        }
  		},
  		{
            test: /\.scss$/,
            loader: 'style!css!sass!postcss'
        },
        {
                test: /\.html/,
                loader: 'html',
                include: __dirname

        },
            {
                test: /\.(png|jpg)$/,
                loader:"url-loader",
                query:{
                    limit:'10000',
                    name:"./images/"+(production?"[hash:6].[name].[ext]":"[name].[ext]")
                },
                //loader: 'url?limit=8192',
                //loader: "url?limit=10000&name="+config.ImageFile+config.hash+".[name].[ext]",
                include: __dirname + '/build/'

            },
  	]
  },
  postcss:[autoprefixer({browsers:['last 2 versions']})],
  plugins:plugins,
  devServer: {
  	contentBase: path.resolve(__dirname,'./web'),//本地服务器所加载的页面所在的目录
    colors: true,//终端中输出结果为彩色
    historyApiFallback: true,//不跳转 
    inline: true,//实时刷新
    port:8080
  } 
}













// webpack 命令行的几种基本命令
// $ webpack // 最基本的启动webpack方法
// $ webpack -w // 提供watch方法，实时进行打包更新
// $ webpack -p // 对打包后的文件进行压缩，提供production
// $ webpack -d // 提供source map，方便调试。
//
//$ NODE_ENV=production webpack  生成环境