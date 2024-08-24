'use client';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './graph.module.css';

// Student analytical data
const data = [
    {
        semester: 'Semester 1',
        spi: 8.43,
        highest: 10,
    },
    {
        semester: 'Semester 2',
        spi: 7.85,
        highest: 10,
    },
    {
        semester: 'Semester 3',
        spi: 8.77,
        highest: 10,
    },
    {
        semester: 'Semester 4',
        spi: 8.31,
        highest: 10,
    },
    {
        semester: 'Semester 5',
        spi: 8.11,
        highest: 10,
    },
    {
        semester: 'Semester 6',
        spi: 8.24,
        highest: 10,
    },
    {
        semester: 'Semester 7',
        spi: 9,
        highest: 10,
    },
    {
        semester: 'Semester 8',
        spi: 9.12,
        highest: 10,
    },
];

const Graph = () => {
    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} className={styles.chart}>
                <XAxis dataKey="semester" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="spi" fill="#8884d8" name="SPI" />
                <Bar dataKey="highest" fill="#82ca9d" name="Highest SPI" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default Graph;