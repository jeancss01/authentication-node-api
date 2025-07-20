export interface OauthToken {
  token: (authorization: OauthTokenModel) => Promise<OauthTokenResponse | null>
}

export interface OauthTokenModel {
  code: string
  clientId: string
  clientSecret: string
  codeVerifier: string
  grantType: string
  refreshToken?: string
  scope?: string
}

export interface OauthTokenResponse {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  tokenType: string
}
