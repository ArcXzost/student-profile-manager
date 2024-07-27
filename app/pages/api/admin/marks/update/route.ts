import conn from '@/app/lib/db';

interface MarksEntry {
    batch?: string;
    sem?: number;
    course?: string;
    roll?: string;
    courseID?: string;
    grade?: string;
}

export async function PUT(req: Request) {
    try {
        const { batch, sem, course, roll, courseID, grade } = await req.json() as MarksEntry;
        if (!batch || !sem || !course || !roll || !courseID || !grade) {
            return new Response("Please Provide all the required fields", { status: 400 });
        }
        const client = await conn.connect();
        try {
            await client.query('BEGIN');
            
            const TableName = `sem${sem}_batch${batch}_cse_${course}`;

            const updateQuery = `
            UPDATE ${TableName}
            SET ${courseID} = $1, 
            WHERE roll = $2;`;

            await client.query(updateQuery, [roll, grade]);

            await client.query('COMMIT');
        }
        catch (error) {
            return new Response(`Error in creating table: ${error}`, {
                status: 500
            }); 
        }
    }
    catch (error) {
        return new Response(`Error Processing Data: ${error}`, {
            status: 500
        })
    }
}
