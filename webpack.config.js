const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    app: './src/index.ts',
  },
  target: 'web',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'src'),
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
      }
    ],
  },
  watchOptions: {
    aggregateTimeout: 1000, // Process all changes which happened in this time into one rebuild
    // poll: true,
    ignored: ['**/src/**/*.js', '**/node_modules'],
  }
};