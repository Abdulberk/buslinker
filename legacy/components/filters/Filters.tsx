import React from 'react'
import styles from './styles.module.scss'
import {useState, useEffect} from 'react'
import Filter from './Filter'
import Services from './FilterContent/Services/Services'
import PriceRange from './FilterContent/PriceRange/PriceRange'
import DepartureHour from './FilterContent/DepartureHour/DepartureHour'



const Filters = () =>{
  return (
    <>
        <div className = {styles.filterContainer} >
            <Filter title = "Kalkış Saati" icon = "/departure-hour.svg" children = {<DepartureHour/>}/>
            <Filter title = "Koltuk Düzeni" icon = "/seat-layout.svg" children = {null}/>
            <Filter title = "Nereden" icon = "/from.svg" children = {null}/>
            <Filter title = "Nereye" icon = "/from.svg" children = {null}/>
            <Filter title = "Bilet Fiyatı" icon = "/ticket-price.svg" children = {<PriceRange />
            }/>
            <Filter title = "Hizmetler" icon = "/extra-services.svg" children = {<Services/> }/>
            
        </div>
    </>
  )
}

export default Filters