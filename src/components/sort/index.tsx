import React from 'react'
import {useState, useEffect} from 'react'
import styles from './styles.module.scss'
import leftArrow from '../../icons/left-arrow.svg'
import rightArrow from '../../icons/right-arrow.svg'
import { useMediaQuery } from 'react-responsive'
import sortIcon from '../../icons/sort.svg'
import filterIcon from '../../icons/filters.svg'
import SwitchButton from '../SwitchButton'

const Sort = () => {

    const isMobile = useMediaQuery({ query: '(max-width: 768px)' })




  return (
    <div className = {styles.container}>
        <div className = {styles.heading} >
            <div className = {isMobile ? styles.mobilePreviousDay : styles.previousDay } >
                    <div className = {styles.icon} >
                        <img src = {leftArrow} alt = "previous-day" />
                    </div>
                    {isMobile ? null :
                    <div className = {styles.text} >
                        Önceki Gün
                        </div>
                    }

                        </div>
                        <div className = {styles.totalTravels} >
                            <h1>
                                Toplam <span>
                                    3
                                </span> sefer bulundu
                            </h1>
                        </div>
                        <div className = {isMobile ? styles.mobileNextDay : styles.nextDay} >
                        {isMobile ? null :
                    <div className = {styles.text} >
                        Sonraki Gün
                        </div>
                    }
                    <div className = {styles.icon} >
                        <img src = {rightArrow} alt = "next-day" />
                        </div>
                        </div>


                        </div>
                        <div className = {styles.sort} > 
                            <div className = {styles.left} >
                                <div className = {styles.left__sortIcon} >
                                    <img src = {sortIcon} alt = "sort" />
                                </div>
                                <div className = {styles.left__filterIcon} >
                                    <img src = {filterIcon} alt = "filter" />
                                </div>
                            </div>
                            <div className = {styles.right} >
                                <SwitchButton label = "En Düşük" />
                                <SwitchButton label = "Sadece Premium" />
                              
                                 
                        </div>
                        </div>

                <div>


        </div>
    </div>
  )
}

export default Sort