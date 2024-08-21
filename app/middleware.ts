import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define your roles and corresponding paths
const adminPaths = ['/admin'];
const studentPaths = ['/student'];

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request });
    const { pathname } = request.nextUrl;

    if (!token) {
        // If no token is found, redirect to login page
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const { role } = token;

    // Check if the user has access to the requested path based on their role
    if (adminPaths.some(path => pathname.startsWith(path)) && role !== 'admin') {
        return new NextResponse('Forbidden', { status: 403 });
    }

    if (studentPaths.some(path => pathname.startsWith(path)) && role !== 'student') {
        return new NextResponse('Forbidden', { status: 403 });
    }

    // Allow the request to proceed if no restrictions are violated
    return NextResponse.next();
}

// Specify the paths where middleware should apply
export const config = {
    matcher: ['/admin/:path*', '/student/:path*'], // Apply middleware to paths starting with /admin or /student
};
