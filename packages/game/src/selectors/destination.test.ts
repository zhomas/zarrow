import it from 'ava'
import { stackDestinationSelector } from '..'
import { createCardByID } from '../deck'

it('must play on the afterimage of a queen', (t) => {
  const destination = stackDestinationSelector({
    afterimage: [createCardByID('QH')],
    stack: [createCardByID('3S')],
  })

  t.is(destination.id, 'QH')
})
