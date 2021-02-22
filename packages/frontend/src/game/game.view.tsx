import React, { FC } from 'react'
import {
  CardModel,
  createDeck,
  deal,
  unlockTurn,
  GameDispatch,
  GameState,
  playCardThunk,
  pickupThunk,
  highlightedLocationSelector,
  userModeSelector,
} from 'game'
import { connect, ConnectedProps } from 'react-redux'
import { StyledGame } from './game.style'
import { FluidCard } from './card'

import { AnimateSharedLayout } from 'framer-motion'
import { useCardBuilder as useLocalCardContext } from './game.hooks'
import { Zone } from './zone'
import { Miniplayer } from './miniplayer'
import { FUPU } from './fupu'
import { Sparkler } from './sparkler'
import { EnemyHand } from './hand/enemy'

import { PlayerHand } from './hand/player'
import { Targeter } from './targeter'

const _GameView: FC<Props> = ({
  stack,
  uid,
  replenishPile,
  deal,
  players,
  confirmReplenish,
  pickupStack,
  highlight,
}) => {
  const {
    buildHandCard,
    buildForPlayerStrata,
    buildNPC,
    hovered,
  } = useLocalCardContext(uid)

  const opponent = players.find((p) => p.id !== uid)
  if (!opponent) throw new Error('Oh no')

  return (
    <AnimateSharedLayout type="switch">
      <Targeter uid={uid}>
        {({ screenComponent, setTarget, getCurrentHighlight, fire }) => (
          <>
            <StyledGame>
              <div className="h1">
                <PlayerHand ownerID={uid} curried={buildHandCard} />
              </div>
              <div className="h2">
                <EnemyHand ownerID={opponent.id} />
              </div>
              <div className="s2">
                <Miniplayer
                  ownerID={opponent.id}
                  curried={buildNPC}
                  uid={uid}
                  highlight={getCurrentHighlight(opponent.id)}
                  onHoverEnter={() => setTarget(opponent.id)}
                  onHoverExit={() => setTarget('')}
                  onClick={fire}
                />
              </div>
              <div className="s1">
                <Miniplayer
                  ownerID={uid}
                  curried={buildForPlayerStrata}
                  nudge="up"
                  uid={uid}
                />
              </div>
              <div className="table"></div>
              <div className="table-main">
                {hovered}
                <Sparkler>
                  <Zone
                    onPrompt={pickupStack}
                    promptActive={highlight === 'stack'}
                    cards={stack.map((c) => (
                      <FluidCard key={c.id} card={c} />
                    ))}
                  />
                </Sparkler>
              </div>
              <div className="br">
                <Zone
                  onPrompt={confirmReplenish}
                  promptActive={highlight === 'replenish'}
                  cards={replenishPile.map((c) => (
                    <FluidCard key={c.id} card={c} faceDown />
                  ))}
                />
              </div>
              {screenComponent}
              <FUPU uid={uid} />
            </StyledGame>
            <button onClick={deal}>Redeal</button>
          </>
        )}
      </Targeter>
    </AnimateSharedLayout>
  )
}

const mapState = (state: GameState, ownProps: OwnProps) => {
  const getHighlight = highlightedLocationSelector(ownProps.uid)
  const selectMode = userModeSelector(ownProps.uid)
  return {
    stack: state.stack,
    players: state.players,
    replenishPile: state.pickupPile,
    highlight: getHighlight(state),
    mode: selectMode(state),
  } as const
}

const mapDispatch = (d: GameDispatch, ownProps: OwnProps) => {
  return {
    playCards: (...cards: CardModel[]) => {
      const action = playCardThunk({ cards, playerID: ownProps.uid })
      d(action)
    },
    deal: () => {
      const action = deal({ deck: createDeck(24) })
      d(action)
    },
    confirmReplenish: () => {
      const action = unlockTurn({ channel: 'user:replenish' })
      d(action)
    },
    confirmPickupFaceUp: (c: CardModel) => {
      const action = unlockTurn({ channel: 'user:faceuptake', data: c.id })
      d(action)
    },
    pickupStack: () => {
      const action = pickupThunk()
      d(action)
    },
  }
}

type OwnProps = { uid: string }
type Props = Readonly<OwnProps & PropsFromRedux>

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

export const GameView = connector(_GameView)
