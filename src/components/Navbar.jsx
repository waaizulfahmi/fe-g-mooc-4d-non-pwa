'use client';

/* 
@DOCS :
1. core
    -> package from react / next
2. third party
    -> package from third party
3. redux
    -> redux global state management
4. components
    -> reusable component
5. data
    -> handle data model or application static data
6. apis
    -> api functions
7. utils
    -> utility functions
*/

// core
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { usePathname } from 'next/navigation';

// third party
// ---

// redux
// ---

// components
import HeroIcon from './HeroIcon';
import Links from './Links';
import NavbarButton from './NavbarButton';
import Link from 'next/link';
// data
// ---

// apis
// ---

// utils
// ---

const navUrlPath = [
    {
        href: '/',
        name: 'Beranda',
    },
    {
        href: '/kelas',
        name: 'Kelas',
    },
    {
        href: '/rapor',
        name: 'Rapor',
    },
    {
        href: '/peringkat',
        name: 'Peringkat',
    },
];

const colorTheme = (path) => {
    switch (path) {
        case '/':
            return 'bg-white';
        case '/kelas':
            return 'bg-[#EDF3F3]';
        default:
            return 'bg-primary-1';
    }
};

const Navbar = ({ className }) => {
    const path = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        const handleColorNav = () => {
            if (window.scrollY >= 200 || document.body.scrollTop >= 200 || document.documentElement.scrollTop >= 200) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleColorNav);

        return () => {
            window.removeEventListener('scroll', handleColorNav);
        };
    });

    return (
        <nav
            className={`${colorTheme(path)} ${
                isScrolled ? 'shadow-low' : 'shadow-none'
            } ${className} fixed top-0 z-20 w-screen py-[20px]`}>
            <div className='mx-auto flex max-w-screen-xl flex-wrap items-center justify-between'>
                <HeroIcon
                    alt='icons'
                    imgUrl={
                        path === '/rapor' || path === '/peringkat' ? '/small-images/icon-white.webp' : '/images/voice-icon.svg'
                    }
                    height={120}
                    width={140}
                />

                {/* Hamburger menu button */}
                {/* <button className='block pe-2 lg:hidden' onClick={toggleSidebar}>
                    <svg className='h-6 w-6 fill-current' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
                        {isOpen ? (
                            <path
                                fillRule='evenodd'
                                clipRule='evenodd'
                                d='M3 5H21C21.5523 5 22 5.44771 22 6V8C22 8.55229 21.5523 9 21 9H3C2.44772 9 2 8.55229 2 8V6C2 5.44771 2.44771 5 3 5ZM3 13H21C21.5523 13 22 13.4477 22 14V16C22 16.5523 21.5523 17 21 17H3C2.44772 17 2 16.5523 2 16V14C2 13.4477 2.44771 13 3 13ZM3 21H21C21.5523 21 22 21.4477 22 22V24C22 24.5523 21.5523 25 21 25H3C2.44772 25 2 24.5523 2 24V22C2 21.4477 2.44771 21 3 21Z'
                            />
                        ) : (
                            <path fillRule='evenodd' clipRule='evenodd' d='M4 6H20V8H4V6ZM4 13H20V15H4V13ZM4 21H20V23H4V21Z' />
                        )}
                    </svg>
                </button> */}

                <div className='hidden md:block'>
                    <Links links={navUrlPath} />
                </div>

                {/* Sidebar */}
                {isOpen && (
                    <div
                        className={`fixed right-0 top-0 z-30 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ${
                            isOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}>
                        {' '}
                        {/* Close button */}
                        <button
                            className='absolute right-0 top-0 m-4 text-gray-800 hover:text-gray-600 focus:outline-none'
                            onClick={closeSidebar}>
                            <svg className='h-6 w-6 fill-current' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
                                <path
                                    fillRule='evenodd'
                                    clipRule='evenodd'
                                    d='M6.293 7.293L12 13l5.707-5.707 1.414 1.414L13 14.414l5.707 5.707-1.414 1.414L12 15.414l-5.707 5.707-1.414-1.414L10.586 14 4.879 8.293 6.293 7.293z'
                                />
                            </svg>
                        </button>
                        {/* Sidebar content */}
                        <ul>
                            {navUrlPath.map((item, index) => (
                                <li key={index} className='py-4 ps-2'>
                                    <Link href={item.href}>{item.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Navbar button */}
                <NavbarButton />
            </div>
        </nav>
    );
};

Navbar.propTypes = {
    className: PropTypes.string,
};

export default Navbar;
