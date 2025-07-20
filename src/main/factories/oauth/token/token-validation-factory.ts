import { ValidationComposite, RequiredFieldValidation } from '../../../../presentation/helpers/validators'
import type { Validation } from '../../../../presentation/protocols/validation'

export const makeTokenValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  for (const field of ['grantType']) {
    validations.push(new RequiredFieldValidation(field))
  }
  return new ValidationComposite(validations)
}
