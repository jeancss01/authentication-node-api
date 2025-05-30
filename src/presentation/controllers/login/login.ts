import { MissingParamError, ServerError } from '../../errors'
import { badRequest } from '../../helpers/http-helper'
import type { HttpRequest, HttpResponse, Controller } from '../../protocols'

export class LoginController implements Controller {
  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    if (!httpRequest.body.email) {
      return badRequest(new MissingParamError('email'))
    }
    if (!httpRequest.body.password) {
      return badRequest(new MissingParamError('password'))
    }
    return badRequest(new ServerError('This is a placeholder for a successful response'))
  }
}
