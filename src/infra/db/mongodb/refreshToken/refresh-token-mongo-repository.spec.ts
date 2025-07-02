import { type Collection } from 'mongodb'
import { MongoHelper } from '../helpers/mongo-helpers'
import { RefreshTokenMongoRepository } from './refresh-token-mongo-repository'

let accountCollection: Collection

describe('RefreshTokenMongoRepository', () => {
  beforeAll(async () => {
    const uri = process.env.MONGO_URL
    if (!uri) {
      throw new Error('MONGO_URL environment variable is not defined')
    }
    console.log('Mongo URI:', uri)
    await MongoHelper.connect(uri)
  })
  afterAll(async () => {
    await MongoHelper.disconnect()
  })
  beforeEach(async () => {
    accountCollection = await MongoHelper.getCollection('refreshTokens')
    await accountCollection.deleteMany({})
  })
  const makeSut = (): RefreshTokenMongoRepository => {
    return new RefreshTokenMongoRepository()
  }

  test('Should return a refresh token on add success', async () => {
    const sut = makeSut()
    const refreshToken = await sut.add({
      token: 'any_token',
      accountId: 'any_account_id',
      clientId: 'any_client_id',
      expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
    })
    expect(refreshToken).toBeTruthy()
    expect(refreshToken.id).toBeTruthy()
    expect(refreshToken.clientId).toBe('any_client_id')
    expect(refreshToken.token).toBe('any_token')
    expect(refreshToken.expiresAt).toBeInstanceOf(Date)
  })
  test('Should return null if add fails', async () => {
    const sut = makeSut()
    const refreshToken = await sut.add({
      accountId: 'any_account_id',
      clientId: 'any_client_id',
      token: 'any_token',
      expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
    })
    expect(refreshToken).toBeTruthy()
    expect(refreshToken.id).toBeTruthy()
    expect(refreshToken.accountId).toBe('any_account_id')
    expect(refreshToken.token).toBe('any_token')
    expect(refreshToken.expiresAt).toBeInstanceOf(Date)
  })
})
