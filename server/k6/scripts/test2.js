import http from 'k6/http'
import { check, sleep } from 'k6'

const LOAD_TEST_KEY = __ENV.MY_LOAD_TEST_KEY

export let options = {
  stages: [
    { duration: '1m', target: 500 },
    { duration: '1m', target: 1000 },
    { duration: '2m', target: 2500 },
    // { duration: '2m', target: 4000 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
}

export default function () {
  const params = {
    headers: {
      'X-Load-Test-Key': LOAD_TEST_KEY,
    },
  }

  // 백엔드 api 연결확인
  const res = http.get('https://api.writemd.space/test/connected', params)

  check(res, {
    'Status 200': (r) => r.status === 200,
  })

  sleep(1)
}
