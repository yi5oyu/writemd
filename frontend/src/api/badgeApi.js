import axios from 'axios'
import { API_URL } from '../config/api'

export const fetchLogos = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/badge/list`)
    const data = response.data

    const icons = data.icons

    const transformedLogos = icons.map((icon) => ({
      id: icon.slug,
      name: icon.title,
      keywords: ['logo', 'badge', icon.slug],
      skins: [
        {
          src: `${BADGE_API_URL}/${icon.slug}/${icon.hex}`,
        },
      ],
    }))

    return [
      {
        id: 'logos',
        name: '로고',
        emojis: transformedLogos,
      },
    ]
  } catch (error) {
    console.error('로고 목록을 가져오는 중 오류가 발생했습니다:', error)
    return []
  }
}
