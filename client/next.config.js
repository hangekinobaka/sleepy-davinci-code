const path = require('path')

module.exports = {
  sassOptions: {
    indentWidth: 2,
    includePaths: [path.join(__dirname, 'styles')],
    prependData: '@import "styles/_mixins.scss";'
  }
}