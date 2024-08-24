'use client';
import React, { useState, useEffect } from 'react';
import styles from './courses.module.css'

const Course = (props) => 
{
       return (
            <div className={styles.container}>
                <div key={props.id} className={styles.courses}>
                    <h3>{props.Course}</h3>
                    <p>CourseID: {props.Code}</p>
                    <p>Credit: {props.Credit}</p>
                    {/* <div id="gradeLine" className={styles.line}></div>; */}
                    <p>Grade: {props.grade}</p>
                </div>
            </div>
        )
    }
export default Course

