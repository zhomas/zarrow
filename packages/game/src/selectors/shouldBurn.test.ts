import it from 'ava'
import { getStore } from '..'
import { createCardByID } from '../deck'
import { shouldBurn } from './index'

it('should burn when three afterimages match', (t) => {
  const store = getStore({
    afterimage: [
      createCardByID('QD'),
      createCardByID('QS'),
      createCardByID('QC'),
    ],
    stack: [],
  })

  const b = shouldBurn(store.getState(), createCardByID('QH'))
  t.is(b, true)
})

it('should burn with 3 8s on top of the stack', (t) => {
  const store = getStore({
    stack: [createCardByID('8D'), createCardByID('8S'), createCardByID('8C')],
  })

  const b = shouldBurn(store.getState(), createCardByID('8H'))

  t.is(b, true)
})
