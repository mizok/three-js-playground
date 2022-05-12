const fs = require('fs');
const { resolve } = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
import chalk from 'chalk';
import * as webpack from 'webpack';
import 'webpack-dev-server'; // dont remove this import, it's for webpack-dev-server type
import HtmlWebpackPlugin from 'html-webpack-plugin';
const COMPRESS = true;
const warn = chalk.bgYellow.black; 

const getBaseEntry = ()=>{
  const baseFolder = `./src/base`;
  const entryObj: webpack.EntryObject = {
    // import es6-promise and scss util automatically
    base: ['es6-promise/auto', `${baseFolder}/ts/index.ts`, './src/util/style/reset.scss', `${baseFolder}/scss/main.scss`].filter(function (x: string | undefined) {
      return x !== undefined;
    })
  };
  return entryObj;
}

const getExampleEntries = ()=>{
  const folderPath = resolve(__dirname, `./src/examples`);
  const entryObj: webpack.EntryObject = {};
  fs.readdirSync(folderPath).forEach((entryName: string) => {
    if(!fs.lstatSync(`${folderPath}/${entryName}`).isDirectory())return;
    const scriptEntryPath1 = resolve(__dirname, `${folderPath}/${entryName}/index.ts`);
    const scriptEntryPath2 = resolve(__dirname, `${folderPath}/${entryName}/ts/index.ts`);
    const scriptEntry = fs.existsSync(scriptEntryPath1) ? scriptEntryPath1 : fs.existsSync(scriptEntryPath2)? scriptEntryPath2:undefined;

    const styleSheetEntryPath1 = resolve(__dirname, `${folderPath}/${entryName}/main.scss`);
    const styleSheetEntryPath2 = resolve(__dirname, `${folderPath}/${entryName}/scss/main.scss`);
    const styleSheetEntryPath = fs.existsSync(styleSheetEntryPath1) ? styleSheetEntryPath1 : fs.existsSync(styleSheetEntryPath2)? styleSheetEntryPath2: undefined;

    entryObj[entryName] = ['es6-promise/auto', scriptEntry, './src/util/style/reset.scss', styleSheetEntryPath].filter(function (x: string | undefined) {
      return x !== undefined;
    });
  })

  return entryObj;
}

const getBaseTemplateInstances = ()=>{
  const baseTemplatePath = resolve(__dirname, `./src/base/index.ejs`);
  return new HtmlWebpackPlugin({
    cache: false,
    chunks: ['base'],
    filename: `index.html`,
    template: baseTemplatePath,
    favicon: 'src/assets/images/logo.svg',
    minify: COMPRESS ? {
      collapseWhitespace: true,
      keepClosingSlash: true,
      removeComments: true,
      removeRedundantAttributes: false,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true
    } : false
  })
}

const getExampleEntryTemplateInstances = () => {
  const folderPath = resolve(__dirname, `./src/examples`);
  return fs.readdirSync(folderPath).map((entryName: string) => {
    if(!fs.lstatSync(`${folderPath}/${entryName}`).isDirectory())return;
    const ejsFilePath = resolve(folderPath, `${entryName}/index.ejs`);
    if(!fs.existsSync(ejsFilePath)){
      const msg = warn(`WARNING: "./src/examples/${entryName}/" is an empty folder, no template files detected inside`);
      console.log(msg)
      return;
    }
    const content = fs.readFileSync(ejsFilePath, 'utf8')
    if (!content) {
      fs.writeFile(ejsFilePath, ' ', () => { });
      const msg = warn(`WARNING : ${entryName} is an empty file, no inner content detected, since this boilerplate don't allow using empty template files, a blank space has been added to this file automatically`);
      console.log(msg);
    }

    return new HtmlWebpackPlugin({
      cache: false,
      chunks: [entryName],
      filename: `examples/${entryName}.html`,
      template: ejsFilePath,
      favicon: 'src/assets/images/logo.svg',
      minify: COMPRESS ? {
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeComments: true,
        removeRedundantAttributes: false,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      } : false
    })
  }).filter(function (x: HtmlWebpackPlugin | undefined) {
    return x !== undefined;
  });
}

//generate base entry object
const baseEntry = getBaseEntry();
//generate exampleEntry object
const exampleEntries: webpack.EntryObject = getExampleEntries();
//generate htmlWebpackPlugin instances
const baseEntryTemplateInstances: HtmlWebpackPlugin = getBaseTemplateInstances();

const exampleEntryTemplateInstances: HtmlWebpackPlugin[] = getExampleEntryTemplateInstances();


const config = (env: any, argv: any): webpack.Configuration => {
  const configObj: webpack.Configuration = {
    entry: { ...baseEntry, ...exampleEntries },
    output: {
      filename: 'js/[name].[chunkhash].js',
      chunkFilename: '[id].[chunkhash].js',
      path: resolve(__dirname, 'dist'),
      clean: true
    },
    target: ['web', 'es5'],
    devServer: {
      historyApiFallback: true,
      open: true,
      compress: true,
      watchFiles: [
        'src/pages/*.html',
        'src/template/*.html',
        'src/template/**/*.html',
        'src/pages/*.ejs',
        'src/template/*.ejs',
        'src/template/**/*.ejs',
      ],// this is important
      port: 8080
    },
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                minimize: COMPRESS
              }
            }
          ],
        },
        {
          test: /\.(glsl|vert|frag)$/,
          loader: 'shader-loader',
          options: {
            glsl: {
              chunkPath: resolve("/glsl/chunks")
            }
          }
        },
        {
          test: /\.ejs$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                minimize: COMPRESS
              }
            },
            {
              loader: 'template-ejs-loader',
              options: {
                data: {
                  mode: argv.mode
                }
              }
            }
          ]
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name][ext]'
          }
        },
        {
          test: /\.(sass|scss|css)$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: '../'
              }
            },
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  ident: 'postcss',
                  plugins: [
                    require('postcss-preset-env')()
                  ]
                }
              }
            },
            (() => {
              return COMPRESS ? 'sass-loader' : {
                loader: 'sass-loader',
                options: { sourceMap: true, sassOptions: { minimize: false, outputStyle: 'expanded' } }
              }
            })()

          ]
        },
        {
          test: /\.(woff(2)?|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[name][ext]'
          }
        }

      ]
    },
    resolve: {
      extensions:['.ts','.tsx','.js','.jsx','json'],
      alias: {
        '@util':resolve(__dirname,'./src/util/'),
        '@img': resolve(__dirname, './src/assets/images/'),
        '@font': resolve(__dirname, './src/assets/fonts/')
      }
    },
    optimization: {
      minimize: COMPRESS,
      minimizer: [new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        test: /\.js(\?.*)?$/i,
        extractComments: false
      })],
      splitChunks: { name: 'vendor', chunks: 'all' }
    },
    performance: {
      hints: false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    },
    plugins: [
      new webpack.DefinePlugin({
        'PROCESS.MODE': JSON.stringify(argv.mode)
      }),
      (() => {
        return COMPRESS ? new OptimizeCssAssetsWebpackPlugin() : undefined
      })(),
      new MiniCssExtractPlugin({
        filename: 'css/[name].css'
      }),
      new CopyPlugin(
        {
          patterns: [
            {
              from: 'src/static',
              to: 'static',
              globOptions: {
                dot: true,
                ignore: ['**/.DS_Store', '**/.gitkeep'],
              },
              noErrorOnMissing: true,
            },
            {
              from: 'src/assets/images',
              to: 'assets/images',
              globOptions: {
                dot: true,
                ignore: ['**/.DS_Store', '**/.gitkeep'],
              },
              noErrorOnMissing: true,
            }
          ],
        }
      ),
      baseEntryTemplateInstances,
      ...exampleEntryTemplateInstances

    ].filter(function (x) {
      return x !== undefined;
    })
  }
  return configObj;
}


export default config;