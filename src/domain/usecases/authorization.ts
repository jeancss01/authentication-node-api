export interface Authorization {
  authorize: (authorization: AuthorizationModel) => Promise<string | null>
}
export interface AuthorizationModel {
  clientId: string
  redirectUri: string
  email: string
  password: string
  codeChallenge: string
  codeChallengeMethod: string
}
