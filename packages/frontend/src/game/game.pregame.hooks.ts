import { CardModel } from 'game'
import { useEffect, useState } from 'react'
import { FluidCardProps } from '../typings'

export const usePregameContext = (uid: string, dealID: string) => {
  const [selected, setSelected] = useState<string[]>([])
  const [hovered, setHovered] = useState<string>('')

  useEffect(() => {
    setSelected([])
    setHovered('')
  }, [dealID])

  return {
    selected,
    getCardProps: (c: CardModel): FluidCardProps => {
      const getVariant = (): FluidCardProps['variant'] => {
        if (hovered === c.id) {
          return 'lowlight'
        }

        return 'default'
      }

      const next = selected.includes(c.id)
        ? selected.filter((h) => h !== c.id)
        : [...selected, c.id]

      return {
        variant: getVariant(),
        onMouseEnter: () => setHovered(c.id),
        onMouseExit: () => setHovered(''),
        onClick: () => setSelected(next),
        card: c,
        selected: selected.includes(c.id),
      }
    },
  }
}
