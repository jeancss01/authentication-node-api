import { MissingParamError } from '../../errors/missing-param-error'
import type { Validation } from '../../protocols/validation'

export class RequiredFieldValidation implements Validation {
  constructor (private readonly fieldName: string) {}

  validate (input: any): Error | null {
    if (!input?.[this.fieldName]) {
      return new MissingParamError(this.fieldName)
    }
    return null
  }
}
