import { type AccountModel } from '../../../domain/models/account'
import { type Decrypter } from '../../protocols/criptography/decrypter'
import { DbLoadAccountByToken } from './db-load-account-by-token'
import type { LoadAccountByIdRepository } from '../../protocols/db/account/load-account-by-token-repository'

const makeDecrypter = (): Decrypter => {
  class DecrypterStub implements Decrypter {
    async decrypt (value: string): Promise<string> {
      return await new Promise(resolve => { resolve('decrypted_token') })
    }
  }
  return new DecrypterStub()
}

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

const makeLoadAccountByIdRepository = (): LoadAccountByIdRepository => {
  class LoadAccountByIdRepositoryStub implements LoadAccountByIdRepository {
    async loadById (id: string, role?: string): Promise<AccountModel | null> {
      return await new Promise(resolve => { resolve(makeFakeAccount()) })
    }
  }
  return new LoadAccountByIdRepositoryStub()
}

const makeSut = (): SutTypes => {
  const decrypterStub = makeDecrypter()
  const LoadAccountByIdRepositoryStub = makeLoadAccountByIdRepository()
  const sut = new DbLoadAccountByToken(decrypterStub, LoadAccountByIdRepositoryStub)
  return {
    sut,
    decrypterStub,
    LoadAccountByIdRepositoryStub
  }
}

interface SutTypes {
  sut: DbLoadAccountByToken
  decrypterStub: Decrypter
  LoadAccountByIdRepositoryStub: LoadAccountByIdRepository
}

describe('DbLoadAccountByToken', () => {
  test('Should call DecryptToken with correct token', async () => {
    const { sut, decrypterStub } = makeSut()
    const decryptSpy = jest.spyOn(decrypterStub, 'decrypt')
    await sut.load('any_token', 'any_role')
    expect(decryptSpy).toHaveBeenCalledWith('any_token')
  })

  test('Should return null if DecryptToken returns null', async () => {
    const { sut, decrypterStub } = makeSut()
    jest.spyOn(decrypterStub, 'decrypt').mockReturnValueOnce(new Promise(resolve => { resolve(null) }))
    const account = await sut.load('any_token', 'any_role')
    expect(account).toBeNull()
  })

  test('Should call LoadAccountByIdRepository with correct values', async () => {
    const { sut, LoadAccountByIdRepositoryStub } = makeSut()
    const loadByIdSpy = jest.spyOn(LoadAccountByIdRepositoryStub, 'loadById')
    await sut.load('any_token', 'any_role')
    expect(loadByIdSpy).toHaveBeenCalledWith('decrypted_token', 'any_role')
  })

  test('Should return null if LoadAccountByIdRepository returns null', async () => {
    const { sut, LoadAccountByIdRepositoryStub } = makeSut()
    jest.spyOn(LoadAccountByIdRepositoryStub, 'loadById').mockReturnValueOnce(new Promise(resolve => { resolve(null) }))
    const account = await sut.load('any_token', 'any_role')
    expect(account).toBeNull()
  })

  test('Should return an account on success', async () => {
    const { sut } = makeSut()
    const account = await sut.load('any_token', 'any_role')
    expect(account).toEqual(makeFakeAccount())
  })

  test('Should throw if DecryptToken throws', async () => {
    const { sut, decrypterStub } = makeSut()
    jest.spyOn(decrypterStub, 'decrypt').mockReturnValueOnce(new Promise((resolve, reject) => { reject(new Error()) }))
    const promise = sut.load('any_token', 'any_role')
    await expect(promise).rejects.toThrow()
  })

  test('Should throw if LoadAccountByIdRepository throws', async () => {
    const { sut, LoadAccountByIdRepositoryStub } = makeSut()
    jest.spyOn(LoadAccountByIdRepositoryStub, 'loadById').mockReturnValueOnce(new Promise((resolve, reject) => { reject(new Error()) }))
    const promise = sut.load('any_token', 'any_role')
    await expect(promise).rejects.toThrow()
  })
})
