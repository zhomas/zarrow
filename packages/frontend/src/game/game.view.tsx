import React, { FC } from 'react'
import {
  CardModel,
  createDeck,
  deal,
  GameDispatch,
  GameState,
  playCardThunk,
  pickupThunk,
  highlightedLocationSelector,
  userModeSelector,
  confirmReplenish,
} from 'game'
import { connect, ConnectedProps } from 'react-redux'
import { StyledGame } from './game.style'
import { FluidCard } from './card'
import { Debugger } from './debugger'
import { AnimateSharedLayout } from 'framer-motion'
import {
  useCardBuilder as useLocalCardContext,
  useTargeting,
} from './game.hooks'
import { Zone } from './zone'
import { ChainIt } from './chain-it'
import { Sparkler } from './sparkler'
import { EnemyHand } from './hand/enemy'

import { PlayerHand } from './hand/player'
import { PlayerTiers } from './tiers/player.tiers'
import { NonPlayerTiers } from './tiers/nonplayer.tiers'
import { Targeter } from './targeter'
import { Steal } from './steal'
import { createCardByID } from 'game/dist/deck'

const _GameView: FC<Props> = ({
  stack,
  uid,
  replenishPile,
  deal,
  players,
  confirmReplenish,
  pickupStack,
  highlight,
  chains,
  chainIt,
}) => {
  const {
    buildHandCard,
    buildForPlayerStrata,
    playSelectedCards,
  } = useLocalCardContext(uid)

  const target = useTargeting(uid)

  const renderOpponent = () => {
    const opponent = players.find((p) => p.id !== uid)
    if (!opponent) throw new Error('Oh no')
    const targetMode = target.getCurrentHighlight(opponent.id)
    const onMouseEnter = () => target.setTarget(opponent.id)
    const onMouseLeave = () => target.setTarget('')
    return (
      <>
        <div className="h2">
          <EnemyHand ownerID={opponent.id} />
        </div>
        <div className="s2">
          <NonPlayerTiers
            userID={uid}
            ownerID={opponent.id}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            targetMode={targetMode}
            onClick={target.fire}
          />
        </div>
      </>
    )
  }

  const getChainedCard = () => {
    const [chained] = chains
    if (chained) {
      return createCardByID(chained)
    }

    return undefined
  }

  const getCards = (id: string) => {
    const player = players.find((p) => p.id === id)
    if (!player) throw new Error('impossible')
    const chained = getChainedCard()
    let { cards } = player

    if (chainIt && chained) {
      cards = cards.filter((c) => c.card.id !== chained.id)
    }

    return {
      hand: cards.filter((c) => c.tier === 2).map((c) => c.card),
      ups: cards.filter((c) => c.tier === 1).map((c) => c.card),
      downs: cards.filter((c) => c.tier === 0).map((c) => c.card),
    }
  }

  const player = getCards(uid)

  return (
    <AnimateSharedLayout type="switch">
      <Targeter uid={uid}>
        {({ screenComponent }) => (
          <>
            <StyledGame>
              <div className="h1">
                <PlayerHand
                  cards={player.hand}
                  ownerID={uid}
                  curried={buildHandCard}
                  playSelected={playSelectedCards}
                />
              </div>

              {renderOpponent()}
              <div className="s1">
                <PlayerTiers
                  ups={player.ups}
                  downs={player.downs}
                  uid={uid}
                  revealing={target.isRevealing}
                  buildPropsFaceUp={buildForPlayerStrata}
                />
              </div>
              <div className="table"></div>
              <div className="table-main">
                <Sparkler>
                  <Zone
                    onPrompt={pickupStack}
                    promptActive={highlight === 'stack'}
                    cards={stack.map((c, i) => (
                      <FluidCard key={c.id} card={c} stackIndex={i} />
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
              <Steal uid={uid} />
              <ChainIt card={getChainedCard()} uid={uid} />
            </StyledGame>
            <button onClick={() => deal(52)}>Deal</button>
            <button onClick={() => deal(24)}>Minideal</button>
            <Debugger uid={uid} />
          </>
        )}
      </Targeter>
    </AnimateSharedLayout>
  )
}

// Four eights to burn!

const mapState = (state: GameState, ownProps: OwnProps) => {
  const getHighlight = highlightedLocationSelector(ownProps.uid)
  const selectMode = userModeSelector(ownProps.uid)
  return {
    stack: state.stack,
    players: state.players,
    replenishPile: state.pickupPile,
    highlight: getHighlight(state),
    mode: selectMode(state),
    chains: state.pendingChains || [],
    chainIt: state.chainIt?.show,
  } as const
}

const mapDispatch = (d: GameDispatch, ownProps: OwnProps) => {
  return {
    playCards: (...cards: CardModel[]) => {
      const action = playCardThunk({ cards, playerID: ownProps.uid })
      d(action)
    },
    deal: (size: number) => {
      const action = deal({ deck: createDeck(size) })
      d(action)
    },
    confirmReplenish: () => {
      const action = confirmReplenish()
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
