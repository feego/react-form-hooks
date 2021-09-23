import { getFields, isForm } from './schemaUtils'

export const Errors = {
  Required: 'Required',
  InvalidType: 'InvalidType',
  FailedRegex: 'FailedRegex',
  Unexpected: 'Unexpected'
}

const typeCheckers: any = {
  number: (value: any) => Boolean(parseInt(value, 10))
}

const identity = [true]

export const identityValidator = (result = identity) => result

export const requiredValidator = (result: any, value: any) =>
  !value ? [false, Errors.Required] : identityValidator(result)

export const createTypeValidator = (type: any) => (result: any, value: any) => {
  const typeChecker = typeCheckers[type]

  return typeChecker !== undefined && !typeChecker(value)
    ? [false, Errors.InvalidType]
    : identityValidator(result)
}

export const createRegexValidator = (regex: any, error: any = Errors.FailedRegex) => (
  result: any,
  value: any
) => (!regex.test(value) ? [false, error] : identityValidator(result))

/**
 * Validates a field value.
 *
 * @param {Object} field - Field schema.
 * @param {any} value - Field value.
 * @param {Object} metadata - Configurations and metadata for validations (validators and other fields data).
 * @returns {Array} Array with a boolean that flags the validation result and the error as the second element.
 */
export const validateField = (field: any, value: any, metadata: any) => {
  const { validators = [identityValidator] } = field

  return validators.reduce(
    (result: any, validator: any) => validator(result, value, field, metadata),
    identity
  )
}

/**
 * Validates a fields array.
 *
 * @example Example structute:
 * [{ name: 'firstName', placeholder: 'first-name' }, { ... }]
 *
 * @param {Schema} schema - Form schema.
 * @param {Object} values - Values to validate.
 * @param {Object} touched - Touched fields.
 * @returns {Array} Array with a boolean that flags the validation result and the errors object as the second element.
 */
export default function validate(schema: any, values: any = {}, touched: any = {}) {
  return getFields(schema).reduce(
    ([isValid, fieldValidationResults]: any, [fieldName, field]: any) => {
      const wasFieldTouched = Boolean(touched[fieldName])

      // We only validate touched fields.
      // eslint-disable-next-line no-nested-ternary
      const validationResult = isForm(field)
        ? validate(field, values[fieldName], touched[fieldName])
        : wasFieldTouched
        ? validateField(field, values[fieldName], {
            fieldName,
            fields: getFields(schema),
            values
          })
        : identity

      return [
        isValid && validationResult[0],
        {
          ...fieldValidationResults,
          [fieldName]: validationResult
        }
      ]
    },
    [true, {}]
  )
}
