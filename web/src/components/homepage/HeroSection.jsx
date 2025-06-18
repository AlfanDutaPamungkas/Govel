// src/components/homepage/HeroSection.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";

const HeroSection = () => {
    return (
        <section className="py-16 pt-32 px-4 bg-white">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10">
                {/* Gambar di atas (mobile), kiri (desktop) */}
                <div className="flex-1 flex justify-center">
                    <img
                        src="./images/writer.png"
                        alt="Ilustrasi membaca"
                        className="w-80 md:w-[420px]"
                    />
                </div>

                {/* Teks di bawah (mobile), kanan (desktop) */}
                <div className="flex-1 text-center lg:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-gray-900">
                        <span className="text-black">
                            <Typewriter
                                words={[
                                    "Temukan Novel Terbaik",
                                    "Baca Cerita Seru Setiap Hari",
                                    "Romance yang Bikin Baper",
                                    "Fantasy Penuh Keajaiban",
                                ]}
                                loop={true}
                                cursor
                                cursorStyle="|"
                                typeSpeed={70}
                                deleteSpeed={50}
                                delaySpeed={1500}
                            />
                        </span>
                    </h1>

                    <p className="text-gray-600 text-lg mb-6">
                        Mulai petualanganmu sekarang dengan membaca novel terbaik dari berbagai genre. Gratis, mudah, dan selalu update.
                    </p>

                    <Link
                        to="/novel"
                        className="inline-block bg-white border border-black text-black px-6 py-3 rounded-lg font-semibold shadow hover:bg-black hover:text-white transition"
                    >
                        Mulai Membaca
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
