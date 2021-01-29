import { CardModel } from './types'
import parse from 'csv-parse/lib/sync'
import path from 'path'
import fs from 'fs'

const pathTo = path.resolve(__dirname, './matrix.csv')

const data = fs.readFileSync(pathTo)

type CardMap = {
  [K in CardModel['value']]: {
    [K in CardModel['value']]: boolean
  }
}

const x = parse(data, {
  columns: true,
  skip_empty_lines: true,
}) as any[]

const y = x.reduce((obj, row) => {
  const { CARD, ...rest } = row
  const values = Object.entries(rest).reduce((o, [card, canPlay]) => {
    return {
      ...o,
      [card]: canPlay === 'TRUE',
    }
  }, {})

  return {
    ...obj,
    [CARD]: values,
  }
}, {}) as CardMap

export const canCardPlay = (
  card: CardModel,
  destination: CardModel,
): boolean => {
  if (!destination) return true
  console.log(`Try to play :: ${card.value} => ${destination.value}`)

  const row = y[card.value]

  return row[destination.value]
}
