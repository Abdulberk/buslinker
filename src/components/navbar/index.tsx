import React from 'react';
import styles from './styles.module.scss';
import { useMediaQuery } from 'react-responsive';
import hamburger from '../../icons/hamburger.svg';
import mobileLogo from '../../icons/mobile-logo.svg';
import {useNavigate} from 'react-router-dom';


const Navbar = () => {

  const navigate = useNavigate();
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1024px)' });

  return (
    <div>
      <nav className={isTabletOrMobile ? styles.mobile : styles.navbar}>
        <div className={styles.logo} onClick = {() => navigate('/')}>
          {isTabletOrMobile ? (
            <img src={mobileLogo} alt="logo" />
          ) : (
            <img src={process.env.PUBLIC_URL + '/logo.svg'} alt="logo" />
          )}
        </div>

        {!isTabletOrMobile && (
          <div className={styles.menu}>
            <div className={styles.currency}>
              <img src={process.env.PUBLIC_URL + '/flag.svg'} alt="flag" />
              <h1>USD</h1>
            </div>
            <div className={styles.links}>
              <ul>
                <li>Help</li>
                <li>Login</li>
                <li className={styles.register}>Register</li>
              </ul>
            </div>
          </div>
        )}

        {isTabletOrMobile && (
          <div className={styles.menu}>
            <img src={hamburger} alt="hamburger" />
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
