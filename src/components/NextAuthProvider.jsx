"use client";

import { SessionProvider } from "next-auth/react";
import PropTypes from "prop-types";

const NextAuthProvider = ({ children }) => {
    return <SessionProvider>{children}</SessionProvider>;
};

NextAuthProvider.propTypes = {
    children: PropTypes.node,
};

export default NextAuthProvider;
