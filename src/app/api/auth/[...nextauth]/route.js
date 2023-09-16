import NextAuth from "next-auth";
import axios from "axios";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "text",
                    placeholder: "arief@gmail.com",
                },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials) {
                try {
                    const res = await axios.post(
                        "https://nurz.site/api/login",
                        {
                            email: credentials.email,
                            password: credentials.password,
                        },
                        {
                            headers: {
                                accept: "*/*",
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    return res.data.data;
                } catch (error) {
                    console.log("ERROR USER AUTH", error.response.data.message);
                    throw new Error(error.response.data.message);
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            return { ...token, ...user };
        },

        // async session({ session, token, user }) {
        //     session.user = token;
        //     return session;
        // },
        async session({ session, token }) {
            session.user = token;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
    },
});

export { handler as GET, handler as POST };
