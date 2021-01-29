import { PlayerModel } from 'game'
import { Box, Text } from 'ink'
import React, { FC } from 'react'

interface Props {
  activeID: string
  winners: string[]
  players: PlayerModel[]
}

export const PlayerList: FC<Props> = ({ players, activeID, winners }) => {
  return (
    <Box flexDirection={'column'}>
      {players.map((p) => (
        <Box key={p.id}>
          <Text color={p.id === activeID ? 'green' : 'grey'}>
            {p.id === activeID ? '> ' : '  '}
            {p.id}
            {winners.includes(p.id) && ' (OUT)'}
          </Text>
        </Box>
      ))}
    </Box>
  )
}
