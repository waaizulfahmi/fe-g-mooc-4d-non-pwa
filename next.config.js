/** @type {import('next').NextConfig} */
// const withPWA = require('next-pwa')({
//     dest: 'public',
//     customWorkerDir: 'serviceworker',
//     // register: true,
//     // skipWaiting: false,
//     // swSrc: '/sw2.js',
//     // importScripts: ['/sw2.js'],
// });

const nextConfig = {
    images: {
        domains: ['res.cloudinary.com', 'placehold.jp', 'i.imgur.com', 'imgur.com', 'be.gmooc4d.id'],
    },
    eslint: {
        dirs: ['app', 'utils', 'components', 'redux'], // Only run ESLint on the [...] directories during production builds (next build)
    },
    reactStrictMode: false,
    experimental: {
        newNextLinkBehavior: true,
    },
};

// const nextConfig = withPWA({
//     images: {
//         domains: ['res.cloudinary.com', 'placehold.jp', 'i.imgur.com', 'imgur.com', 'nurz.site'],
//     },
//     eslint: {
//         dirs: ['app', 'utils', 'components', 'redux'], // Only run ESLint on the [...] directories during production builds (next build)
//     },
//     reactStrictMode: false,
//     experimental: {
//         newNextLinkBehavior: true,
//     },
//     // Customize the HTML head element
//     // async headers() {
//     //     return [
//     //         {
//     //             source: '/(.*)',
//     //             headers: [
//     //                 {
//     //                     key: 'Content-Security-Policy',
//     //                     value: 'upgrade-insecure-requests',
//     //                 },
//     //             ],
//     //         },
//     //     ];
//     // },
// });

// module.exports = process.env.NODE_ENV === 'development' ? nextConfig : nextConfigWithPWA;
module.exports = nextConfig;
