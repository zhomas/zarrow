import React, { FC } from 'react'
import type { FluidCardProps } from '../../typings'
import { styled } from '@linaria/react'
import { CARD_SIZE, FluidCard } from '../card'
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
  min-height: ${CARD_SIZE.height}px;
  > *:last-child {
    flex-basis: ${CARD_SIZE.width}px;
    flex-shrink: 0;
  }
`

const Wrapper = styled.div`
  padding: 20px;
  display: inline-block;
  background: #000;
`

const InnerWrapper = styled.div`
  position: relative;
  margin: 0 auto;
`

const Ups = styled(CardsRow)``

const Downs = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`

export const Tiers: FC<Props> = ({ ups, downs, nudge, revealing, throb }) => {
  const getOffsetUps = () => {
    if (revealing) return CARD_SIZE.height * -1

    return 0
  }

  const getUpsWidth = () => {
    return (ups.length - 1) * 50 + CARD_SIZE.width
  }

  const getDownsWidth = () => {
    if (revealing) return 500
    return (downs.length - 1) * 65 + CARD_SIZE.width
  }

  const width = Math.max(getUpsWidth(), getDownsWidth())

  return (
    <Wrapper>
      <InnerWrapper style={{ width }}>
        <Downs>
          <CardsRow style={{ width: getDownsWidth() }}>
            {downs.map((props) => (
              <FluidCard key={props.card.id} {...props} />
            ))}
          </CardsRow>
        </Downs>
        <Spacer />
        <Ups style={{ y: getOffsetUps(), width: getUpsWidth() }}>
          {ups.map((props) => (
            <FluidCard key={props.card.id} {...props} />
          ))}
        </Ups>
        {throb && <Throbber point="right" left={-100} />}
      </InnerWrapper>
    </Wrapper>
  )
}
