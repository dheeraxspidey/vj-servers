const Dotenv = require('dotenv-webpack');

module.exports = {
  // other configurations
  plugins: [
    new Dotenv()
  ]
};
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
        type: 'json', 
      },
    ],
  },
}