import React from 'react'
import './App.css'
import { UserGate } from './wrappers/UserGate'
import firebase from 'firebase'
import { EntryPage } from './pages/Entry'
import { GamePage } from './pages/Game'

import { Router } from '@reach/router'

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
  return (
    <UserGate>
      {(uid) => (
        <Router>
          <GamePage path=":gid" uid={uid} />
          <EntryPage default />
        </Router>
      )}
    </UserGate>
  )
}

export default App
