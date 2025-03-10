import React from "react";
import "../styles/Footer.css"; // Import CSS file
import footer from "../assets/Footer.png"

function Footer() {
    return (
        <footer className="footer">
            <img src={footer} alt="" className="footerimg"></img>
            <p>© 2025 Amazon Delivery. All rights reserved.</p>
            <p>Contact: support@amazondelivery.com | Phone: +1 234 567 890</p>
        </footer>
    );
}

export default Footer;
