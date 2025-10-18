import React from "react";
import "./Header.css";

interface HeaderProps {
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ title = "Mascotas Perdidas" }) => {
    return (
        <header className="header">
            <img src="/logo.png" alt="Logo" className="header-logo" />
            <h1 className="header-title">{title}</h1>
        </header>
    );
};

export default Header;
