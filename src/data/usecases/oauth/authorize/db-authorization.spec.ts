import { type ClientModel } from '../../../../domain/models/client'
import { type AuthorizationModel } from '../../../../domain/usecases/oauth/authorize'
import { type LoadClientByClientIdRepository } from '../../../protocols/db/client/load-client-by-client-id-repository'
import { DbAuthorization } from './db-authorization'

const makeAuthorizationModel = (): AuthorizationModel => ({
  clientId: 'any_client_id',
  redirectUri: 'any_redirect_uri',
  codeChallenge: 'any_code_challenge',
  codeChallengeMethod: 'any_code_challenge_method'
})

const makeFakeClient = (): ClientModel => ({
  id: 'any_client_id',
  clientId: 'any_client_id',
  clientSecret: 'any_client_secret',
  redirectUris: ['any_redirect_uri']
})

const makeLoadClientByClientIdRepository = (): LoadClientByClientIdRepository => {
  class LoadClientByClientIdRepositoryStub implements LoadClientByClientIdRepository {
    async loadByClientId (clientId: string): Promise<ClientModel | null> {
      return await new Promise(resolve => { resolve(makeFakeClient()) })
    }
  }
  return new LoadClientByClientIdRepositoryStub()
}

interface SutTypes {
  sut: DbAuthorization
  loadClientByClientIdRepository: LoadClientByClientIdRepository
}

const makeSut = (): SutTypes => {
  const loadClientByClientIdRepositoryStub = makeLoadClientByClientIdRepository()

  const sut = new DbAuthorization(
    loadClientByClientIdRepositoryStub
  )
  return {
    sut,
    loadClientByClientIdRepository: loadClientByClientIdRepositoryStub
  }
}
describe('DbAuthorization UseCase', () => {
  test('should return a redirectForUri on success', async () => {
    const { sut } = makeSut()
    const redirectForUri = await sut.authorize(makeAuthorizationModel())
    expect(redirectForUri).toBe('any_redirect_uri?client_id=any_client_id&redirect_uri=any_redirect_uri&code_challenge=any_code_challenge&code_challenge_method=any_code_challenge_method')
  })

  test('should return null if LoadClientByClientIdRepository returns null', async () => {
    const { sut, loadClientByClientIdRepository } = makeSut()
    jest.spyOn(loadClientByClientIdRepository, 'loadByClientId').mockReturnValueOnce(Promise.resolve(null))
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

  test('Should call return null if redirectUri is not valid for the client', async () => {
    const { sut, loadClientByClientIdRepository } = makeSut()
    jest.spyOn(loadClientByClientIdRepository, 'loadByClientId').mockReturnValueOnce(Promise.resolve({
      ...makeFakeClient(),
      redirectUris: ['invalid_redirect_uri']
    }))
    const redirectForUri = await sut.authorize(makeAuthorizationModel())
    expect(redirectForUri).toBeNull()
  })

  test('Should call return ok if redirectUri is valid for the client', async () => {
    const { sut, loadClientByClientIdRepository } = makeSut()
    jest.spyOn(loadClientByClientIdRepository, 'loadByClientId').mockReturnValueOnce(Promise.resolve({
      ...makeFakeClient(),
      redirectUris: ['any_redirect_uri']
    }))
    const redirectForUri = await sut.authorize(makeAuthorizationModel())
    expect(redirectForUri).toBe('any_redirect_uri?client_id=any_client_id&redirect_uri=any_redirect_uri&code_challenge=any_code_challenge&code_challenge_method=any_code_challenge_method')
  })
})
