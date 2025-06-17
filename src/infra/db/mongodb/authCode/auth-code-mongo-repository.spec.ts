import { type Collection } from 'mongodb'
import { MongoHelper } from '../helpers/mongo-helpers'
import { AuthCodeMongoRepository } from './auth-code-mongo-repository'

let authCodeCollection: Collection

describe('AuthCodeMongoRepository', () => {
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
    authCodeCollection = await MongoHelper.getCollection('authCodes')
    await authCodeCollection.deleteMany({})
  })

  const makeSut = (): AuthCodeMongoRepository => {
    return new AuthCodeMongoRepository()
  }

  test('Should return an auth code on add success', async () => {
    const sut = makeSut()
    const authCode = await sut.add({
      code: 'any_code',
      clientId: 'any_client_id',
      userId: 'any_user_id',
      codeChallenge: 'any_code_challenge',
      codeChallengeMethod: 'S256',
      expiresAt: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes from now
      createdAt: new Date()
    })
    expect(authCode).toBeTruthy()
    expect(authCode.id).toBeTruthy()
    expect(authCode.code).toBe('any_code')
    expect(authCode.clientId).toBe('any_client_id')
    expect(authCode.userId).toBe('any_user_id')
    expect(authCode.expiresAt).toEqual(expect.any(Date))
    expect(authCode.createdAt).toEqual(expect.any(Date))
  })

  test('Should return an auth code on load success', async () => {
    const sut = makeSut()
    await authCodeCollection.insertOne({
      code: 'any_code',
      clientId: 'any_client_id',
      userId: 'any_user_id',
      codeChallenge: 'any_code_challenge',
      codeChallengeMethod: 'S256',
      expiresAt: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes from now
      createdAt: new Date()
    })
    const authCode = await sut.load('any_code')
    expect(authCode).toBeTruthy()
    if (authCode) {
      expect(authCode.id).toBeTruthy()
      expect(authCode.code).toBe('any_code')
      expect(authCode.clientId).toBe('any_client_id')
      expect(authCode.userId).toBe('any_user_id')
      expect(authCode.expiresAt).toEqual(expect.any(Date))
      expect(authCode.createdAt).toEqual(expect.any(Date))
    }
  })
})
