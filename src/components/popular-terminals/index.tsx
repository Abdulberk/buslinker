import React from 'react'
import styles from './styles.module.scss'

function PopularTerminals() {

const terminals = [
    {
        name: "Esenler Otogarı",
        link: "/esenler-otogari",
        
    },
    {
        name: "Ankara AŞTİ",
        link: "/ankara-asti",
        
    },
    {
        name: "İzmir Otogarı",
        link: "/izmir-otogari",
       
    },
    {
        name: "Antalya Otogarı",
        link: "/antalya-otogari",
       
    },
    {
        name: "Hatay Otogarı",
        link: "/hatay-otogari",
       
    },
    {
        name: "Adana Otogarı",
        link: "/adana-otogari",

       
    },
    {
        name: "Muğla Otogarı",
        link: "/mugla-otogari",
        
    },
    {
        name: "Trabzon Otogarı",
        link: "/trabzon-otogari",

       
    },
    {
        name: "Gaziantep Otogarı",
        link: "/gaziantep-otogari",

        
    },
    {
        name: "Nevşehir Otogarı",
       link: "/nevsehir-otogari",
    },
    {
        name: "Mersin Otogarı",
        link: "/mersin-otogari",

        
    },
    {   
        name: "Fethiye Otogarı",
        link: "/fethiye-otogari",
    },
    {
        name: "Bursa Otogarı",
        link: "/bursa-otogari",
    },
    {
        name: "Konya Otogarı",
        link: "/konya-otogari",
    },
    {
        name: "Çanakkale Otogarı",
        link: "/canakkale-otogari",
    },
    {
        name: "Çorum Otogarı",
        link: "/corum-otogari",
    },
    

]


  return (
  <div>

  
    
    <div className = {styles.container}>
        <div className={styles.header}>
            <img src="/linker.svg" alt="terminal" />
            <h1>Popular Terminals</h1>
            </div>

            <div className = {styles.terminalContainer}>
                {
                    terminals.map((terminal) => (
                        <div className = {styles.terminal}>
                            <img src = {process.env.PUBLIC_URL + "/terminal.svg"} alt = "terminal" />
                            <a href = {terminal.link}>{terminal.name}</a>

                            </div>
                    ))
                }
                </div>

                <div className={styles.path}>
        <img src={process.env.PUBLIC_URL + "/path.png"} alt="terminal" />
    </div>

                

    </div>

    <div className = {styles.reasons}>
        <div className = {styles.container}>
                <div className = {styles.reason} >
                    <div className = {styles.image}>
                        <img src = {process.env.PUBLIC_URL + "/cancel-anytime.svg"} alt = "reason" />
                        </div>

                        <div className = {styles.description}>
                            <h1>Cancel Anytime</h1>
                            <p>cancel your reservation whenever you need, no question !</p>
                            </div>
                </div>
                <div className = {styles.reason} >
                    <div className = {styles.image}>
                        <img src = {process.env.PUBLIC_URL + "/easy-refund.svg"} alt = "reason" />

                        </div>

                        <div className = {styles.description}>
                            <h1>Easy Refund</h1>
                            <p>If you cancel within 24 hours of booking, we will give you a full refund</p>

                            </div>
                            </div>
                <div className = {styles.reason} >
                    <div className = {styles.image}>
                        <img src = {process.env.PUBLIC_URL + "/comfortable-travel.svg"} alt = "reason" />

                        </div>

                        <div className = {styles.description}>
                            <h1>Comfortable Travel</h1>
                            <p>Travel with our trusted bus companies and enjoy your trip</p>

                            </div>

                            </div>
                <div className = {styles.reason} >
                    <div className = {styles.image}>
                        <img src = {process.env.PUBLIC_URL + "/secure-payment.svg"} alt = "reason" />

                        </div>

                        <div className = {styles.description}>
                            <h1>Secure Payment</h1>
                            <p>Secure payment with your credit card 
                            or debit card</p>

                            </div>

                            </div>
                <div className = {styles.reason} >
                    <div className = {styles.image}>
                        <img src = {process.env.PUBLIC_URL + "/giftcards.svg"} alt = "reason" />

                        </div>

                        <div className = {styles.description}>
                            <h1>Gift Cards</h1>
                            <p>Gift cards are available for your loved ones</p>

                            </div>

                            </div>
                <div className = {styles.reason} >
                    <div className = {styles.image}>
                        <img src = {process.env.PUBLIC_URL + "/no-fees.svg"} alt = "reason" />

                        </div>

                        <div className = {styles.description}>
                            <h1>No Fees</h1>
                            <p>No booking fees, no hidden charges 
                            and no payment processing fees</p>

                            </div>

                            </div>

                
                <div className={styles.reason}>
                    <div className={styles.image}>
                        <img src={process.env.PUBLIC_URL + "/comfortable-travel.svg"} alt="reason" />

                        </div>

                        <div className={styles.description}>
                            <h1>Comfortable Travel</h1>
                            <p>Travel with our trusted bus companies and enjoy your trip</p>

                            </div>

                            </div>


                <div className={styles.reason}>
                    <div className={styles.image}>
                        <img src={process.env.PUBLIC_URL + "/best-price-guarantee.svg"} alt="reason" />
                        </div>

                        <div className={styles.description}>
                            <h1>Best Price Guarantee</h1>
                            <p>Find the best prices from our trusted bus companies</p>
                                 
                            </div>

                            </div>

            </div>

    </div>
   
  
    </div>

  )
}

export default PopularTerminals