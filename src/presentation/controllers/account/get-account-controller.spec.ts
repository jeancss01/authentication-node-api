import type { AccountModel } from '../../../domain/models/account'
import type { GetAccount } from '../../../domain/usecases/get-account'
import { notFound, ok, serverError } from '../../helpers/http/http-helper'
import type { HttpRequest } from '../../protocols'
import type { Validation } from '../../protocols/validation'
import { GetAccountController } from './get-account-controller'

const makeFakeRequest = (): HttpRequest => ({
  query: {
    accountId: 'valid_account_id_1234567'
  },
  accountId: 'valid_account_id_1234567' // Simulating the accountId
})
const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error | null {
      return null
    }
  }
  return new ValidationStub()
}

const makeFakeAccount = (): AccountModel => ({
  id: 'valid_account_id',
  name: 'valid_name',
  email: 'valid_email@example.com',
  password: 'valid_password',
  birthday: '1990-01-01',
  country: 'valid_country',
  city: 'valid_city',
  state: 'valid_state'
})

const makeGetAccount = (): GetAccount => {
  class GetAccountStub implements GetAccount {
    async get (accountId: string): Promise<AccountModel> {
      return await Promise.resolve(makeFakeAccount())
    }
  }
  return new GetAccountStub()
}

interface SutTypes {
  sut: GetAccountController
  getAccountStub: GetAccount
  validationStub: Validation
}

const makeSut = (): SutTypes => {
  const getAccountStub = makeGetAccount()
  const validationStub = makeValidation()
  const sut = new GetAccountController(getAccountStub, validationStub)
  return {
    sut,
    getAccountStub,
    validationStub
  }
}

describe('GetAccountController', () => {
  test('Should call GetAccount with correct accountId', async () => {
    const { sut, getAccountStub } = makeSut()
    const getSpy = jest.spyOn(getAccountStub, 'get')
    await sut.handle(makeFakeRequest())
    expect(getSpy).toHaveBeenCalledWith('valid_account_id_1234567')
  })
  test('Should return an account on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    const response = {
      id: 'valid_account_id',
      name: 'valid_name',
      email: 'valid_email@example.com',
      birthday: '1990-01-01',
      country: 'valid_country',
      city: 'valid_city',
      state: 'valid_state'
    }
    expect(httpResponse).toEqual(ok(response))
  })
  test('Should return 404 if GetAccount returns null', async () => {
    const { sut, getAccountStub } = makeSut()
    jest.spyOn(getAccountStub, 'get').mockResolvedValueOnce(null)
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(notFound())
  })
  test('Should return server error if GetAccount throws', async () => {
    const { sut, getAccountStub } = makeSut()
    jest.spyOn(getAccountStub, 'get').mockRejectedValueOnce(new Error('any_error'))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse).toEqual(serverError(new Error('any_error')))
  })
})
