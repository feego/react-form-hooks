const FIELD_TYPE = Symbol('FIELD')
const FORM_TYPE = Symbol('FORM')

export const isField = (field: any) => field['#type'] === FIELD_TYPE
export const isForm = (field: any) => field['#type'] === FORM_TYPE

export const createField = (validators: any = [], metadata?: any) => ({
  '#type': FIELD_TYPE,
  validators,
  metadata
})

export const createForm = (fields: any) => {
  const fieldsByName = fields.reduce((result: any, [name, field]: [any, any]) => {
    return {
      ...result,
      [name]: field
    }
  }, {})

  return {
    '#type': FORM_TYPE,
    '#fieldsByName': fieldsByName,
    '#fields': fields
  }
}

export const map = (schema: any, mapFunction: (field: any) => any) => {
  const fields = schema['#fields']
  return createForm(fields.map(mapFunction))
}

export const getField = (schema: any, key: any) => {
  const { [key]: field } = schema['#fieldsByName']

  return field
}

export const getFields = (schema: any) => schema['#fields']
