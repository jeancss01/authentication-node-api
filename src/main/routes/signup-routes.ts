import type { Router } from 'express'
import { adapterRoute } from '../adapters/express/express-route-adapter'
import { makeSignupController } from '../factories/signup/signup-factory'

export default (router: Router): void => {
  router.post('/signup', adapterRoute(makeSignupController()))
}
