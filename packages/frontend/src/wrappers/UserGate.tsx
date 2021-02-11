import firebase from 'firebase'
import React, { FC, useState, useEffect } from 'react'

interface Props {
  children: (uid: string) => JSX.Element
}

export const UserGate: FC<Props> = ({ children }) => {
  const [uid, setUID] = useState<string>()

  useEffect(() => {
    const login = async () => {
      const x = await firebase.auth().signInAnonymously()
      console.log('signed in', x)
      setUID(x.user?.uid)
    }

    login()
  }, [])

  return uid ? <>{children(uid)}</> : <h1>Loading...</h1>
}
