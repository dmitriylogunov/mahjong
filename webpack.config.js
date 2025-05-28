const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const analyzeBundle = process.env.ANALYZE === 'true';

  return {
    mode: argv.mode || 'development',
    entry: {
      app: './src/index.ts',
      vendor: [
        '@angular/core',
        '@angular/common', 
        '@angular/platform-browser',
        '@angular/platform-browser-dynamic',
        'rxjs',
        'zone.js'
      ]
    },
    target: 'web',
    output: {
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      chunkFilename: isProduction ? '[name].[contenthash].chunk.js' : '[name].chunk.js'
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: ['node_modules', 'src']
    },
    optimization: {
      usedExports: true, // Tree shaking
      sideEffects: false, // Mark the project as side-effect free
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true
          },
          angular: {
            test: /[\\/]node_modules[\\/]@angular[\\/]/,
            name: 'angular',
            priority: 20
          },
          common: {
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true
          }
        }
      },
      runtimeChunk: 'single',
      minimizer: isProduction ? [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info']
            },
            mangle: true,
            format: {
              comments: false
            }
          },
          extractComments: false
        })
      ] : []
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-syntax-dynamic-import']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name].[hash][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name].[hash][ext]'
          }
        },
        {
          test: /\.(wav|mp3|ogg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'sounds/[name].[hash][ext]'
          }
        }
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
      }),
      ...(analyzeBundle ? [new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        reportFilename: 'bundle-report.html',
        openAnalyzer: false
      })] : [])
    ],
    watchOptions: {
      aggregateTimeout: 1000,
      ignored: ['**/dist/**', '**/node_modules']
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  };
};