import type { AddRefreshTokenRepository } from '../../../../data/protocols/db/refresh-token/add-refresh-token-repository'
import type { RefreshTokenModel } from '../../../../domain/models/refresh-token'
import type { AddRefreshTokenModel } from '../../../../domain/usecases/add-refresh-token'
import { MongoHelper } from '../helpers/mongo-helpers'

export class RefreshTokenMongoRepository implements AddRefreshTokenRepository {
  async add (data: AddRefreshTokenModel): Promise<RefreshTokenModel> {
    const refreshTokenCollection = await MongoHelper.getCollection('refreshTokens')
    const result = await refreshTokenCollection.insertOne(data)
    const refreshToken = await refreshTokenCollection.findOne({ _id: result.insertedId })
    return MongoHelper.map(refreshToken)
  }
}
