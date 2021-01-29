import React, { FC } from 'react'
import { Box } from 'ink'
import { activePlayerSelector, GameState } from 'game'
import _ from 'lodash'
import SelectInput from 'ink-select-input'

interface Props {
  state: GameState
}

interface Option {
  value: string
}

export const TargetPick: FC<Props> = ({ state }) => {
  const active = activePlayerSelector(state)

  const handleSelect = (option: Option) => {}

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
      <SelectInput items={p} onSelect={handleSelect} />
    </Box>
  )
}
