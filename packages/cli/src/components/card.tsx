import React, { FC } from 'react'
import { Box, Text } from 'ink'
import { CardModel } from 'game/types'

type Props = CardModel & { faceDown?: boolean }

export const Card: FC<Props> = ({ faceDown = false, label }) => {
  const renderContent = () => {
    if (faceDown) return null
    return <Text>{label}</Text>
  }

  return (
    <Box
      borderStyle={'round'}
      borderColor={'red'}
      width={5}
      height={4}
      alignItems="center"
    >
      {renderContent()}
    </Box>
  )
}
