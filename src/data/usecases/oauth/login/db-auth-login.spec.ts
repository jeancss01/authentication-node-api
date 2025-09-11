import type { LoadAccountByEmailRepository } from '../../authentication/db-authentication-protocols'
import { DbAuthLogin } from './db-auth-login'
import type { HashComparer } from '../../../protocols/criptography/hash-comparer'
import { type AccountModel } from '../../../../domain/models/account'
import type { OauthLoginModel } from '../../../../domain/usecases/oauth/login'

const makeFakeOauthLoginModel = (): OauthLoginModel => ({
  email: 'any_email@mail.com',
  password: 'any_password'
})

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail (email: string): Promise<AccountModel | null> {
      return await Promise.resolve({
        id: 'any_id',
        name: 'any_name',
        email: 'any_email',
        password: 'hashed_password',
        birthday: '1990-01-01',
        country: 'any_country',
        city: 'any_city',
        state: 'any_state'
      })
    }
  }
  return new LoadAccountByEmailRepositoryStub()
}

const makeHashComparer = (): HashComparer => {
  class HashComparerStub implements HashComparer {
    async compare (value: string, hash: string): Promise<boolean> {
      return await Promise.resolve(true)
    }
  }
  return new HashComparerStub()
}

interface SutTypes {
  sut: DbAuthLogin
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
  hashComparerStub: HashComparer
}

const makeSut = (): SutTypes => {
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository()
  const hashComparerStub = makeHashComparer()
  const sut = new DbAuthLogin(loadAccountByEmailRepositoryStub, hashComparerStub)
  return {
    sut,
    loadAccountByEmailRepositoryStub,
    hashComparerStub
  }
}

describe('DbAuthLogin', () => {
  test('should return null if LoadAccountByEmailRepository returns null', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(Promise.resolve(null))
    const redirectForUri = await sut.auth(makeFakeOauthLoginModel())
    expect(redirectForUri).toBeNull()
  })
  test('should return null if HashComparer returns false', async () => {
    const { sut, hashComparerStub } = makeSut()
    jest.spyOn(hashComparerStub, 'compare').mockReturnValueOnce(Promise.resolve(false))
    const redirectForUri = await sut.auth(makeFakeOauthLoginModel())
    expect(redirectForUri).toBeNull()
  })
  test('should return an account id on success', async () => {
    const { sut } = makeSut()
    const accountId = await sut.auth(makeFakeOauthLoginModel())
    expect(accountId).toBe('any_id')
  })
  test('should call LoadAccountByEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')
    await sut.auth(makeFakeOauthLoginModel())
    expect(loadSpy).toHaveBeenCalledWith('any_email@mail.com')
  })
  test('Should call HashComparer with correct values', async () => {
    const { sut, hashComparerStub } = makeSut()
    const compareSpy = jest.spyOn(hashComparerStub, 'compare')
    await sut.auth(makeFakeOauthLoginModel())
    expect(compareSpy).toHaveBeenCalledWith('any_password', 'hashed_password')
  })
  test('Should throw if HashComparer throws', async () => {
    const { sut, hashComparerStub } = makeSut()
    jest.spyOn(hashComparerStub, 'compare').mockImplementationOnce(() => {
      throw new Error()
    })
    const promise = sut.auth(makeFakeOauthLoginModel())
    await expect(promise).rejects.toThrow()
  })
})
