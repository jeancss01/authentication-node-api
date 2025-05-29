require('ts-node/register')

const config = require('./jest.config.ts')
config.testMatch = ['**/*.spec.ts']
module.exports = config
