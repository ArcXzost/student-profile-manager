import conn from '@/app/lib/db';
import formidable from 'formidable';
import ExcelJS from 'exceljs';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
    api: {
        bodyParser: false,
    },
};

interface FormFields {
    batch?: string;
    sem?: string;
    course?: string;
}

export async function POST(request: NextApiRequest, res: NextApiResponse) {
    const form = formidable({ multiples: false, keepExtensions: true });

    try {
        const { fields, files } = await new Promise<{ fields: FormFields; files: any }>((resolve, reject) => {
            form.parse(request, (err, fields: formidable.Fields, files: formidable.Files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });

        const { batch, sem, course } = fields;
        const file = files.file;

        if (!batch || !sem || !course || !file) {
            return res.status(400).json({ message: "Please provide all the required fields and the file." });
        }

        const fileBuffer = await getFileBuffer(file.filepath);
        const parsedData = await parseExcel(fileBuffer);

        const client = await conn.connect();
        try {
            await client.query('BEGIN');
            const courseDigit = course.toLowerCase() === 'btech' ? '1' : '2';
            const tableName = `sem${sem}_batch${batch}_cse_${course.toLowerCase()}`;

            // Ensure table name is safe to use in a query
            if (!/^[a-z0-9_]+$/.test(tableName)) {
                throw new Error("Invalid table name.");
            }

            const attributes = parsedData[0];
            attributes.shift(); // Remove the first element from the array

            const createTableQuery: string = `
                CREATE TABLE IF NOT EXISTS ${tableName} (
                anomalie INT,
                roll VARCHAR(10) NOT NULL,
                ${attributes.map((attribute: string) => `${attribute} VARCHAR(255)`).join(',\n')},
                PRIMARY KEY (roll)
            )`;

            await client.query(createTableQuery);

            for (let row of parsedData.slice(1)) {
                let anomalie = 0;
                const rollNumber = row[0];
                if (rollNumber.slice(0, 2) !== batch || rollNumber.slice(3, 4) !== courseDigit) {
                    anomalie = 1;
                }

                const insertQuery = `
                    INSERT INTO ${tableName} (anomalie, roll, ${attributes.join(', ')})
                    VALUES ($1, $2, ${attributes.map((_: any, index: number) => `$${index + 3}`).join(', ')})
                    ON CONFLICT (roll) DO NOTHING`;

                row.unshift(anomalie);
                await client.query(insertQuery, row);
            }

            await client.query('COMMIT');
            res.status(200).json({ message: "Table migrated successfully from Excel to database." });
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(400).json({ message: `Error inserting data into database: ${error}` });
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ message: `Error processing request: ${error}` });
    }
}

async function getFileBuffer(filepath: string): Promise<Buffer> {
    const fs = require('fs');
    return fs.promises.readFile(filepath);
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