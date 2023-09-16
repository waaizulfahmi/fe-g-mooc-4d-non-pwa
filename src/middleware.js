export { default } from 'next-auth/middleware';

export const config = {
    matcher: ['/', '/kelas', '/kelas/:path*', '/rapor', '/rapor/:path*'],
};
