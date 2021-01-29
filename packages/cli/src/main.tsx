import React, { FC, useEffect } from 'react'
import { Box, Text, Static } from 'ink'
import _ from 'lodash'
import { deal, GameState, GameDispatch, createDeck, PlayerModel } from 'game'
import { connect } from 'react-redux'
import { Player } from './components/player'
import { Stack } from './components/stack'
import SelectInput from 'ink-select-input'
import { CardModel } from 'game/types'
import {
  activePlayerSelector,
  activeTierSelector,
  mustPickUpSelector,
  pickupStack,
  playCard,
} from 'game/game.slice'

interface CardsInput {
  value: CardModel[]
}

const Main: FC<GameState & D> = (props) => {
  useEffect(props.deal, [])

  if (props.players.length === 0) return null

  const player = activePlayerSelector(props)

  const playCard = (item: CardsInput) => {
    props.pushToStack(item.value)
  }

  const pickupCard = (item: CardsInput) => {
    props.pickup(item.value)
  }

  const renderInputs = () => {
    const mustPickup = mustPickUpSelector(props)
    const cards = activeTierSelector(props)
    const x = Object.values(_.groupBy(cards, (c) => c.card.value)).map(
      (cards) => {
        return {
          label: cards.map((c) => c.card.label).join(', '),
          value: cards.map((c) => c.card),
          key: cards.map((c) => c.card.label).join(', '),
        }
      },
    )

    const items = activeTierSelector(props).map((c) => ({
      label: c.card.label,
      value: c.card,
      key: c.card.label,
    }))

    return (
      <Box flexDirection="column">
        {mustPickup && <Text>You can't go! Choose card(s) to pick up</Text>}
        <SelectInput items={x} onSelect={mustPickup ? pickupCard : playCard} />
      </Box>
    )
  }

  return (
    <Box alignItems="stretch" justifyContent="space-between">
      <Box flexDirection="column">
        <Stack cards={props.stack} />
        <Player {...player} />
        <Text>Player ID: {player.id}</Text>
      </Box>
      <Box
        flexDirection="column"
        flexBasis="30%"
        justifyContent="space-between"
      >
        <Box>{renderInputs()}</Box>
        <Box>
          <Text>Cards left in pickup pile: {props.pickupPile.length}</Text>
        </Box>
      </Box>
    </Box>
  )
}

const mapState = (state: GameState) => {
  return state
}

const mapDispatch = (dispatch: GameDispatch) => {
  return {
    deal: () => {
      const cards = createDeck(12)
      const action = deal({
        factions: [
          ['Barry', 'Joe'],
          ['John', 'Greg'],
        ],
        deck: cards,
      })

      dispatch(action)
    },
    pushToStack: (cards: CardModel[]) => {
      const action = playCard({
        cards,
        playerIndex: 0,
      })

      dispatch(action)
    },
    pickup: (cards: CardModel[]) => {
      const action = pickupStack(cards)
      dispatch(action)
    },
  }
}
type D = ReturnType<typeof mapDispatch>
export default connect(mapState, mapDispatch)(Main)
