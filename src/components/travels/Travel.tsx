import React from 'react'
import styles from './styles.module.scss'
import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../redux/store'
import metro from '../../icons/metro.png'
import cancel from '../../icons/cancel.svg'
import hygiene from '../../icons/hygiene.svg'
import tv from '../../icons/tv.svg'
import wireless from '../../icons/wireless.svg'
import charge from '../../icons/charge.svg'
import seat from '../../icons/seat.svg'
import { useMediaQuery } from 'react-responsive'
import metroMobile from '../../icons/mobile-metro.png'


const Travel = ()=> {

  const isMobileOrTablet = useMediaQuery({ query: '(max-width: 1024px)' })




  return (
    <div className = {isMobileOrTablet ? styles.mobileTravelContainer : styles.travelContainer}> 
      <div className = {styles.logo} >
        <img src = {
          isMobileOrTablet ? metroMobile : metro
        } alt = "logo" />
      </div>
         <div className = {styles.mid} >
          <div className = {styles.fromSection}>
            <div className = {styles.hour}> 
            11:30 PM
            </div>
            <div className = {styles.location}> 
            İstanbul, Esenler
            </div>
            </div>
              <div className = {styles.arrivalSection}>
              <div className = {styles.hour}> 
              9h 10m
                </div>
                <div className = {styles.line}> 

                </div>

                </div>
                <div className = {styles.toSection} >
                <div className = {styles.hour}> 
                8:30 PM
                  </div>
                  <div className = {styles.location}> 
                  Hatay, Merkez
                  </div>
                </div>
         </div>

         <div className = {styles.leftBottom} >
              <div className = {styles.option} >
                <div className = {styles.icon} >
                  <img src = {hygiene} alt = "hygiene" />
              </div>
              <div className = {styles.text} >
                Hijyenik Yolculuk
                </div>
                </div>
                <div className = {styles.option} >
                <div className = {styles.icon} >
                  <img src = {cancel} alt = "cancel" />

                    </div>
                    <div className = {styles.text} >
                      Kolay İptal
                      </div>
              </div>

            </div>

            <div className = {styles.right} >
              <div className = {styles.price} >
                  <h1> ₺876 </h1>
                  </div>
                 
                    <button className = {styles.button}> 
                        <h1> SEÇ </h1>
                       </button>

                    
            </div>


            <div className = {styles.midBottom} >
              <div className = {styles.service} >
                  <img src = {tv} alt = "tv" />
              </div>
              <div className = {styles.service} >
                  <img src = {seat} alt = "seat" />
              </div>
              <div className = {styles.service} >
                  <img src = {wireless} alt = "wireless" />
                  </div>
                  <div className = {styles.service} >
                    <img src = {charge} alt = "charge" />
                    </div>

                    </div>



    </div>
  )
}

export default Travel