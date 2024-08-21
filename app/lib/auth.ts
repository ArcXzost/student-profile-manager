import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import { v4 as uuidv4 } from 'uuid';
import conn from './db';

export interface User {
    id: string;
    name: string;
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
                    let query = 'SELECT email, name FROM public."Admin" WHERE email = $1 AND password = $2';
                    let result = await client.query(query, [email, password]);
                    // console.log(result.rows[0]);
                    if (result.rows.length > 0) {
                        const { name } = result.rows[0];
                        const user: User = { id: uuidv4(), name, email, role: 'admin' };
                        return user;
                    }

                    // Check in Student table
                    query = 'SELECT email, roll, name FROM public."Student" WHERE email = $1 AND password = $2';
                    result = await client.query(query, [email, password]);

                    if (result.rows.length > 0) {
                        const { roll, name } = result.rows[0];
                        const user: User = { id: uuidv4(), name, email, role: 'student', roll };
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
        }),

        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!
        }),
        
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!

        }),
    ],
    callbacks: {
        async session({ session, token }) {
            session.user = {
                ...session.user,
                id: token.id as string,
                name: token.name as string,
                email: token.email as string,
                role: token.role as string,
                roll: token.roll as string
            } as User;
            // console.log("Session Info", session);
            return session;
        },
        async jwt({ token, user}){
            // console.log("User in JWT callback", user);
            if (user) {
                token.user = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    roll: user.roll
                };
            }
            return token;
        },
    },
};
