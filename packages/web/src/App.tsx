import React from 'react'
import './App.css'
import firebase from 'firebase'
import { Router } from '@reach/router'
import { Game } from './pages/Game'
import { Home } from './pages/Home'
import { useEffect } from 'react'
import { useState } from 'react'

firebase.initializeApp({
  apiKey: 'AIzaSyCLam-c7ihiHBe-8lbIz7yERTpqxJse8PY',
  authDomain: 'zarrow-a706c.firebaseapp.com',
  projectId: 'zarrow-a706c',
  storageBucket: 'zarrow-a706c.appspot.com',
  messagingSenderId: '399489894980',
  appId: '1:399489894980:web:b2565a1f826805e102ca11',
})

firebase.functions().useEmulator('localhost', 5001)
firebase.firestore().useEmulator('localhost', 8081)

function App() {
  const [uid, setUID] = useState<string>()

  useEffect(() => {
    const stuff = async () => {
      const x = await firebase.auth().signInAnonymously()
      console.log('signed in', x)
      setUID(x.user?.uid)
    }

    stuff()
  }, [])

  return (
    <div className="App">
      {uid && (
        <Router>
          <Game path="/game/:gameID" userID={uid} />
          <Home default />
        </Router>
      )}
    </div>
  )
}

export default App
