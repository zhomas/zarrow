import React, { FC } from 'react'
import { Box, Text } from 'ink'
import { PlayerModel } from 'game/types'
import { Card } from './card'

export const Player: FC<PlayerModel> = (props) => {
  return (
    <Box flexDirection="column">
      <Box>
        {props.cards
          .filter((c) => c.tier === 1)
          .map((c) => (
            <Card key={c.card.label} {...c.card} />
          ))}
      </Box>
      <Box>
        {props.cards
          .filter((c) => c.tier === 0)
          .map((c) => (
            <Card key={c.card.label} {...c.card} faceDown />
          ))}
      </Box>
    </Box>
  )
}
