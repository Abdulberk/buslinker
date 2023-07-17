import React, { useState } from 'react';
import styles from './styles.module.scss';

const SwitchButton = ({label}:any) => {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    setIsOn(!isOn);
  };

  return (
    <div className={styles.container}>
        <div className = {`${styles.switchContainer} ${isOn ? styles.on : styles.off}`} onClick = {handleToggle}> 
        <div className={`${styles.button} ${isOn ? styles.on : styles.off}`} >    
        </div>
      </div>
      {label &&
        <div className = {styles.label }>
            {label}
            </div>
        }
    </div>
  );
};

export default SwitchButton;
