import type { Controller } from '../../../../presentation/protocols'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMongoRepository } from '../../../../infra/db/mongodb/log/log-mongo-repository'
import { LoginController } from '../../../../presentation/controllers/oauth/login/login-controller'
import { DbAuthLogin } from '../../../../data/usecases/oauth/login/db-auth-login'
import { AccountMongoRepository } from '../../../../infra/db/mongodb/account/account-mongo-repository'
import { BcryptAdapter } from '../../../../infra/criptography/bcrypt-adapter/bcrypt-adapter'
import env from '../../../config/env'
import { CryptoAdapter } from '../../../../infra/criptography/crypto-adapter/crypto-adapter'
import { AuthCodeMongoRepository } from '../../../../infra/db/mongodb/authCode/auth-code-mongo-repository'
import { makeOauthLoginValidation } from './login-validation-factory'

export const makeOauthLoginController = (): Controller => {
  const accountMongoRepository = new AccountMongoRepository()
  const bcryptAdapter = new BcryptAdapter(env.salt)
  const authCodeMongoRepository = new AuthCodeMongoRepository()
  const cryptoAdapter = new CryptoAdapter()

  const dbAuthLogin = new DbAuthLogin(
    accountMongoRepository,
    bcryptAdapter
  )
  const loginController = new LoginController(
    makeOauthLoginValidation(),
    dbAuthLogin,
    authCodeMongoRepository,
    cryptoAdapter
  )
  const logMongoRepository = new LogMongoRepository()
  return new LogControllerDecorator(loginController, logMongoRepository)
}
