export const scrollbarStyles = {
  scrollbarGutter: 'stable',
  '&::-webkit-scrollbar': {
    width: '10px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
    borderRadius: '5px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'transparent',
    borderRadius: '10px',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    backgroundClip: 'padding-box',
  },
  '&::-webkit-scrollbar:hover': {
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(0, 0, 0, 0.5)',
    },
    '&::-webkit-scrollbar-track': {
      background: 'rgba(0, 0, 0, 0.1)',
    },
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: 'rgba(0, 0, 0, 0.65)',
  },
}
