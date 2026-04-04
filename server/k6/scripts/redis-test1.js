import http from 'k6/http'
import { check, sleep } from 'k6'

const LOAD_TEST_KEY = __ENV.MY_LOAD_TEST_KEY

export const options = {
  stages: [
    { duration: '30s', target: 200 },
    { duration: '1m', target: 500 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
}

export default function () {
  const userId = 159 + Math.floor(Math.random() * 1000)

  const params = {
    headers: {
      'X-Load-Test-Key': LOAD_TEST_KEY,
      'Content-Type': 'application/json',
    },
  }

  // API Key 조회
  let res = http.get(`https://api.writemd.space/api/user/key/${userId}`, params)

  check(res, {
    'API Key 조회 성공': (r) => r.status === 200,
  })

  sleep(0.1)
}
