import {
  activeTierSelector,
  GameState,
  mustPickUpSelector,
  playCard,
} from '../../../game/dist/src'
import { createCard } from 'game/deck'
import { CardModel } from 'game/types'
import { Box, Text } from 'ink'
import SelectInput from 'ink-select-input'
import _ from 'lodash'
import React, { FC, useState } from 'react'
import { TargetPick } from './targetPick'

interface Props {
  state: GameState
  aceThatSucka: (cards: CardModel[], targetID: string) => void
  pushToStack: (x: CardModel[]) => void
  pickup: (x: CardModel[]) => void
}

interface CardsInput {
  value: CardModel[]
}

export const CardPick: FC<Props> = ({
  state,
  pushToStack,
  pickup,
  aceThatSucka,
}) => {
  const [mode, setMode] = useState<string>()
  const [tmpCards, setTmpCards] = useState<CardModel[]>([])

  const playCard = (item: CardsInput) => {
    if (item.value.find((c) => c.value === 'A')) {
      setMode('target')
      setTmpCards(item.value)
      return
    }

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

  if (mode === 'target') {
    return (
      <TargetPick
        state={state}
        handleSelect={(id) => aceThatSucka(tmpCards, id)}
      />
    )
  }

  return (
    <Box flexDirection="column">
      {mustPickup && <Text>You can't go! Choose card(s) to pick up</Text>}
      <SelectInput items={x} onSelect={mustPickup ? pickupCard : playCard} />
    </Box>
  )
}
