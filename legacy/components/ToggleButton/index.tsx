import styles from "./styles.module.scss";
import { useState } from "react";


const ToggleButton = ({ text, onToggle, selected }: any) => {

  const handleClick = () => {
    
    onToggle(text);
  };

  return (
    <div
      className={`${styles.selectButton} ${
        selected ? styles.active : styles.passive
      }`}
      onClick={handleClick}
    >
      {selected ? (
        <>
          <img src={process.env.PUBLIC_URL + "/tick.svg"} alt="arrow-down" />
          <h3>{text}</h3>
        </>
      ) : (
        <h3>{text}</h3>
      )}
    </div>
  );
};

export default ToggleButton;
