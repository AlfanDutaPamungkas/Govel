import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const AdminLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Dummy logic (ganti sesuai kebutuhan)
        if (username === "admin" && password === "admin123") {
            localStorage.setItem("admin_token", "dummy_token");
            navigate("/admin");
        } else {
            alert("Username atau password salah.");
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Left: Image */}
            <div className="w-1/2 hidden md:block">
                <img
                    src="/images/novel-2.jpeg"
                    alt="Admin Illustration"
                    className="w-full h-screen object-cover"
                />
            </div>

            {/* Right: Login Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-8">
                <div className="max-w-md w-full space-y-6">
                    <h1 className="text-3xl font-bold text-blue-700">Admin Login</h1>



                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Username</label>
                            <input
                                type="text"
                                className="w-full border rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-600 outline-none"
                                placeholder="Masukkan username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full border rounded-full px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-600 outline-none"
                                    placeholder="Masukkan password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-500"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-700 text-white font-semibold py-2 rounded-full hover:bg-blue-800 transition"
                        >
                            Login
                        </button>
                        {/* Back to Home */}
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-sm text-gray-600 hover:underline"
                        >
                            <ArrowLeft size={16} /> Kembali ke Homepage
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
