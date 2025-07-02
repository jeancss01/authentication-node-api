export interface RefreshTokenModel {
  id: string
  token: string
  accountId: string
  clientId: string
  expiresAt: Date
  createdAt: Date
}
