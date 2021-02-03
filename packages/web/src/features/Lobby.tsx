import { DerivedGameState } from 'game'
import React, { FC, useState } from 'react'
import { useGameDispatch } from '../api/useGameDispatch'
import { FactionSwitch } from '../components/FactionSwitch'

interface Props {
  state: DerivedGameState
  uid: string
  gid: string
}

export const Lobby: FC<Props> = ({ state, uid, gid }) => {
  const [name, setName] = useState<string>('')
  const dispatch = useGameDispatch(gid, uid)
  const playerInLobby = state.players.find((p) => p.id === uid)

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch({ verb: 'join', displayName: name })
  }

  const handleDeal = () => {
    dispatch({ verb: 'deal' })
  }

  return (
    <div>
      <h1>Lobby</h1>
      <h2>{state.mode}</h2>
      {!playerInLobby && (
        <form onSubmit={handleJoin}>
          <input type="text" onChange={(e) => setName(e.target.value)} />
          <button type="submit">Submit</button>
        </form>
      )}
      {state.players.map((player) => {
        const toggle = () => {
          dispatch({
            verb: 'changeFaction',
            faction: player.faction === 0 ? 1 : 0,
          })
        }
        return (
          <FactionSwitch
            isSelf={player.id === uid}
            displayName={player.displayName}
            faction={player.faction}
            switch={toggle}
          />
        )
      })}
      <button disabled={state.mode !== 'lobby:valid'} onClick={handleDeal}>
        Deal!
      </button>
    </div>
  )
}
