import type { HttpResponse, HttpRequest, Controller, AddAccount, Validation } from './signup-controller-protocols'
import { badRequest, serverError, ok } from '../../helpers/http/http-helper'

export class SignUpController implements Controller {
  private readonly addAccount: AddAccount
  private readonly validation: Validation
  constructor (addAccount: AddAccount, validation: Validation) {
    this.validation = validation
    this.addAccount = addAccount
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }

      const { password, email, name, birthday, country, city, state } = httpRequest.body
      const account = await this.addAccount.add({
        name,
        email,
        password,
        birthday,
        country,
        city,
        state
      })

      return ok(account)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
