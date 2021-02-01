import React, { FC } from 'react'
import { Box, Spacer, Text } from 'ink'
import { activePlayerSelector, GameState } from '../../../game/dist/src'
import _ from 'lodash'
import SelectInput from 'ink-select-input'

interface Props {
  state: GameState
  handleSelect: (id: string) => void
}

interface Option {
  value: string
}

export const TargetPick: FC<Props> = ({ state, handleSelect }) => {
  const active = activePlayerSelector(state)

  const p = state.players
    .filter((pl) => pl.id !== active.id)
    .map((pl) => {
      return {
        label: pl.id,
        key: pl.id,
        value: pl.id,
      }
    })

  return (
    <Box flexDirection="column">
      <Text>Who will you target?</Text>
      <Spacer />
      <SelectInput items={p} onSelect={(x) => handleSelect(x.value)} />
    </Box>
  )
}
