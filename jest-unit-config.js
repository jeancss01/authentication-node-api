require('ts-node/register')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('./jest.config.ts')
config.default.testMatch = ['**/*.spec.ts']
module.exports = config.default
// This file is used to run unit tests only
