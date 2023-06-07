import React from "react";
import styles from "./styles.module.scss";
import { useState, useEffect } from "react";
import Calendar from 'react-calendar'
import "./Calendar.scss"
import { useRef } from "react";
import Tabs from "../tabs";
import { Tab } from "../tabs";
import '../../fonts/Poppins-Regular.ttf';
import '../../fonts/Poppins-Bold.ttf';
import '../../fonts/Poppins-Medium.ttf';
import '../../fonts/Poppins-SemiBold.ttf';
import '../../fonts/Poppins-Light.ttf';
import '../../fonts/Poppins-ExtraLight.ttf';




const tabs: Tab[] = [
    {
       
        title : "Otobüs",
        icon: "/bus.svg",
        activeIcon: "/busred.svg",
        content : <span>Bus</span>
    },
    {
        
        title : "Uçak",
        icon: "/plane1.svg",
        activeIcon: "/planered.svg",
        content : <span>Plane</span>
    },
    {
       
        title : "Otel",
        icon: "/hotel.svg",
        activeIcon: "/hotelred.svg",
        content : <span>Hotel</span>
    },
    {
       
        title : "Feribot",
        icon: "/ferry.svg",
        activeIcon: "/ferryred.svg",
        content : <span>Ferry</span>

    },

]


interface ChoiceState {
    from: string;
    to: string;
    date: string;
  }

function Booking() {

  const [choice, setChoice] = useState<ChoiceState >
  ({
    from: "",
    to: "",
    date: "",
  }) 




  const [activeTab, setActiveTab] = useState<string>(tabs[0].title);



  const dateRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);



  type  ValuePiece = Date|null;

  const [value, onChange] = useState<ValuePiece|[ValuePiece,ValuePiece]>(new Date());

  const [showCalendar, setShowCalendar] = useState(false);
  const [showScrollMenu, setShowScrollMenu] = useState(false);
  

    const showCalendarHandler = () => {
        setShowCalendar((prev) => !prev);
    };


    useEffect(() => {

        let handler = (event: React.MouseEvent<HTMLElement, MouseEvent> | MouseEvent
            ) => {
            if (dateRef.current && !dateRef.current.contains(event.target as Node
                )) {
                setShowCalendar(false);
            }
        };

        document.addEventListener("mousedown", handler);

        return () => {
            document.removeEventListener("mousedown", handler);

            
        }

    }, [dateRef]
    );

   
    useEffect(() => {
      const handleScroll = () => {
        const scrollTop = window.scrollY; 
        const scrollThreshold = 600

        if (scrollTop > scrollThreshold) {
          setShowScrollMenu(true);
        } else {
          setShowScrollMenu(false);
        }

        
      };
    
      window.addEventListener("scroll", handleScroll);
    
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, []);

  const swapHandler = () => {
    setChoice((prev) => {
      return {
        ...prev,
        from: choice.to,
        to: choice.from,
      };
    });

    
  };
  const textHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChoice((prev) => {
        return {
            ...prev,
            [name]: value
        };
    });
   
};

 
  return (
    <div>
        <div>
            <Tabs tabs = {tabs} activeTab = {activeTab} setActiveTab = {setActiveTab}

                />
        </div>
      <div className={styles.booking}>
        <div className={styles.booking__bookingSection} ref = {containerRef}>
          <div className={styles.booking__bookingSection__bookingContainer} >
            <div className={styles.upperSection}>
              <div className={styles.textBoxContainer}>
                <input type="text" placeholder="Hatay - Merkez" name = "from" value={choice.from}
                onChange={
                    (e) => textHandler(e)
                } />
                <img
                  src={process.env.PUBLIC_URL + "/point.svg"}
                  alt="logo"
                  className={styles.uppericons}
                />
              </div>

              <img src={process.env.PUBLIC_URL + "/swap.svg"} alt="logo" onClick={swapHandler}/>

              <div className={styles.textBoxContainer}>
                <input type="text" placeholder="İstanbul - Otogar" name= "to" value={choice.to}
                 onChange={
                    (e) => textHandler(e)
                }
                
                />
                <img
                  src={process.env.PUBLIC_URL + "/point.svg"}
                  alt="logo"
                  className={styles.uppericons}
                />
                
              </div>
            </div>

            <div className={styles.bottomSection}>
              <div className={styles.textBoxContainer}>
                <input
                  type="text"
                 
                  placeholder="Hatay - Merkez"
                  className={styles.bottominput}
                  onClick={showCalendarHandler}
                    value={choice.date}
                    name="date"
                    onChange={
                        (e) => textHandler(e)
                    }
            

                />  
                <img
                  src={process.env.PUBLIC_URL + "/date.svg"}
                  alt="logo"
                  className={styles.dateicon}


                />
                <div className = {styles.calendarContainer} ref = {dateRef}>
                {showCalendar && (
                    <Calendar
                    
                        onChange={onChange}
                        value={value}
                        className="react-calendar"
                        onClickDay={(value, event) => {
                            setChoice((prev) => {
                                return {
                                    ...prev,
                                    date: value.toLocaleDateString()
                                };
                            });
                            setShowCalendar(false);

                        }}
                       
                                            nextLabel = {
                            <img src={process.env.PUBLIC_URL + "/next.svg"} alt="logo" className={styles.nextLabel} />

                        }
                        prevLabel = {
                            <img src={process.env.PUBLIC_URL + "/prev.svg"} alt="logo" className={styles.prevLabel} />

                        }
                        next2Label = {
                            <img src={process.env.PUBLIC_URL + "/double-next.svg"} alt="logo" className={styles.doubleNext} />

                        }
                        prev2Label = {
                            <img src={process.env.PUBLIC_URL + "/double-prev.svg"} alt="logo" className={styles.doublePrev} />

                        }
                       

                    />
                )}
                </div>
              </div>

              <div className={styles.lastTextBoxContainer}>
                <div className={styles.options}>
                  <img
                    src={process.env.PUBLIC_URL + "/redtick.svg"}
                    alt="logo"
                  />

                  <span>Bugün</span>
                </div>
                <div className={styles.options}>
                  <img
                    src={process.env.PUBLIC_URL + "/redtick.svg"}
                    alt="logo"
                  />
                  <span>Yarın</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.booking__find}>
          <img src={process.env.PUBLIC_URL + "/magnify.svg"} alt="logo" />

          <span>Bilet Bul</span>
        </div>
      </div>

      <div className={`${styles.stickyMenu}${showScrollMenu ? " " + styles.expand : ""}`}>

                        <div className = {styles.inputs}>

                        <div className =  {styles.inputText} >
                            <input type = "text" placeholder = "Hatay - Merkez"
                            name="from"
                            value={choice.from}
                            onChange={textHandler}

                            />
                            <img src = {process.env.PUBLIC_URL + "/point.svg"} alt = "logo" className = {styles.icon} />
                        </div>

                        <div className = {styles.swap} >
                        <img src={process.env.PUBLIC_URL + "/swap.svg"} alt="logo" onClick={swapHandler}/>
                        </div>
                       
                        <div className =  {styles.inputText} >

                            <input type = "text" placeholder = "İstanbul - Otogar" 
                            name="to"
                            value={choice.to}
                            onChange={textHandler}


                            />
                            <img src = {process.env.PUBLIC_URL + "/point.svg"} alt = "logo" className = {styles.icon} />

                            </div>
                            
                            <div className =  {styles.inputText} >

                            <input type = "text" 
                            placeholder="Tarih"
                            name="date"
                            value={choice.date}
                            onChange={textHandler}
                            onClick={showCalendarHandler} />


                            <img src = {process.env.PUBLIC_URL + "/date.svg"} alt = "logo" className = {styles.icon} />
                          </div>

                          <div className = {styles.find}>
                            <img src = {process.env.PUBLIC_URL + "/magnify.svg"} alt = "logo" />
                            <span>Bilet Bul</span>
                            </div>


                        </div>
      </div>
                  



    </div>
  );
}

export default Booking;
