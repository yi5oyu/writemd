import React, { useState, useEffect, useRef } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'
import { Box, Text, Image } from '@chakra-ui/react'

const ToolDataPicker = ({ data, type, onSelect, screen }) => {
  const boxRef = useRef(null)

  const gridHeigth = 400
  const [gridWidth, setGridWidth] = useState(630)
  const [colCount, setColCount] = useState(13)
  const columnCount = 13 // 21
  const rowCount = Math.ceil(data.length / colCount)
  const itemSize = 55

  // TODO: w조절
  useEffect(() => {
    const boxWidth = document.getElementById('feature').offsetWidth
    setGridWidth(boxWidth)
    setColCount(Math.floor(boxWidth / itemSize))
  }, [window.width, screen])

  return (
    <Box ref={boxRef} borderRadius="8px" padding="4px">
      <Grid
        style={{ background: 'rgb(229, 231, 235)', borderRadius: '8px' }}
        columnCount={colCount}
        rowCount={rowCount}
        columnWidth={itemSize - 10}
        rowHeight={itemSize - 10}
        height={gridHeigth}
        width={gridWidth}
      >
        {({ columnIndex, rowIndex, style }) => {
          const index = rowIndex * columnCount + columnIndex
          const key = data[index]

          if (!key) return null

          return (
            <Box
              id="aa"
              style={style}
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              onClick={() => onSelect(key)}
            >
              {type === 'emoji' ? (
                // 이모지
                <Text fontSize="32px">{key.split('/')[1]}</Text>
              ) : type === 'logo' ? (
                // 로고
                <Image src={`/icons/${key}`} width="32px" height="32px" />
              ) : null}
            </Box>
          )
        }}
      </Grid>
    </Box>
  )
}

export default React.memo(ToolDataPicker)
