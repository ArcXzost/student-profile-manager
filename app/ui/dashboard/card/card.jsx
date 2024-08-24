"use client"
import React from 'react';
import styles from './card.module.css';
import { useSpring, animated } from 'react-spring';

const Card = ({ title, value, details, icon }) => {
  // Animation for the value
  const props = useSpring({
    from: { number: 0 },
    number: value,
    delay: 200,
    config: { mass: 1, tension: 180, friction: 12 },
  });

  return (
    <div className={styles.card}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <animated.div className={styles.value}>
          {props.number.to((n) => n.toFixed(0))}
        </animated.div>
        <p className={styles.details}>{details}</p>
      </div>
    </div>
  );
};

export default Card;
