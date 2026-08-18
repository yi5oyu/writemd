import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const LOAD_TEST_KEY = __ENV.MY_LOAD_TEST_KEY

export const errorRate = new Rate('errors')
export const loginDuration = new Trend('api_login_duration')
export const noteFetchDuration = new Trend('api_note_fetch_duration')
export const noteWriteDuration = new Trend('api_note_write_duration')
export const noteCreateDuration = new Trend('api_note_create_duration')

const DUMMY_TEXT = '## 부하 테스트\nK6 1번 시나리오 작성 시간: ' + new Date().toISOString()

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '2m', target: 300 },
    { duration: '3m', target: 600 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    api_login_duration: ['p(95)<500'],
    api_note_fetch_duration: ['p(95)<500'],
    api_note_write_duration: ['p(95)<500'],
    api_note_create_duration: ['p(95)<500'],
    errors: ['rate<0.01'],
  },
}

const START_USER_ID = 159
const START_NOTE_ID = 417

export default function () {
  const index = (__VU - 1) % 1000
  const userId = START_USER_ID + index
  const githubId = `load_test_${index + 1}`
  const firstNoteId = START_NOTE_ID + index * 2
  const secondNoteId = firstNoteId + 1

  const params = {
    headers: {
      'X-Load-Test-Key': LOAD_TEST_KEY,
      'X-Load-Test-User-Id': githubId,
      'Content-Type': 'application/json',
    },
  }

  group('0. 로그인', function () {
    const res = http.get(`https://api.writemd.space/api/user/info`, {
      ...params,
      tags: { name: 'UserInfo' },
    })
    const success = check(res, { 'Login 200 OK': (r) => r.status === 200 })

    errorRate.add(!success)
    if (success) loginDuration.add(res.timings.duration)
  })

  sleep(Math.random() * 2 + 1)

  const rand = Math.random()

  if (rand < 0.2) {
    // 20%: 로그인 후 아무 행동 없이 종료
  } else if (rand < 0.6) {
    // 40%: 단일 노트 조회
    group('1. 단일 노트 조회', function () {
      const responses = http.batch([
        [
          'GET',
          `https://api.writemd.space/api/note/${firstNoteId}`,
          null,
          { ...params, tags: { name: 'NoteContent' } },
        ],
        [
          'GET',
          `https://api.writemd.space/api/chat/sessions/${firstNoteId}`,
          null,
          { ...params, tags: { name: 'ChatSessions' } },
        ],
        [
          'GET',
          `https://api.writemd.space/api/memo/${userId}`,
          null,
          { ...params, tags: { name: 'UserMemo' } },
        ],
        [
          'GET',
          `https://api.writemd.space/api/user/key/${userId}`,
          null,
          { ...params, tags: { name: 'UserApiKeys' } },
        ],
      ])

      const success = check(responses[0], { 'Note Fetch 200 OK': (r) => r.status === 200 })
      errorRate.add(!success)
      if (success) noteFetchDuration.add(responses[0].timings.duration)
    })
  } else if (rand < 0.9) {
    // 30%: 여러 노트 조회
    group('2. 여러 노트 조회', function () {
      const res1 = http.batch([
        [
          'GET',
          `https://api.writemd.space/api/note/${firstNoteId}`,
          null,
          { ...params, tags: { name: 'NoteContent' } },
        ],
        [
          'GET',
          `https://api.writemd.space/api/chat/sessions/${firstNoteId}`,
          null,
          { ...params, tags: { name: 'ChatSessions' } },
        ],
      ])
      check(res1[0], { '1번 노트 OK': (r) => r.status === 200 })

      sleep(Math.random() * 2 + 1)

      const res2 = http.batch([
        [
          'GET',
          `https://api.writemd.space/api/note/${secondNoteId}`,
          null,
          { ...params, tags: { name: 'NoteContent' } },
        ],
        [
          'GET',
          `https://api.writemd.space/api/chat/sessions/${secondNoteId}`,
          null,
          { ...params, tags: { name: 'ChatSessions' } },
        ],
      ])
      check(res2[0], { '2번 노트 OK': (r) => r.status === 200 })
    })
  } else {
    // 10%: 노트 수정 or 생성
    const writeRand = Math.random()

    if (writeRand < 0.8) {
      group('3-1. 노트 수정', function () {
        const payload = JSON.stringify({ markdownText: DUMMY_TEXT })
        const res = http.put(`https://api.writemd.space/api/note/${firstNoteId}`, payload, {
          ...params,
          tags: { name: 'UpdateNote' },
        })
        const success = check(res, { 'Write 200 OK': (r) => r.status === 200 })
        errorRate.add(!success)
        if (success) noteWriteDuration.add(res.timings.duration)
      })
    } else {
      group('3-2. 노트 생성', function () {
        const notePayload = JSON.stringify({
          noteName: `Load Test Note - ${new Date().toISOString()}`,
        })
        const res = http.post(
          `https://api.writemd.space/api/note/create/${githubId}`,
          notePayload,
          { ...params, tags: { name: 'CreateNote' } }
        )
        const success = check(res, { 'Create Note 200 OK': (r) => r.status === 200 })
        errorRate.add(!success)
        if (success) noteCreateDuration.add(res.timings.duration)
      })
    }
  }

  sleep(Math.random() * 2 + 1)
}
