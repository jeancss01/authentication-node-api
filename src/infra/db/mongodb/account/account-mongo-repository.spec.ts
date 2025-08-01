import { type Collection } from 'mongodb'
import { MongoHelper } from '../helpers/mongo-helpers'
import { AccountMongoRepository } from './account-mongo-repository'

let accountCollection: Collection

describe('Account Mongo Repository', () => {
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
    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  const makeSut = (): AccountMongoRepository => {
    return new AccountMongoRepository()
  }
  test('Should return an account on add success', async () => {
    const sut = makeSut()
    const account = await sut.add({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password',
      brithday: 'any_brithday',
      country: 'any_country',
      city: 'any_city',
      state: 'any_state'
    })
    expect(account).toBeTruthy()
    expect(account.id).toBeTruthy()
    expect(account.name).toBe('any_name')
    expect(account.email).toBe('any_email')
    expect(account.password).toBe('any_password')
  })

  test('Should return an account on loadByEmail success', async () => {
    const sut = makeSut()
    await accountCollection.insertOne({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    })
    const account = await sut.loadByEmail('any_email@mail.com')
    expect(account).toBeTruthy()
    if (account) {
      expect(account.id).toBeTruthy()
      expect(account.name).toBe('any_name')
      expect(account.email).toBe('any_email@mail.com')
      expect(account.password).toBe('any_password')
    }
  })

  test('Should return null if loadByEmail fails', async () => {
    const sut = makeSut()
    const account = await sut.loadByEmail('non_existing_email@mail.com')
    expect(account).toBeFalsy()
  })

  test('Should update the account access token on updateAccessToken success', async () => {
    const sut = makeSut()
    const res = await accountCollection.insertOne({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    })
    await sut.updateAccessToken(res.insertedId.toString(), 'any_token')
    const updatedAccount = await accountCollection.findOne({ _id: res.insertedId })
    expect(updatedAccount).toBeTruthy()
    if (updatedAccount) {
      expect(updatedAccount.accessToken).toBe('any_token')
    }
  })
  test('Should return an account on get success', async () => {
    const sut = makeSut()
    const res = await accountCollection.insertOne({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    })
    const account = await sut.get(res.insertedId.toString())
    expect(account).toBeTruthy()
    if (account) {
      expect(account.id).toBe(res.insertedId.toString())
      expect(account.name).toBe('any_name')
      expect(account.email).toBe('any_email@mail.com')
      expect(account.password).toBe('any_password')
    }
  })

  test('Should return null if get fails', async () => {
    const sut = makeSut()
    const account = await sut.get('6865a466896ad76a59b5639f')
    expect(account).toBeFalsy()
  })
})
