import { CodedError } from '../lib/errors'
import { parseNotifyAnswer, type NotifyAnswer } from '../lib/revisions/messages'
import type {
  RevisionAttachment,
  RevisionComment,
  RevisionRequest,
  RevisionStatus,
  RevisionStatusChange,
} from '../lib/revisions/model'
import { SCREENSHOT_BUCKET, screenshotPath } from '../lib/revisions/screenshots'
import { db } from '../lib/supabase'
import { callFunction } from './content/functions'

/**
 * The revision tables (RLS: revisions.use). Requester, author and uploader are stamped by the
 * database; status changes go through set_revision_status; screenshots go to the private
 * revision-screenshots bucket first, then get their attachment rows.
 */

const REQUEST_COLUMNS = 'id, number, requester_id, description, urgency, status, created_at, updated_at, completed_at'
const COMMENT_COLUMNS = 'id, request_id, author_id, body, created_at, edited_at'
const CHANGE_COLUMNS = 'id, request_id, from_status, to_status, changed_by, created_at'
const ATTACHMENT_COLUMNS = 'id, request_id, comment_id, object_path, uploaded_by, created_at'

/**
 * Ten minutes: a signed address works for whoever holds it, also after their access was removed, so
 * it stays short. A reload of the screen signs again.
 */
const SIGNED_URL_SECONDS = 600

export async function listRevisions(): Promise<RevisionRequest[]> {
  const { data, error } = await db()
    .from('revision_requests')
    .select(REQUEST_COLUMNS)
    .order('urgency', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as RevisionRequest[]
}

export interface RevisionDetail {
  /** Null when there is no such request (or no right to see it). */
  request: RevisionRequest | null
  comments: RevisionComment[]
  changes: RevisionStatusChange[]
  attachments: RevisionAttachment[]
}

export async function loadRevision(id: string): Promise<RevisionDetail> {
  const [request, comments, changes, attachments] = await Promise.all([
    db().from('revision_requests').select(REQUEST_COLUMNS).eq('id', id).maybeSingle(),
    db().from('revision_comments').select(COMMENT_COLUMNS).eq('request_id', id).order('created_at', { ascending: true }),
    db().from('revision_status_changes').select(CHANGE_COLUMNS).eq('request_id', id).order('created_at', { ascending: true }),
    db().from('revision_attachments').select(ATTACHMENT_COLUMNS).eq('request_id', id).order('created_at', { ascending: true }),
  ])
  const failed = [request, comments, changes, attachments].find((result) => result.error)
  if (failed?.error) throw failed.error
  return {
    request: (request.data ?? null) as RevisionRequest | null,
    comments: (comments.data ?? []) as RevisionComment[],
    changes: (changes.data ?? []) as RevisionStatusChange[],
    attachments: (attachments.data ?? []) as RevisionAttachment[],
  }
}

export async function createRevision(description: string, urgency: number): Promise<RevisionRequest> {
  const { data, error } = await db().from('revision_requests').insert({ description, urgency }).select(REQUEST_COLUMNS).single()
  if (error) throw error
  return data as RevisionRequest
}

export async function addComment(requestId: string, body: string): Promise<RevisionComment> {
  const { data, error } = await db().from('revision_comments').insert({ request_id: requestId, body }).select(COMMENT_COLUMNS).single()
  if (error) throw error
  return data as RevisionComment
}

/** Only the author's own comment matches; anything else changes no row and reads as "not found". */
export async function editComment(id: string, body: string): Promise<void> {
  const { error, count } = await db().from('revision_comments').update({ body }, { count: 'exact' }).eq('id', id)
  if (error) throw error
  if (count === 0) throw new CodedError('PGRST116')
}

/** Returns the id of the status-change row (the Tamamlandı mail names it). */
export async function setRevisionStatus(requestId: string, status: RevisionStatus): Promise<string> {
  const { data, error } = await db().rpc('set_revision_status', { p_request: requestId, p_status: status })
  if (error) throw error
  return data as string
}

export interface ScreenshotTarget {
  requestId: string
  /** Null: the screenshots belong to the request itself. */
  commentId: string | null
}

/**
 * Uploads every file to `<request>/<uuid>.<ext>`, records the ones that arrived in one insert, then
 * throws the first upload failure, if any, so the screen can say that something is missing.
 */
export async function attachScreenshots(
  target: ScreenshotTarget,
  files: readonly File[],
  newId: () => string = () => crypto.randomUUID(),
): Promise<void> {
  if (files.length === 0) return
  const bucket = db().storage.from(SCREENSHOT_BUCKET)
  const uploads = await Promise.allSettled(
    files.map(async (file) => {
      const path = screenshotPath(target.requestId, newId(), file.type)
      const { error } = await bucket.upload(path, file, { contentType: file.type, upsert: false })
      if (error) throw error
      return path
    }),
  )
  const paths = uploads.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))
  if (paths.length > 0) {
    const rows = paths.map((object_path) => ({ request_id: target.requestId, comment_id: target.commentId, object_path }))
    const { error } = await db().from('revision_attachments').insert(rows)
    if (error) throw error
  }
  const failed = uploads.find((result): result is PromiseRejectedResult => result.status === 'rejected')
  if (failed) throw failed.reason
}

/** Signed thumbnail and full-size addresses for the private bucket, keyed by object path. */
export async function screenshotUrls(paths: readonly string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {}
  const { data, error } = await db().storage.from(SCREENSHOT_BUCKET).createSignedUrls([...paths], SIGNED_URL_SECONDS)
  if (error) throw error
  return Object.fromEntries((data ?? []).flatMap((item) => (item.path && item.signedUrl ? [[item.path, item.signedUrl]] : [])))
}

export type RevisionEvent = 'created' | 'commented' | 'done'

/**
 * Asks revision-notify to mail the team about an action that is already saved. Never throws: a
 * failed notification must not look like a failed action. Null when the function was unreachable.
 */
export async function notifyRevision(event: RevisionEvent, id: string): Promise<NotifyAnswer | null> {
  try {
    return parseNotifyAnswer(await callFunction<unknown>('revision-notify', { event, id }))
  } catch {
    return null
  }
}
