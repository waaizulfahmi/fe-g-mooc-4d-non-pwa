import NextAuth from 'next-auth';
import { authLogin } from '@/axios/auth';
import { ApiResponseError } from '@/utils/error-handling';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            id: 'test',
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'text',
                    placeholder: 'arief@gmail.com',
                },
                password: { label: 'Password', type: 'password' },
            },

            async authorize(credentials) {
                try {
                    const response = await authLogin({
                        email: credentials.email,
                        password: credentials.password,
                    });

                    console.log('Response login: ', response.data);
                    return response.data;
                } catch (error) {
                    if (error instanceof ApiResponseError) {
                        console.log(`ERR USER AUTH: `, error.message);
                        console.log(error.data);
                        throw new Error(error.message);
                    }
                    throw new Error(error.response.data.message);
                    // console.log("ERROR USER AUTH", error.response.data.message);
                    // console.log(`MESSAGE: `, error.message);
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            return { ...token, ...user };
        },

        async session({ session, token }) {
            session.user = token;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
    },
});

export { handler as GET, handler as POST };
