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
// ---

// redux
import { store, persistor } from '@/redux';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// components
// ---

// data
// ---

// apis
// ---

// utils
// ---

const ReduxProvider = ({ children }) => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                {children}
            </PersistGate>
        </Provider>
    );
};

ReduxProvider.propTypes = {
    children: PropTypes.node,
};

export default ReduxProvider;
