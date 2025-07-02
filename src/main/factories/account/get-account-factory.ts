import { LogControllerDecorator } from '../../decorators/log-controller-decorator'
import { LogMongoRepository } from '../../../infra/db/mongodb/log/log-mongo-repository'
import { GetAccountController } from '../../../presentation/controllers/account/get-account-controller'
import type { Controller } from '../../../presentation/protocols'
import { AccountMongoRepository } from '../../../infra/db/mongodb/account/account-mongo-repository'
import { makeGetAccountValidation } from './get-account-validation-factory'

export const makeGetAccountController = (): Controller => {
  const accountMongoRepository = new AccountMongoRepository()
  const getAccountController = new GetAccountController(accountMongoRepository, makeGetAccountValidation())
  const logMongoRepository = new LogMongoRepository()
  return new LogControllerDecorator(getAccountController, logMongoRepository)
}
