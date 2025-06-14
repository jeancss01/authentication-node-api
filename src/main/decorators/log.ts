import { type LogErrorRepository } from '../../data/protocols/log-error-repository'
import type { Controller, HttpRequest, HttpResponse } from '../../presentation/protocols'
// This file defines a LogControllerDecorator that wraps a Controller to log errors.
export class LogControllerDecorator implements Controller {
  private readonly controller: Controller
  private readonly logErrorRepository: LogErrorRepository

  constructor (controller: Controller, logErrorRepository: LogErrorRepository) {
    this.controller = controller
    this.logErrorRepository = logErrorRepository
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    const httpResponse = await this.controller.handle(httpRequest)
    if (httpResponse.statusCode === 500) {
      await this.logErrorRepository.logError(httpResponse.body.stack as string ?? 'Unknown error')
    }
    return httpResponse
  }
}
