import React, { useEffect } from "react";
import { useState } from "react";
import styles from "./styles.module.scss";
import maleActiveSvg from "../../male-active.svg";
import malePassiveSvg from "../../male-passive.svg";
import femaleActiveSvg from "../../female-active.svg";
import femalePassiveSvg from "../../female-passive.svg";
import Modal from "react-modal";



import { useSelector, useDispatch } from "react-redux";

import {
  addSeat,
  removeSeat,
  clearSeats,
  updateGender,
} from "../../redux/selectedSeatsSlice";
import { setSeats, selectSeat, reserveSeat } from "../../redux/seatsSlice";

const SelectedFemaleSeat = ({ text }: any) => {
  return (
    <>
      <svg
        width="33"
        height="33"
        viewBox="0 0 33 33"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0.5"
          y="2.5"
          width="29"
          height="27"
          rx="2.5"
          fill="#EAD8DE"
          stroke="#CA9DAC"
        />
        <rect
          x="9.5"
          y="0.5"
          width="20"
          height="5"
          rx="2.5"
          fill="#EAD8DE"
          stroke="#CA9DAC"
        />
        <rect
          x="9.5"
          y="27.5"
          width="20"
          height="5"
          rx="2.5"
          fill="#EAD8DE"
          stroke="#CA9DAC"
        />
        <rect
          x="27.5"
          y="3.5"
          width="5"
          height="26"
          rx="2.5"
          fill="#EAD8DE"
          stroke="#CA9DAC"
        />
        <text
          x="15"
          y="20"
          fill="black"
          fontSize="16px"
          fontFamily="Arial"
          textAnchor="middle"
        >
          {text}
        </text>
      </svg>
    </>
  );
};


const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',

  },
};



Modal.setAppElement('#root');





const SelectedMaleSeat = ({ text }: any) => {
  return (
    <>
      <svg
        width="33"
        height="33"
        viewBox="0 0 33 33"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0.5"
          y="2.5"
          width="29"
          height="27"
          rx="2.5"
          fill="#C7E2FB"
          stroke="#75B7F5"
        />
        <rect
          x="9.5"
          y="0.5"
          width="20"
          height="5"
          rx="2.5"
          fill="#C7E2FB"
          stroke="#75B7F5"
        />
        <rect
          x="9.5"
          y="27.5"
          width="20"
          height="5"
          rx="2.5"
          fill="#C7E2FB"
          stroke="#75B7F5"
        />
        <rect
          x="27.5"
          y="3.5"
          width="5"
          height="26"
          rx="2.5"
          fill="#C7E2FB"
          stroke="#75B7F5"
        />
        <text
          x="15"
          y="20"
          fill="black"
          fontSize="16px"
          fontFamily="Arial"
          textAnchor="middle"
        >
          {text}
        </text>
      </svg>
    </>
  );
};

const SelectedSeat = ({ text, gender }: any) => {
  return (
    <>
      {gender === "E" ? (
        <SelectedMaleSeat text={text} />
      ) : (
        <SelectedFemaleSeat text={text} />
      )}
    </>
  );
};

const MySelectedSeats = () => {
  const selectedSeats = useSelector((state: any) => state.selectedSeats) as any;

  return (
    <div className={styles.selectedSeats}>
      <div className={styles.upper}>
        <div className={styles.title}>
          {selectedSeats.length > 0 ? (
            <h1>Seçili Koltuklar</h1>
          ) : (
            <h1>Lütfen koltuk seçin</h1>
          )}
        </div>
        <div className={styles.seats}>
          {selectedSeats.map((seat: any) => (
            <>{<SelectedSeat text={seat.seatNumber} gender={seat.gender} />}</>
          ))}
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.title}>Toplam Fiyat</div>
        <div className={styles.totalPrice}>
          <h1>{selectedSeats.length * 60} TL</h1>
        </div>
      </div>
    </div>
  );
};

const SelectPassenger = ({ currentSeatNumber, yanimdakiKisi = null }: any) => {
  const seats = useSelector((state: any) => state.seats) as any;
  const selectedSeats = useSelector((state: any) => state.selectedSeats) as any;
  const dispatch = useDispatch();
  const currentSeat = seats.find(
    (seat: any) => seat.seatNumber === currentSeatNumber
  );

  const genderNextToMe = yanimdakiKisi;

  const addSeatToSelectedSeats = (gender: any) => {
    if (genderNextToMe === gender || genderNextToMe === null) {
      dispatch(
        addSeat({
          seatNumber: currentSeatNumber,
          gender: gender,
        })
      );
    } else if (genderNextToMe === null && gender === null) {
      dispatch(
        addSeat({
          seatNumber: currentSeatNumber,
          gender: gender,
        })
      );
    } else {
      alert("Yanınızdaki kişi ile cinsiyetiniz aynı olmalıdır.");
      return;
    }
  };

  return (
    <>
      <div className={styles.selection}>
        <div
          className={styles.person}
          onClick={() => addSeatToSelectedSeats("E")}
        >
          <img
            src={
              genderNextToMe === "E"
                ? maleActiveSvg
                : genderNextToMe === null
                ? maleActiveSvg
                : malePassiveSvg
            }
            alt="none"
          />
          <div
            className={
              genderNextToMe === "E"
                ? styles.active
                : genderNextToMe === null
                ? styles.active
                : styles.passive
            }
          >
            Erkek
          </div>
        </div>
        <div
          className={styles.person}
          onClick={() => addSeatToSelectedSeats("K")}
        >
          <img
            src={
              genderNextToMe === "K"
                ? femaleActiveSvg
                : genderNextToMe === null
                ? femaleActiveSvg
                : femalePassiveSvg
            }
            alt="none"
          />
          <div
            className={
              genderNextToMe === "K"
                ? styles.active
                : genderNextToMe === null
                ? styles.active
                : styles.passive
            }
          >
            Kadın
          </div>
        </div>
      </div>
    </>
  );
};

const EmptySeat = ({ text }: any) => {
  return (
    <>
      <svg
        width="33"
        height="33"
        viewBox="0 0 33 33"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0.5"
          y="2.5"
          width="29"
          height="27"
          rx="2.5"
          fill="white"
          stroke="#C6C6C6"
        />
        <rect
          x="9.5"
          y="0.5"
          width="20"
          height="5"
          rx="2.5"
          fill="white"
          stroke="#C6C6C6"
        />
        <rect
          x="9.5"
          y="27.5"
          width="20"
          height="5"
          rx="2.5"
          fill="white"
          stroke="#C6C6C6"
        />
        <rect
          x="27.5"
          y="3.5"
          width="5"
          height="26"
          rx="2.5"
          fill="white"
          stroke="#C6C6C6"
        />
        <text
          x="15"
          y="20"
          fill="black"
          fontSize="16px"
          fontFamily="Arial"
          textAnchor="middle"
        >
          {text}
        </text>
      </svg>
    </>
  );
};

const ReservedSeat = ({ text, seat }: any) => {
  const seats = useSelector((state: any) => state.seats) as any;

  const currentSeat = seats.find(
    (seat1: any) => seat1.seatNumber === seat.seatNumber
  );

  const checkReserved = currentSeat.reserved;

  return (
    <>
      {checkReserved === "E" ? (
        <ReservedMaleSeat text={text} />
      ) : (
        <ReservedFemaleSeat text={text} />
      )}
    </>
  );
};

const ReservedMaleSeat = ({ text }: any) => {
  return (
    <>
      <svg
        width="33"
        height="33"
        viewBox="0 0 33 33"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0.5"
          y="2.5"
          width="29"
          height="27"
          rx="2.5"
          fill="#C7E2FB"
          stroke="#75B7F5"
        />
        <rect
          x="9.5"
          y="0.5"
          width="20"
          height="5"
          rx="2.5"
          fill="#C7E2FB"
          stroke="#75B7F5"
        />
        <rect
          x="9.5"
          y="27.5"
          width="20"
          height="5"
          rx="2.5"
          fill="#C7E2FB"
          stroke="#75B7F5"
        />
        <rect
          x="27.5"
          y="3.5"
          width="5"
          height="26"
          rx="2.5"
          fill="#C7E2FB"
          stroke="#75B7F5"
        />
        <text
          x="15"
          y="20"
          fill="black"
          fontSize="16px"
          fontFamily="Arial"
          textAnchor="middle"
        >
          {text}
        </text>
      </svg>
    </>
  );
};

const SelectedGreenSeat = ({ text }: any) => {
  return (
    <>
      <svg
        width="33"
        height="33"
        viewBox="0 0 33 33"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0.5"
          y="2.5"
          width="29"
          height="27"
          rx="2.5"
          fill="#ACDCC2"
          stroke="#6AC092"
        />
        <rect
          x="9.5"
          y="0.5"
          width="20"
          height="5"
          rx="2.5"
          fill="#ACDCC2"
          stroke="#6AC092"
        />
        <rect
          x="9.5"
          y="27.5"
          width="20"
          height="5"
          rx="2.5"
          fill="#ACDCC2"
          stroke="#6AC092"
        />
        <rect
          x="27.5"
          y="3.5"
          width="5"
          height="26"
          rx="2.5"
          fill="#ACDCC2"
          stroke="#6AC092"
        />
        <text
          x="15"
          y="20"
          fill="black"
          fontSize="16px"
          fontFamily="Arial"
          textAnchor="middle"
        >
          {text}
        </text>
      </svg>
    </>
  );
};

const ReservedFemaleSeat = ({ text }: any) => {
  return (
    <>
      <svg
        width="33"
        height="33"
        viewBox="0 0 33 33"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0.5"
          y="2.5"
          width="29"
          height="27"
          rx="2.5"
          fill="#EAD8DE"
          stroke="#CA9DAC"
        />
        <rect
          x="9.5"
          y="0.5"
          width="20"
          height="5"
          rx="2.5"
          fill="#EAD8DE"
          stroke="#CA9DAC"
        />
        <rect
          x="9.5"
          y="27.5"
          width="20"
          height="5"
          rx="2.5"
          fill="#EAD8DE"
          stroke="#CA9DAC"
        />
        <rect
          x="27.5"
          y="3.5"
          width="5"
          height="26"
          rx="2.5"
          fill="#EAD8DE"
          stroke="#CA9DAC"
        />
        <text
          x="15"
          y="20"
          fill="black"
          fontSize="16px"
          fontFamily="Arial"
          textAnchor="middle"
        >
          {text}
        </text>
      </svg>
    </>
  );
};

const Seat = ({ text, seatNumber, currentSeatNumber, yanimdakiKisi }: any) => {
  const seats = useSelector((state: any) => state.seats) as any;

  const currentSeat = seats.find((seat: any) => seat.seatNumber === seatNumber);

  const selected = currentSeat.selected;

  const selectedSeats = useSelector((state: any) => state.selectedSeats) as any;

  return (
    <>
      {selected && currentSeatNumber === currentSeat.seatNumber ? (
        <>
          <SelectPassenger
            currentSeatNumber={currentSeatNumber}
            yanimdakiKisi={yanimdakiKisi}
          />
        </>
      ) : (
        <>
          {selectedSeats.some(
            (selectedSeat: any) => selectedSeat.seatNumber === seatNumber
          ) ? (
            <SelectedGreenSeat text={text} />
          ) : (
            <EmptySeat text={text} />
          )}
        </>
      )}
    </>
  );
};

function Bus() {
  const seats = useSelector((state: any) => state.seats) as any;
  const selectedSeats = useSelector((state: any) => state.selectedSeats) as any;
  const dispatch = useDispatch();
  const [currentSeat, setCurrentSeat] = useState(null);
  const [yanimdakiKisi, setYanimdakiKisi] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (seat: any) => {
    const seatNumber = seat.seatNumber;

    if (seat.reserved) {
      alert("Bu koltuk rezerve edilmiştir.");
      return;
    }

    if (selectedSeats.length > 3) {
      alert("En fazla 3 koltuk seçebilirsiniz.");
      return;

    }

    if (selectedSeats.some((selectedSeat: any) => selectedSeat.seatNumber === seatNumber)) {
      dispatch(removeSeat(seatNumber));
      return;
    }

    setCurrentSeat(seatNumber);
    dispatch(selectSeat(seatNumber));

    if (seat.seatRow === 0) {
      const nextSeat = seatNumber - 1;
      const nextSeatInfo = seats.find(
        (seat: any) => seat.seatNumber === nextSeat
      );
      if (nextSeatInfo && nextSeatInfo.reserved) {
        setYanimdakiKisi(nextSeatInfo.reserved);
      }
    } else if (seat.seatRow === 1) {
      const prevSeat = seatNumber + 1;
      const prevSeatInfo = seats.find(
        (seat: any) => seat.seatNumber === prevSeat
      );
      if (prevSeatInfo && prevSeatInfo.reserved) {
        setYanimdakiKisi(prevSeatInfo.reserved);
      }
    } else if (seat.seatRow === 2) {
      setYanimdakiKisi(null);
    }
  };

  interface GenerateSeatsProps {
    totalSeats: number;
    startingSeatNumbers: number[];
    rowSpacing: number;
  }

  const generateSeats = ({
    totalSeats,
    startingSeatNumbers,
    rowSpacing,
  }: GenerateSeatsProps) => {
    const numRows = startingSeatNumbers.length;
    const numSeatsPerRow = Math.floor(totalSeats / numRows);

    const seatData = [];

    for (let row = 0; row < numRows; row++) {
      const startingSeatNumber = startingSeatNumbers[row];
      let positionY;

      if (row === 0) {
        positionY = 0;
      } else {
        positionY = row * (42 + (row - 1) * rowSpacing);
      }

      for (let seatNum = 0; seatNum < numSeatsPerRow; seatNum++) {
        const seatNumber = startingSeatNumber + seatNum * 3;
        const positionX = seatNum * 42;

        const genders = ["E", "K", null];
        const randomIndex = Math.floor(Math.random() * 3);
        const randomGenders = randomIndex === 2 ? null : genders[randomIndex];

        const reserved = randomGenders;
        const selected = false;

        seatData.push({
          seatNumber,
          positionX: positionX.toString(),
          positionY: positionY.toString(),
          selected,
          reserved,
          seatRow: row,
        });
      }
    }

    return seatData;
  };

  useEffect(() => {
    const totalSeats = 40;
    const startingSeatNumbers = [3, 2, 1];
    const rowSpacing = 90;

    const seats = generateSeats({
      totalSeats,
      startingSeatNumbers,
      rowSpacing,
    });

    dispatch(setSeats(seats));
  }, []);

  return (
    <>
    <div >
      <button className = {styles.button} onClick = {() => setIsOpen(true)}>Koltuk Seçimi</button>
      </div>
    <Modal isOpen = {isOpen} onRequestClose = {() => setIsOpen(false)} style = {customStyles} contentLabel = "Example Modal">
   
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row",
        padding: "20px",
        gap:"24px"
      }}
    >
      <div className = {styles.mainBus}>
      <div className = {styles.frontBus}>
      <img src = {process.env.PUBLIC_URL + '/front-bus.svg'} alt = "none" />
        </div>
      <div className={styles.busContainer}>
        <div className={styles.firstRow}>
          {seats.map((seat: any, index: any) => {
            if (seat.seatRow === 0) {
              return (
                <>
                  <div
                    className={styles.seat}
                    key={index}
                    onClick={() => handleClick(seat)}
                  >
                    {seat.reserved ? (
                      <ReservedSeat text={seat.seatNumber} seat={seat} />
                    ) : (
                      <Seat
                        text={seat.seatNumber}
                        seatNumber={seat.seatNumber}
                        currentSeatNumber={currentSeat}
                        yanimdakiKisi={yanimdakiKisi}
                      />
                    )}
                  </div>
                </>
              );
            } else {
              return null;
            }
          })}
        </div>
        <div style={{ marginTop: "10px" }}></div>
        <div className={styles.secondRow}>
          {seats.map((seat: any, index: any) => {
            if (seat.seatRow === 1) {
              return (
                <>
                  <div
                    className={styles.seat}
                    key={index}
                    onClick={() => handleClick(seat)}
                  >
                    {seat.reserved ? (
                      <ReservedSeat seat={seat} text={seat.seatNumber} />
                    ) : (
                      <Seat
                        text={seat.seatNumber}
                        seatNumber={seat.seatNumber}
                        currentSeatNumber={currentSeat}
                        yanimdakiKisi={yanimdakiKisi}
                      />
                    )}
                  </div>
                </>
              );
            } else {
              return null;
            }
          })}
        </div>
        <div style={{ marginTop: "60px" }}></div>
        <div className={styles.thirdRow}>
          {seats.map((seat: any, index: any) => {
            if (seat.seatRow === 2) {
              return (
                <>
                  <div
                    className={styles.seat}
                    key={index}
                    onClick={() => handleClick(seat)}
                  >
                    {seat.reserved ? (
                      <ReservedSeat seat={seat} text={seat.seatNumber} />
                    ) : (
                      <Seat
                        text={seat.seatNumber}
                        seatNumber={seat.seatNumber}
                        currentSeatNumber={currentSeat}
                        yanimdakiKisi={yanimdakiKisi}
                      />
                    )}
                  </div>
                </>
              );
            } else {
              return null;
            }
          })}
        </div>
      </div>
      </div>

      <MySelectedSeats />
    </div>
    </Modal>
    </>
  );
}

export default Bus;
