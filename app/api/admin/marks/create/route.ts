import conn from '@/app/lib/db';

interface createTable {
    batch?: string;
    sem?: number;
    course?: string;
    courseID?: string[];
    branch?: string;
}

export async function POST(req: Request) {
    try {
        const { batch, sem, course, courseID, branch} = await req.json() as createTable;
        if (!batch || !sem || !course || !courseID  || !branch) {
            return new Response("Please Provide all the required fields", { status: 400 });
        }
        const client = await conn.connect();
        try {
            await client.query('BEGIN');
            
            const TableName = `sem${sem}_batch${batch}_${branch}_${course}`;

            const CreateTableQuery = `
            CREATE TABLE IF NOT EXISTS ${TableName} (
            anomalie INT,
            roll VARCHAR(10) NOT NULL,   
            ${courseID.map((attribute: string, _: any) => `${attribute} VARCHAR(255)`).join(',\n')},
            PRIMARY KEY (roll)
            )`;

            await client.query(CreateTableQuery);

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
        return new Response(`Error Processing request: ${error}`, {
            status: 500
        })
    }
}
