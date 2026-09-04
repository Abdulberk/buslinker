import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import DoubleRangeSlider from '../../../MultiSlider';
import night from '../../../../icons/night.svg';
import nightSelected from '../../../../icons/night-selected.svg';
import morning from '../../../../icons/morning.svg';
import morningSelected from '../../../../icons/morning-selected.svg';
import noon from '../../../../icons/noon.svg';
import noonSelected from '../../../../icons/noon-selected.svg';
import evening from '../../../../icons/evening.svg';
import eveningSelected from '../../../../icons/evening-selected.svg';
import { useDispatch, useSelector } from 'react-redux';
import { setDepartureTimeRange } from '../../../../redux/filtersSlice';
import { RootState } from '../../../../redux/store';
const Night = ({ isSelected }: { isSelected: boolean }) => {
  return <img src={isSelected ? nightSelected : night} alt='night' />;
};

const Morning = ({ isSelected }: { isSelected: boolean }) => {
  return <img src={isSelected ? morningSelected : morning} alt='morning' />;
};

const Noon = ({ isSelected }: { isSelected: boolean }) => {
  return <img src={isSelected ? noonSelected : noon} alt='noon' />;
};

const Evening = ({ isSelected }: { isSelected: boolean }) => {
  return <img src={isSelected ? eveningSelected : evening} alt='evening' />;
};

const DepartureHour = () => {
  const [selectedOption, setSelectedOption] = useState('none');
  const [departureTime, setDepartureTime] = useState<[number, number]>([0, 24]);
  const dispatch = useDispatch();
  const departureTimeRange = useSelector((store: RootState) => store.filters.departureTimeRange);
  const maxValue = 24;
  const minValue = 0;



  useEffect(() => {
      if (departureTimeRange) {
      const [start, end] = departureTimeRange;
      if (start === 0 && end === 6) {
        setSelectedOption('night');
      } else if (start === 6 && end === 12) {
        setSelectedOption('morning');
      } else if (start === 12 && end === 18) {
        setSelectedOption('noon');
      } else if (start === 18 && end === 24) {
        setSelectedOption('evening');
      }
      else {
        setSelectedOption('none')
      }

    }
  }, [departureTimeRange]);



  const handleOptionSelect = (option: string) => {
    setSelectedOption(option); 
  
    switch (option) {
      case 'night':
        setDepartureTime([0, 6]);
        break;
      case 'morning':
        setDepartureTime([6, 12]);
        break;
      case 'noon':
        setDepartureTime([12, 18]);
        break;
      case 'evening':
        setDepartureTime([18, 24]);
        break;

        case 'none':
          setDepartureTime([0, 24]);
          break;




    }
  
    dispatch(setDepartureTimeRange(departureTime));
  };
  
  useEffect(() => {
    let departureTime: [number, number] = [0, 24];
  
    switch (selectedOption) {
      case 'night':
        departureTime = [0, 6];
        break;
      case 'morning':
        departureTime = [6, 12];
        break;
      case 'noon':
        departureTime = [12, 18];
        break;
      case 'evening':
        departureTime = [18, 24];
        break;
    }
  
    dispatch(setDepartureTimeRange(departureTime));
  }, [selectedOption, dispatch]);

  const handleSliderChange = (values: [number,number]) => {
    dispatch(setDepartureTimeRange(values));
  };


  return (
    <div className={styles.container}>
      <div className={styles.daysSelectContainer}>
        <div className={styles.day} onClick={() => handleOptionSelect('night')}>
          <Night isSelected={selectedOption === 'night'} />
        </div>
        <div className={styles.day} onClick={() => handleOptionSelect('morning')}>
          <Morning isSelected={selectedOption === 'morning'} />
        </div>
        <div className={styles.day} onClick={() => handleOptionSelect('noon')}>
          <Noon isSelected={selectedOption === 'noon'} />
        </div>
        <div className={styles.day} onClick={() => handleOptionSelect('evening')}>
          <Evening isSelected={selectedOption === 'evening'} />
        </div>
      </div>
      <div className={styles.hoursRangeContainer}>
        <DoubleRangeSlider initialValues={departureTime} 
        onChange = {handleSliderChange} 
        minValue={minValue}
         maxValue={maxValue}
         type = "time"
        />
      </div>
    </div>
  );
};

export default DepartureHour;
