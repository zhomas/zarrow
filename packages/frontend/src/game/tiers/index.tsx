import React, { FC } from 'react'
import type { FluidCardProps } from '../../typings'
import { styled } from '@linaria/react'
import { FluidCard } from '../card'
import { motion } from 'framer-motion'
import { Throbber } from '../throbber'

interface Props {
  ups: FluidCardProps[]
  downs: FluidCardProps[]
  nudge: 'up' | 'down'
  revealing: boolean
  throb: boolean
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 20px;
  flex: 1;
`

const Ups = styled(motion.div)`
  display: flex;
  position: absolute;
  bottom: 0;
  z-index: 1;
  max-width: 100%;

  > *:last-child {
    flex-basis: 126px;
    flex-shrink: 0;
  }
`

const Downs = styled(motion.div)`
  display: flex;
  justify-content: center;
  max-width: 100%;
  > *:last-child {
    flex-basis: 126px;
    flex-shrink: 0;
  }
`

export const Tiers: FC<Props> = ({ ups, downs, nudge, revealing, throb }) => {
  const getOffsetUps = () => {
    if (revealing) return -230

    if (nudge === 'up') {
      return -50
    }

    return 0
  }

  const getUpsWidth = () => {
    return (ups.length - 1) * 50 + 126
  }

  const getDownsWidth = () => {
    if (revealing) return 500
    return (downs.length - 1) * 80 + 126
  }

  return (
    <Wrapper>
      <Ups style={{ y: getOffsetUps(), width: getUpsWidth() }}>
        {ups.map((props) => (
          <FluidCard key={props.card.id} {...props} />
        ))}
      </Ups>
      <Downs style={{ width: getDownsWidth() }}>
        {downs.map((props) => (
          <FluidCard key={props.card.id} {...props} />
        ))}
      </Downs>
      {throb && <Throbber point="right" left={-100} />}
    </Wrapper>
  )
}
