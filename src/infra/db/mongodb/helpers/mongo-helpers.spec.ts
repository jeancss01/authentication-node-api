import { MongoHelper as sut } from './mongo-helpers'

describe('MongoHelpers', () => {
  beforeAll(async () => {
    const uri = process.env.MONGO_URL
    if (!uri) {
      throw new Error('MONGO_URL environment variable is not defined')
    }
    await sut.connect(uri)
  })

  afterAll(async () => {
    await sut.disconnect()
  })

  test('Should reconnect if mongodb is down', async () => {
    let accountCollection = await sut.getCollection('accounts')
    expect(accountCollection).toBeTruthy()
    await sut.disconnect()
    accountCollection = await sut.getCollection('accounts')
    expect(accountCollection).toBeTruthy()
  })
})
