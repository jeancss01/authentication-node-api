export interface AuthCodeModel {
  id: string
  code: string
  clientId: string
  accountId: string
  codeChallenge: string
  codeChallengeMethod: string
  expiresAt: Date
  createdAt: Date
}
