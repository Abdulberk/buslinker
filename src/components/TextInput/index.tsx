import styles from './styles.module.scss';

const InputText = ({icon, placeholder}:any) => {
  return (
    <div className={styles.input}>
      <input type="text" placeholder={placeholder} />
      <div className={styles.icon}>
        <img src={process.env.PUBLIC_URL + icon} alt="none" />
      </div>
    </div>
  );
};

export default InputText;
