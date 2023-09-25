import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert'
import TodoService from "../src/todoService.js";
import Todo from "../src/todo.js";

describe('todoService test Suite', () => {
    describe('#list', () => {
        let _todoService
        let _dependencies
        const mockDatabase = [
            {
                text: 'I must fix my old car',
                when: new Date ('2021-02-21T00:00:00.000Z'),
                status: 'late',
                id: 'f6106fee-6d5e-43f6-a9ba-2c8f222dd5d2'
            }
        ]

        beforeEach((context) => {
            _dependencies = {
                todoRepository: {
                    list: context.mock.fn( async () => mockDatabase)
                }
            }

            _todoService = new TodoService(_dependencies)
        })

        it('should return a list of items with uppercase text', async () => {
            const expected = mockDatabase.map(({ text, ...result }) => ({ text: text.toUpperCase(), ...result }))
            const result = await _todoService.list()
            assert.deepStrictEqual(result, expected)
            const fnMock = _dependencies.todoRepository.list.mock
            assert.strictEqual(fnMock.callCount(), 1)
        })
    })

    describe('#create', () => {
        let _todoService
        let _dependencies
        const mockDatabase = {
            text: 'I must fix my old car',
            when: new Date('2021-02-21T00:00:00.000Z'),
            status: 'late',
            id: 'f6106fee-6d5e-43f6-a9ba-2c8f222dd5d2'
        }

        beforeEach((context) => {
            _dependencies = {
                todoRepository: {
                    create: context.mock.fn( async () => mockDatabase)
                }
            }

            _todoService = new TodoService(_dependencies)
        })

        it(`shouldn't save todo item with invalid data`, async () => {
            const expected = mockDatabase.map(({ text, ...result }) => ({ text: text.toUpperCase(), ...result }))
            const result = await _todoService.list()
            assert.deepStrictEqual(result, expected)
        })
    })
})