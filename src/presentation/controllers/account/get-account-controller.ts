import type { GetAccount } from '../../../domain/usecases/get-account'
import { notFound, ok, serverError } from '../../helpers/http/http-helper'
import type { Controller, HttpResponse, HttpRequest } from '../../protocols'
import type { Validation } from '../../protocols/validation'

export class GetAccountController implements Controller {
  constructor (
    private readonly account: GetAccount,
    private readonly validation: Validation
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      console.log('Account ID:', httpRequest.accountId)
      const accountId = httpRequest.accountId
      const account = await this.account.get(String(accountId))
      if (!account) {
        return notFound()
      }

      return ok({
        id: account.id,
        name: account.name,
        email: account.email,
        birthday: account.birthday,
        country: account.country,
        city: account.city,
        state: account.state
      })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
