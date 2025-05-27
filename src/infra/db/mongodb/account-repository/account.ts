import type { AddAccountRepository } from '../../../../data/protocols/add-account-repository'
import type { AccountModel } from '../../../../domain/models/account'
import type { AddAccountModel } from '../../../../domain/usecases/add-account'
import { MongoHelper } from '../helpers/mongo-helpers'

export class AccountMongoRepository implements AddAccountRepository {
  async add (accountData: AddAccountModel): Promise<AccountModel> {
    const accountCollection = MongoHelper.getCollection('accounts')
    const result = await accountCollection.insertOne(accountData)
    const account = await accountCollection.findOne({ _id: result.insertedId })
    if (!account) {
      throw new Error('Account not found after insertion')
    }
    return MongoHelper.map(account)
  }
}
