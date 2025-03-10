require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors"); 
const fileUpload = require("express-fileupload");
const path = require("path"); 
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer"); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use(express.static("uploads"));

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error("⛔ Database connection failed:", err.stack);
        return;
    }
    console.log("✅ Connected to MySQL database.");
});

// User Authentication
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";
    
    db.query(sql, [email], async (err, data) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (data.length === 0) return res.status(401).json({ error: "User not found" });

        const user = data[0];
        const storedPassword = user.password;
        const isBcrypt = storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2a$");
        const match = isBcrypt ? await bcrypt.compare(password, storedPassword) : password === storedPassword;

        if (!match) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign({ user_id: user.id, role: user.role }, "secret_key", { expiresIn: "1h" });
        res.json({ success: true, token, user_id: user.id, role: user.role });
    });
});

// Product Routes
app.get("/products", (req, res) => {
    db.query("SELECT * FROM products", (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json(result);
    });
});

app.post("/products", (req, res) => {
    const { name, price } = req.body;
    if (!req.files || !req.files.image) return res.status(400).json({ error: "No image uploaded" });

    const image = req.files.image;
    const filename = `${Date.now()}_${image.name}`;
    const uploadPath = path.join(__dirname, "uploads", filename);
    
    image.mv(uploadPath, (err) => {
        if (err) return res.status(500).json({ error: "Image upload failed" });
        const sql = "INSERT INTO products (name, price, image) VALUES (?, ?, ?)";
        db.query(sql, [name, parseFloat(price), filename], (err) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json({ message: "✅ Product added successfully!" });
        });
    });
});

app.delete("/products/:id", (req, res) => {
    db.query("DELETE FROM products WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Product deleted successfully!" });
    });
});

app.put("/products/:id", (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || !price) {
        return res.status(400).json({ message: "Name and price are required" });
    }

    const updateQuery = "UPDATE products SET name=?, price=? WHERE id=?";
    db.query(updateQuery, [name, price, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Update failed", error: err });

        res.json({ message: "Product updated successfully!" });
    });
});

// Order Routes
app.get("/orders", (req, res) => {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

    try {
        const decoded = jwt.verify(token.split(" ")[1], "secret_key");
        const sql = decoded.role === "admin"
            ? "SELECT orders.*, products.name AS product_name FROM orders JOIN products ON orders.product_id = products.id ORDER BY orders.id DESC"
            : "SELECT orders.*, products.name AS product_name FROM orders JOIN products ON orders.product_id = products.id WHERE orders.user_id = ? ORDER BY orders.id DESC";
        const params = decoded.role === "admin" ? [] : [decoded.user_id];

        db.query(sql, params, (err, data) => {
            if (err) return res.status(500).json({ error: "Database error" });
            res.json(data);
        });
    } catch (err) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
});

app.post("/orders", (req, res) => {
    const { user_id, product_id, quantity, total_price } = req.body;
    if (!user_id || !product_id || !quantity || !total_price) return res.json({ success: false, message: "Missing order details!" });

    const query = "INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)";
    db.query(query, [user_id, product_id, quantity, total_price], (err) => {
        if (err) return res.json({ success: false, message: "Failed to place order!" });
        res.json({ success: true, message: "Order placed successfully!" });
    });
});

app.put("/orders/:id", (req, res) => {
    const { status, estimated_time } = req.body;
    if (!status) return res.status(400).json({ error: "Order status is required" });
    if (status === "Accepted" && (!estimated_time || estimated_time.trim() === "")) {
        return res.status(400).json({ error: "Estimated time is required for accepted orders" });
    }
    
    const sql = "UPDATE orders SET status = ?, estimated_time = ? WHERE id = ?";
    db.query(sql, [status, estimated_time, req.params.id], (err) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ success: true, message: `Order updated to ${status} with estimated time ${estimated_time}` });
    });
});

app.delete("/orders/:id", (req, res) => {
    db.query("DELETE FROM orders WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: "Internal server error" });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Order not found" });
        res.json({ message: "Order deleted successfully" });
    });
});

// Serve Static Images
app.use("/uploads", express.static("uploads"));

app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
        db.query(query, [name, email, hashedPassword, role], (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ message: "Email already exists" });
                }
                return res.status(500).json({ message: "Database error", error: err });
            }
            res.status(201).json({ message: "User registered successfully" });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Start Server
app.listen(5000, () => {
    console.log("✅ Server running on port 5000");
});
