import http from 'k6/http'
import { check, sleep } from 'k6'

const LOAD_TEST_KEY = __ENV.MY_LOAD_TEST_KEY

export const options = {
  stages: [
    { duration: '1m', target: 200 },
    { duration: '2m', target: 500 },
    // { duration: '3m', target: 1000 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
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

  // 최초 로그인
  let infoRes = http.get(`https://api.writemd.space/api/user/info`, params)
  check(infoRes, { 'Common. User Info OK': (r) => r.status === 200 })

  sleep(0.5)

  const randomVal = Math.random()

  if (randomVal < 0.3) {
    // 아무것도 안함
  } else if (randomVal < 0.7) {
    // 노트 클릭
    let firstBatch = http.batch([
      ['GET', `https://api.writemd.space/api/note/${firstNoteId}`, null, params],
      ['GET', `https://api.writemd.space/api/chat/sessions/${firstNoteId}`, null, params],
      ['GET', `https://api.writemd.space/api/memo/${userId}`, null, params],
      ['GET', `https://api.writemd.space/api/user/key/${userId}`, null, params],
    ])
    check(firstBatch[0], { 'G1. First Note OK': (r) => r.status === 200 })

    sleep(2)
  } else {
    // 다른 노트 클릭
    let firstBatch = http.batch([
      ['GET', `https://api.writemd.space/api/note/${firstNoteId}`, null, params],
      ['GET', `https://api.writemd.space/api/chat/sessions/${firstNoteId}`, null, params],
      ['GET', `https://api.writemd.space/api/memo/${userId}`, null, params],
      ['GET', `https://api.writemd.space/api/user/key/${userId}`, null, params],
    ])

    sleep(Math.random() * 3 + 2)

    let secondBatch = http.batch([
      ['GET', `https://api.writemd.space/api/note/${secondNoteId}`, null, params],
      ['GET', `https://api.writemd.space/api/chat/sessions/${secondNoteId}`, null, params],
    ])
    check(secondBatch[0], { 'G2. Second Note OK': (r) => r.status === 200 })

    sleep(2)
  }
}
