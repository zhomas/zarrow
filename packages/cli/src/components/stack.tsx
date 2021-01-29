import React, { FC } from 'react'
import { Box, Text } from 'ink'
import { CardModel, PlayerModel } from 'game/types'
import { Card } from './card'

interface Props {
  cards: CardModel[]
}

export const Stack: FC<Props> = (props) => {
  if (props.cards.length === 0) {
    return (
      <Box>
        <Box
          borderStyle={'round'}
          borderColor={'grey'}
          width={5}
          height={4}
          alignItems="center"
        ></Box>
      </Box>
    )
  }
  return (
    <Box>
      <Card {...props.cards[0]} />
      <Text>Cards in stack :: {props.cards.length}</Text>
    </Box>
  )
}
