import React, { FC, useCallback, useEffect, useState } from 'react'
import {
  CardModel,
  createDeck,
  deal,
  unlockTurn,
  GameDispatch,
  GameState,
  playCardThunk,
  stackDestinationSelector,
  canCardPlay,
  userModeSelector,
  pickupThunk,
  activeTierSelector,
  hasLock,
  getWrappedIndex,
} from 'game'
import { connect, ConnectedProps } from 'react-redux'
import { FluidCard } from '../components'
import { FaceDowns } from './downs'
import { AnimateSharedLayout, motion } from 'framer-motion'
import { getCardProps } from './game.view.model'
import { Reticule } from './reticule'
import { Zone } from '../components/zone'
import { MiniPlayer } from '../components/miniplayer'
import { Hand } from '../components/hand'

import { styled } from '@linaria/react'

const ZoneLabel = styled.div`
  width: 100px;
  display: flex;
  align-items: flex-end;
  text-align: right;
  padding: 10px;
`

const _GameView: FC<Props> = ({
  hand,
  ups,
  stack,
  uid,
  replenishPile,
  playCards,
  deal,
  players,
  confirmReplenish,
  confirmPickupFaceUp,
  mode,
  pickupStack,
  destination,
  activeCards,
  pickFaceUp,
  burn,
}) => {
  const [selected, setSelected] = useState<CardModel[]>([])
  const [hovered, setHovered] = useState<CardModel[]>([])

  useEffect(() => {
    setSelected([])
    setHovered([])
  }, [mode, stack.length])

  useEffect(() => {
    setHovered([])
  }, [selected])

  const curried = useCallback(
    (c: CardModel, isActiveMode: boolean) =>
      getCardProps({
        active: isActiveMode,
        destID: destination.id,
        selected: selected.map((c) => c.id),
        hovered: hovered.map((h) => h.id),
        id: c.id,
        toggleHover: () => {
          const next = hovered.includes(c)
            ? hovered.filter((h) => h.id !== c.id)
            : [...hovered, c]

          setHovered(next)
        },
        toggleSelected: () => {
          const next = selected.includes(c)
            ? selected.filter((h) => h.id !== c.id)
            : [...selected, c]

          console.log('toggle selected!', next)
          setSelected(next)
        },
        playAllSiblings: () => {
          const siblings = activeCards
            .filter((a) => a.card.value === c.value)
            .map((a) => a.card)

          playCards(...siblings)
        },
        hand: activeCards.map((a) => a.card),
      }),
    [activeCards, destination.id, hovered, playCards, selected],
  )

  const opponent = players.find((p) => p.id !== uid)
  if (!opponent) throw new Error('Oh no')

  return (
    <AnimateSharedLayout>
      {pickFaceUp && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10,
            color: 'white',
            padding: '10vh',
          }}
        >
          <h1>Pick a card to pickup:</h1>
          <div>
            {activeCards.map((c) => (
              <FluidCard
                key={c.card.id}
                keyPrefix={'fup'}
                card={c.card}
                onClick={() => {
                  confirmPickupFaceUp(c.card)
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <MiniPlayer
            downs={
              <>
                {opponent.cards
                  .filter((c) => c.tier === 0)
                  .map((c) => (
                    <FluidCard key={c.card.id} faceDown card={c.card} />
                  ))}
              </>
            }
          >
            {opponent.cards
              .filter((c) => c.tier === 1)
              .map((c) => (
                <FluidCard key={c.card.id} card={c.card} />
              ))}
          </MiniPlayer>
        </div>
        <div style={{ backgroundColor: 'turquoise', display: 'flex' }}>
          <ZoneLabel>
            <h4>{stack.length} cards in stack</h4>
          </ZoneLabel>
          <Zone
            promptLabel={'Pick up stack'}
            promptActive={mode === 'pickup:stack'}
            onPrompt={pickupStack}
          >
            {stack.map((c, i) => (
              <FluidCard
                key={c.id}
                stackIndex={i}
                stackLength={stack.length}
                card={c}
                variant="default"
              />
            ))}
          </Zone>
          <Zone
            promptLabel={'Replenish'}
            promptActive={mode === 'pickup:replenish'}
            onPrompt={confirmReplenish}
          >
            {replenishPile.map((c, i) => (
              <FluidCard key={c.id} card={c} faceDown variant="default" />
            ))}
          </Zone>
          <ZoneLabel style={{ textAlign: 'left' }}>
            <h4>{replenishPile.length} cards left</h4>
          </ZoneLabel>
        </div>
        <div>
          <div>
            <button
              disabled={selected.length === 0}
              onClick={() => {
                playCards(...selected)
              }}
            >
              Play selected
            </button>
          </div>
        </div>
        <div>
          <motion.div
            initial={{ scale: 0.85, transformOrigin: 'bottom' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                padding: 10,
                display: 'flex',
                backgroundColor:
                  mode === 'play:ups' ? 'thistle' : 'transparent',
                position: 'absolute',
                top: 0,
                left: '50%',
                zIndex: 1,
                transform: 'translate3d(-50%, -50px, 0)',
                maxWidth: 260,
                marginLeft: -30,
              }}
            >
              {ups.map((c) => {
                const props = curried(c.card, mode === 'play:ups')

                return (
                  <FluidCard
                    key={c.card.id}
                    {...props}
                    selected={selected.some((s) => s.id === c.card.id)}
                  />
                )
              })}
            </div>
            <FaceDowns uid={uid} />
          </motion.div>

          <Hand active={mode === 'play:hand'} handleDeal={deal}>
            {hand.map((c, i) => {
              const props = curried(c.card, mode === 'play:hand')
              return (
                <FluidCard
                  key={c.card.id}
                  {...props}
                  selected={selected.some((s) => s.id === c.card.id)}
                />
              )
            })}
          </Hand>
        </div>
      </div>
      <Reticule uid={uid} />
    </AnimateSharedLayout>
  )
}

const mapState = (state: GameState, ownProps: OwnProps) => {
  const destination = stackDestinationSelector(state)
  const myCards = state.players.find((p) => p.id === ownProps.uid)?.cards || []
  const getMode = userModeSelector(ownProps.uid)
  const canPlay = (c: CardModel) => {
    return canCardPlay(c, destination)
  }

  return {
    pickFaceUp: state.turnLocks?.some((c) => c === 'user:faceuptake'),
    turnActive: state.queue[0] === ownProps.uid,
    mode: getMode(state),
    hand: myCards.filter((c) => c.tier === 2),
    ups: myCards.filter((c) => c.tier === 1),
    downs: myCards.filter((c) => c.tier === 0),
    stack: state.stack,
    players: state.players,
    replenishPile: state.pickupPile,
    myCards,
    canPlay,
    activeCards: activeTierSelector(state),
    destination,
    burn: state.burnt,
  } as const
}

const mapDispatch = (d: GameDispatch) => {
  return {
    playCards: (...cards: CardModel[]) => {
      const action = playCardThunk({ cards })
      d(action)
    },
    deal: () => {
      const action = deal({ deck: createDeck(26) })
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
type Props = OwnProps & PropsFromRedux

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

export const GameView = connector(_GameView)
