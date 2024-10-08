import { getStudentInfo } from '@/app/lib/marks';
import { getServerSession } from 'next-auth/next';
import { options, User } from '@/app/lib/auth';


interface Student {
    roll: string;
    branch: string;
}


export async function GET(req: Request) {
    const session = await getServerSession(options);

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        console.log(await req.json());
        const { roll, branch } = await req.json() as Student;

        if (!roll || !branch) {
            return new Response("Please provide all the required fields", { status: 400 });
        }

        // Authorization: Check if the logged-in user is allowed to access the requested information

        const user = session.user! as User; // Update the type of 'user'

        if (user.role === 'student' && roll != '2101110') {
            return new Response("Forbidden: You are not allowed to view other students' transcripts", { status: 403 });
        }


        const studentInfo = await getStudentInfo(roll, branch);
        return new Response(JSON.stringify(studentInfo), { status: 200 });
    } catch (error) {
        return new Response(`Error fetching student information: ${error}`, { status: 400 });
    }
}
