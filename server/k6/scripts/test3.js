import http from 'k6/http'
import { check, sleep, group } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const LOAD_TEST_KEY = __ENV.MY_LOAD_TEST_KEY

export const errorRate = new Rate('errors')
export const loginDuration = new Trend('api_login_duration')
export const noteFetchDuration = new Trend('api_note_fetch_duration')

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '2m', target: 1000 },
    { duration: '3m', target: 2500 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    api_login_duration: ['p(95)<500'],
    api_note_fetch_duration: ['p(95)<500'],
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

  group('1. 로그인 (Single DB Query)', function () {
    const res = http.get(`https://api.writemd.space/api/user/info`, params)
    const success = check(res, { 'Login 200 OK': (r) => r.status === 200 })

    errorRate.add(!success)
    if (success) loginDuration.add(res.timings.duration)
  })

  // 사용자가 화면을 읽는 시간
  sleep(Math.random() * 2 + 1)

  const rand = Math.random()

  if (rand < 0.3) {
    // 30%: 로그인 후 아무 행동 없이 종료
  } else if (rand < 0.7) {
    // 40%: 단일 노트 조회
    group('2. 노트 조회', function () {
      const responses = http.batch([
        ['GET', `https://api.writemd.space/api/note/${firstNoteId}`, null, params],
        ['GET', `https://api.writemd.space/api/chat/sessions/${firstNoteId}`, null, params],
        ['GET', `https://api.writemd.space/api/memo/${userId}`, null, params],
        ['GET', `https://api.writemd.space/api/user/key/${userId}`, null, params],
      ])

      const success = check(responses[0], { 'Note Fetch 200 OK': (r) => r.status === 200 })
      errorRate.add(!success)
      if (success) noteFetchDuration.add(responses[0].timings.duration)
    })

    sleep(Math.random() * 2 + 1)
  } else {
    // 30%: 여러 노트
    group('3. 다른 노트 조회', function () {
      const res1 = http.batch([
        ['GET', `https://api.writemd.space/api/note/${firstNoteId}`, null, params],
        ['GET', `https://api.writemd.space/api/chat/sessions/${firstNoteId}`, null, params],
        ['GET', `https://api.writemd.space/api/memo/${userId}`, null, params],
        ['GET', `https://api.writemd.space/api/user/key/${userId}`, null, params],
      ])
      check(res1[0], { '1번 노트 OK': (r) => r.status === 200 })

      sleep(Math.random() * 2 + 1)

      const res2 = http.batch([
        ['GET', `https://api.writemd.space/api/note/${secondNoteId}`, null, params],
        ['GET', `https://api.writemd.space/api/chat/sessions/${secondNoteId}`, null, params],
      ])
      check(res2[0], { '2번 노트 OK': (r) => r.status === 200 })
    })
  }
}
