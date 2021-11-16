//eslint-disable-next-line no-undef
const HtmlWebpackPlugin = require('html-webpack-plugin'); //подключаем плагин index.html
//eslint-disable-next-line no-undef
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); //подключаем плагин для возможности подключения css отдельным файлом
//eslint-disable-next-line no-undef
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin'); //подключаем плагин для минимизации картинок
//eslint-disable-next-line no-undef
module.exports = (env) => ({
  resolve: {
    fallback: {
      bufferutil: false,
      'utf-8-validate': false,
      // fs: false,
      // path: true,
      os: false,
      zlib: false,
      stream: false,
      net: false,
      tls: false,
      crypto: false,
      http: false,
      https: false,
    },
  },
  entry: './src/index.js',
  output: {
    filename: './js/main.[contenthash].js',
    // publicPath: '/',
  },
  module: {
    rules: [
      {
        //байбел для того, чтобы работало со старыми браузерами
        test: /\.js$/,
        exclude: /node_modules/, //то что не надо переводить через бейбел
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'], //лоадер использует настройки по умолчанию
          },
        },
      },
      {
        //требование Plotly
        test: /\.js$/,
        loader: 'ify-loader',
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ttf)$/i, //форматы, которые нужно закачать в проект
        use: [
          {
            loader: 'file-loader', // Or `url-loader` or your other loader
          },
          {
            loader: ImageMinimizerPlugin.loader, //использование плагина автономно
            options: {
              severityError: 'warning', // Ignore errors on corrupted images
              minimizerOptions: {
                plugins: ['gifsicle'],
              },
            },
          },
        ],
      },
      {
        //переводим препроцессор в обычный css
        test: /\.scss$/i,
        use: [
          env.prod ? MiniCssExtractPlugin.loader : 'style-loader', //есть в env есть prod = true, то подключаем отдельный файл css(для build), иначе css в js(для dev)
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    //плагины
    new HtmlWebpackPlugin({
      hash: true,
      title: 'Coin',
      // myPageHeader: 'Hello World',
      template: './src/index.html',
      filename: 'index.html',
    }), //получаем index.html для dist
    new MiniCssExtractPlugin({
      //для получения файла css отдельно от js
      filename: './css/main.[contenthash].css', //имя файла
    }),
  ],
  //сервер разработки
  devServer: {
    //отображает в браузере процесс компиляции в процентах
    client: {
      progress: true,
      webSocketTransport: 'ws',
    },
    webSocketServer: 'ws',
    historyApiFallback: true, //для работы виртуальных ссылок, которых в реальности нет
    hot: true, //не перезагружать всю страницу при изменении какого-то модуля, к примеру css(перезагружать только css)

    // compress: true,
    // port: 8080,
    // host: '0.0.0.0',
    // open: false,
    // proxy: [
    //   {
    //     context: ['/websocket'],
    //     target: `wss://localhost:3000/currency-feed/`,
    //     changeOrigin: true,
    //     ws: true,
    //   },
    // ],
  },
});
