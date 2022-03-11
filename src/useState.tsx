import { useState as useBaseState } from 'react'
import { getInitialTouched, getInitialValues, getInitialVisited } from './utils'

/**
 * Builds the state hooks that `useController` will use to store all form related data.
 * NOTE: `useFormController` already creates it's own state hooks internally by default, if we don't give it
 * custom owns as options. However, for the specific case of the single add form, we need to isolate the form
 * state from the controller, so we can access it before we actually use the form controller hook.
 *
 * @param {Object} options - Options.
 * @returns {Object} State hooks to be used with `useFormController`.
 */
export const useState = ({
  schema,
  initialValues,
  validateOnInit,
  /* eslint-disable react-hooks/rules-of-hooks */
  valuesStateHook = useBaseState(getInitialValues(schema, initialValues)),
  touchedStateHook = useBaseState(getInitialTouched(schema, validateOnInit)),
  visitedStateHook = useBaseState(getInitialVisited(schema))
}: any = {}) => ({
  valuesStateHook,
  touchedStateHook,
  visitedStateHook
})

export default useState
