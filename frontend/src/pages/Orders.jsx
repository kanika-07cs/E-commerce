import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Orders.css"; // Import CSS file

function Orders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token"); 

        if (!token) {
            setError("User not logged in! Please log in.");
            setLoading(false);
            return;
        }

        axios.get("http://localhost:5000/orders", {
            headers: { Authorization: `Bearer ${token}` }, 
        })
            .then(res => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching orders:", err);
                setError("Failed to fetch orders. Please try again later.");
                setLoading(false);
            });
    }, []);

    if (loading) return <p className="loading">Loading orders...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="orders-container">
            <h2>My Orders</h2>
            {orders.length === 0 ? (
                <p className="no-orders">No orders found.</p>
            ) : (
                <div className="order-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card">
                            <p><strong>Product:</strong> {order.product_name}</p>
                            <p><strong>Quantity:</strong> {order.quantity}</p>
                            <p><strong>Total Price:</strong> ₹{order.total_price}</p>
                            <p><strong>Status:</strong> <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span></p>
                            <p><strong>Estimated Time:</strong> {order.estimated_time}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Orders;
