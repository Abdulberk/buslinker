import React from 'react';
import styles from './styles.module.scss';
import { useState } from 'react';

function Filter({ title, children, icon }: any) {
  const [extend, setExtend] = useState(false);

  const handleClick = () => {
    setExtend(!extend);
  };

  return (
    <>
      <div className={styles.filterItem} >
        <div className={styles.filter} onClick={handleClick}>
          <div className={styles.left}>
            <img src={process.env.PUBLIC_URL + icon} alt="filter" />
            <h1>{title}</h1>
          </div>
          <div className={`${styles.right} ${extend ? styles.active : styles.passive}`}>
            <img src={process.env.PUBLIC_URL + '/extend-down.svg'} alt="arrow-down" />
          </div>
        </div>
        <div className={`${styles.content} ${extend ? styles.extended : styles.normal}`}>{children}
            

        </div>
      </div>
    </>
  );
}

export default Filter;
