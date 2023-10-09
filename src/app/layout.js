import './globals.css';
import { Montserrat } from 'next/font/google';
import PropTypes from 'prop-types';
import NextAuthProvider from '@/components/NextAuthProvider';
import ReduxProvider from '@/components/ReduxProvider';

const monsterrat = Montserrat({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-monsterrat',
    weight: ['400', '500', '600', '700'],
});

export const metadata = {
    title: 'G-MOOC 4D',
    description: 'Apps for who have spirit of learning!',
    manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
    return (
        <html lang='en' className={`${monsterrat.variable}`}>
            <body suppressHydrationWarning>
                <NextAuthProvider>
                    <ReduxProvider>{children}</ReduxProvider>
                </NextAuthProvider>
            </body>
        </html>
    );
}

RootLayout.propTypes = {
    children: PropTypes.node.isRequired,
};
