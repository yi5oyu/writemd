// utils/textUtils.js
export const safeTextCompression = (text) => {
  if (!text || typeof text !== 'string') return text

  // 공백 및 줄바꿈 정리
  let processed = text
    .replace(/[ \t]+/g, ' ') // 연속 공백을 하나로
    .replace(/\n{3,}/g, '\n\n') // 연속 줄바꿈 제한
    .replace(/[ \t]*\n[ \t]*/g, '\n') // 줄바꿈 앞뒤 공백 제거
    .replace(/\s+([,.!?;:])/g, '$1') // 문장부호 앞 공백 제거
    .replace(/([,.!?;:])\s+/g, '$1 ') // 문장부호 뒤 공백 정리
    .replace(/\(\s+/g, '(') // 괄호 안쪽 공백 제거
    .replace(/\s+\)/g, ')')
    .replace(/"\s+/g, '"') // 따옴표 안쪽 공백 정리
    .replace(/\s+"/g, '"')
    .trim()

  // JSON 이스케이프 처리
  // processed = processed
  //   .replace(/\\/g, '\\\\') // 백슬래시 이스케이프
  //   .replace(/"/g, '\\"') // 더블쿼트 이스케이프
  //   .replace(/\n/g, '\\n') // 줄바꿈 이스케이프
  //   .replace(/\r/g, '\\r') // 캐리지리턴 이스케이프
  //   .replace(/\t/g, '\\t') // 탭 이스케이프

  return processed
}

// 길이 체크와 함께 사용하는 함수
export const prepareTextForTransmission = (text, maxLength = 5000) => {
  if (!text || typeof text !== 'string') return { text: '', isValid: false, info: {} }

  const original = text.length
  const compressed = safeTextCompression(text)
  const final = compressed.length

  const info = {
    originalLength: original,
    compressedLength: final,
    savedChars: original - final,
    compressionRatio: original > 0 ? (((original - final) / original) * 100).toFixed(1) : '0',
    isUnderLimit: final <= maxLength,
    status: final <= maxLength ? 'safe' : 'too_long',
  }

  return {
    text: compressed,
    isValid: final <= maxLength,
    info,
  }
}
