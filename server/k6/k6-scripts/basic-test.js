import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  stages: [
    { duration: '30s', target: 5 }, // 5명으로 증가
    { duration: '1m', target: 10 }, // 10명 유지
    { duration: '30s', target: 0 }, // 0명으로 감소
  ],
}

export default function () {
  // Frontend 테스트
  let frontendRes = http.get('http://frontend-app')
  check(frontendRes, {
    'Frontend 200 OK': (r) => r.status === 200,
    'Frontend 응답 < 2초': (r) => r.timings.duration < 2000,
  })

  // Backend Health Check
  let healthRes = http.get('http://backend-app:8888/actuator/health')
  check(healthRes, {
    'Backend Health UP': (r) => r.status === 200,
    'Health Check < 1초': (r) => r.timings.duration < 1000,
  })

  sleep(1)
}
