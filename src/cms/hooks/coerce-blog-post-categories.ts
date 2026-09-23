import type { CollectionAfterReadHook, CollectionBeforeChangeHook } from 'payload'

function toCategoryIdList(value: unknown): string[] {
  if (value == null || value === '') return []
  const items = Array.isArray(value) ? value : [value]
  return items
    .map((item) => {
      if (typeof item === 'string' || typeof item === 'number') return String(item)
      if (item && typeof item === 'object' && 'id' in item && item.id != null) {
        return String(item.id)
      }
      return null
    })
    .filter((id): id is string => Boolean(id))
}

/** Posts saved before `category` became `hasMany` still store a single value. */
export const coerceBlogPostCategoriesOnWrite: CollectionBeforeChangeHook = ({ data }) => {
  if (!data || !('category' in data)) return data
  data.category = toCategoryIdList(data.category)
  return data
}

export const coerceBlogPostCategoriesOnRead: CollectionAfterReadHook = ({ doc }) => {
  if (!doc) return doc
  if (doc.category == null || doc.category === '') {
    doc.category = []
    return doc
  }
  if (!Array.isArray(doc.category)) {
    doc.category = [doc.category]
  }
  return doc
}
