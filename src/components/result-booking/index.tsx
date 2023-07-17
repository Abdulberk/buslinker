import styles from './styles.module.scss';
import { useEffect, useState } from 'react';
import ToggleButton from '../ToggleButton';
import InputText from '../TextInput';
import { useMediaQuery } from 'react-responsive';
import swap from '../../icons/swap.svg';
import mobileSwap from '../../icons/mobile-swap.svg';


const ResultBooking = () => {

    const [selectedButton, setSelectedButton] = useState("");
    const isMobileOrTablet = useMediaQuery({ query: '(min-width: 1024px)' })

    const handleClick = (buttonText: any) => {
        setSelectedButton(prev => prev = buttonText);
    }

        return (
            <> 
           <div className = {styles.container} >

               <InputText placeholder = "Hatay - Merkez" icon = "/point.svg" />
                
                {isMobileOrTablet ? 
                <div className = {styles.swap} >
                    <img src ={swap} alt = "arrow-down" />
                </div>
                :
                <div className = {styles.mobileSwap} >
                    <img src ={mobileSwap} alt = "arrow-down" />
                </div>
                }

                <InputText placeholder = "İstanbul - Esenler" icon = "/point.svg" />
                <InputText placeholder = "23 Nisan Cuma 2023" icon = "/date.svg" />

                <div className = {styles.buttonContainer} >
                <ToggleButton text = "Bugün" onToggle = {handleClick} selected = {selectedButton === "Bugün"} />
                <ToggleButton text = "Yarın" onToggle = {handleClick} selected = {selectedButton === "Yarın"} />

                </div>

           </div>
           
            </>

            );
}

export default ResultBooking;