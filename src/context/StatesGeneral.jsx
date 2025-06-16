import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import {counterContext} from '../context/CounterContext'

export default function StatesGeneral({children}) {

const [contador, setContador] = useState(0)

    const sumar = () => {
        setContador(contador + 1)
    }

    const restar = () => {
        setContador(contador - 1)
    }

  return (
    <counterContext.Provider value={{contador, setContador, sumar, restar}}>
        {children}
    </counterContext.Provider>
  )
}

const styles = StyleSheet.create({})