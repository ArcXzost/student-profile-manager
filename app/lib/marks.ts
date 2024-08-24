import conn from '@/app/lib/db';
import { assert } from 'console';

interface StudentInfo {
    roll: string;
    [key: string]: any;
}

async function calculateSPI(grades: { [key: string]: string }) {
    let receivedPoints = 0;
    let totalPoints = 0;
    let creditsMap: { [key: string]: number } = {};
    const gradeMap: { [key: string]: number } = { 'AA': 10, 'AB': 9, 'BB': 8, 'BC': 7, 'CC': 6, 'CD': 5, 'DD': 4, 'FF': 0, 'PP': 10 };

    const subjectKeys = Object.keys(grades).filter(key => key !== 'roll');
    const client = await conn.connect();
    try {
        const creditsQuery = `SELECT Number, Credits FROM Subjects WHERE Number = ANY($1::text[])`;
        const creditsResult = await client.query(creditsQuery, [subjectKeys.map(key => key.toUpperCase())]);
        creditsResult.rows.forEach(row => {
            creditsMap[row.number] = row.credits;
        });

        for (let key of subjectKeys) {
            const grade = grades[key];
            const gradePoints = gradeMap[grade];
            const credits = creditsMap[key.toUpperCase()];

            totalPoints += credits * 10;
            receivedPoints += credits * gradePoints;
        }
    } 
    catch(e){
        console.log(e);
    }finally {
        client.release();
    }

    return {
        SPI: receivedPoints / totalPoints,
        TotalPoints: totalPoints,
        ReceivedPoints: receivedPoints,
        Credits: creditsMap
    };
}

async function calculateCPI(stats: { [key: string]: { TotalPoints: number; ReceivedPoints: number; } }) {
    let totalPoints = 0;
    let receivedPoints = 0;

    for (let sem in stats) {
        if (!stats.hasOwnProperty(sem)) continue;
        if (sem === 'roll') continue;
        totalPoints += stats[sem].TotalPoints;
        receivedPoints += stats[sem].ReceivedPoints;
    }

    return { CPI: receivedPoints / totalPoints };
}

export async function getStudentInfo(rollNumber: string, branch: string): Promise<StudentInfo> {
    assert(rollNumber.length === 7, 'Invalid roll number');

    const batch = Number(rollNumber.slice(0, 2));
    const courseNumber = Number(rollNumber[3]);
    // const branch = 'cse';
    let courseString: string;

    if (courseNumber === 1) {
        courseString = 'btech';
    } else if (courseNumber === 2) {
        courseString = 'mtech';
    } else {
        throw new Error('Invalid course number');
    }

    const client = await conn.connect();
    const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'sem__batch${batch}_${branch}_${courseString}';`);

    const sems: string[] = [];
    for (let i = 0; i < tables.rows.length; i++) {
        let sem = tables.rows[i].table_name[3];
        sems.push(sem);
    }

    let studentInfo: StudentInfo = { roll: rollNumber };
    for (let i = 0; i < sems.length; i++) {
        let sem = sems[i];
        const gradesResult = await client.query(`SELECT * FROM sem${sem}_batch${batch}_${branch}_${courseString} WHERE Roll = $1`, [rollNumber]);
        
        if (gradesResult.rows.length === 0) continue;
        
        const grades = gradesResult.rows[0];
        delete grades.roll;
        
        const hasNullValue = Object.values(grades).some(value => value === null);
        if (hasNullValue) {
            continue;
        }

        let semInfo: any = { grades };
        const semDetails = await calculateSPI(grades);
        semInfo.SPI = semDetails.SPI;
        semInfo.TotalPoints = semDetails.TotalPoints;
        semInfo.ReceivedPoints = semDetails.ReceivedPoints;
        semInfo.Credits = semDetails.Credits;

        studentInfo[sem] = semInfo;
    }

    const CPI = await calculateCPI(studentInfo);
    studentInfo.CPI = CPI.CPI;

    return studentInfo;
}
