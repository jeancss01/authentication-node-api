import { type AccountModel } from '../models/account'

export interface AddAccountModel {
  name: string
  email: string
  password: string
  brithday: string
  country: string
  city: string
  state: string
}

export interface AddAccount {
  add: (accountData: AddAccountModel) => Promise<AccountModel>
}
