import type { Router } from 'express'
import { adapterRoute } from '../adapters/express/express-route-adapter'
import { makeSignupController } from '../factories/signup/signup-factory'
import { makeLoginController } from '../factories/login/login-factory'
import { makeAuthorizerController } from '../factories/oauth/authorizer-factory'

export default (router: Router): void => {
  router.post('/signup', adapterRoute(makeSignupController()))
  router.post('/login', adapterRoute(makeLoginController()))
  router.get('/oauth/authorizer', adapterRoute(makeAuthorizerController()))
}
