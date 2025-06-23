import { type AccountModel } from '../../../domain/models/account'
import { type AuthCodeModel } from '../../../domain/models/auth-code'
import { type ClientModel } from '../../../domain/models/client'
import { type AddAuthCodeModel } from '../../../domain/usecases/add-auth-code'
import { type AuthorizationModel } from '../../../domain/usecases/authorization'
import { type HashComparer } from '../../protocols/criptography/hash-comparer'
import { type Hasher } from '../../protocols/criptography/hasher'
import { type LoadAccountByEmailRepository } from '../../protocols/db/account/load-account-by-email-repository'
import { type AddAuthCodeRepository } from '../../protocols/db/auth-code/add-auth-code-repository'
import { type LoadClientByClientIdRepository } from '../../protocols/db/client/load-client-by-client-id-repository'
import { DbAuthorization } from './db-authorization'

const makeAuthorizationModel = (): AuthorizationModel => ({
  clientId: 'any_client_id',
  redirectUri: 'any_redirect_uri',
  email: 'any_email@mail.com',
  password: 'any_password',
  codeChallenge: 'any_code_challenge',
  codeChallengeMethod: 'any_code_challenge_method'
})

const makeFakeAccount = (): AccountModel => ({
  id: 'any_id',
  name: 'any_name',
  email: 'any_email@mail.com',
  password: 'hashed_password'
})

const makeFakeClient = (): ClientModel => ({
  id: 'any_client_id',
  clientId: 'any_client_id',
  clientSecret: 'any_client_secret',
  redirectUris: ['any_redirect_uri']
})

const makeFakeAuthCode = (): AuthCodeModel => ({
  id: 'any_auth_code_id',
  code: 'any_code',
  clientId: 'any_client_id',
  userId: 'any_user_id',
  codeChallenge: 'any_code_challenge',
  codeChallengeMethod: 'any_code_challenge_method',
  expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
  createdAt: new Date()
})

const makeLoadClientByClientIdRepository = (): LoadClientByClientIdRepository => {
  class LoadClientByClientIdRepositoryStub implements LoadClientByClientIdRepository {
    async loadByClientId (clientId: string): Promise<ClientModel | null> {
      return await new Promise(resolve => { resolve(makeFakeClient()) })
    }
  }
  return new LoadClientByClientIdRepositoryStub()
}

const makeLoadAccountByEmailRepository = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail (email: string): Promise<AccountModel | null> {
      return await new Promise(resolve => { resolve(makeFakeAccount()) })
    }
  }
  return new LoadAccountByEmailRepositoryStub()
}

const makeAddAuthCodeRepositoryStub = (): AddAuthCodeRepository => {
  class AddAuthCodeRepositoryStub implements AddAuthCodeRepository {
    async add (authCodeData: AddAuthCodeModel): Promise<AuthCodeModel> {
      await new Promise<void>(resolve => { resolve() })
      return makeFakeAuthCode()
    }
  }
  return new AddAuthCodeRepositoryStub()
}

const makeHashComparer = (): HashComparer => {
  class HashComparerStub implements HashComparer {
    async compare (value: string, hash: string): Promise<boolean> {
      return await new Promise(resolve => { resolve(true) })
    }
  }
  return new HashComparerStub()
}

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async hash (value: string): Promise<string> {
      return await new Promise(resolve => { resolve('hashed_password') })
    }
  }
  return new HasherStub()
}

interface SutTypes {
  sut: DbAuthorization
  loadClientByClientIdRepository: LoadClientByClientIdRepository
  loadAccountByEmailRepository: LoadAccountByEmailRepository
  addAuthCodeRepository: AddAuthCodeRepository
  hashComparer: HashComparer
  hasher: Hasher
}

const makeSut = (): SutTypes => {
  const loadClientByClientIdRepositoryStub = makeLoadClientByClientIdRepository()
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository()
  const addAuthCodeRepositoryStub = makeAddAuthCodeRepositoryStub()
  const hashComparerStub = makeHashComparer()
  const hasherStub = makeHasher()

  const sut = new DbAuthorization(
    loadClientByClientIdRepositoryStub,
    loadAccountByEmailRepositoryStub,
    addAuthCodeRepositoryStub,
    hashComparerStub,
    hasherStub
  )
  return {
    sut,
    loadClientByClientIdRepository: loadClientByClientIdRepositoryStub,
    loadAccountByEmailRepository: loadAccountByEmailRepositoryStub,
    addAuthCodeRepository: addAuthCodeRepositoryStub,
    hashComparer: hashComparerStub,
    hasher: hasherStub
  }
}
describe('DbAuthorization UseCase', () => {
  test('should return a redirectForUri on success', async () => {
    const { sut, hasher } = makeSut()
    jest.spyOn(hasher, 'hash').mockReturnValueOnce(Promise.resolve('any_code'))
    const redirectForUri = await sut.authorize(makeAuthorizationModel())
    expect(redirectForUri).toBe('any_redirect_uri?code=any_code')
  })

  test('should return null if LoadClientByClientIdRepository returns null', async () => {
    const { sut, loadClientByClientIdRepository } = makeSut()
    jest.spyOn(loadClientByClientIdRepository, 'loadByClientId').mockReturnValueOnce(Promise.resolve(null))
    const redirectForUri = await sut.authorize(makeAuthorizationModel())
    expect(redirectForUri).toBeNull()
  })

  test('should return null if LoadAccountByEmailRepository returns null', async () => {
    const { sut, loadAccountByEmailRepository } = makeSut()
    jest.spyOn(loadAccountByEmailRepository, 'loadByEmail').mockReturnValueOnce(Promise.resolve(null))
    const redirectForUri = await sut.authorize(makeAuthorizationModel())
    expect(redirectForUri).toBeNull()
  })

  test('Should throw if LoadClientByClientIdRepository throws', async () => {
    const { sut, loadClientByClientIdRepository } = makeSut()
    jest.spyOn(loadClientByClientIdRepository, 'loadByClientId').mockImplementationOnce(() => {
      throw new Error()
    })
    const promise = sut.authorize(makeAuthorizationModel())
    await expect(promise).rejects.toThrow()
  })
  test('Should throw if LoadAccountByEmailRepository throws', async () => {
    const { sut, loadAccountByEmailRepository } = makeSut()
    jest.spyOn(loadAccountByEmailRepository, 'loadByEmail').mockImplementationOnce(() => {
      throw new Error()
    })
    const promise = sut.authorize(makeAuthorizationModel())
    await expect(promise).rejects.toThrow()
  })
  test('Should call AddAuthCodeRepository with correct values', async () => {
    const { sut, addAuthCodeRepository, hasher } = makeSut()
    jest.spyOn(hasher, 'hash').mockReturnValueOnce(Promise.resolve('any_code'))
    const addSpy = jest.spyOn(addAuthCodeRepository, 'add')
    await sut.authorize(makeAuthorizationModel())
    expect(addSpy).toHaveBeenCalledWith({
      code: 'any_code',
      clientId: 'any_client_id',
      userId: 'any_id',
      codeChallenge: 'any_code_challenge',
      codeChallengeMethod: 'any_code_challenge_method',
      expiresAt: expect.any(Date),
      createdAt: expect.any(Date)
    })
  })
  test('Should throw if AddAuthCodeRepository throws', async () => {
    const { sut, addAuthCodeRepository } = makeSut()
    jest.spyOn(addAuthCodeRepository, 'add').mockImplementationOnce(() => {
      throw new Error()
    })
    const promise = sut.authorize(makeAuthorizationModel())
    await expect(promise).rejects.toThrow()
  })
  test('Should call HashComparer with correct values', async () => {
    const { sut, hashComparer } = makeSut()
    const compareSpy = jest.spyOn(hashComparer, 'compare')
    await sut.authorize(makeAuthorizationModel())
    expect(compareSpy).toHaveBeenCalledWith('any_password', 'hashed_password')
  })
  test('Should throw if HashComparer throws', async () => {
    const { sut, hashComparer } = makeSut()
    jest.spyOn(hashComparer, 'compare').mockImplementationOnce(() => {
      throw new Error()
    })
    const promise = sut.authorize(makeAuthorizationModel())
    await expect(promise).rejects.toThrow()
  })
})
