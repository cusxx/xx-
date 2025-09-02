
// vue.config.js，如没有此文件则手动创建
module.exports = {
    transpileDependencies: ['uview-ui', '@dcloudio/uni-ui'],
    devServer: {
        port: 7860,
        host: '0.0.0.0'
    },
    configureWebpack: {
        resolve: {
            fallback: {
                "path": false,
                "fs": false,
                "crypto": false,
                "stream": false,
                "buffer": false
            }
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true,
                                appendTsSuffixTo: [/\.vue$/]
                            }
                        }
                    ]
                }
            ]
        }
    },
    chainWebpack: config => {
        // 删除可能导致问题的规则
        config.module.rules.delete('eslint')
        
        // 修复sass-loader配置
        const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
        types.forEach(type => {
            const rule = config.module.rule('sass').oneOf(type)
            if (rule.uses.has('sass-loader')) {
                rule.use('sass-loader').tap(options => {
                    return Object.assign(options || {}, {
                        sassOptions: {
                            outputStyle: 'expanded'
                        }
                    })
                })
            }
        })
    }
}