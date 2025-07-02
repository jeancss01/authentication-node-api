import type { Router } from 'express'
import { adapterRoute } from '../adapters/express/express-route-adapter'
import { makeSignupController } from '../factories/signup/signup-factory'
import { makeLoginController } from '../factories/login/login-factory'
import { makeAuthorizerController } from '../factories/oauth/authorizer/authorizer-factory'
import { makeTokenController } from '../factories/oauth/token/token-factory'
import { makeOauthLoginController } from '../factories/oauth/login/login-factory'
import { makeGetAccountController } from '../factories/account/get-account-factory'

export default (router: Router): void => {
  router.get('/account', adapterRoute(makeGetAccountController()))
  router.post('/signup', adapterRoute(makeSignupController()))
  router.post('/login', adapterRoute(makeLoginController()))
  router.get('/oauth/authorize', adapterRoute(makeAuthorizerController()))
  router.post('/oauth/token', adapterRoute(makeTokenController()))
  router.post('/oauth/login', adapterRoute(makeOauthLoginController()))
}
