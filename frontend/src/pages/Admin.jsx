import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Admin.css";

function Admin() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [estimatedTime, setEstimatedTime] = useState({});
    const [editProduct, setEditProduct] = useState(null);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    useEffect(() => {
        const role = localStorage.getItem("role");
        if (role !== "admin") {
            navigate("/login");
        } else {
            fetchProducts();
            fetchOrders();
        }
    }, [navigate]);

    const fetchProducts = async () => {
        try {
            const res = await axios.get("http://localhost:5000/products");
            setProducts(res.data);
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    const fetchOrders = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found. Redirecting to login...");
            navigate("/login");
            return;
        }

        try {
            const res = await axios.get("http://localhost:5000/orders", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error("Error fetching orders:", err);
            alert("Failed to fetch orders.");
        }
    };

    const handleAcceptOrder = async (id) => {
        const time = estimatedTime[id];

        if (!time || time.trim() === "") {
            alert("Please enter an estimated delivery time.");
            return;
        }

        try {
            await axios.put(`http://localhost:5000/orders/${id}`, {
                status: "Accepted",
                estimated_time: time,
            });
            fetchOrders();
            setEstimatedTime((prev) => ({ ...prev, [id]: "" }));
        } catch (err) {
            console.error("Error accepting order:", err);
        }
    };

    const handleRejectOrder = async (id) => {
        try {
            await axios.put(`http://localhost:5000/orders/${id}`, { status: "Rejected" });
            fetchOrders();
        } catch (err) {
            console.error("Error rejecting order:", err);
        }
    };

    const handleEdit = (product) => {
        setEditProduct(product);
        setName(product.name);
        setPrice(product.price);
        setImagePreview(`http://localhost:5000/${product.image}`);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/products/${id}`);
            fetchProducts();
        } catch (err) {
            console.error("Error deleting product:", err);
        }
    };

    const handleUpdate = async () => {
        if (!editProduct || !editProduct.id) {
            console.error("Invalid product ID");
            return;
        }
    
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("price", price);
            if (image) formData.append("image", image);
    
            console.log("Updating product:", editProduct.id);
            console.log("FormData:", [...formData]);
    
            await axios.put(`http://localhost:5000/products/${editProduct.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
    
            await fetchProducts();
            setEditProduct(null);
            setImage(null);
            setImagePreview("");
    
            console.log("Product updated successfully!");
        } catch (err) {
            console.error("Error updating product:", err.response?.data || err.message);
        }
    };    

    return (
        <div className="admin-container">
            <h2>Admin Panel</h2>
            <div>
                <button onClick={() => navigate("/add-product")} className="add-button">Add Product</button>
                <button onClick={() => { localStorage.removeItem("role"); navigate("/"); }} className="logout-button">Logout</button>
            </div>

            {/* Manage Products */}
            <h3>Products ({products.length})</h3>
            <div className="product-list">
                {products.length > 0 ? (
                    products.map(product => (
                        <div key={product.id} className="product-card">
                            <h3>{product.name}</h3>
                            <p>Price: ₹{product.price}</p>
                            <img 
                                src={`http://localhost:5000/${product.image}?t=${Date.now()}`} 
                                alt={product.name} 
                                className="product-image"
                            />
                            <div className="product-actions">
                                <button onClick={() => handleEdit(product)} className="edit-button">Edit</button>
                                <button onClick={() => handleDelete(product.id)} className="delete-button">Delete</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No products available.</p>
                )}
            </div>

            {/* Edit Product Form */}
            {editProduct && (
                <div className="edit-product">
                    <h3>Edit Product</h3>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" />
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
                    <div>
                        <p>Current Image:</p>
                        <img src={imagePreview} alt="Product Preview" width="100" />
                    </div>
                    <div className="edit-buttons">
                        <button onClick={handleUpdate} className="edit-button">Update</button>
                        <button onClick={() => setEditProduct(null)} className="delete-button">Cancel</button>
                    </div>
                </div>
            )}

            {/* Manage Orders */}
            <h3>Orders ({orders.length})</h3>
            <div className="order-list">
                {orders.length > 0 ? (
                    orders.map(order => (
                        <div key={order.id} className="order-card">
                            <p><strong>User Id:</strong> {order.user_id}</p>
                            <p><strong>Product:</strong> {order.product_name}</p>
                            <p><strong>Quantity:</strong> {order.quantity}</p>
                            <p><strong>Amount:</strong> {order.total_price}</p>
                            <p><strong>Status:</strong> {order.status}</p>
                            <p><strong>Estimated Time:</strong> {order.estimated_time || "Not Assigned"}</p>

                            {order.status === "pending" && (
                                <div className="order-actions">
                                    <input 
                                        type="text" 
                                        placeholder="Enter estimated time" 
                                        value={estimatedTime[order.id] || ""} 
                                        onChange={(e) => setEstimatedTime({ ...estimatedTime, [order.id]: e.target.value })} 
                                    />
                                    <button onClick={() => handleAcceptOrder(order.id)} className="edit-button">Accept</button>
                                    <button onClick={() => handleRejectOrder(order.id)} className="delete-button">Reject</button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No orders found.</p>
                )}
            </div>
        </div>
    );
}

export default Admin;
