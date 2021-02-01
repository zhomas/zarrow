import React from 'react'
import logo from './logo.svg'
import './App.css'
import axios from 'axios'

function App() {
  const createLobby = async () => {
    const url = 'http://localhost:5001/zarrow-a706c/us-central1/createLobby'
    const response = await axios.post(url, { owner: 'abc' })
    console.log(response)
  }

  return (
    <div className="App">
      <button onClick={createLobby}>Create lobby</button>
    </div>
  )
}

export default App
