import React, { FC } from 'react'
import { StateGate } from '../wrappers/StateGate'
import { GameProvider } from './game.provider'
import { GameRoot } from './game.root'

interface Props {
  uid: string
  gid: string
}

export const Game: FC<Props> = ({ gid, uid }) => {
  return (
    <StateGate gid={gid}>
      {(remoteState) => (
        <GameProvider initialState={remoteState} gid={gid}>
          <GameRoot uid={uid} gid={gid} />
        </GameProvider>
      )}
    </StateGate>
  )
}
