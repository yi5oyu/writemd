import React, { useState, useEffect, useRef } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'
import { Box, Text, Image } from '@chakra-ui/react'

const ToolDataPicker = ({ data, type, onSelect }) => {
  const gridRef = useRef(null)
  const [gridHeight, setGridHeight] = useState(window.innerHeight - 270)
  const [gridWidth, setGridWidth] = useState(630)
  const columnCount = 12 // 21
  const rowCount = Math.ceil(data.length / columnCount)
  const itemSize = 60

  // resize
  useEffect(() => {
    const updateGrid = () => {
      setGridHeight(window.innerHeight - 270)
    }

    updateGrid()
    window.addEventListener('resize', updateGrid)

    return () => {
      window.removeEventListener('resize', updateGrid)
    }
  }, [])

  return (
    <Box borderRadius="8px" padding="4px" bg="gray.200">
      <Grid
        columnCount={columnCount}
        rowCount={rowCount}
        columnWidth={itemSize - 10}
        rowHeight={itemSize - 10}
        height={gridHeight}
        width={gridWidth}
      >
        {({ columnIndex, rowIndex, style }) => {
          const index = rowIndex * columnCount + columnIndex
          const key = data[index]

          if (!key) return null

          return (
            <Box
              style={style}
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              onClick={() => onSelect(key)}
            >
              {type === 'emoji' ? (
                // 이모지
                <Text fontSize="24px">{key.split('/')[1]}</Text>
              ) : type === 'logo' ? (
                // 로고
                <Image src={`https://cdn.simpleicons.org/${key}`} width="32px" height="32px" />
              ) : null}
            </Box>
          )
        }}
      </Grid>
    </Box>
  )
}

export default React.memo(ToolDataPicker)
