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
import PropTypes from 'prop-types';

// third party
import { SessionProvider } from 'next-auth/react';

// redux
// ---

// components
// ---

// data
// ---

// apis
// ---

// utils
// ---

const NextAuthProvider = ({ children }) => {
    return <SessionProvider>{children}</SessionProvider>;
};

NextAuthProvider.propTypes = {
    children: PropTypes.node,
};

export default NextAuthProvider;
