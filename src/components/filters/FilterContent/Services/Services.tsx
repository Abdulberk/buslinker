import React from 'react'
import Check from '../../../CheckBox/Check'
import styles from './styles.module.scss'




const servicesData = [
  { id: 1, label: 'Multimedya', completed: true },
  { id: 2, label: 'Hızlı İnternet İmkanı', completed: false },
  { id: 3, label: 'Güvenlik', completed: false },
  { id: 4, label: 'Otomatik', completed: true },
  { id: 5, label: 'Kontrol', completed: true },
  { id: 6, label: 'Koltuk', completed: false },
  { id: 7, label: 'Yemek', completed: false },
  { id: 8, label: 'İçecek', completed: false },
  { id: 9, label: 'TV', completed: false },
  { id: 10, label: 'Müzik', completed: false },
  { id: 11, label: 'USB', completed: false },
  { id: 12, label: 'WC', completed: false },
  { id: 13, label: 'Klima', completed: false },
  { id: 14, label: 'Örtü', completed: false },

];

function Services() {
  return (
    <div className={styles.container}>
      <div className={styles.container__services}>
        {servicesData.map(service => (
          <div key={service.id} className={styles.service}>
            <div className={styles.service__checkbox}>
              <Check completed={service.completed} />
            </div>
            <div className={styles.service__serviceLabel}>
              {service.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Services