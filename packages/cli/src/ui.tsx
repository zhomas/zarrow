import React, { FC } from 'react'
import { store } from 'game'
import { Provider } from 'react-redux'
import UI from './main'

const App: FC<{ name?: string }> = ({}) => {
  return (
    <Provider store={store}>
      <UI />
    </Provider>
  )
}

module.exports = App
export default App
