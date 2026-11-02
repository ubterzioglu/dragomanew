import { describe, expect, it } from 'vitest'
import { eventsDrift } from '../../scripts/check-events-drift.mjs'
import { distProblems } from '../../../panel/scripts/check-dist.mjs'

const content = {
  events: [
    { id: 'deneme-dalisi', status: 'published' },
    { id: 'gece-dalisi', status: 'published' },
  ],
  options: [
    { eventId: 'deneme-dalisi', optionId: 'tek' },
    { eventId: 'gece-dalisi', optionId: 'tek' },
  ],
}

describe('eventsDrift', () => {
  it('is empty when content and database agree', () => {
    expect(eventsDrift(content, content)).toEqual([])
  })

  it('names missing rows, stale rows and status changes on both sides', () => {
    const db = {
      events: [
        { id: 'deneme-dalisi', status: 'archived' },
        { id: 'eski-etkinlik', status: 'published' },
      ],
      options: [
        { eventId: 'deneme-dalisi', optionId: 'tek' },
        { eventId: 'deneme-dalisi', optionId: 'cift' },
      ],
    }
    expect(eventsDrift(content, db)).toEqual([
      'event gece-dalisi: in content, missing in database',
      'event eski-etkinlik: in database, missing in content',
      'event deneme-dalisi: status published in content, archived in database',
      'option gece-dalisi/tek: in content, missing in database',
      'option deneme-dalisi/cift: in database, missing in content',
    ])
  })
})

const BUILT = [
  '<!doctype html><html lang="tr"><head><title>Dragoman Panel</title>',
  '<script type="module" crossorigin src="/panel/assets/index-abc.js"></script>',
  '<link rel="modulepreload" crossorigin href="/panel/assets/react-abc.js">',
  '<link rel="stylesheet" crossorigin href="/panel/assets/index-abc.css">',
  '</head><body><div id="root"></div></body></html>',
].join('\n')

describe('panel distProblems', () => {
  it('accepts the page Vite builds', () => {
    expect(distProblems(BUILT)).toEqual([])
  })

  it('rejects what the header CSP would block', () => {
    const page = BUILT.replace('<div id="root"></div>', '<style>body{margin:0}</style><div id="root" style="color:red"></div><script>init()</script>')
    expect(distProblems(page)).toEqual([
      'inline script: <script>',
      'inline <style> element',
      'style= attribute: <div id="root" style="color:red">',
    ])
  })

  it('rejects scripts and stylesheets from outside /panel/assets/', () => {
    const page = BUILT.replace('/panel/assets/index-abc.js', 'https://cdn.example/x.js').replace('/panel/assets/index-abc.css', '/other.css')
    expect(distProblems(page)).toEqual([
      'script from outside /panel/assets/: https://cdn.example/x.js',
      'link from outside /panel/assets/: <link rel="stylesheet" crossorigin href="/other.css">',
    ])
  })
})
