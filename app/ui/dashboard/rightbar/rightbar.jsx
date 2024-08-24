"use client";
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Ensure the Calendar CSS is imported
import styles from './rightbar.module.css';

const RightBar = () => {
    const [date, setDate] = useState(new Date());

    const onChange = (newDate) => {
        setDate(newDate);
    };

    return (
        <div className={styles.container}>
            <div>
                <h2>Calendar</h2>
                <Calendar 
                    onChange={onChange} 
                    value={date}
                    className={styles.calendar}
                />
            </div>
            <div className={styles.item}>
                <div className={styles.bgContainer}>
                    <img src="/notbell.png" alt="user" width={100} height={100} className={styles.bg} />
                </div>
                <div className={styles.texts}>
                    <span className={styles.notification}>You have 5 new notifications</span>
                    <h3 className={styles.title}>Welcome! 
                        <span className="element"></span>
                    </h3>
                    <span className={styles.subtitle}>You can go through the users, dashboard and student details</span>
                    <p className={styles.description}>
                        The admin can update the student details, add new students, delete students and update the marks of the students.
                    </p>
                    <button className={styles.button}>Read More</button>
                </div>
            </div>
        </div>
    );
};

export default RightBar;