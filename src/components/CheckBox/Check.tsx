import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const UncheckedIcon = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="22" height="22" rx="4" stroke="#5F717A" strokeWidth="2" />
    </svg>
  );
};

const scaleDown = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.8);
  }
  75% {
    transform: scale(1.1);

  }
  100% {
    transform: scale(1);
  }
`;

const CheckedIcon = styled.svg`
  width: 24px;
  height: 24px;
`;

const AnimatedTick = styled.path`
  transform-origin: center;
  animation: ${scaleDown} 0.3s ease-in-out;
`;

const IconWrapper = styled.div`
  user-select: none;
  cursor: pointer;
  width: 24px;
  height: 24px;
`;

interface CheckProps {
  completed: boolean;
}

const Check = ({ completed }: CheckProps) => {
  const [isChecked, setIsChecked] = useState(completed);

  const handleCheck = () => {
    setIsChecked(!isChecked);
  };

  return (
    <IconWrapper onClick={handleCheck}>
      {isChecked ? (
        <CheckedIcon viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <AnimatedTick
            d="M20 7.15883L9.02857 18.1303L4 13.1017L5.28914 11.8126L9.02857 15.5428L18.7109 5.86969L20 7.15883Z"
            fill="#D23B38"
          />
          <rect x="1" y="1" width="22" height="22" rx="4" stroke="#D23B38" strokeWidth="2" />
        </CheckedIcon>
      ) : (
        <UncheckedIcon />
      )}
    </IconWrapper>
  );
};

export default Check;
