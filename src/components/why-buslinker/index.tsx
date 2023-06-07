import React from 'react'
import styles from './styles.module.scss'

function WhyBuslinker() {
  return (
    <div className = {styles.container}>

        <div className = {styles.header}>
            <img src = "/linker.svg" alt = "why-buslinker" />
            <h1>
                Why Buslinker ?
            </h1>
            </div>
            <div className = {styles.content}>
        <div className = {styles.left} > 
            <img src = "/whybus.png" alt = "why-buslinker" />

        </div>
        <div className = {styles.right}>
        <div className = {styles.textContainer} >

        <p>
        Buslinker is not just another run-of-the-mill bus ticket booking website. It's a one-stop-shop for all your travel needs. Whether you are planning a solo trip or travelling with family, our user-friendly platform makes booking bus tickets a hassle-free experience. With an extensive network of bus operators, we offer a wide range of routes across multiple destinations. Our commitment to providing safe and comfortable travel options, coupled with our competitive pricing, makes Buslinker the go-to destination for travellers. So, if you're looking for a reliable and convenient way to book your bus tickets, look no further than Buslinker. At Buslinker, we understand that travel can be stressful, which is why we have made it our mission to simplify the process of booking bus tickets.
        </p>

        </div>

            </div>
        </div>
    </div>
  )
}

export default WhyBuslinker