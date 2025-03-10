import { Link } from "react-router-dom";
import "../styles/Home.css"; // Import CSS file

function Home() {
    return (
        <div className="home-container">
            <nav className="navbar">
                <Link to="/">Home</Link>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
            </nav>
            <header className="home-header">
                <br/>
                <h1>Welcome to Amazon</h1>
                <p> Not Just Shopping, But an<span className="italic">Experience!</span> Discover premium quality, unbeatable deals, 
                    and seamless service <br/> that keeps you coming back for more. Your perfect shopping destination—today, tomorrow, forever!</p>
                    <br/>
                <p>Your Ultimate Shopping Destination – Endless Choices, Unmatched Quality! Experience the future of online shopping with seamless service,<br/> 
                premium products, and deals you can’t resist. We bring the <span className="italic">best</span> to your <span className="bold">doorstep!</span></p>
                <p><span className="bold">One Click,</span> Endless Possibilities! Why settle for less when you can have the best? From trending products to timeless essentials,<br/>
                 we bring the world to your fingertips. Welcome to the future of shopping!</p>
                 <p>We Don’t Just Sell, We Deliver <span className="italic">Happiness!</span> With <span className="bold">top-quality</span> products, unbeatable prices, and seamless service,<br/>
                  your perfect shopping experience starts here. <span className="bold">Shop now </span>and experience <span className="Italic">excellence!</span></p><br/>
            </header>
        </div>
    );
}

export default Home;
