import React, { useEffect } from 'react';
import { Range } from 'react-range';
import styles from  './styles.module.scss';

interface IProps {
  initialValues: [number,number];
  onChange: (values: [number,number]) => void;
  minValue: number;
  maxValue: number;
  type: string;

}

const DoubleRangeSlider = ({ initialValues, onChange, minValue, maxValue, type }: IProps) => {

  const [values, setValues] = React.useState<[number,number]>(initialValues);

  const handleChange = (newValues: number[]) => {
    const range: [number, number] = [newValues[0], newValues[1]];
    setValues(range);
    
  };

  const handleFinalChange = (newValues: number[]) => {
    const range: [number, number] = [newValues[0], newValues[1]];
    onChange(range);
  };


  const calculateWidth = () => {
    const [start, end] = values;
    const width = ((end - start) / (maxValue - minValue)) * 100 + '%';
    return width;
  };

  const calculateLeft = () => {
    const [start] = values;
    const left = ((start - minValue) / (maxValue - minValue)) * 100 + '%';
    return left;
  };


  const formatThumbValue = (value: number) => {

    if (type === 'price') {

      return value.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      });

    }
    else if (type === 'time') {
       return value.toString().padStart(2, '0') + ':00';
    }

    return value.toString();

  }

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  return (
    <div className={styles.sliderWrapper}>
      <Range
        values={values}
        step={1}
        min={minValue}
        max={maxValue}
        onChange={handleChange}
        onFinalChange={handleFinalChange}
        renderTrack={({ props, children }) => (
          <div {...props} className={styles.track}>
            <div
              className={styles.range}
              style={{
                width: calculateWidth(),
                left: calculateLeft(),
              }}
            />
            {children}
          </div>
        )}
        renderThumb={({ props, value }) => (
          <div {...props} className={styles.thumb}>
            <span className={styles.value}>{
              formatThumbValue(value)
            }</span>
          </div>
        )}
      />
    </div>
  );
};

export default DoubleRangeSlider;
