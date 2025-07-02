export interface Authorization {
  authorize: (authorization: AuthorizationModel) => Promise<string | null>
}
export interface AuthorizationModel {
  clientId: string
  redirectUri: string
  codeChallenge: string
  codeChallengeMethod: string
}
