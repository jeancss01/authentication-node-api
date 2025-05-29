import type { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols'
// This file defines a LogControllerDecorator that wraps a Controller to log errors.
export class LogControllerDecorator implements Controller {
  private readonly controller: Controller

  constructor (controller: Controller) {
    this.controller = controller
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    const httpResponse = await this.controller.handle(httpRequest)
    if (httpResponse.statusCode === 500) {
      console.error('An error occurred:', httpResponse.body)
    }
    return httpResponse
  }
}
