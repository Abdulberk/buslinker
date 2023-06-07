import React from 'react'
import styles from './styles.module.scss'
import {useState, useEffect} from 'react'
import Filter from './Filter'


function Filters() {
  return (
    <>
        <div className = {styles.filterContainer} >
            <Filter title = "Kalkış Saati" icon = "/departure-hour.svg" children = {null}/>
            <Filter title = "Koltuk Düzeni" icon = "/seat-layout.svg" children = {null}/>
            <Filter title = "Nereden" icon = "/from.svg" children = {null}/>
            <Filter title = "Nereye" icon = "/from.svg" children = {null}/>
            <Filter title = "Bilet Fiyatı" icon = "/ticket-price.svg" children = {null}/>
            <Filter title = "Hizmetler" icon = "/extra-services.svg" children = {null}/>
            
        </div>
    </>
  )
}

export default Filters