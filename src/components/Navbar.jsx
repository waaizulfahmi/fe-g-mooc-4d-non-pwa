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
            } ${className} fixed top-0 z-20 w-screen  py-[20px] `}>
            <div className='mx-auto flex max-w-screen-xl flex-wrap items-center justify-between'>
                <HeroIcon
                    alt='icons'
                    imgUrl={path === '/rapor' || path === '/peringkat' ? '/images/icon-white.svg' : '/images/voice-icon.svg'}
                    height={120}
                    width={140}
                />
                <Links links={navUrlPath} />
                <NavbarButton />
            </div>
        </nav>
    );
};

Navbar.propTypes = {
    className: PropTypes.string,
};

export default Navbar;
