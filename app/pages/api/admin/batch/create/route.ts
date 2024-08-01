import conn from '@/app/lib/db';


interface createTable{
    batch?: string;
    sem?: string;
    course?: string;
    branch?: string;
}

export async function POST(req: Request) {
    try {
        const { batch, sem, course, branch } = await req.json() as createTable;
        if (!batch || !sem || !course || !branch) {
            return new Response("Please Provide all the required fields", { status: 400 });
        }
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
