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
import PropTypes from 'prop-types';
// import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// third party
// ---

// redux
// ---

// components
// ---

// data
// ---

// apis
// ---

// utils
import { stopSpeech } from '@/utils/text-to-speech';

const Links = ({ className = 'flex gap-[80px]', links }) => {
    const path = usePathname();
    const router = useRouter();

    const handleDeleteSessionReload = (pathname) => {
        if (path === pathname) {
            return;
        }
        sessionStorage.removeItem(path);
        if (sessionStorage.getItem(path) == null) {
            stopSpeech();
            router.push(pathname);
        }
    };

    return (
        <ul className={`${className}`}>
            {links &&
                links.map((link, index) => {
                    return (
                        <li key={index} className='relative'>
                            <div
                                onClick={() => handleDeleteSessionReload(link?.href?.toLowerCase())}
                                className={`${
                                    link?.href?.toLowerCase() === path
                                        ? `${
                                              path === '/rapor' || path === '/peringkat'
                                                  ? 'text-white'
                                                  : 'text-primary-1 text-opacity-100'
                                          }`
                                        : `${
                                              path === '/rapor' || path === '/peringkat'
                                                  ? 'text-white text-opacity-50'
                                                  : 'text-black text-opacity-50'
                                          }`
                                } cursor-pointer font-bold`}
                                href={link?.href}>
                                {link?.name}
                            </div>
                            {link?.href?.toLowerCase() === path && (
                                <div className='absolute left-1/2 h-[10px] w-[10px] translate-x-[-50%] rounded-full bg-secondary-1'></div>
                            )}
                        </li>
                    );
                })}
        </ul>
    );
};

Links.propTypes = {
    links: PropTypes.array,
    className: PropTypes.string,
};

export default Links;
