import { describe, expect, it } from 'vitest'
import { withLastAnswer } from '../src/lib/lastAnswer'

/** A loader that answers from a script: a value, or an Error to throw. */
const scripted = (steps: ReadonlyArray<string[] | Error>) => {
  let call = 0
  return async (): Promise<string[]> => {
    const step = steps[Math.min(call, steps.length - 1)] ?? []
    call += 1
    if (step instanceof Error) throw step
    return step
  }
}

describe('withLastAnswer', () => {
  it('passes a fresh answer through', async () => {
    const run = withLastAnswer(scripted([['revisions.use']]))
    await expect(run('me')).resolves.toEqual(['revisions.use'])
  })

  it('keeps the last answer for the same key when a later read fails', async () => {
    const run = withLastAnswer(scripted([['revisions.use'], new Error('offline'), ['forms.manage']]))
    await run('me')
    await expect(run('me')).resolves.toEqual(['revisions.use'])
    await expect(run('me')).resolves.toEqual(['forms.manage'])
  })

  it('still fails when this key never had an answer', async () => {
    const run = withLastAnswer(scripted([['revisions.use'], new Error('offline')]))
    await run('me')
    await expect(run('someone-else')).rejects.toThrow('offline')
  })

  it('fails on a first read that fails', async () => {
    const run = withLastAnswer(scripted([new Error('offline')]))
    await expect(run('me')).rejects.toThrow('offline')
  })
})
