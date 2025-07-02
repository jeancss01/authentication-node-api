import type { GetAccount } from '../../../domain/usecases/get-account'
import { badRequest, notFound, ok, serverError } from '../../helpers/http/http-helper'
import type { Controller, HttpResponse, HttpRequest } from '../../protocols'
import type { Validation } from '../../protocols/validation'

export class GetAccountController implements Controller {
  constructor (
    private readonly account: GetAccount,
    private readonly validation: Validation
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.query)
      if (error) {
        return badRequest(error)
      }
      const { accountId } = httpRequest.query
      if (accountId.length < 24) {
        return badRequest(new Error('accountId is not empty or null and must be 24 characters long'))
      }

      const account = await this.account.get(String(accountId))
      if (!account) {
        return notFound()
      }

      return ok({
        id: account.id,
        name: account.name,
        email: account.email,
        brithday: account.brithday,
        country: account.country,
        city: account.city,
        state: account.state
      })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
