import React, { useEffect } from 'react';
import { Range } from 'react-range';
import styles from  './styles.module.scss';

const DoubleRangeSlider = () => {


  const [values, setValues] = React.useState([25, 75]);

  const handleChange = (newValues:any) => {
    const difference = newValues[1] - newValues[0];

    if (difference < 10) {
      if (newValues[0] < newValues[1] && newValues[1] < 100) {
        setValues([newValues[0], newValues[0] + 10]);
      } else if (newValues[1] > newValues[0] && newValues[0] > 0) {
        setValues([newValues[1] - 10, newValues[1]]);
      }
    } else {
      setValues(newValues);
    }
  };

  return (
    <div className={styles.sliderWrapper}>
      <Range
        values={values}
        step={1}
        min={0}
        max={100}
        onChange={(values) => handleChange(values)}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            className={styles.track}
          >
            <div
              className={styles.range}
              style={{
                width: `${values[1] - values[0]}%`,
                left: `${values[0]}%`,
              }}
            />
            {children}
          </div>
        )}
        renderThumb={({ props, value }) => (
          <div
            {...props}
            className={styles.thumb}
          >
            <span className={styles.value}>
              {value}
            </span>
          </div>
        )}
      />
    </div>
  );
};

export default DoubleRangeSlider;
