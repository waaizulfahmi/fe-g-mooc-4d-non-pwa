"use client";

// core
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { usePathname } from "next/navigation";

// components
import HeroIcon from "./HeroIcon";
import Links from "./Links";
import NavbarButton from "./NavbarButton";

// data
// import { navUrlPath } from '@/data/path-url';

//utils
// import { recognition } from '@/utils/speechRecognition';
// import { colorTheme } from '@/utils/colorTheme';

const navUrlPath = [
    {
        href: "/",
        name: "Beranda",
    },
    {
        href: "/kelas",
        name: "Kelas",
    },
    {
        href: "/rapor",
        name: "Rapor",
    },
    {
        href: "/peringkat",
        name: "Peringkat",
    },
];

const colorTheme = (path) => {
    switch (path) {
        case "/":
            return "bg-white";
        case "/kelas":
            return "bg-[#EDF3F3]";
        default:
            return "bg-primary-1";
    }
};

const Navbar = ({ className }) => {
    const path = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleColorNav = () => {
            if (
                window.scrollY >= 200 ||
                document.body.scrollTop >= 200 ||
                document.documentElement.scrollTop >= 200
            ) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleColorNav);

        return () => {
            window.removeEventListener("scroll", handleColorNav);
        };
    });

    return (
        <nav
            className={`${colorTheme(path)} ${
                isScrolled ? "shadow-low" : "shadow-none"
            } ${className} fixed top-0 z-20 w-screen  py-[20px] `}
        >
            <div className="flex flex-wrap items-center justify-between max-w-screen-xl mx-auto">
                <HeroIcon
                    alt="icons"
                    imgUrl={
                        path === "/rapor" || path === "/peringkat"
                            ? "/images/icon-white.svg"
                            : "/images/voice-icon.svg"
                    }
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
