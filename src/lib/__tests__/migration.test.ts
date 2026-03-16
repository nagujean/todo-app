// Migration 유틸리티 테스트
import { describe, it, expect } from 'vitest'
import {
  migrateDescriptionToContent,
  migrateTodos,
  needsMigration,
  countNeedsMigration,
} from '../migration'
import type { JSONContent } from '@tiptap/react'

describe('migration', () => {
  describe('migrateDescriptionToContent', () => {
    it('does nothing when content already exists', () => {
      const todo = {
        description: 'old description',
        content: { type: 'doc', content: [] } as JSONContent,
      }
      const result = migrateDescriptionToContent(todo)
      expect(result).toEqual(todo)
    })

    it('does nothing when description is missing', () => {
      const todo = {}
      const result = migrateDescriptionToContent(todo)
      expect(result).toEqual(todo)
    })

    it('converts description to content', () => {
      const todo = {
        description: 'Test description',
      }
      const result = migrateDescriptionToContent(todo)
      expect(result.content).toBeDefined()
      expect(result.content?.type).toBe('doc')
      expect(result.description).toBe('Test description')
    })

    it('preserves other fields', () => {
      const todo = {
        id: 'test-id',
        title: 'Test Todo',
        description: 'Test description',
        completed: false,
      }
      const result = migrateDescriptionToContent(todo)
      expect((result as typeof todo).id).toBe('test-id')
      expect((result as typeof todo).title).toBe('Test Todo')
      expect((result as typeof todo).completed).toBe(false)
    })
  })

  describe('migrateTodos', () => {
    it('migrates multiple todos', () => {
      const todos = [
        { description: 'First' },
        { description: 'Second' },
        { description: 'Third' },
      ]
      const result = migrateTodos(todos)
      expect(result).toHaveLength(3)
      expect(result[0].content).toBeDefined()
      expect(result[1].content).toBeDefined()
      expect(result[2].content).toBeDefined()
    })

    it('skips todos with existing content', () => {
      const todos = [
        { description: 'First' },
        { content: { type: 'doc', content: [] } as JSONContent },
        { description: 'Third' },
      ]
      const result = migrateTodos(todos)
      expect(result[1]).toEqual(todos[1])
    })

    it('handles empty array', () => {
      const result = migrateTodos([])
      expect(result).toEqual([])
    })
  })

  describe('needsMigration', () => {
    it('returns true when content is missing and description exists', () => {
      const todo = { description: 'Test' }
      expect(needsMigration(todo)).toBe(true)
    })

    it('returns false when content exists', () => {
      const todo = {
        description: 'Test',
        content: { type: 'doc', content: [] } as JSONContent,
      }
      expect(needsMigration(todo)).toBe(false)
    })

    it('returns false when description is missing', () => {
      const todo = {}
      expect(needsMigration(todo)).toBe(false)
    })

    it('returns false when both are missing', () => {
      const todo = {}
      expect(needsMigration(todo)).toBe(false)
    })
  })

  describe('countNeedsMigration', () => {
    it('counts todos needing migration', () => {
      const todos = [
        { description: 'First' },
        { content: { type: 'doc', content: [] } as JSONContent },
        { description: 'Second' },
        {},
        { description: 'Third' },
      ]
      const result = countNeedsMigration(todos)
      expect(result).toBe(3)
    })

    it('returns 0 for empty array', () => {
      expect(countNeedsMigration([])).toBe(0)
    })

    it('returns 0 when all todos have content', () => {
      const todos = [
        { content: { type: 'doc', content: [] } as JSONContent },
        { content: { type: 'doc', content: [] } as JSONContent },
      ]
      expect(countNeedsMigration(todos)).toBe(0)
    })
  })
})
