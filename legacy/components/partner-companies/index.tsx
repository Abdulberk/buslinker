import React from 'react'
import styles from './styles.module.scss'


function Partners() {

    const partnerData = [
        {
            name: "Metro Turizm",
            logo: "/metro.png"
        },
        {
            name: "Ulusoy Turizm",
            logo: "/ulusoy.png"
        },
        {
            name: "Nilüfer Turizm",
            logo: "/nilufer.png"
        },
        {
            name: "Pamukkale Turizm",
            logo: "/pamukkale.png"
        },
        {
            name: "Varan Turizm",
            logo: "/varan.png"
        },
        {
            name: "Efetur Turizm",
            logo: "/efetur.png"
        },
        
    ]


  return (
    <div className={styles.partnerContainer}>
        <div className = {styles.partnerTitle}>
        <img src={process.env.PUBLIC_URL + '/linker.svg'} alt='line' className={styles.partnerTitleLogo} />
            <h1 className = {styles.partnerTitleText}>Partner Companies</h1>
            

    </div>

    <div className = {styles.partnerCompanies}>

   
        {
            partnerData.map((partner) => (
                <img src={process.env.PUBLIC_URL + partner.logo} alt={partner.name} />
            ))

        }
        

        
        <div className = {styles.seeAll}>
            <p className = {styles.all}>All</p>
            <img src={process.env.PUBLIC_URL + '/seeall.svg'} alt='arrow' className={styles.icon} />

            </div>
    


        </div>

    </div>
  )
}

export default Partners