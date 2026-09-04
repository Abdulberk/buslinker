import React, {useState, useEffect} from 'react'
import styles from './styles.module.scss'
import DoubleRangeSlider from '../../../MultiSlider'
import {useSelector, useDispatch} from 'react-redux'
import {setPriceRange} from '../../../../redux/filtersSlice'
import {RootState} from '../../../../redux/store'


function PriceRange() {

  const dispatch = useDispatch()
  const priceRange = useSelector((store:RootState) => store.filters.priceRange)

  const [values, setValues] = useState<[number, number]>([0, 1000])

  const minValue = 0;
  const maxValue = 1000;

  useEffect(() => {
    if (priceRange) {
     
      setValues(priceRange)
    }
  }, [priceRange])

  const onPriceRangeChange = (values: [number, number]) => {
    setValues(values)
    dispatch(setPriceRange(values))

  }

  return (
    <div className = {styles.container}>
        <div className = {styles.container__priceSection}>  

            <div className = {styles.highestPrice}> 
              
                    Fiyat Aralığı 
            
            </div>
            <div className = {styles.highestPriceLabel}>
               
                   {
                        values[0] + " - " + values[1] + " TL"
                        
                   }
               
                </div>
        </div>
        <div className = {styles.rangeSection} >
            <DoubleRangeSlider minValue={minValue} maxValue = {maxValue} onChange = {onPriceRangeChange} initialValues={values} type = "price" />
        </div>

    </div>
  )
}

export default PriceRange