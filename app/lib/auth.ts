import { NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { v4 as uuidv4 } from 'uuid';
import conn from './db';

export interface User{
    id: string,
    email: string;
    role: string;
    roll?: string;
}

export const options: NextAuthOptions = {
    secret: process.env.NEXT_AUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email:', type: 'email', placeholder: 'Enter your email' },
                password: { label: 'Password:', type: 'password', placeholder: 'Enter your password' }
            },
            async authorize(credentials): Promise<User | null> {
                if (!credentials) {
                    return null;
                }

                const { email, password } = credentials;
                const client = await conn.connect();
                try {

                    // Check in Admin table
                    let query = 'SELECT email, role FROM Admin WHERE email = $1 AND password = $2';
                    let result = await client.query(query, [email, password]);

                    if (result.rows.length > 0) {
                        const user: User = { id: uuidv4(), email, role: 'admin' };
                        return user;
                    }

                    // Check in Student table
                    query = 'SELECT email, roll FROM Student WHERE email = $1 AND password = $2';
                    result = await client.query(query, [email, password]);

                    if (result.rows.length > 0) {
                        const { roll } = result.rows[0];
                        const user: User = {id: uuidv4(), email, role: 'student', roll };
                        return user;
                    }

                    return null; // No matching user found
                } catch (error) {
                    console.error('Error fetching user:', error);
                    return null; // Return null in case of any error
                } finally {
                    client.release(); // Ensure the client connection is released
                }
            }
        })
    ],
};
