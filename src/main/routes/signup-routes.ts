import type { Router } from 'express'
import { adapterRoute } from '../adapter/express-route-adapter'
import { makeSignupController } from '../factories/signup/signup'

export default (router: Router): void => {
  router.post('/signup', adapterRoute(makeSignupController()))
}
