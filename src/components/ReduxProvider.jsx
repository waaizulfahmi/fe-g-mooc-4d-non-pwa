"use client";

import PropTypes from "prop-types";
import { store, persistor } from "@/redux";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

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
