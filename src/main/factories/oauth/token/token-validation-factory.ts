import { ValidationComposite, RequiredFieldValidation } from '../../../../presentation/helpers/validators'
import type { Validation } from '../../../../presentation/protocols/validation'

export const makeTokenValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  for (const field of ['clientId', 'redirectUri', 'codeVerifier', 'grantType', 'scope', 'code']) {
    validations.push(new RequiredFieldValidation(field))
  }
  return new ValidationComposite(validations)
}
