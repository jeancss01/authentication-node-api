import { type AddAuthCodeRepository } from '../../../../data/protocols/db/auth-code/add-auth-code-repository'
import { type DeleteAuthCodeRepository } from '../../../../data/protocols/db/auth-code/delete-auth-code-repository'
import { type LoadAuthCodeRepository } from '../../../../data/protocols/db/auth-code/load-auth-code-repository'
import { type AuthCodeModel } from '../../../../domain/models/auth-code'
import { type AddAuthCodeModel } from '../../../../domain/usecases/add-auth-code'
import { MongoHelper } from '../helpers/mongo-helpers'

export class AuthCodeMongoRepository implements AddAuthCodeRepository, LoadAuthCodeRepository, DeleteAuthCodeRepository {
  async delete (code: string, clientId: string): Promise<void> {
    const authCodeCollection = await MongoHelper.getCollection('authCodes')
    await authCodeCollection.deleteOne({ code, clientId })
  }

  async add (data: AddAuthCodeModel): Promise<AuthCodeModel> {
    const authCodeCollection = await MongoHelper.getCollection('authCodes')
    const result = await authCodeCollection.insertOne(data)
    const authCode = await authCodeCollection.findOne({ _id: result.insertedId })
    return MongoHelper.map(authCode)
  }

  async load (code: string, clientId: string): Promise<AuthCodeModel | null> {
    const authCodeCollection = await MongoHelper.getCollection('authCodes')
    const authCode = await authCodeCollection.findOne({ code, clientId })
    return authCode ? MongoHelper.map(authCode) : null
  }
}
