import type { AuthCodeModel } from '../../../../domain/models/auth-code'
import type { OauthToken, OauthTokenModel, OauthTokenResponse } from '../../../../domain/usecases/oauth/token'
import type { RefreshTokenMongoRepository } from '../../../../infra/db/mongodb/refreshToken/refresh-token-mongo-repository'
import type { Hasher } from '../../../protocols/criptography/hasher'
import type { DeleteAuthCodeRepository } from '../../../protocols/db/auth-code/delete-auth-code-repository'
import type { LoadAuthCodeRepository } from '../../../protocols/db/auth-code/load-auth-code-repository'
import type { LoadClientByClientIdRepository } from '../../../protocols/db/client/load-client-by-client-id-repository'
import type { Encrypter } from '../../authentication/db-authentication-protocols'

export class DbAuthToken implements OauthToken {
  constructor (
    private readonly loadClientByClientIdRepository: LoadClientByClientIdRepository,
    private readonly loadAuthCodeRepository: LoadAuthCodeRepository,
    private readonly refreshTokenMongoRepository: RefreshTokenMongoRepository,
    private readonly deleteAuthCodeRepository: DeleteAuthCodeRepository,
    private readonly hasher: Hasher,
    private readonly encrypter: Encrypter
  ) {}

  private readonly timeExpiresIn = 100 // 100 seconds for access token expiration

  async token (authorization: OauthTokenModel): Promise<OauthTokenResponse | null> {
    if (authorization.grantType === 'authorization_code') {
      return await this.handleAuthorizationCodeGrant(authorization)
    }

    if (authorization.grantType === 'refresh_token') {
      return await this.handleRefreshTokenGrant(authorization)
    }

    return null // Unsupported grant type
  }

  private async handleAuthorizationCodeGrant (authorization: OauthTokenModel): Promise<OauthTokenResponse | null> {
    const client = await this.loadClientByClientIdRepository.loadByClientId(authorization.clientId)
    if (!client) {
      console.log('Client not found')
      return null
    }

    if (!authorization.code) {
      console.log('Authorization code is required for authorization_code grant type')
      return null
    }

    const authCode: AuthCodeModel | null = await this.loadAuthCodeRepository.load(authorization.code, authorization.clientId)
    if (!authCode || authCode.expiresAt < new Date()) {
      console.log('Authorization code not found or invalid')
      return null
    }

    const isAuthenticationValid = await this.validateAuthentication(authCode, client, authorization)
    if (!isAuthenticationValid) {
      return null
    }

    if (!this.isCodeChallengeMethodSupported(authCode)) {
      console.log('Unsupported code challenge method:', authCode.codeChallengeMethod)
      return null
    }

    return await this.generateTokenResponse(authCode, authorization)
  }

  private async validateAuthentication (authCode: any, client: any, authorization: OauthTokenModel): Promise<boolean> {
    if (authCode.codeChallenge) {
      return await this.validatePKCE(authCode, authorization)
    }

    return this.validateClientSecret(client, authorization)
  }

  private async validatePKCE (authCode: any, authorization: OauthTokenModel): Promise<boolean> {
    console.log('PKCE codeChallenge salvo na base:', authCode.codeChallenge)
    console.log('PKCE recebido codeVerifier:', authorization.codeVerifier)

    const hash = await this.hasher.createHash(authorization.codeVerifier)
    const codeChallenge = hash.toString()
    console.log('PKCE codeChallenge gerado no backend:', codeChallenge)

    if (authCode.codeChallenge !== codeChallenge) {
      console.log('PKCE code challenge mismatch')
      return false
    }

    return true
  }

  private validateClientSecret (client: any, authorization: OauthTokenModel): boolean {
    if (client.clientSecret !== authorization.clientSecret) {
      console.log('Client secret mismatch')
      return false
    }
    return true
  }

  private isCodeChallengeMethodSupported (authCode: any): boolean {
    return !authCode.codeChallengeMethod || authCode.codeChallengeMethod === 'S256'
  }

  private async generateTokenResponse (authCode: AuthCodeModel, authorization: OauthTokenModel): Promise<OauthTokenResponse> {
    const accessToken = await this.encrypter.encrypt(authCode.accountId, this.timeExpiresIn)
    const refreshToken = await this.hasher.hash('')

    await this.storeRefreshToken(refreshToken, authCode.accountId, authorization.clientId)
    await this.deleteAuthCodeRepository.delete(authCode.code, authorization.clientId)

    return {
      accessToken,
      refreshToken,
      expiresIn: this.timeExpiresIn,
      tokenType: 'Bearer'
    }
  }

  private async storeRefreshToken (refreshToken: string, accountId: string, clientId: string): Promise<void> {
    await this.refreshTokenMongoRepository.add({
      token: refreshToken,
      accountId,
      clientId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours
    })
  }

  private async handleRefreshTokenGrant (authorization: OauthTokenModel): Promise<OauthTokenResponse | null> {
    if (!authorization.refreshToken) {
      return null
    }

    const refreshToken = await this.refreshTokenMongoRepository.load(authorization.refreshToken)
    if (!refreshToken) {
      return null
    }

    if (refreshToken.expiresAt < new Date()) {
      return null
    }

    const accessToken = await this.encrypter.encrypt(refreshToken.accountId, this.timeExpiresIn)

    return {
      accessToken,
      refreshToken: authorization.refreshToken,
      expiresIn: this.timeExpiresIn,
      tokenType: 'Bearer'
    }
  }
}
