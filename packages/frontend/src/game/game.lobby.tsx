import {
  createDeck,
  deal,
  GameDispatch,
  GameState,
  joinGame,
  gameModeSelector,
  setFaction,
} from 'game'
import React, { FC, useState } from 'react'
import { connect, ConnectedProps } from 'react-redux'

const GameLobby: FC<Props> = ({
  players,
  mode,
  uid,
  join,
  setFaction,
  deal,
}) => {
  const [name, setName] = useState<string>('')
  const playerInLobby = players.find((p) => p.id === uid)
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    join(name)
  }

  return (
    <div>
      <h1>Lobby</h1>
      <h2>{mode}</h2>
      {!playerInLobby && (
        <form onSubmit={handleJoin}>
          <input type="text" onChange={(e) => setName(e.target.value)} />
          <button type="submit">Submit</button>
        </form>
      )}
      {players.map((player) => {
        const nextFaction = player.faction === 0 ? 1 : 0

        return (
          <div key={player.id}>
            {player.displayName}
            <button onClick={() => setFaction(nextFaction)}>
              Faction {player.faction}
            </button>
          </div>
        )
      })}
      <button disabled={mode !== 'lobby:valid'} onClick={deal}>
        Deal!
      </button>
    </div>
  )
}

const mapState = (state: GameState) => {
  return {
    players: state.players,
    mode: gameModeSelector(state),
  }
}

const mapDispatch = (dispatch: GameDispatch, { uid }: OwnProps) => {
  return {
    join: (displayName: string) => {
      const action = joinGame({ uid, displayName })
      dispatch(action)
    },
    setFaction: (faction: number) => {
      const action = setFaction({ faction, uid })
      dispatch(action)
    },
    deal: () => {
      const action = deal(createDeck())
      dispatch(action)
    },
  }
}

type OwnProps = { uid: string }
type Props = OwnProps & PropsFromRedux

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

export const Lobby = connector(GameLobby)
