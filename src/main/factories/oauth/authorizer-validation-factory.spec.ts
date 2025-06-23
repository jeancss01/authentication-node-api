import { RequiredFieldValidation, ValidationComposite, EmailValidation } from '../../../presentation/helpers/validators'
import { type EmailValidator } from '../../../presentation/protocols/email-validator'
import { makeAuthorizationValidation } from './authorizer-validation-factory'

jest.mock('../../../presentation/helpers/validators/validation-composite')

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

describe('AuthorizationValidation Factory', () => {
  test('should call ValidationComposite with all validations', () => {
    makeAuthorizationValidation()
    const validations: any[] = []
    for (const field of ['clientId', 'redirectUri', 'password', 'codeChallenge', 'codeChallengeMethod', 'email']) {
      validations.push(new RequiredFieldValidation(field))
    }
    validations.push(new EmailValidation('email', makeEmailValidator()))
    expect(ValidationComposite).toHaveBeenCalledTimes(1)
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})
