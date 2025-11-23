const config = {
  plugins: {
    autoprefixer: {},
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'breakpoint-mobile': '36em',
        'breakpoint-tablet': '48em',
        'breakpoint-laptop': '64em',
        'breakpoint-desktop': '74em',
      },
    },
  },
};

module.exports = config;
