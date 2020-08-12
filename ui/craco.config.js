const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { 
                '@primary-color': '#6D0FA7',
                '@font-family': 'Noto Sans',
                '@dropdown-vertical-padding': '8px',
                '@dropdown-edge-child-vertical-padding': '4px',
                '@border-radius-base': '5px',
                '@primary-1': '#F6F6F6'
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};