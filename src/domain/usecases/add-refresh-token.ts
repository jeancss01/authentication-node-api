import type { RefreshTokenModel } from '../models/refresh-token'

export interface AddRefreshTokenModel {
  token: string
  accountId: string
  clientId: string
  expiresAt: Date
}

export interface AddRefreshToken {
  add: (data: AddRefreshTokenModel) => Promise<RefreshTokenModel>
}
