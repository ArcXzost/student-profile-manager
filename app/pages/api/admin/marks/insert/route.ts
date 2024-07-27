import conn from '@/app/lib/db';

interface MarksEntry {
    batch?: string;
    sem?: number;
    course?: string;
    roll?: string;
    courseID?: string[];
    grade?: string[];
}

export async function POST(req: Request) {
    try {
        const { batch, sem, course, roll, courseID, grade } = await req.json() as MarksEntry;
        if (!batch || !sem || !course || !roll || !courseID || !grade) {
            return new Response("Please Provide all the required fields", { status: 400 });
        }
        const client = await conn.connect();
        try {
            await client.query('BEGIN');
            
            const TableName = `sem${sem}_batch${batch}_cse_${course}`;

            let course_digit = course.toLowerCase() === 'btech' ? '1' : '2';
            let anomalie = 0;
            if ((roll.slice(0, 2) !== batch) || (roll.slice(3, 4) !== course_digit)) {
                anomalie = 1;
            }

            const insertQuery = `
            INSERT INTO ${TableName} (anomalie, roll, ${courseID.join(', ')})
            VALUE ($1, $2, ${courseID.map((_, index) => `$${index + 3}`).join(', ')});`;

            await client.query(insertQuery, [anomalie, roll, ...grade]);

            await client.query('COMMIT');
            

        }
        catch (error) {
            return new Response(`Error in creating table: ${error}`, {
                status: 500
            }); 
        }
    }
    catch (error) {
        // console.error('Error fetching data from Google Sheets:', error);
        return new Response(`Error Processing Data: ${error}`, {
            status: 500
        })
    }
}
