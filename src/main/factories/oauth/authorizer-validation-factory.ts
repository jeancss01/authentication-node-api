import { EmailValidation, ValidationComposite, RequiredFieldValidation } from '../../../presentation/helpers/validators'
import type { Validation } from '../../../presentation/protocols/validation'
import { EmailValidatorAdapter } from '../../adapters/validators/email-validator-adapter'

export const makeAuthorizationValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  for (const field of ['clientId', 'redirectUri', 'password', 'codeChallenge', 'codeChallengeMethod', 'email']) {
    validations.push(new RequiredFieldValidation(field))
  }
  validations.push(new EmailValidation('email', new EmailValidatorAdapter()))
  return new ValidationComposite(validations)
}
