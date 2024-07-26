import ExcelJS from 'exceljs';
import { Buffer } from 'buffer';
import conn from '@/app/lib/db';

interface FileHandler {
    file?: string;
    filename?: string;
    batch?: string;
    sem?: number;
    course?: string;
}

export async function POST(req: Request) {
    try {
        const { file, filename, batch, sem, course } = await req.json() as FileHandler;
        console.log(req.body);

        if (!file || !batch || !sem || !course || !filename) {
            return new Response("Please provide all required fields and the file.", { status: 400 });
        }

        // Convert base64 file to Buffer
        const fileBuffer = Buffer.from(file, 'base64');
        const parsedData = await parseExcel(fileBuffer);

        const rows = parsedData;
        // Connect to the database
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
            ${attributes.map((attribute: string, _: any) => `${attribute} VARCHAR(255)`).join(',\n')},
            PRIMARY KEY (roll)
            )`;

            await client.query(createTableQuery);

            for (let row of rows) {
                let anomalie = 0;
                const rollNumber = String(row[0]);
                if ((rollNumber.slice(0, 2) !== batch) || (rollNumber.slice(3, 4) !== course_digit)) {
                    anomalie = 1;
                }

                const insertQuery =
                `INSERT INTO ${TableName} (anomalie, roll, ${attributes.map((attribute: string, _: any) => `${attribute}`).join(', ')})
                VALUES ($1, $2, ${attributes.map((_: any, index: number) => `$${index + 3}`)})`; // Use placeholders to prevent SQL injection

                row.unshift(anomalie);
                //  console.log(insertQuery);
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

async function parseExcel(fileData: Buffer): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(fileData);

    const worksheet = workbook.worksheets[0];
    const data: any[] = [];

    worksheet.eachRow({ includeEmpty: true }, (row) => {
        data.push((row.values as any[]).slice(1)); // Skip the first cell which is undefined due to ExcelJS indexing
    });

    return data;
}
