import { InvalidParamError, MissingParamError, ServerError } from '../../errors'
import { badRequest, serverError } from '../../helpers/http-helper'
import type { HttpRequest, HttpResponse, Controller } from '../../protocols'
import { type EmailValidator } from '../signup/signup-protocols'

export class LoginController implements Controller {
  private readonly emailValidator: EmailValidator

  constructor (emailValidator: EmailValidator) {
    this.emailValidator = emailValidator
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { email, password } = httpRequest.body
      if (!email) {
        return await new Promise(resolve => {
          resolve(badRequest(new MissingParamError('email')))
        })
      }
      if (!password) {
        return await new Promise(resolve => {
          resolve(badRequest(new MissingParamError('password')))
        })
      }

      const isValid = this.emailValidator.isValid(email as string)

      if (!isValid) {
        return await new Promise(resolve => {
          resolve(badRequest(new InvalidParamError('email')))
        })
      }
      return badRequest(new ServerError('This is a placeholder for a successful response'))
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
