import React from 'react'
import styles from './styles.module.scss'
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import Travel from './Travel'
import Sort from '../sort'


const Travels = ()=> {
  return (
    <div className = {styles.container}>
      <Sort/>
      <Travel/>
      <Travel/>
      <Travel/>

    </div>
  )
}

export default Travels