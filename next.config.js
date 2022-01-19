module.exports = {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        config.module.rules.push({
            test: /\.svg$/,
            exclude: /node_modules/,
            use: {
                loader: 'svg-react-loader',
                options: {
                    tag: 'symbol',
                    attrs: {
                        title: 'example',
                    },
                    name: 'MyIcon',
                },
            },

        })
        return config
    },
}