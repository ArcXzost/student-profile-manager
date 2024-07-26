import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import ExcelJS from 'exceljs';
import conn from '@/app/lib/db';

export const config = {
    api: {
        bodyParser: false,
    },
};

interface FormFields {
    [key: string]: string | undefined;
    batch?: string;
    sem?: string;
    course?: string;
}

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { fields, fileBuffer } = await parseFormData(req);
        const { batch, sem, course } = fields;

        if (!batch || !sem || !course || !fileBuffer) {
            return new Response("Please Provide all the required fields",{status: 400});
        }

        const parsedData = await parseExcel(fileBuffer);

        const client = await conn.connect();
        try {
            await client.query('BEGIN');
            const courseDigit = course.toLowerCase() === 'btech' ? '1' : '2';
            const tableName = `sem${sem}_batch${batch}_cse_${course.toLowerCase()}`;

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
            return new Response("Table migrated successfully from spreadsheet to database",{
                status: 200
            })
        } catch (error) {
            await client.query('ROLLBACK');
            return new Response(`Error inserting data into database: ${error}`,{
                status: 400
            });
        } finally {
            client.release();
        }
    } catch (error) {
        return new Response(`Error fetching data from sheets: ${error}`,{
            status: 500
        })
    }
};

async function parseFormData(req: NextApiRequest): Promise<{ fields: FormFields; fileBuffer: Buffer }> {
    // const contentType = req.headers['content-type'] || '';
    // const boundary = contentType.split('boundary=')[1]?.trim();
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    if (!boundary) {
        throw new Error(`Boundary not found in Content-Type header`);
    }

    const chunks: Uint8Array[] = [];
    req.on('data', chunk => chunks.push(chunk));

    return new Promise((resolve, reject) => {
        req.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const formData = parseMultipart(buffer, boundary);
            
            if (!formData.fileBuffer) {
                reject(new Error('File not found in form data'));
                return;
            }

            resolve({ fields: formData.fields, fileBuffer: formData.fileBuffer });
        });

        req.on('error', reject);
    });
}

function parseMultipart(buffer: Buffer, boundary: string): { fields: FormFields; fileBuffer: Buffer } {
    const formData: { fields: FormFields; fileBuffer: Buffer | null } = { fields: {}, fileBuffer: null };
    const boundaryString = `--${boundary}`;
    const parts = buffer.toString().split(boundaryString);

    for (const part of parts) {
        if (part.includes('Content-Disposition: form-data; name="')) {
            const nameMatch = part.match(/name="([^"]+)"/);
            if (nameMatch) {
                const name = nameMatch[1];
                const value = part.split('\r\n\r\n')[1]?.split('\r\n--')[0];
                if (name === 'file') {
                    formData.fileBuffer = Buffer.from(value || '', 'binary');
                } else {
                    formData.fields[name] = value || '';
                }
            }
        }
    }

    if (!formData.fileBuffer) {
        throw new Error('File buffer is null');
    }
    return { fields: formData.fields, fileBuffer: formData.fileBuffer };
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

