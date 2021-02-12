import { motion } from 'framer-motion'
import React, { FC } from 'react'

interface Props {
  downs: JSX.Element
}

export const MiniPlayer: FC<Props> = ({ downs, children }) => {
  return (
    <div
      style={{ width: '33vw', height: 200, backgroundColor: 'rebeccapurple' }}
    >
      <motion.div animate={{ scale: 0.5, transformOrigin: 'top' }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>{downs}</div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>{children}</div>
        {}
      </motion.div>
    </div>
  )
}
