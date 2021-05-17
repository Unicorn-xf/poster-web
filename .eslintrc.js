module.exports = {
  root: true,
  'extends': [
    'plugin:vue/essential',
    // 关闭eslintic语法规范
    // '@vue/standard'
  ],
  rules: {
    // allow async-await
    'space-before-function-paren': 'off',
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'vue/no-parsing-error': [2, {
      'x-invalid-end-tag': false
    }],
    'no-undef': 'off',
    'camelcase': 'off',
    'no-tabs': 'off'
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
