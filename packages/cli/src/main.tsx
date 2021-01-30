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
  playAce,
  playCard,
} from 'game/game.slice'
import { PlayerList } from './components/playerList'
import { gameStatusSelector, winnersSelector } from 'game/rules/win'
import { CardPick } from './components/cardPick'

interface CardsInput {
  value: CardModel[]
}

const Main: FC<GameState & D> = (props) => {
  useEffect(props.deal, [])

  if (props.players.length === 0) return null

  const status = gameStatusSelector(props)

  if (status.status === 'complete') {
    return (
      <Box flexDirection="column">
        <Text>Game is complete!</Text>
        <Text>Winners: {status.winners.join(', ')}</Text>
      </Box>
    )
  }

  const player = activePlayerSelector(props)

  return (
    <Box alignItems="stretch" justifyContent="space-between">
      <Box flexDirection="column">
        <Stack cards={props.stack} />
        <Player {...player} />
        <Text>Player ID: {player.id}</Text>
      </Box>
      <Box flexBasis="30%">
        <PlayerList
          activeID={props.queue[0]}
          players={props.players}
          winners={winnersSelector(props)}
        />
      </Box>
      <Box
        flexDirection="column"
        flexBasis="30%"
        justifyContent="space-between"
      >
        <Box>
          <CardPick
            key={player.id}
            state={props}
            pickup={props.pickup}
            pushToStack={props.pushToStack}
            aceThatSucka={props.aceTarget}
          />
        </Box>
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
      const cards = createDeck()
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
    aceTarget: (cards: CardModel[], targetID: string) => {
      const action = playAce({ cards, targetID })
      dispatch(action)
    },
  }
}
type D = ReturnType<typeof mapDispatch>
export default connect(mapState, mapDispatch)(Main)
