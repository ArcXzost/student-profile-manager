import { google } from 'googleapis';
import conn from '@/app/lib/db';
import credentials from '@/app/lib/credentials';

interface Marks {
    batch?: string;
    course?: string;
    branch?: string;
}


export async function POST(req: Request, { params }: { params: { sheetID: string } }) {
    try {
        const { batch, course, branch } = await req.json() as Marks;
        const sheetID = params.sheetID;
        if (!batch || !course || !branch) {
            return new Response("Please Provide all the required fields", { status: 400 });
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
        rows.shift(); // Remove the first row from the array
        const client = await conn.connect();
        try {

            await client.query('BEGIN');
            const TableName = `batch${batch}_${branch}_${course}`;

            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS ${TableName} (
                name VARCHAR(255),
                roll VARCHAR(255),
                dob DATE,
                address TEXT,
                branch VARCHAR(255),
                email VARCHAR(255),
                father VARCHAR(255),
                mother VARCHAR(255),
                PRIMARY KEY (roll)
                )`;

            console.log(createTableQuery);

            await client.query(createTableQuery);

            for (let row of rows) {

                const insertQuery =
                `INSERT INTO ${TableName} (name, roll, dob, address, branch, email, father, mother)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`; // Use placeholders to prevent SQL injection

                await client.query(insertQuery, row);
            }
            await client.query('COMMIT');
            // res.status(200).json({message: 'Table migrated successfully from spreadsheet to database'})
            return new Response("Table migrated successfully from spreadsheet to database", {
                status: 200
            })
        } catch (error) {
            await client.query('ROLLBACK');
            // res.status(400).json({message: 'Error inserting data into database', error: error});
            return new Response(`Error inserting data into database: ${error}`, {
                status: 400
            });
        } finally {
            client.release();
        }
    } catch (error) {
        // console.error('Error fetching data from Google Sheets:', error);
        return new Response(`Error fetching data form Google Sheets: ${error}`, {
            status: 500
        })
    }
}