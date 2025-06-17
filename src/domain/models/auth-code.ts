export interface AuthCodeModel {
  id: string
  code: string
  clientId: string
  userId: string
  codeChallenge: string
  codeChallengeMethod: string
  expiresAt: Date
  createdAt: Date
}
