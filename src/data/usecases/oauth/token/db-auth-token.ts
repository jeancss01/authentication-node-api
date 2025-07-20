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
    // Check if the grant type is supported
    if (authorization.grantType === 'authorization_code') {
      // Load the client from the repository
      const client = await this.loadClientByClientIdRepository.loadByClientId(authorization.clientId)
      // Check if the client exists and the client secret matches
      // If the client is not found or the secret does not match, return null
      if (!client) {
        return null // Client not found or invalid secret, return null
      }
      // Handle authorization code grant type
      if (!authorization.code) {
        return null // Code is required for authorization_code grant type
      }

      // Load the authorization code from the repository
      // Check if the authorization code exists and is valid
      // If the code is expired or not found, return null
      const authCode = await this.loadAuthCodeRepository.load(authorization.code, authorization.clientId)
      if (!authCode || authCode.expiresAt < new Date()) {
        return null // Auth code not found or invalid, return null
      }
      // Check if PKCE is used
      if (authCode.codeChallenge) {
        // console.log('PKCE codeChallenge salvo na base:', authCode.codeChallenge)
        // console.log('PKCE recebido codeVerifier:', authorization.codeVerifier)
        const hash = await this.hasher.createHash(authorization.codeVerifier)
        const codeChallenge = hash.toString()
        // console.log('PKCE codeChallenge gerado no backend:', codeChallenge)
        if (authCode.codeChallenge !== codeChallenge) {
          return null // Code challenge mismatch, return null PKCE Invalid
        }
      } else if (client.clientSecret !== authorization.clientSecret) {
        // If PKCE is not used, check if the client secret matches
        return null // Client secret mismatch, return null
      }
      // Check if code challenge method is supported
      // Currently, only S256 is supported as per OAuth 2.0 PKCE specification
      if (authCode.codeChallengeMethod && authCode.codeChallengeMethod !== 'S256') {
        return null // Unsupported code challenge method, return null
      }
      // Generate access token and refresh token
      // Encrypt the accountId to create the access token
      const accessToken = await this.encrypter.encrypt(authCode.accountId, this.timeExpiresIn) // Assuming 100 seconds expiration
      const refreshToken = await this.hasher.hash('')

      // Add the refresh token to the database
      await this.refreshTokenMongoRepository.add({
        token: refreshToken,
        accountId: authCode.accountId,
        clientId: authorization.clientId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours
      })
      // Delete the authorization code after successful token generation
      await this.deleteAuthCodeRepository.delete(authCode.code, authorization.clientId)

      // Return the token response
      return {
        accessToken,
        refreshToken,
        expiresIn: this.timeExpiresIn,
        tokenType: 'Bearer'
      }
    } else if (authorization.grantType === 'refresh_token') {
      // Handle refresh token grant type
      if (!authorization.refreshToken) {
        return null // Refresh token is required for refresh_token grant type
      }

      // Load the refresh token from the repository
      const refreshToken = await this.refreshTokenMongoRepository.load(authorization.refreshToken)
      if (!refreshToken) {
        return null // Refresh token not found or invalid, return null
      }

      // Check if the refresh token is expired
      if (refreshToken.expiresAt < new Date()) {
        return null // Refresh token expired, return null
      }

      // Generate a new access token
      const accessToken = await this.encrypter.encrypt(refreshToken.accountId, this.timeExpiresIn)

      // Return the token response
      return {
        accessToken,
        refreshToken: authorization.refreshToken,
        expiresIn: this.timeExpiresIn,
        tokenType: 'Bearer'
      }
    } else {
      // Unsupported grant type
      return null // Return null for unsupported grant types
    }
  }
}
