import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  stages: [
    { duration: '2m', target: 500 }, // 2분안에 500명
    { duration: '5m', target: 1000 }, // 그 후 5분 동안 1000명
  ],
  thresholds: {
    // 95% 응답 시간 500ms를 넘으면 중단
    http_req_duration: [{ threshold: 'p(95)<500', abortOnFail: true }],
    // 에러율 1%를 넘으면 중단
    http_req_failed: [{ threshold: 'rate<0.01', abortOnFail: true }],
  },
}

export default function () {
  // 페이지 접속
  const frontendRes = http.get('https://www.writemd.space')
  check(frontendRes, {
    'Frontend 200 OK': (r) => r.status === 200,
  })

  sleep(1)
}
