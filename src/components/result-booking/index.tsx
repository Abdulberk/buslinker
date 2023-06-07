import styles from './styles.module.scss';
import { useEffect, useState } from 'react';
import ToggleButton from '../ToggleButton';
import InputText from '../TextInput';

const ResultBooking = () => {

    const [selectedButton, setSelectedButton] = useState("");

    const handleClick = (buttonText: any) => {
        setSelectedButton(prev => prev = buttonText);
    }



        return (
            <> 
           <div className = {styles.container} >

            
            
          
               <InputText placeholder = "Hatay - Merkez" icon = "/point.svg" />
                <div className = {styles.swap} >
                    <img src ={process.env.PUBLIC_URL + "/swap.svg"} alt = "arrow-down" />
                </div>
                <InputText placeholder = "İstanbul - Esenler" icon = "/point.svg" />
                <InputText placeholder = "23 Nisan Cuma 2023" icon = "/date.svg" />

                <ToggleButton text = "Bugün" onToggle = {handleClick} selected = {selectedButton === "Bugün"} />
                <ToggleButton text = "Yarın" onToggle = {handleClick} selected = {selectedButton === "Yarın"} />



           </div>
           
            </>

            );
}

export default ResultBooking;