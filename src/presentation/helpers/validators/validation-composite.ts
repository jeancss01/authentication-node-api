import { type Validation } from '../../protocols/validation'

export class ValidationComposite implements Validation {
  private readonly validators: Validation[]

  constructor (validators: Validation[]) {
    this.validators = validators
  }

  validate (input: any): Error | null {
    for (const validator of this.validators) {
      const error = validator.validate(input)
      if (error) {
        return error
      }
    }
    return null
  }
}
