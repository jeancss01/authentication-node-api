import { type Collection } from 'mongodb'
import { MongoHelper } from '../helpers/mongo-helpers'
import { ClientMongoRepository } from './client-mongo-repository'

let clientCollection: Collection

describe('Client Mongo Repository', () => {
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
    clientCollection = await MongoHelper.getCollection('clients')
    await clientCollection.deleteMany({})
  })

  const makeSut = (): ClientMongoRepository => {
    return new ClientMongoRepository()
  }

  test('Should return a client on add success', async () => {
    const sut = makeSut()
    const client = await sut.add({
      clientId: 'any_name',
      clientSecret: 'any_secret',
      redirectUris: ['any_uri']
    })
    expect(client).toBeTruthy()
    expect(client.id).toBeTruthy()
    expect(client.clientId).toBe('any_name')
    expect(client.clientSecret).toBe('any_secret')
    expect(client.redirectUris).toEqual(['any_uri'])
  })
  test('Should return a client on loadByClientId success', async () => {
    const sut = makeSut()
    await clientCollection.insertOne({
      clientId: 'any_name',
      clientSecret: 'any_secret',
      redirectUris: ['any_uri']
    })
    const client = await sut.loadByClientId('any_name')
    expect(client).toBeTruthy()
    if (client) {
      expect(client.id).toBeTruthy()
      expect(client.clientId).toBe('any_name')
      expect(client.clientSecret).toBe('any_secret')
      expect(client.redirectUris).toEqual(['any_uri'])
    }
  })
})
