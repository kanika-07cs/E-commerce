import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AddProduct.css"; // Import CSS file

function AddProduct() {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("image", image);

        try {
            await axios.post("http://localhost:5000/products", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Product added successfully!");
            navigate("/admin");
        } catch (err) {
            console.error("Error adding product:", err);
            alert("Failed to add product");
        }
    };

    return (
        <div className="add-product-container">
            <h2>Add Product</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data" className="add-product-form">
                <label>
                    Product Name:
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                </label>
                
                <label>
                    Price (₹):
                    <input 
                        type="number" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        required 
                    />
                </label>
                
                <label>
                    Product Image:
                    <input 
                        type="file" 
                        onChange={(e) => setImage(e.target.files[0])} 
                        required 
                    />
                </label>
                
                <button type="submit">Add Product</button>
            </form>
        </div>
    );
}

export default AddProduct;
