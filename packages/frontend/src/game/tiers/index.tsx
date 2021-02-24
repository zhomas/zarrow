import React, { FC } from 'react'
import type { FluidCardProps } from '../../typings'
import { styled } from '@linaria/react'
import { FluidCard } from '../card'
import { motion } from 'framer-motion'

interface Props {
  ups: FluidCardProps[]
  downs: FluidCardProps[]
  nudge: 'up' | 'down'
  revealing: boolean
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 20px 0;
  height: 220px;
`

const Ups = styled(motion.div)`
  max-width: 260px;
  display: flex;
  position: absolute;
  bottom: 0;
  z-index: 1;
`

const Downs = styled(motion.div)`
  display: flex;
  justify-content: center;
`

export const Tiers: FC<Props> = ({ ups, downs, nudge, revealing }) => {
  const getOffsetUps = () => {
    if (revealing) return -230

    if (nudge === 'up') {
      return -50
    }

    return 0
  }

  const getDownsWidth = () => {
    if (revealing) return 500
    return downs.length * 90
  }

  return (
    <Wrapper>
      <Ups style={{ x: -20, y: getOffsetUps() }}>
        {ups.map((props) => (
          <FluidCard key={props.card.id} {...props} />
        ))}
      </Ups>
      <Downs style={{ width: getDownsWidth() }}>
        {downs.map((props) => (
          <FluidCard key={props.card.id} {...props} />
        ))}
      </Downs>
    </Wrapper>
  )
}
