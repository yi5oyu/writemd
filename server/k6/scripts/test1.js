import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

export const errorRate = new Rate('errors')
export const pageLoadTime = new Trend('page_load_time')

export const options = {
  stages: [
    { duration: '1m', target: 500 },
    { duration: '2m', target: 3000 },
    { duration: '2m', target: 10000 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    // 95% 응답 시간 500ms 미만, 에러율 1% 미만
    http_req_duration: [{ threshold: 'p(95)<500', abortOnFail: true }],
    errors: [{ threshold: 'rate<0.01', abortOnFail: true }],
  },
}

export default function () {
  // 정적 페이지 단일 요청 (HTML/CSS/JS 등 프론트엔드 서빙)
  const res = http.get('https://www.writemd.space')

  const success = check(res, {
    'Frontend 200 OK': (r) => r.status === 200,
  })

  errorRate.add(!success)
  pageLoadTime.add(res.timings.duration)

  sleep(1)
}
