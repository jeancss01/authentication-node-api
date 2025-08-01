import type { AuthCodeModel } from '../../../../domain/models/auth-code'
import type { ClientModel } from '../../../../domain/models/client'
import type { RefreshTokenModel } from '../../../../domain/models/refresh-token'
import type { AddRefreshTokenModel } from '../../../../domain/usecases/add-refresh-token'
import type { OauthTokenModel } from '../../../../domain/usecases/oauth/token'
import type { Encrypter } from '../../../protocols/criptography/encrypter'
import type { Hasher } from '../../../protocols/criptography/hasher'
import { type DeleteAuthCodeRepository } from '../../../protocols/db/auth-code/delete-auth-code-repository'
import type { LoadAuthCodeRepository } from '../../../protocols/db/auth-code/load-auth-code-repository'
import type { LoadClientByClientIdRepository } from '../../../protocols/db/client/load-client-by-client-id-repository'
import type { AddRefreshTokenRepository } from '../../../protocols/db/refresh-token/add-refresh-token-repository'
import { DbAuthToken } from './db-auth-token'

const makeFakeRefreshTokenModel = (): RefreshTokenModel => ({
  id: 'any_id',
  token: 'any_token',
  accountId: 'any_account_id',
  clientId: 'any_client_id',
  expiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes
  createdAt: new Date()
})

const makeFakeClient = (): ClientModel => ({
  id: 'any_client_id',
  clientId: 'any_client_id',
  clientSecret: 'any_client_secret',
  redirectUris: ['any_redirect_uri']
})

const makeFakeAuthCodeModel = (): AuthCodeModel => ({
  id: 'any_auth_code_id',
  code: 'any_code',
  clientId: 'any_client_id',
  accountId: 'any_account_id',
  codeChallenge: 'any_code_challenge',
  codeChallengeMethod: 'S256',
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

const makeLoadAuthCodeRepository = (): LoadAuthCodeRepository => {
  class LoadAuthCodeRepositoryStub implements LoadAuthCodeRepository {
    async load (code: string, clientId: string): Promise<AuthCodeModel | null> {
      return await new Promise(resolve => { resolve(makeFakeAuthCodeModel()) })
    }
  }
  return new LoadAuthCodeRepositoryStub()
}
const makeAddRefreshTokenRepositoryStub = (): AddRefreshTokenRepository => {
  class AddRefreshTokenRepositoryStub implements AddRefreshTokenRepository {
    async add (refreshTokenData: AddRefreshTokenModel): Promise<RefreshTokenModel> {
      return await new Promise(resolve => { resolve(makeFakeRefreshTokenModel()) })
    }
  }
  return new AddRefreshTokenRepositoryStub()
}
const makeDeleteAuthCodeRepositoryStub = (): DeleteAuthCodeRepository => {
  class DeleteAuthCodeRepositoryStub implements DeleteAuthCodeRepository {
    async delete (code: string, clientId: string): Promise<void> {
      await new Promise<void>(resolve => { resolve() })
    }
  }
  return new DeleteAuthCodeRepositoryStub()
}

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async createHash (value: string): Promise<string> {
      return await new Promise(resolve => { resolve('hashed_value') })
    }

    async hash (value: string): Promise<string> {
      return await new Promise(resolve => { resolve('hashed') })
    }
  }
  return new HasherStub()
}

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (value: string): Promise<string> {
      return await new Promise(resolve => { resolve('any_token') })
    }
  }
  return new EncrypterStub()
}

interface SutTypes {
  sut: DbAuthToken
  loadClientByClientIdRepository: LoadClientByClientIdRepository
  loadAuthCodeRepository: LoadAuthCodeRepository
  addRefreshTokenRepository: AddRefreshTokenRepository
  deleteAuthCodeRepository: DeleteAuthCodeRepository
  hasher: Hasher
  encrypter: Encrypter
}

const makeSut = (): SutTypes => {
  const loadClientByClientIdRepositoryStub = makeLoadClientByClientIdRepository()
  const loadAuthCodeRepositoryStub = makeLoadAuthCodeRepository()
  const addRefreshTokenRepositoryStub = makeAddRefreshTokenRepositoryStub()
  const deleteAuthCodeRepositoryStub = makeDeleteAuthCodeRepositoryStub()
  const hasherStub = makeHasher()
  const encrypterStub = makeEncrypter()
  const sut = new DbAuthToken(
    loadClientByClientIdRepositoryStub,
    loadAuthCodeRepositoryStub,
    addRefreshTokenRepositoryStub,
    deleteAuthCodeRepositoryStub,
    hasherStub,
    encrypterStub
  )
  return {
    sut,
    loadClientByClientIdRepository: loadClientByClientIdRepositoryStub,
    loadAuthCodeRepository: loadAuthCodeRepositoryStub,
    addRefreshTokenRepository: addRefreshTokenRepositoryStub,
    deleteAuthCodeRepository: deleteAuthCodeRepositoryStub,
    hasher: hasherStub,
    encrypter: encrypterStub
  }
}

const makeFakeOauthTokenModel = (): OauthTokenModel => ({
  clientId: 'any_client_id',
  clientSecret: 'any_client_secret',
  grantType: 'authorization_code',
  code: 'any_code',
  codeVerifier: 'any_code_verifier',
  redirectUri: 'any_redirect_uri'
})

describe('DbAuthToken UseCase', () => {
  test('Should call LoadClientByClientIdRepository with correct clientId', async () => {
    const { sut, loadClientByClientIdRepository } = makeSut()
    const loadByClientIdSpy = jest.spyOn(loadClientByClientIdRepository, 'loadByClientId')
    await sut.token(makeFakeOauthTokenModel())
    expect(loadByClientIdSpy).toHaveBeenCalledWith('any_client_id')
  })

  test('Should return null if LoadClientByClientIdRepository returns null', async () => {
    const { sut, loadClientByClientIdRepository } = makeSut()
    jest.spyOn(loadClientByClientIdRepository, 'loadByClientId').mockReturnValueOnce(Promise.resolve(null))
    const response = await sut.token(makeFakeOauthTokenModel())
    expect(response).toBeNull()
  })

  test('Should return null if client secret is invalid', async () => {
    const { sut, loadClientByClientIdRepository } = makeSut()
    jest.spyOn(loadClientByClientIdRepository, 'loadByClientId').mockReturnValueOnce(Promise.resolve(makeFakeClient()))
    const response = await sut.token({
      ...makeFakeOauthTokenModel(),
      clientSecret: 'invalid_secret'
    })
    expect(response).toBeNull()
  })

  test('Should return null if code verifier is invalid', async () => {
    const { sut, loadClientByClientIdRepository } = makeSut()
    jest.spyOn(loadClientByClientIdRepository, 'loadByClientId').mockReturnValueOnce(Promise.resolve(makeFakeClient()))
    const response = await sut.token({
      ...makeFakeOauthTokenModel(),
      codeVerifier: 'invalid_code_verifier'
    })
    expect(response).toBeNull()
  })
  test('Should call LoadAuthCodeRepository with correct values', async () => {
    const { sut, loadAuthCodeRepository } = makeSut()
    const loadSpy = jest.spyOn(loadAuthCodeRepository, 'load')
    await sut.token(makeFakeOauthTokenModel())
    expect(loadSpy).toHaveBeenCalledWith('any_code', 'any_client_id')
  })
  test('Should return null if LoadAuthCodeRepository returns null', async () => {
    const { sut, loadAuthCodeRepository } = makeSut()
    jest.spyOn(loadAuthCodeRepository, 'load').mockReturnValueOnce(Promise.resolve(null))
    const response = await sut.token(makeFakeOauthTokenModel())
    expect(response).toBeNull()
  })
  test('Should return null if auth code is expired', async () => {
    const { sut, loadAuthCodeRepository } = makeSut()
    jest.spyOn(loadAuthCodeRepository, 'load').mockReturnValueOnce(Promise.resolve({
      ...makeFakeAuthCodeModel(),
      expiresAt: new Date(Date.now() - 1000) // Expired
    }))
    const response = await sut.token(makeFakeOauthTokenModel())
    expect(response).toBeNull()
  })
  test('Should call Hasher with correct codeVerifier if codeChallenge is provided', async () => {
    const { sut, hasher } = makeSut()
    const createHashSpy = jest.spyOn(hasher, 'createHash')
    await sut.token({
      ...makeFakeOauthTokenModel(),
      codeVerifier: 'any_code_verifier'
    })
    expect(createHashSpy).toHaveBeenCalledWith('any_code_verifier')
  })
  test('Should return null if code challenge does not match', async () => {
    const { sut, loadAuthCodeRepository, hasher } = makeSut()
    jest.spyOn(loadAuthCodeRepository, 'load').mockReturnValueOnce(Promise.resolve({
      ...makeFakeAuthCodeModel(),
      codeChallenge: 'different_code_challenge'
    }))
    jest.spyOn(hasher, 'createHash').mockReturnValueOnce(Promise.resolve('hashed_value'))
    const response = await sut.token({
      ...makeFakeOauthTokenModel(),
      codeVerifier: 'any_code_verifier'
    })
    expect(response).toBeNull()
  })
  test('Should return null if code generated by Authorization Code Flow is invalid', async () => {
    const { sut, loadAuthCodeRepository } = makeSut()
    jest.spyOn(loadAuthCodeRepository, 'load').mockReturnValueOnce(Promise.resolve({
      ...makeFakeAuthCodeModel(),
      code: 'invalid_code'
    }))
    const response = await sut.token({
      ...makeFakeOauthTokenModel(),
      code: ''
    })
    expect(response).toBeNull()
  })

  test('Should return null if code challenge method is not supported', async () => {
    const { sut, loadAuthCodeRepository, hasher } = makeSut()
    jest.spyOn(hasher, 'createHash').mockReturnValueOnce(Promise.resolve('any_code_challenge'))
    jest.spyOn(loadAuthCodeRepository, 'load').mockReturnValueOnce(Promise.resolve({
      ...makeFakeAuthCodeModel(),
      codeChallengeMethod: 'unsupported_method'
    }))
    const response = await sut.token(makeFakeOauthTokenModel())
    expect(response).toBeNull()
  })

  test('Should return accessToken and refreshToken on success', async () => {
    const { sut, encrypter, addRefreshTokenRepository, hasher, loadAuthCodeRepository, loadClientByClientIdRepository } = makeSut()
    jest.spyOn(loadClientByClientIdRepository, 'loadByClientId').mockReturnValueOnce(Promise.resolve(makeFakeClient()))
    jest.spyOn(hasher, 'createHash').mockReturnValueOnce(Promise.resolve('any_code_challenge'))
    jest.spyOn(loadAuthCodeRepository, 'load').mockReturnValueOnce(Promise.resolve(makeFakeAuthCodeModel()))
    jest.spyOn(encrypter, 'encrypt').mockReturnValueOnce(Promise.resolve('any_access_token'))
    jest.spyOn(hasher, 'hash').mockReturnValueOnce(Promise.resolve('any_refresh_token'))
    const addSpy = jest.spyOn(addRefreshTokenRepository, 'add')
    const response = await sut.token(makeFakeOauthTokenModel())
    expect(response).toEqual({
      accessToken: 'any_access_token',
      refreshToken: 'any_refresh_token',
      expiresIn: 900,
      tokenType: 'Bearer'
    })
    expect(addSpy).toHaveBeenCalledWith({
      token: 'any_refresh_token',
      accountId: 'any_account_id',
      clientId: 'any_client_id',
      expiresAt: expect.any(Date)
    })
  })

  test('Should return null if grantType is not supported', async () => {
    const { sut } = makeSut()
    const response = await sut.token({
      clientId: 'any_client_id',
      clientSecret: 'any_client_secret',
      grantType: 'unsupported_grant_type',
      code: 'any_code',
      codeVerifier: 'any_code_verifier',
      redirectUri: 'any_redirect_uri'
    })
    expect(response).toBeNull()
  })

  test('Should return null if pkce is not used and client secret does not match', async () => {
    const { sut, loadClientByClientIdRepository, loadAuthCodeRepository } = makeSut()
    jest.spyOn(loadClientByClientIdRepository, 'loadByClientId').mockReturnValueOnce(Promise.resolve(makeFakeClient()))
    jest.spyOn(loadAuthCodeRepository, 'load').mockReturnValueOnce(Promise.resolve({ ...makeFakeAuthCodeModel(), codeChallenge: '' }))

    const response = await sut.token({
      ...makeFakeOauthTokenModel(),
      codeVerifier: '',
      clientSecret: 'invalid_secret'
    })
    expect(response).toBeNull()
  })
})
