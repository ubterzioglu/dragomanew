import { describe, expect, it, vi } from 'vitest'
import { SMTP_TIMEOUTS, smtpTransportOptions, withTimeoutLabel } from '../../../supabase/functions/_shared/mail/smtpOptions.ts'
import { clientIp, UNKNOWN_CLIENT } from '../../../supabase/functions/submit-request/http.ts'
import { createIpHasher, THROTTLE_SALT_MIN_LENGTH } from '../../../supabase/functions/submit-request/ipHash.ts'
import { mailerFromEnv, readSmtp, SMTP_NOT_CONFIGURED } from '../../../supabase/functions/submit-request/mailer.ts'
import { createReporter, describeError, redactEmails } from '../../../supabase/functions/submit-request/redact.ts'
import { throttleSubmission, type RpcClient } from '../../../supabase/functions/submit-request/throttle.ts'
import type { Mailer, MailMessage } from '../../../supabase/functions/submit-request/types.ts'

const MESSAGE: MailMessage = { to: 'a@example.com', subject: 's', text: 't', html: 'h' }

const request = (headers: Record<string, string>) => new Request('http://localhost/functions/v1/submit-request', { headers })

describe('clientIp', () => {
  it('prefers cf-connecting-ip over any X-Forwarded-For', () => {
    expect(clientIp(request({ 'cf-connecting-ip': '192.0.2.44', 'x-forwarded-for': '198.18.0.1, 203.0.113.7' }))).toBe('192.0.2.44')
  })

  it('takes the right-most X-Forwarded-For entry, never a forged leading one', () => {
    expect(clientIp(request({ 'x-forwarded-for': '198.18.0.1, 10.0.0.9 , 203.0.113.7' }))).toBe('203.0.113.7')
    expect(clientIp(request({ 'x-forwarded-for': 'spoofed,203.0.113.7' }))).toBe('203.0.113.7')
  })

  it('falls back to the shared unknown bucket, ignoring X-Real-IP', () => {
    expect(clientIp(request({}))).toBe(UNKNOWN_CLIENT)
    expect(clientIp(request({ 'x-forwarded-for': ' , ' }))).toBe(UNKNOWN_CLIENT)
    expect(clientIp(request({ 'x-real-ip': '198.18.0.7' }))).toBe(UNKNOWN_CLIENT)
    expect(clientIp(request({ 'cf-connecting-ip': '  ' }))).toBe(UNKNOWN_CLIENT)
  })
})

describe('THROTTLE_SALT guard', () => {
  it('accepts a salt of at least 32 characters', () => {
    expect(THROTTLE_SALT_MIN_LENGTH).toBe(32)
    expect(() => createIpHasher('x'.repeat(32))).not.toThrow()
  })

  it('refuses a short salt, naming the variable and never the value', () => {
    for (const salt of ['test', 'secret-but-short', 'x'.repeat(31)]) {
      let thrown: unknown
      try {
        createIpHasher(salt)
      } catch (error) {
        thrown = error
      }
      expect(thrown).toBeInstanceOf(Error)
      expect((thrown as Error).message).toMatch(/THROTTLE_SALT/)
      expect((thrown as Error).message).not.toContain(salt)
    }
  })

  it('refuses the .env.example placeholder, however long it is', () => {
    expect(() => createIpHasher('change-me-to-a-long-random-string')).toThrow(/THROTTLE_SALT/)
  })
})

describe('SMTP transport options', () => {
  const settings = { host: 'smtp.zoho.eu', port: 465, secure: true, user: 'u', pass: 'p', from: 'Dragoman <info@x.example>' }
  /** env.ts MAIL_TIMEOUT_MS: the handler marks a mail failed after this long. */
  const HANDLER_DEADLINE_MS = 8_000

  it('gives up on the connection, the greeting and the socket before the handler deadline', () => {
    const options = smtpTransportOptions(settings)
    expect(options).toMatchObject({ connectionTimeout: 5_000, greetingTimeout: 5_000, socketTimeout: 7_000 })
    for (const value of Object.values(SMTP_TIMEOUTS)) expect(value).toBeLessThan(HANDLER_DEADLINE_MS)
  })

  it('passes host, port, TLS and auth through, and skips auth and STARTTLS for local Mailpit', () => {
    expect(smtpTransportOptions(settings)).toMatchObject({ host: 'smtp.zoho.eu', port: 465, secure: true, ignoreTLS: false, auth: { user: 'u', pass: 'p' } })
    const local = smtpTransportOptions({ ...settings, secure: false, user: null, pass: null })
    expect(local).toMatchObject({ secure: false, ignoreTLS: true })
    expect(local.auth).toBeUndefined()
  })

  it('labels nodemailer timeouts so last_error says timeout, and leaves other errors alone', () => {
    const connection = Object.assign(new Error('Connection timeout'), { code: 'ETIMEDOUT' })
    expect(withTimeoutLabel(connection)).toMatchObject({ message: 'timeout: Connection timeout' })
    const greeting = Object.assign(new Error('Greeting never received'), { code: 'ETIMEDOUT' })
    expect(withTimeoutLabel(greeting)).toMatchObject({ message: 'timeout: Greeting never received' })
    const refused = Object.assign(new Error('550 mailbox unavailable'), { code: 'EENVELOPE' })
    expect(withTimeoutLabel(refused)).toBe(refused)
    expect(withTimeoutLabel('odd')).toBe('odd')
  })
})

describe('throttleSubmission (the RPC call)', () => {
  const client = (reply: { data: unknown; error: unknown }) => {
    const rpc = vi.fn<RpcClient['rpc']>(async () => reply)
    return { db: { rpc }, rpc }
  }

  it('calls public.throttle_submission once with the hash and the limit', async () => {
    const { db, rpc } = client({ data: true, error: null })
    await expect(throttleSubmission(db, 'abc', { max: 5, windowSeconds: 600 })).resolves.toBe(true)
    expect(rpc).toHaveBeenCalledTimes(1)
    expect(rpc).toHaveBeenCalledWith('throttle_submission', { p_ip_hash: 'abc', p_max: 5, p_window_seconds: 600 })
  })

  it('passes a refusal through as false', async () => {
    await expect(throttleSubmission(client({ data: false, error: null }).db, 'abc', { max: 5, windowSeconds: 600 })).resolves.toBe(false)
  })

  it('throws on a database error or a reply that is not a boolean', async () => {
    const failure = { code: '42501', message: 'permission denied' }
    await expect(throttleSubmission(client({ data: null, error: failure }).db, 'abc', { max: 5, windowSeconds: 600 })).rejects.toBe(failure)
    await expect(throttleSubmission(client({ data: null, error: null }).db, 'abc', { max: 5, windowSeconds: 600 })).rejects.toThrow(/boolean/)
    await expect(throttleSubmission(client({ data: 'true', error: null }).db, 'abc', { max: 5, windowSeconds: 600 })).rejects.toThrow(/boolean/)
  })
})

describe('readSmtp', () => {
  const env = (values: Record<string, string>) => (name: string) => values[name]
  const complete = { SMTP_HOST: 'smtp.zoho.eu', SMTP_PORT: '465', SMTP_USER: 'u', SMTP_PASS: 'p', MAIL_FROM: 'Dragoman <info@x.example>' }

  it('reads a complete Zoho setting with implicit TLS', () => {
    expect(readSmtp(env(complete))).toEqual({
      ok: true,
      settings: { host: 'smtp.zoho.eu', port: 465, secure: true, user: 'u', pass: 'p', from: 'Dragoman <info@x.example>' },
    })
  })

  it('defaults to port 465 and turns TLS off only for SMTP_SECURE=false (local Mailpit)', () => {
    const result = readSmtp(env({ SMTP_HOST: '127.0.0.1', MAIL_FROM: 'dev@x.example', SMTP_SECURE: 'false' }))
    expect(result).toEqual({ ok: true, settings: { host: '127.0.0.1', port: 465, secure: false, user: null, pass: null, from: 'dev@x.example' } })
  })

  it('names every missing or wrong variable, and never echoes a value', () => {
    const result = readSmtp(env({ SMTP_PORT: 'secret-port', SMTP_USER: 'secret-user' }))
    expect(result).toEqual({ ok: false, invalid: ['SMTP_HOST', 'SMTP_PORT', 'MAIL_FROM', 'SMTP_PASS'] })
    expect(JSON.stringify(result)).not.toMatch(/secret/)
  })

  it('treats blank values as missing and refuses ports out of range', () => {
    expect(readSmtp(env({ ...complete, SMTP_HOST: '  ' }))).toEqual({ ok: false, invalid: ['SMTP_HOST'] })
    expect(readSmtp(env({ ...complete, SMTP_PORT: '70000' }))).toEqual({ ok: false, invalid: ['SMTP_PORT'] })
    expect(readSmtp(env({ ...complete, SMTP_PASS: '' }))).toEqual({ ok: false, invalid: ['SMTP_PASS'] })
  })
})

describe('mailerFromEnv', () => {
  it('falls back to a mailer that rejects with smtp_not_configured, logging only variable names', async () => {
    const report = vi.fn()
    const build = vi.fn()
    const mailer = mailerFromEnv((name) => ({ SMTP_PASS: 'hunter2' })[name], build, report)
    expect(build).not.toHaveBeenCalled()
    expect(report).toHaveBeenCalledTimes(1)
    expect(report.mock.calls[0]?.[0]).toMatch(/SMTP_HOST, MAIL_FROM, SMTP_USER/)
    expect(JSON.stringify(report.mock.calls)).not.toContain('hunter2')
    await expect(mailer.send(MESSAGE)).rejects.toThrow(SMTP_NOT_CONFIGURED)
  })

  it('builds the real mailer from a complete setting', () => {
    const report = vi.fn()
    const real: Mailer = { send: async () => undefined }
    const build = vi.fn(() => real)
    const mailer = mailerFromEnv((name) => ({ SMTP_HOST: 'h', MAIL_FROM: 'f@x.example' })[name], build, report)
    expect(mailer).toBe(real)
    expect(build).toHaveBeenCalledWith({ host: 'h', port: 465, secure: true, user: null, pass: null, from: 'f@x.example' })
    expect(report).not.toHaveBeenCalled()
  })

  it('survives a transport that throws while being built, logging only the error class', async () => {
    const report = vi.fn()
    const mailer = mailerFromEnv(
      (name) => ({ SMTP_HOST: 'h', MAIL_FROM: 'f@x.example' })[name],
      () => {
        throw new TypeError('bad host h for f@x.example')
      },
      report,
    )
    expect(report.mock.calls[0]?.[0]).toMatch(/TypeError/)
    expect(JSON.stringify(report.mock.calls)).not.toContain('f@x.example')
    await expect(mailer.send(MESSAGE)).rejects.toThrow(SMTP_NOT_CONFIGURED)
  })
})

describe('log masking', () => {
  it('masks e-mail addresses and keeps the error code', () => {
    expect(redactEmails('rejected: Ayse.Y+x@mail.example.com, b@c.io')).toBe('rejected: [email], [email]')
    const smtp = Object.assign(new Error('Can not send to ayse@example.com'), { code: 'EENVELOPE', responseCode: 550 })
    expect(describeError(smtp)).toBe('Error EENVELOPE 550: Can not send to [email]')
    expect(describeError({ message: 'Key (email)=(x@y.example) exists', code: '23505' })).toBe('23505: Key (email)=([email]) exists')
    expect(describeError('plain x@y.example')).toBe('plain [email]')
  })

  it('never logs the fields of an error object besides message and codes', () => {
    const postgrest = { message: 'duplicate key', code: '23505', details: 'Key (email)=(ayse@example.com)', payload: { note: 'secret note' } }
    expect(describeError(postgrest)).toBe('23505: duplicate key')
    expect(describeError({ toString: () => 'secret note' })).not.toContain('secret')
  })

  it('caps a logged message', () => {
    expect(describeError(new Error('x'.repeat(5000))).length).toBeLessThanOrEqual('Error: '.length + 500)
  })

  it('writes one masked line per failure through reportError', () => {
    const log = vi.fn()
    createReporter(log)('submit-request: customer_receipt not sent', new Error('550 <ayse@example.com>: rejected'))
    expect(log).toHaveBeenCalledWith('submit-request: customer_receipt not sent: Error: 550 <[email]>: rejected')
  })
})
