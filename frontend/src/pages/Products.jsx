import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Products.css"; // Import CSS file
import Logo from "../assets/Logo.png"; // Import logo image
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlignCenter, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import Search from "../assets/search.png"
import Cart from "../assets/Cart.png"


import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import '../styles/styles.css';
import { Pagination } from 'swiper/modules';

// import 'swiper/css/navigation';
// import { Navigation } from 'swiper/modules';


import Apple from "../board/Apple.png"
import Watch from "../board/Watch.png"
import Dress from "../board/Dress.png"


function Products() {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (!role) {
            navigate("/login");
            return;
        }
        fetchProducts();
    }, [navigate]);

    const fetchProducts = async () => {
        try {
            const res = await axios.get("http://localhost:5000/products");
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("role");
        localStorage.removeItem("user_id");
        navigate("/");
    };

    const handleOrder = async (product) => {
        const user_id = localStorage.getItem("user_id");

        if (!user_id) {
            alert("User not logged in! Please log in first.");
            return;
        }

        const quantity = prompt(`Enter quantity for ${product.name}:`, "1");
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            alert("Invalid quantity entered.");
            return;
        }

        const totalAmount = quantity * product.price;
        const confirmOrder = window.confirm(`Total Amount: ₹${totalAmount}. Proceed with order?`);

        if (!confirmOrder) return;

        try {
            const res = await axios.post("http://localhost:5000/orders", {
                user_id,  
                product_id: product.id,  
                quantity,
                total_price: totalAmount
            });

            if (res.data.success) {
                alert("Order placed successfully!");
                navigate("/orders"); 
            } else {
                alert("Failed to place order.");
            }
        } catch (err) {
            console.error("Error placing order:", err);
            alert("Something went wrong.");
        }
    };

    return (
        <div className="product">
        <div className="header">
            <img src={Logo} alt="" className="logo"></img>
            <p className="location"><h3>Delivering to Coimbatore 641008<br/><span className="bold"><FontAwesomeIcon icon={faLocationDot} /> Update Location</span></h3></p>
            <input type="text" className="search" placeholder="Search Amazon.in"></input>
            <img src={Search} alt="" className="searchicon" ></img>
            <div className="buttons-container">
                <button onClick={() => navigate("/orders")} className="orders-button"><h3>View Orders</h3></button>
                <button onClick={handleLogout} className="logout-button"><h3>Logout</h3></button>
            </div>
            <img src={Cart} alt="" className="cart"></img>
        </div>




        <div className="ads">
        <Swiper
        pagination={{
          dynamicBullets: true,
        }}
        modules={[Pagination]}
        className="mySwiper"
      >
        {/* <Swiper navigation={true} modules={[Navigation]} className="mySwiper"> */}
        <SwiperSlide><img src={Apple} alt="" id="aplbrd"></img></SwiperSlide>
        <SwiperSlide><img src={Dress} alt="" id="aplbrd"></img></SwiperSlide>
        <SwiperSlide><img src={Watch} alt="" id="aplbrd"></img></SwiperSlide>
      </Swiper>
      {/* </Swiper> */}
        </div>

        <br/>


        <div className="products-container">
    <br />
    {products.length > 0 ? (
        <div className="product-list">
            {products.map((product) => (
                <div key={product.id} className="product-card">
                    <h3 className="productname">{product.name}</h3>
                    <p className="price">Price: ₹{product.price}</p>
                    <img 
                        src={`http://localhost:5000/${product.image}?t=${Date.now()}`} 
                        alt={product.name} 
                        className="product-image"
                    />
                    <button onClick={() => handleOrder(product)} className="order-button">Order</button>
                </div>
            ))}
        </div>
        ) : (
        <p className="no-products">No products available.</p>
        )}
    </div>
    <div>
        <h1 className="botcnt">Search for more!</h1>
    </div>
    </div>
    );
}

export default Products;
