import { LogControllerDecorator } from '../../../decorators/log-controller-decorator'
import { LogMongoRepository } from '../../../../infra/db/mongodb/log/log-mongo-repository'
import { DbAuthorization } from '../../../../data/usecases/oauth/authorize/db-authorization'
import { AuthorizerController } from '../../../../presentation/controllers/oauth/authorize/authorizer-controller'
import { type Controller } from '../../../../presentation/protocols'
import { makeAuthorizationValidation } from './authorizer-validation-factory'
import { ClientMongoRepository } from '../../../../infra/db/mongodb/client/client-mongo-repository'

export const makeAuthorizerController = (): Controller => {
  const clientMongoRepository = new ClientMongoRepository()
  const dbAuthorization = new DbAuthorization(
    clientMongoRepository
  )
  const authorizerController = new AuthorizerController(makeAuthorizationValidation(), dbAuthorization)
  const logMongoRepository = new LogMongoRepository()
  return new LogControllerDecorator(authorizerController, logMongoRepository)
}
