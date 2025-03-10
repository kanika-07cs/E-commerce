import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Products from "../pages/Products";
import Orders from "../pages/Orders";
import  Admin from "../pages/Admin";
import AddProduct from "../pages/AddProduct";
import Footer from "../pages/Footer";

const routes = ({ children }) => {
    const role=localStorage.getItem("role");
    return (
        <>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {role === 'user' && <Route path="/products" element={<Products />} />}
            {role === 'user' && <Route path="/orders" element={<Orders />} />}
            {role === 'admin' && <Route path="/admin" element={<Admin />} />}
            {role === 'admin' && <Route path="/add-product" element={<AddProduct />} />}
        </Routes>
        <Footer/>
        </>
    )
};
export default routes;