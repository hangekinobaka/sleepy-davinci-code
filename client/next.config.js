const path = require('path')

module.exports = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  env: {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    REACT_APP_ENDPOINT: process.env.REACT_APP_ENDPOINT,
  },
}