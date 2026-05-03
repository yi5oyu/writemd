import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

const LOAD_TEST_KEY = __ENV.MY_LOAD_TEST_KEY

export const errorRate = new Rate('errors')
export const apiResponseTime = new Trend('api_response_time')

export const options = {
  stages: [
    { duration: '1m', target: 500 },
    { duration: '2m', target: 1500 },
    { duration: '2m', target: 3000 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.01'],
  },
}

export default function () {
  const params = {
    headers: {
      'X-Load-Test-Key': LOAD_TEST_KEY,
    },
  }

  // DB 접근이 없는 단순 API 접근
  const res = http.get('https://api.writemd.space/test/connected', params)

  const success = check(res, {
    'Status 200': (r) => r.status === 200,
  })

  errorRate.add(!success)
  if (success) {
    apiResponseTime.add(res.timings.duration)
  }

  sleep(Math.random() * 0.5 + 0.5)
}
