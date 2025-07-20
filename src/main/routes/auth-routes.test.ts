import request from 'supertest'
import app from '../config/app'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helpers'
import { type Collection } from 'mongodb'
import { hash } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import env from '../config/env'

let accountCollection: Collection

describe('Auth Routes', () => {
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

  describe('POST /signup', () => {
    test('should return 200 on signup', async () => {
      await request(app)
        .post('/api/signup')
        .send({
          name: 'Jean Santana',
          email: 'jeancss01@gmail.com',
          password: '123',
          passwordConfirmation: '123',
          birthday: '1990-01-01',
          country: 'Brazil',
          city: 'São Paulo',
          state: 'SP'
        })
        .expect(200)
    })
  })
  describe('POST /login', () => {
    test('should return 200 on login', async () => {
      const password = await hash('123', 12)
      await accountCollection.insertOne({
        name: 'Jean Santana',
        email: 'jeancss01@gmail.com',
        password
      })
      await request(app)
        .post('/api/login')
        .send({
          email: 'jeancss01@gmail.com',
          password: '123'
        })
        .expect(200)
    })

    test('should return 401 on login', async () => {
      await request(app)
        .post('/api/login')
        .send({
          email: 'jeancss01@gmail.com',
          password: '123'
        })
        .expect(401)
    })
  })

  describe('GET /account', () => {
    test('should return 200 on get account', async () => {
      const password = await hash('123', 12)
      const res = await accountCollection.insertOne({
        name: 'Jean Santana',
        email: 'jeancss01@gmail.com',
        password
      })
      const accessToken = sign({ id: `${res.insertedId.toString()}` }, env.jwtSecret)
      const account = await request(app)
        .get('/api/account')
        .set('x-access-token', `${accessToken}`)
      expect(account).toBeTruthy()
    })

    test('should return 403 on get account without token', async () => {
      await request(app)
        .get('/api/account')
        .expect(403)
    })
  })
})
