import { MissingParamError } from '../../errors'
import { badRequest } from '../../helpers/http-helper'
import type { HttpRequest, HttpResponse, Controller } from '../../protocols'

export class LoginController implements Controller {
  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    return badRequest(new MissingParamError('email'))
  }
}
