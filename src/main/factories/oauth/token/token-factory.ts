import { TokenController } from '../../../../presentation/controllers/oauth/token/token-controller'
import { LogMongoRepository } from '../../../../infra/db/mongodb/log/log-mongo-repository'
import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { ClientMongoRepository } from '../../../../infra/db/mongodb/client/client-mongo-repository'
import { JwtAdapter } from '../../../../infra/criptography/jwt-adapter/jwt-adapter'
import env from '../../../config/env'
import { type Controller } from '../../../../presentation/protocols'
import { makeTokenValidation } from './token-validation-factory'
import { DbAuthToken } from '../../../../data/usecases/oauth/token/db-auth-token'
import { AuthCodeMongoRepository } from '../../../../infra/db/mongodb/authCode/auth-code-mongo-repository'
import { CryptoAdapter } from '../../../../infra/criptography/crypto-adapter/crypto-adapter'

import { RefreshTokenMongoRepository } from '../../../../infra/db/mongodb/refreshToken/refresh-token-mongo-repository'

export const makeTokenController = (): Controller => {
  const clientMongoRepository = new ClientMongoRepository()
  const authCodeMongoRepository = new AuthCodeMongoRepository()
  const refreshTokenMongoRepository = new RefreshTokenMongoRepository()
  const cryptoAdapter = new CryptoAdapter()
  const jwtAdapter = new JwtAdapter(env.jwtSecret)

  const dbAuthToken = new DbAuthToken(
    clientMongoRepository,
    authCodeMongoRepository,
    refreshTokenMongoRepository,
    authCodeMongoRepository,
    cryptoAdapter,
    jwtAdapter
  )
  const tokenController = new TokenController(makeTokenValidation(), dbAuthToken)
  const logMongoRepository = new LogMongoRepository()
  return new LogControllerDecorator(tokenController, logMongoRepository)
}
