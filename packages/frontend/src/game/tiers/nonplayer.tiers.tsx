import React, { FC } from 'react'
import { GameState, highlightedLocationSelector } from 'game'
import { connect, ConnectedProps } from 'react-redux'
import { FluidCardProps } from '../../typings'
import { Tiers } from './index'
import { styled } from '@linaria/react'

const Wrapper = styled.div`
  position: relative;
`

const Screen = styled.div`
  position: absolute;
  background: rgba(255, 0, 0, 0.3);
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  opacity: 0;
  pointer-events: none;
`

const _NonPlayerTiers: FC<Props> = ({
  ups,
  downs,
  throb,
  onMouseEnter,
  onMouseLeave,
  onClick,
  targetMode,
}) => (
  <Wrapper
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
  >
    <Tiers
      ups={ups}
      downs={downs}
      revealing={false}
      nudge={'down'}
      throb={throb}
    />
    <Screen
      style={{
        opacity: targetMode === 'ace:hover' ? 1 : 0,
      }}
    />
  </Wrapper>
)

const mapState = (state: GameState, { ownerID }: OwnProps) => {
  const highlight = highlightedLocationSelector(ownerID)(state)
  const cards = state.players.find((p) => p.id === ownerID)?.cards || []
  const ups: FluidCardProps[] = cards
    .filter((c) => c.tier === 1)
    .map((c) => ({ card: c.card, variant: 'default' }))
  const downs: FluidCardProps[] = cards
    .filter((c) => c.tier === 0)
    .map((c) => ({
      card: c.card,
      variant: 'default',
      faceDown: c.card.id !== state.focused,
    }))

  return {
    ups,
    downs,
    focused: state.focused,
    throb: highlight[1] === ownerID,
  }
}

interface OwnProps {
  ownerID: string
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
  targetMode: 'none' | 'ace:able' | 'ace:hover'
}

const connector = connect(mapState)

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

export const NonPlayerTiers = connector(_NonPlayerTiers)
