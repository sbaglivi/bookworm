const path = require('path');
console.log(path.resolve(__dirname, "assets", "js"))
module.exports = {
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            }
        ]
    },
  entry: './assets/js/revised.js',
  output: {
    filename: 'dist.js',
    path: path.resolve(__dirname, "assets", "js"),
  },
};