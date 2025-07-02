import type { OauthToken, OauthTokenModel, OauthTokenResponse } from '../../../../domain/usecases/oauth/token'
import type { Hasher } from '../../../protocols/criptography/hasher'
import type { DeleteAuthCodeRepository } from '../../../protocols/db/auth-code/delete-auth-code-repository'
import type { LoadAuthCodeRepository } from '../../../protocols/db/auth-code/load-auth-code-repository'
import type { LoadClientByClientIdRepository } from '../../../protocols/db/client/load-client-by-client-id-repository'
import type { AddRefreshTokenRepository } from '../../../protocols/db/refresh-token/add-refresh-token-repository'
import type { Encrypter } from '../../authentication/db-authentication-protocols'

export class DbAuthToken implements OauthToken {
  constructor (
    private readonly loadClientByClientIdRepository: LoadClientByClientIdRepository,
    private readonly loadAuthCodeRepository: LoadAuthCodeRepository,
    private readonly addRefreshTokenRepository: AddRefreshTokenRepository,
    private readonly deleteAuthCodeRepository: DeleteAuthCodeRepository,
    private readonly hasher: Hasher,
    private readonly encrypter: Encrypter
  ) {}

  async token (authorization: OauthTokenModel): Promise<OauthTokenResponse | null> {
    // Load the client from the repository
    const client = await this.loadClientByClientIdRepository.loadByClientId(authorization.clientId)
    // Check if the client exists and the client secret matches
    // If the client is not found or the secret does not match, return null
    if (!client) {
      return null // Client not found or invalid secret, return null
    }

    // Check if the grant type is supported
    if (authorization.grantType === 'authorization_code') {
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
        const hash = await this.hasher.createHash(authorization.codeVerifier)
        const codeChallenge = hash.toString()
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
      const accessToken = await this.encrypter.encrypt(authCode.accountId)
      const refreshToken = await this.hasher.hash('')

      // Add the refresh token to the database
      await this.addRefreshTokenRepository.add({
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
        expiresIn: 900, // 15 minutes
        tokenType: 'Bearer'
      }
    } else {
      return null
    }
  }
}
