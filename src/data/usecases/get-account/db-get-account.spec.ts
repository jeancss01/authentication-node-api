import { DbGetAccount } from './db-get-account'
import { type GetAccountRepository } from '../../protocols/db/account/get-account-repository'
import type { AccountModel } from '../add-account/db-add-account-protocols'

const makeFakeAccount = (): AccountModel => ({
  id: 'valid_account_id',
  name: 'valid_name',
  email: 'valid_email',
  password: 'valid_password',
  brithday: '1990-01-01',
  country: 'valid_country',
  city: 'valid_city',
  state: 'valid_state'
})

interface SutTypes {
  sut: DbGetAccount
  getAccountRepositoryStub: GetAccountRepository
}

const makeSut = (): SutTypes => {
  class GetAccountRepositoryStub {
    async get (accountId: string): Promise<any> {
      return await Promise.resolve(makeFakeAccount())
    }
  }
  const getAccountRepositoryStub = new GetAccountRepositoryStub()
  const sut = new DbGetAccount(getAccountRepositoryStub)
  return { sut, getAccountRepositoryStub }
}

describe('DbGetAccount Usecase', () => {
  test('Should call GetAccountRepository with correct accountId', async () => {
    const { sut, getAccountRepositoryStub } = makeSut()
    const getAccountSpy = jest.spyOn(getAccountRepositoryStub, 'get')
    await sut.get('valid_account_id')
    expect(getAccountSpy).toHaveBeenCalledWith('valid_account_id')
  })

  test('Should return an account on success', async () => {
    const { sut, getAccountRepositoryStub } = makeSut()
    jest.spyOn(getAccountRepositoryStub, 'get').mockResolvedValueOnce(makeFakeAccount())
    const account = await sut.get('valid_account_id')
    expect(account).toEqual(makeFakeAccount())
  })

  test('Should throw if GetAccountRepository throws', async () => {
    const { sut, getAccountRepositoryStub } = makeSut()
    jest.spyOn(getAccountRepositoryStub, 'get').mockRejectedValueOnce(new Error('any_error'))
    const promise = sut.get('valid_account_id')
    await expect(promise).rejects.toThrow()
  })

  test('Should return null if GetAccountRepository returns null', async () => {
    const { sut, getAccountRepositoryStub } = makeSut()
    jest.spyOn(getAccountRepositoryStub, 'get').mockResolvedValueOnce(null)
    const account = await sut.get('valid_account_id')
    expect(account).toBeNull()
  })
})
