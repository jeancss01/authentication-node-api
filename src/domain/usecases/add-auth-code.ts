import { type AuthCodeModel } from '../models/auth-code'

export interface AddAuthCodeModel {
  code: string
  clientId: string
  accountId: string
  codeChallenge: string
  codeChallengeMethod: string
  expiresAt: Date
  createdAt: Date
}

export interface AddAuthCode {
  add: (data: AddAuthCodeModel) => Promise<AuthCodeModel>
}
