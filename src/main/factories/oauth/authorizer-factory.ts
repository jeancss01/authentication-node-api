import { LogControllerDecorator } from '../../decorators/log-controller-decorator'
import { LogMongoRepository } from '../../../infra/db/mongodb/log/log-mongo-repository'
import { DbAuthorization } from '../../../data/usecases/authorization/db-authorization'
import { AuthorizerController } from '../../../presentation/controllers/oauth/authorizer-controller'
import { type Controller } from '../../../presentation/protocols'
import { makeAuthorizationValidation } from './authorizer-validation-factory'
import { AccountMongoRepository } from '../../../infra/db/mongodb/account/account-mongo-repository'
import { ClientMongoRepository } from '../../../infra/db/mongodb/client/client-mongo-repository'
import { BcryptAdapter } from '../../../infra/criptography/bcrypt-adapter/bcrypt-adapter'
import env from '../../config/env'
import { CryptoAdapter } from '../../../infra/criptography/crypto-adapter/crypto-adapter'
import { AuthCodeMongoRepository } from '../../../infra/db/mongodb/authCode/auth-code-mongo-repository'

export const makeAuthorizerController = (): Controller => {
  const clientMongoRepository = new ClientMongoRepository()
  const accountMongoRepository = new AccountMongoRepository()
  const authCodeMongoRepository = new AuthCodeMongoRepository()
  const bcryptAdapter = new BcryptAdapter(env.salt)
  const cryptoAdapter = new CryptoAdapter()
  const dbAuthorization = new DbAuthorization(
    clientMongoRepository,
    accountMongoRepository,
    authCodeMongoRepository,
    bcryptAdapter,
    cryptoAdapter
  )
  const authorizerController = new AuthorizerController(makeAuthorizationValidation(), dbAuthorization)
  const logMongoRepository = new LogMongoRepository()
  return new LogControllerDecorator(authorizerController, logMongoRepository)
}
