import { useState, useCallback } from 'react'

const recursivelyPopulateDirtyFields = (dirty = {} as any, eventMetadata: any): any => {
  const { fieldName, nestedFormEvent } = eventMetadata
  const nextDirtyValue =
    nestedFormEvent !== undefined
      ? recursivelyPopulateDirtyFields(dirty[fieldName], nestedFormEvent)
      : true

  return {
    ...dirty,
    [eventMetadata.fieldName]: nextDirtyValue
  }
}

const useDirtyValues = (baseOnChange: any = () => {}) => {
  const dirtyStateHook = useState({})
  const [, setDirty] = dirtyStateHook
  const onChange = useCallback(
    (eventMetadata, ...args) => {
      setDirty(dirty => recursivelyPopulateDirtyFields(dirty, eventMetadata))
      baseOnChange(eventMetadata, ...args)
    },
    [baseOnChange, setDirty]
  )

  return [dirtyStateHook, onChange]
}

export default useDirtyValues
