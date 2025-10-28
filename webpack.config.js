const tailwindcss = require('@tailwindcss/postcss');

module.exports = {
  // other configurations...
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  tailwindcss({ config: './tailwind.config.js' }),
                ],
              },
            },
          },
        ],
      },
      // other rules...
    ],
  },
  // other configurations...
};
