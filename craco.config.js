module.exports = {
    style: {
        postcss: {
            plugins: [
                require('tailwindcss'),
                require('autoprefixer'),
            ],
        },
    },
    webpack: {
        /**
         * This removes the ModuleScopePlugin from WebPack, to remove
         * a restriction that stops us storing our config file in the
         * root directory.
         */
        configure: webpackConfig => {
            const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
                ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
            );
            if (scopePluginIndex >= 0) {
                webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
            }
            return webpackConfig;
        }
    }
}
