import React from 'react'
import styles from './styles.module.scss'


function PopularDestinations() {

    const destinations = [

        {
            name: "İstanbul",
            image: "/istanbul.png"
        },
        {
            name: "Ankara",
            image: "/ankara.png"
        },
        {
            name: "İzmir",
            image: "/izmir.png"
        },
        {
            name: "Antalya",
            image: "/antalya.png"
        },
        {
            name: "Hatay",
            image: "/hatay.png"
        },
        {
            name: "Adana",
            image: "/adana.png"
        },
        {
            name: "Muğla",
            image: "/mugla.png"
        },
        {
            name: "Trabzon",
            image: "/trabzon.png"
        },
        {
            name: "Gaziantep",
            image: "/gaziantep.png"
        },
        {
            name: "Nevşehir",
            image: "/nevsehir.png"
        },
        {
            name: "Mersin",
            image: "/mersin.png"
        },
        {
            name: "Trabzon",
            image: "/trabzon.png"
        },

    ]

  return (
    <div className = {styles.container}>
        <div className = {styles.header}>
            <img src = {process.env.PUBLIC_URL + "/linker.svg"} alt = "star" />
            <h1>Popular Destinations</h1>

            </div>

            <div className = {styles.grid}>
                {
                    destinations.map((destination) => (
                        <div className = {styles.destination}>
                            <img src = {process.env.PUBLIC_URL + destination.image} alt = {destination.name} />
                            <h3>{destination.name}</h3>
                        </div>
                    ))

                }



            </div>


    </div>
  )
}

export default PopularDestinations