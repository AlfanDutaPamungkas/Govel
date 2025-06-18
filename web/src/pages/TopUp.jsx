import React, { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { Loader2 } from "lucide-react"; // Gunakan lucide-react atau ganti dengan spinner lainnya

const topupOptions = [
  {
    id: "lite",
    name: "Topup Lite",
    coins: 100,
    price: "Rp 10.000",
    description: "Cocok untuk coba-coba dan pengguna baru.",
  },
  {
    id: "scroll",
    name: "Topup Scroll",
    coins: 300,
    price: "Rp 25.000",
    description: "Paket menengah untuk penggunaan rutin.",
  },
  {
    id: "volume",
    name: "Topup Volume",
    coins: 1000,
    price: "Rp 70.000",
    description: "Paket besar, hemat dan praktis!",
    highlight: true,
  },
];

const paymentMethods = [
  "QRIS (All Bank)",
  "Transfer Bank (BCA, Mandiri, BNI)",
  "E-Wallet (Gopay, OVO, Dana)",
];

const TopUp = () => {
  const [selectedTopup, setSelectedTopup] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const openModal = (option) => {
    setSelectedTopup(option);
    setSelectedMethod("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsLoading(false);
  };

  const handleConfirmPayment = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowModal(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 2000);
  };

  return (
    <PageWrapper>
      <div className="pt-24 px-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center mb-4 tracking-wide">
          💰 Topup Coin
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Pilih paket topup yang sesuai dengan kebutuhanmu
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {topupOptions.map((option) => (
            <div
              key={option.id}
              className={`relative rounded-xl p-6 text-center transition-all duration-300 transform hover:-translate-y-2 shadow-lg hover:shadow-xl ${option.highlight
                ? "bg-gradient-to-br from-yellow-100 to-yellow-300 border-yellow-400 border-2"
                : "bg-white border"
                }`}
            >
              {option.highlight && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">
                  ⭐ Favorit
                </div>
              )}
              <h2 className="text-xl font-bold mb-2">{option.name}</h2>
              <p className="text-gray-600 mb-3 italic">{option.description}</p>
              <div className="text-4xl font-bold text-yellow-500 mb-1">
                🪙 {option.coins}
              </div>
              <p className="text-lg font-semibold text-green-600 mb-4">
                {option.price}
              </p>
              <button
                onClick={() => openModal(option)}
                className="mt-2 bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Topup Sekarang
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedTopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative shadow-xl">
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2 text-center">
              Konfirmasi Topup
            </h2>
            <p className="text-center text-gray-600 mb-4">
              Paket: <strong>{selectedTopup.name}</strong>
              <br />
              🪙 {selectedTopup.coins} | {selectedTopup.price}
            </p>

            <div className="mb-4">
              <label className="block mb-2 font-semibold text-sm">
                Pilih Metode Pembayaran:
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">-- Pilih --</option>
                {paymentMethods.map((method, i) => (
                  <option key={i} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <button
              disabled={!selectedMethod || isLoading}
              onClick={handleConfirmPayment}
              className={`w-full py-2 rounded font-semibold flex items-center justify-center ${selectedMethod
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 w-5 h-5" />
                  Memproses...
                </>
              ) : (
                "Lanjutkan Pembayaran"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          🎉 Pembayaran berhasil! Coin akan segera ditambahkan.
        </div>
      )}
    </PageWrapper>
  );
};

export default TopUp;
