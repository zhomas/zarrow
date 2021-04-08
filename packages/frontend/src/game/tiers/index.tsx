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

const Spacer = styled.div`
  height: 30px;
  pointer-events: none;
`

const CardsRow = styled(motion.div)`
  display: flex;
  justify-content: center;
  max-width: 100%;
  margin: 0 auto;
  > *:last-child {
    flex-basis: 126px;
    flex-shrink: 0;
  }
`

const Wrapper = styled.div`
  position: relative;
`

const Ups = styled(CardsRow)``

const Downs = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: -1;
`

export const Tiers: FC<Props> = ({ ups, downs, nudge, revealing, throb }) => {
  const getOffsetUps = () => {
    if (revealing) return -230

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
      <Spacer />
      <Ups style={{ y: getOffsetUps(), width: getUpsWidth() }}>
        {ups.map((props) => (
          <FluidCard key={props.card.id} {...props} />
        ))}
      </Ups>
      <Downs>
        <CardsRow style={{ width: getDownsWidth() }}>
          {downs.map((props) => (
            <FluidCard key={props.card.id} {...props} />
          ))}
        </CardsRow>
      </Downs>
      {throb && <Throbber point="right" left={-100} />}
    </Wrapper>
  )
}
