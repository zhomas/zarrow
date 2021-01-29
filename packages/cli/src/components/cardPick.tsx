import {
  activeTierSelector,
  GameState,
  mustPickUpSelector,
  playCard,
} from 'game'
import { CardModel } from 'game/types'
import { Box, Text } from 'ink'
import SelectInput from 'ink-select-input'
import _ from 'lodash'
import React, { FC } from 'react'

interface Props {
  state: GameState
  pushToStack: (x: CardModel[]) => void
  pickup: (x: CardModel[]) => void
}

interface CardsInput {
  value: CardModel[]
}

export const CardPick: FC<Props> = ({ state, pushToStack, pickup }) => {
  const playCard = (item: CardsInput) => {
    pushToStack(item.value)
  }

  const pickupCard = (item: CardsInput) => {
    pickup(item.value)
  }

  const mustPickup = mustPickUpSelector(state)
  const cards = activeTierSelector(state)
  const x = Object.values(_.groupBy(cards, (c) => c.card.value)).map(
    (cards) => {
      return {
        label: cards.map((c) => c.card.label).join(', '),
        value: cards.map((c) => c.card),
        key: cards.map((c) => c.card.label).join(', '),
      }
    },
  )

  return (
    <Box flexDirection="column">
      {mustPickup && <Text>You can't go! Choose card(s) to pick up</Text>}
      <SelectInput items={x} onSelect={mustPickup ? pickupCard : playCard} />
    </Box>
  )
}
