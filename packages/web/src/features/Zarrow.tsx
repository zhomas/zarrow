import React, { FC } from 'react'
import { CardModel, DerivedGameState, PlayerModel } from 'game'
import { PlayerVisibleCards } from '../components/PlayerVisibleCards'
import { PlayerHand } from '../components/PlayerHand'
import { PickupPile } from '../components/PickupPile'

import { Stack } from '../components/Stack'

import './Zarrow.css'
import { GameUpdatePayload } from 'functions'
import { useEffect } from 'react'
import { Region } from '../components'

interface Props {
  state: DerivedGameState
  emit: (x: GameUpdatePayload) => void
  uid: string
}

type Slotmap = { t?: PlayerModel; b?: PlayerModel }

export const Zarrow: FC<Props> = ({ state, uid, emit }) => {
  const me = state.players.find((p) => p.id === uid)
  const myTurn = me?.id === state.focus
  const getSlotMap = (): Slotmap => {
    if (state.players.length === 2) {
      return {
        t: state.players.find((p) => p.id !== uid),
        b: state.players.find((p) => p.id === uid),
      }
    }

    return { t: undefined, b: undefined }
  }

  const playCards = (c: CardModel[]) => {
    emit({ verb: 'play', cards: c })
  }

  const pickupStack = () => {
    emit({ verb: 'pickup', additions: [] })
  }

  const endTurn = () => {
    emit({ verb: 'endTurn' })
  }

  const map = getSlotMap()

  useEffect(() => {
    console.log(state)
  })

  return (
    <div className="parent">
      <div></div>
      <div>
        {map.t && (
          <div style={{ transform: 'rotateZ(180deg)' }}>
            <PlayerVisibleCards
              player={map.t}
              hasFocus={state.focus === map.t.id}
            />
          </div>
        )}
      </div>
      <div></div>
      <div></div>
      <div style={{ display: 'flex' }}>
        <Stack
          cards={state.stack}
          onClick={pickupStack}
          highlighted={myTurn && state.prompt === 'stack'}
        />
        <PickupPile
          cards={state.pickupPile}
          onClick={endTurn}
          highlighted={myTurn && state.prompt === 'pickupPile'}
        />
      </div>
      <div></div>
      <div></div>
      <div>
        {map.b && (
          <>
            <PlayerVisibleCards
              player={map.b}
              hasFocus={state.focus === map.b.id}
            />
            <div style={{ width: 400, height: 200, position: 'relative' }}>
              <Region />
            </div>
          </>
        )}
      </div>
      <div></div>
      <div></div>
      <div>
        {me && (
          <PlayerHand
            player={me}
            playCards={playCards}
            highlighted={myTurn && state.prompt === 'hand'}
          />
        )}
      </div>
      <div>
        <button onClick={() => emit({ verb: 'deal' })}>Deal</button>
      </div>
    </div>
  )
}
