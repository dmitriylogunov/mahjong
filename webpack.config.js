const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js', // Your main JavaScript file
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      }
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/index.html', to: 'index.html' },
        { from: 'src/favicon.ico', to: 'favicon.ico' },
        { from: 'src/templates', to: 'templates/[name][ext]' },
        { from: 'src/sounds', to: 'sounds/[name][ext]' },
        { from: 'src/js', to: 'js/[name][ext]' },
        { from: 'src/img', to: 'img', globOptions: { dot: true, gitignore: true, ignore: [], } }
      ],
      options: {
        watch: true,
      },
    }),
  ],
};