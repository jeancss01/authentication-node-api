export interface OauthLogin {
  auth: (authorization: OauthLoginModel) => Promise<string | null>
}

export interface OauthLoginModel {
  email: string
  password: string
}
