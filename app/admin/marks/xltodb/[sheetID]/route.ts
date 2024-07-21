import { google } from 'googleapis';
import conn from '@/app/lib/db';
import credentials from '@/app/lib/credentials';
// import type {NextApiRequest, NextApiResponse} from 'next'

interface Marks {
    batch?: string;
    sem?: number;
    course?: string;
  }

export async function POST(req: Request, {params}:{params: {sheetID: string}}) {
    try {
        const {batch, sem, course} =await req.json() as Marks;
        const sheetID = params.sheetID;
        if (!batch || !sem || !course) {
            console.log(batch,sem,course);
            return new Response("Please Provide all the required fields",{status: 400});
        }   
        // Authenticate using the credentials
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        });
        const sheets = google.sheets({ version: 'v4', auth });

        // Retrieve data from the spreadsheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: String(sheetID),
            range: `A1:H`, // Use id1 and id2 to construct the range
        });

        const rows = response.data.values || []; // If no rows, initialize as empty array

        const attributes = rows[0]; // Assuming the first row contains the attribute names
        attributes.shift(); // Remove the first element from the array
        rows.shift(); // Remove the first row from the array
        const client = await conn.connect();
        try {

            await client.query('BEGIN');
            let course_digit = course.toLowerCase() === 'btech' ? '1' : '2';
            const TableName = `sem${sem}_batch${batch}_cse_${course}`;

            const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${TableName} (
            anomalie INT,
            roll VARCHAR(10) NOT NULL,   
            ${attributes.map((attribute, index) => `${attribute} VARCHAR(255)`).join(',\n')},
            PRIMARY KEY (roll)
            )`;

            await client.query(createTableQuery);

            for (let row of rows) {
                let anomalie = 0;
                const rollNumber = row[0];
                if ((rollNumber.slice(0, 2) !== batch) || (rollNumber.slice(3, 4) !== course_digit)) {
                    anomalie = 1;
                }   

                const insertQuery = 
                `INSERT INTO ${TableName} (anomalie, roll, ${attributes.map((attribute, index) => `${attribute}`).join(', ')})
                VALUES ($1, $2, ${attributes.map((attribute, index) => `$${index+3}`)})`; // Use placeholders to prevent SQL injection

                row.unshift(anomalie);
                //  console.log(insertQuery);
                await client.query(insertQuery, row);
            }
            await client.query('COMMIT');
            // res.status(200).json({message: 'Table migrated successfully from spreadsheet to database'})
            return new Response("Table migrated successfully from spreadsheet to database",{
                status: 200
            })
        } catch (error) {
            await client.query('ROLLBACK');
            // res.status(400).json({message: 'Error inserting data into database', error: error});
            return new Response(`Error inserting data into database: ${error}`,{
                status: 400
            });
        } finally {
        client.release();
        }
    } catch (error) {
        // console.error('Error fetching data from Google Sheets:', error);
        return new Response(`Error fetching data form Google Sheets: ${error}`,{
            status: 500
        })
    }
}