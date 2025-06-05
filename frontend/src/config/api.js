console.log('import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('모든 VITE 환경변수:', import.meta.env)

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888'

console.log('최종 API_URL:', API_URL)
