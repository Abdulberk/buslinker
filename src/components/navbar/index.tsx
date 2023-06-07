import React from 'react'
import styles  from './styles.module.scss'


function Navbar() {
  return (
    <div>
        <nav className = {styles.navbar} >

              <div className={styles.logo}>
                <img src = {process.env.PUBLIC_URL + '/logo.svg'} alt="logo" />
              </div>

              <div className={styles.menu}>
                <div className = {styles.currency}>

                  <img src = {process.env.PUBLIC_URL + '/flag.svg'} alt="flag" />
                  <h1>USD</h1>
                </div>
                <div className={styles.links}>

                <ul>
                  <li>Help</li>
                  <li>Login</li>
                  <li className = {styles.register}>
                    Register</li>

                </ul>

                  

                </div>
              </div>

        </nav>
     
     
    </div>

  )
}

export default Navbar