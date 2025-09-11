import { type LoadAccountByToken } from '../../domain/usecases/load-account-by-token'
import { type AccountModel } from '../../domain/models/account'
import { AccessDeniedError } from '../errors/access-denied-error'
import { forbidden, ok, serverError, unauthorized } from '../helpers/http/http-helper'
import type { HttpRequest } from '../protocols/http'
import { AuthMiddleware } from './auth-middleware'

const makeFakeAccount = (): AccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email',
  password: 'hashed_password',
  birthday: '1990-01-01',
  country: 'valid_country',
  city: 'valid_city',
  state: 'valid_state'
})

interface SutTypes {
  sut: AuthMiddleware
  loadAccountByTokenStub: LoadAccountByToken
}

const makeSut = (role?: string): SutTypes => {
  const loadAccountByTokenStub = makeLoadAccountByToken()
  const sut = new AuthMiddleware(loadAccountByTokenStub, role)
  return {
    sut,
    loadAccountByTokenStub
  }
}

const makeLoadAccountByToken = (): LoadAccountByToken => {
  class LoadAccountByTokenStub implements LoadAccountByToken {
    async load (token: string, role?: string): Promise<AccountModel | null> {
      return await Promise.resolve(makeFakeAccount())
    }
  }
  return new LoadAccountByTokenStub()
}

const makeFakeRequest = (): HttpRequest => ({
  headers: {
    Authorization: 'Bearer any_token'
  }
})

describe('AuthMiddleware', () => {
  test('Should return 403 if no Authorization is provided', async () => {
    const { sut } = makeSut()
    const httpRequest: HttpRequest = {
      headers: {}
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should call loadAccount with correct token', async () => {
    const role = 'any_role'
    const { loadAccountByTokenStub, sut } = makeSut(role)
    const loadSpy = jest.spyOn(loadAccountByTokenStub, 'load')
    await sut.handle(makeFakeRequest())
    expect(loadSpy).toHaveBeenCalledWith('any_token', role)
  })

  test('Should return 403 if loadAccountByToken returns null', async () => {
    const { sut, loadAccountByTokenStub } = makeSut()
    jest.spyOn(loadAccountByTokenStub, 'load').mockReturnValueOnce(Promise.resolve(null))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should return 200 if loadAccountByToken succeeds', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse).toEqual(ok({ accountId: 'valid_id' }))
  })

  test('Should return 500 if loadAccountByToken throws', async () => {
    const { sut, loadAccountByTokenStub } = makeSut()
    jest.spyOn(loadAccountByTokenStub, 'load').mockReturnValueOnce(Promise.reject(new Error()))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 401 if token is expired', async () => {
    const { sut, loadAccountByTokenStub } = makeSut()
    const httpRequest: HttpRequest = {
      headers: {
        Authorization: 'Bearer expired_token'
      }
    }
    jest.spyOn(loadAccountByTokenStub, 'load').mockImplementationOnce(() => {
      throw new Error('jwt expired')
    })
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(unauthorized())
  })
})
