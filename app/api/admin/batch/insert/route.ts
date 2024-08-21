import conn from '@/app/lib/db';

interface createTable{
    batch?: string;
    sem?: string;
    course?: string;
    branch?: string;
    details?: string[];
}


export async function POST(req: Request) {
    try {
        const { batch, sem, course, branch, details } = await req.json() as createTable;
        if (!batch || !sem || !course || !branch || !details) {
            return new Response("Please Provide all the required fields", { status: 400 });
        }
        const client = await conn.connect();
        try {
            
            await client.query('BEGIN');
            const TableName = `batch${batch}_${branch}_${course}`;

            const insertQuery =
            `INSERT INTO ${TableName} (name, roll, dob, address, branch, email, father, mother)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`; // Use placeholders to prevent SQL injection

            await client.query(insertQuery, details);

            await client.query('COMMIT');
        }
        catch (error) {
            return new Response(`Error inserting data: ${error}`, {
                status: 500
            }); 
        }
    }
    catch (error) {
        // console.error('Error fetching data from Google Sheets:', error);
        return new Response(`Error Processing request: ${error}`, {
            status: 500
        })
    }
}
