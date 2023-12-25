const path = require('path')

const fs = require('fs')
const webpack = require('webpack')
const cesiumSource = 'node_modules/cesium/Source'
const cesiumWorkers = '../Build/Cesium/Workers'

const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')

var entry = {
    app: './src/index.js'
}
var htmlWebpackPlugins = []

var files = fs.readdirSync(path.resolve(__dirname, './src/example'))

files.forEach((file) => {
    entry[file] = `./src/example/${file}/index.js`
    htmlWebpackPlugins.push(
        new HtmlWebpackPlugin({
            template: file == 'gis' ? 'map.html' : file == 'cesium' ? 'cesium.html' : 'index.html',
            chunks: [file],
            filename: `${file}.html`,
            title: `${file}--Demo`
        })
    )
})

module.exports = {
    context: __dirname,
    mode: 'development',
    entry: entry,
    experiments: {
        asyncWebAssembly: true,
        syncWebAssembly: true,
      },
    devServer: {
        port: 8021
    },
    resolve: {
        fallback: { https: false, zlib: false, http: false, url: false,util:false },
        mainFiles: ['index', 'Cesium']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        sourcePrefix: '/'
    },
    module: {
        rules: [
            {
                test: /\.glsl$/,
                use: path.resolve(__dirname, 'loader/index.js')
            },
            {
                test: /\.jsx?$/,
                use: 'babel-loader'
            },
            {
                test: /\.(png|gif|jpg|jpeg|svg|xml|json|webp)$/,
                use: ['url-loader']
            },
            {
                test: /\.(css|less)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'less-loader',
                        options: {
                            lessOptions: {
                                javascriptEnabled: true
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'static/css/[name].css'
        }),
        new CopyPlugin({
            patterns: [
                { from: 'src/assets', to: 'assets' },
                { from: 'src/static/lib', to: 'lib' },
                { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
                { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
                { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
                { from: path.join(cesiumSource, 'ThirdParty'), to: 'ThirdParty' }
            ]
        }),
        new HtmlWebpackPlugin({
            template: 'index.html',
            chunks: ['app'],
            filename: 'index.html',
            title: 'Threejs案例'
        }),
        new webpack.DefinePlugin({
            // Define relative base path in cesium for loading assets
            CESIUM_BASE_URL: JSON.stringify('/')
        }),
        ...htmlWebpackPlugins
    ]
}
