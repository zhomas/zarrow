import React, { FC } from 'react'
import { RouteComponentProps } from '@reach/router'
import { Game } from '../game'

type Props = RouteComponentProps<{ gid: string }> & { uid: string }

export const GamePage: FC<Props> = ({ gid, uid }) => {
  if (!gid) return <h1>Oh no</h1>

  return <Game uid={uid} gid={gid} />
}
