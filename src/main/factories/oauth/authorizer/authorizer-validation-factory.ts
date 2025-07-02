import { ValidationComposite, RequiredFieldValidation } from '../../../../presentation/helpers/validators'
import type { Validation } from '../../../../presentation/protocols/validation'

export const makeAuthorizationValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  for (const field of ['clientId', 'redirectUri', 'codeChallenge', 'codeChallengeMethod']) {
    validations.push(new RequiredFieldValidation(field))
  }
  return new ValidationComposite(validations)
}
