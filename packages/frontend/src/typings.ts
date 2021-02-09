import type { CardModel } from 'game'

export type FluidCardProps = {
  card: CardModel
  selected?: boolean
  faceDown?: boolean
  onSelect?: (checked: boolean) => void
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseExit?: () => void
  variant?: 'default' | 'disabled' | 'highlight' | 'lowlight'
}
