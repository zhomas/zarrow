import type { CardModel } from 'game'

export type FluidCardProps = {
  card: CardModel
  selectable?: boolean
  selected?: boolean
  faceDown?: boolean
  onSelect?: (e: React.SyntheticEvent) => void
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseExit?: () => void
  variant?:
    | 'default'
    | 'disabled'
    | 'highlight'
    | 'lowlight'
    | 'golden'
    | 'idle'
}
