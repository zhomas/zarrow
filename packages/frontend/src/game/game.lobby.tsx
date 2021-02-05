import {
  createDeck,
  deal,
  GameDispatch,
  GameState,
  joinGame,
  modeSelector,
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
    mode: modeSelector(state),
  }
}

const mapDispatch = (dispatch: GameDispatch, ownProps: OwnProps) => {
  return {
    join: (displayName: string) => {
      dispatch(joinGame({ uid: ownProps.uid, displayName }))
    },
    setFaction: (faction: number) => {
      const action = setFaction({ faction, uid: ownProps.uid })
      dispatch(action)
    },
    deal: () => {
      const action = deal({ deck: createDeck(), factions: [] })
      dispatch(action)
    },
  }
}

type OwnProps = { uid: string }
type Props = OwnProps & PropsFromRedux

const connector = connect(mapState, mapDispatch)

type PropsFromRedux = ConnectedProps<typeof connector>

export const Lobby = connector(GameLobby)
