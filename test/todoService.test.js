import { describe, it, beforeEach, before, after, afterEach } from 'node:test'
import assert from 'node:assert'
import crypto from 'node:crypto'
import sinon from 'sinon'
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
            const expected = mockDatabase.map(({ text, ...result }) => (new Todo({ text: text.toUpperCase(), ...result })))
            const result = await _todoService.list()
            assert.deepStrictEqual(result, expected)
            const fnMock = _dependencies.todoRepository.list.mock
            assert.strictEqual(fnMock.callCount(), 1)
        })
    })

    describe('#create', () => {
        let _todoService
        let _dependencies
        let _sandbox
        const mockDatabase = {
            text: 'I must fix my old car',
            when: new Date('2021-02-21T00:00:00.000Z'),
            status: 'late',
            id: 'f6106fee-6d5e-43f6-a9ba-2c8f222dd5d2'
        }
        const DEFAULT_ID = mockDatabase.id

        //mockando o dado do ID para o teste não depender do ambiente
        before(async() => {
            crypto.randomUUID = () => DEFAULT_ID
            _sandbox = sinon.createSandbox()
        })

        //trazendo o dado original caso algum outro teste precise
        after(async () => {
            crypto.randomUUID = (await import('node:crypto')).randomUUID
        })

        afterEach(() => _sandbox.restore())

        beforeEach((context) => {
            _dependencies = {
                todoRepository: {
                    create: context.mock.fn( async () => mockDatabase)
                }
            }

            _todoService = new TodoService(_dependencies)
        })

        it(`shouldn't save todo item with invalid data`, async () => {
            const input = new Todo({
                text: '',
                when: '',
            })
            const expected = {
                error: {
                    message: 'invalid data',
                    data: {
                        text: '',
                        when: '',
                        status: '',
                        id: DEFAULT_ID
                    }
                }
            }
            const result = await _todoService.create(input)
            assert.deepStrictEqual(JSON.stringify(result), JSON.stringify(expected))
        })

        it(`should save todo item with late status when the property is further than today`, async () => {
            const input = new Todo({
                text: 'I must fix my old car',
                when: new Date('2020-02-21T00:00:00.000Z')
            })
            const expected = {
                text: 'I must fix my old car',
                when: new Date('2020-02-21T00:00:00.000Z'),
                status: 'late',
                id: DEFAULT_ID
            }

            const today = new Date('2020-02-22')
            _sandbox.useFakeTimers(today.getTime())

            await _todoService.create(input)

            const fnMock = _dependencies.todoRepository.create.mock
            assert.strictEqual(fnMock.callCount(), 1)

            assert.deepStrictEqual(fnMock.calls[0].arguments[0], expected)
        })

        it(`should save todo item with pending status when the property is in the past`, async () => {
            const input = new Todo({
                text: 'I must fix my old car',
                when: new Date('2020-02-22T00:00:00.000Z')
            })
            const expected = {
                text: 'I must fix my old car',
                when: new Date('2020-02-22T00:00:00.000Z'),
                status: 'pending',
                id: DEFAULT_ID
            }

            const today = new Date('2020-02-21')
            _sandbox.useFakeTimers(today.getTime())

            await _todoService.create(input)

            const fnMock = _dependencies.todoRepository.create.mock
            assert.strictEqual(fnMock.callCount(), 1)

            assert.deepStrictEqual(fnMock.calls[0].arguments[0], expected)
        })
    })
})