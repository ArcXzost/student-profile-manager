import conn from '@/app/lib/db';

interface createTable{
    batch?: string;
    sem?: string;
    course?: string;
    branch?: string;
    details?: string[];
}


export async function PUT(req: Request) {
    try {
        const { batch, sem, course, branch, details } = await req.json() as createTable;
        if (!batch || !sem || !course || !branch || !details) {
            return new Response("Please Provide all the required fields", { status: 400 });
        }
        const client = await conn.connect();
        try {
            
            await client.query('BEGIN');
            const TableName = `batch${batch}_${branch}_${course}`;

            const updateQuery = `
            UPDATE ${TableName}
            SET ${details.map((_, index) => `$${index+1}`)}, 
            WHERE roll = $9;`; // Use placeholders to prevent SQL injection

            await client.query(updateQuery, [details, details[1]]);

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
