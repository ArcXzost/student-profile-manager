"use client";
import React, { useState, useRef, useEffect } from 'react';
import Welcome from '../ui/student/welcome/welcome.jsx';
import Card from '../ui/dashboard/card/card.jsx';
import Course from '../ui/student/courses/courses.jsx';
import Graph from '../ui/student/analytics/graph.jsx';
import Srightbar from '../ui/student/Srightbar/Srightbar.jsx';
import styles from '../ui/student/student.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const page = () => {
    const [semester, setSemester] = useState(1);  // Default to semester 1
    const [isOpen, setIsOpen] = useState(false);  // State to handle dropdown visibility
    const dropdownRef = useRef(null);  // Ref for the dropdown
    const [courses, setCourses] = useState([]);  // State to store courses

    const branch = 'exampleBranch';
    const rollNumber = '1234567';


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/student/getTranscript', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ branch, rollNumber })  // No need to send semester
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
    
                const data = await response.json();
                setCourses(data[semester].grades); // Assuming data is indexed by 'sem1', 'sem2', etc.
            } catch (error) {
                console.error('Error fetching student info:', error);
            }
        };
    
        fetchData();
    }, [branch, rollNumber, semester]); // Fetch again if semester changes, to update displayed courses
    

    // Toggle dropdown
    const toggleDropdown = () => setIsOpen(!isOpen);

    // Handle clicking outside to close the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <>
            <Welcome />
            <div className={styles.container}>
                <div className={styles.wrapper}>
                    <h2 className={styles.heading}>Finance</h2>
                    <div className={styles.card}>
                        {data.map((item) => (
                            <Card
                                key={item.id}
                                title={item.title}
                                value={item.value}
                                details={item.details}
                            />
                        ))}
                    </div>
                    <div className={styles.rightbar}>
                        <Srightbar />
                    </div>
                    <div className={styles.headingContainer} ref={dropdownRef}>
                        <h2 className={styles.heading} onClick={toggleDropdown}>
                            Courses
                            <FontAwesomeIcon icon={faChevronDown} className={styles.dropdownIcon} />
                        </h2>
                        {isOpen && (
                            <div className={styles.dropdownMenu}>
                                {Array.from({ length: 8 }, (_, i) => (
                                    <div
                                        key={i + 1}
                                        className={styles.dropdownItem}
                                        onClick={() => {
                                            setSemester(i + 1);
                                            setIsOpen(false);
                                        }}
                                    >
                                        Semester {i + 1}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className={styles.courses}>
                        {data1.map((course) => (
                            <Course
                                key={course.id}
                                Course={course.Course}
                                Code={course.Code}
                                Credit={course.Credit}
                                grade={course.grade}
                            />
                        ))}
                    </div>
                    <div className={styles.analytics}>
                        <h2 className={styles.heading}>Analytics</h2>
                        <Graph />
                    </div>
                </div>
            </div>
        </>
    );
};

export default page;


const data = [
    {
        id: 1,
        title: 'Semester Fee Paid',
        value: 125000,
        details: 'Jan 2024-April 2024',
    },
    {
        id: 2,
        title: 'Hostel Fee Paid',
        value: 12500,
        details: 'Jan 2024-April 2024',
    },
    {
        id: 3,
        title: 'Mess Fee Paid',
        value: 4000,
        details: 'For this month..',
    },
    {
        id: 4,
        title: 'Library Fine',
        value: 0,
        details: 'No dues',
    }
]


const data1 = [
    {
        id: 1,
        Course: 'Mathematics',
        Code: 'MA101',
        Credit: 6,
        grade: 'AA'
    },
    {
        id: 2,
        Course: 'Physics',
        Code: 'PH101',
        Credit: 6,
        grade: 'AB'
    },
    {
        id: 3,
        Course: 'Chemistry',
        Code: 'CH101',
        Credit: 6,
        grade: 'BB'
    },
    {
        id: 4,
        Course: 'C Programming',
        Code: 'CS101',
        Credit: 6,
        grade: 'AA'
    },
    {
        id: 5,
        Course: 'Data Structures',
        Code: 'CS102',
        Credit: 6,
        grade: 'AB'
    },
    {
        id: 6,
        Course: 'Digital Design',
        Code: 'EC104',
        Credit: 6,
        grade: 'BB'
    }
]