import React, { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { Loader2 } from "lucide-react"; // Gunakan lucide-react atau ganti dengan spinner lainnya
import { useMutation } from "@tanstack/react-query";
import { createInvoiceAPI } from "../services/invoices/invoiceServices";

const topupOptions = [
  {
    id: "lite",
    name: "Topup Lite",
    coins: 120,
    price: "Rp 15.000",
    description: "Cocok untuk coba-coba dan pengguna baru.",
  },
  {
    id: "scroll",
    name: "Topup Scroll",
    coins: 700,
    price: "Rp 65.000",
    description: "Paket menengah untuk penggunaan rutin.",
  },
  {
    id: "volume",
    name: "Topup Volume",
    coins: 1300,
    price: "Rp 100.000",
    description: "Paket besar, hemat dan praktis!",
    highlight: true,
  },
];

const TopUp = () => {
  const [selectedTopup, setSelectedTopup] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);

  const { mutate: createInvoice, isPending } = useMutation({
    mutationFn: createInvoiceAPI,
    onSuccess: (data) => {
      const redirectUrl = data?.data?.invoice_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        setIsLoading(false);
        alert("Gagal mendapatkan URL pembayaran.");
      }
    },
    onError: () => {
      setIsLoading(false);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    },
  });


  const openModal = (option) => {
    setSelectedTopup(option);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsLoading(false);
  };

  const handleConfirmPayment = () => {
  if (!selectedTopup) return;
    setIsLoading(true);
    createInvoice({ queryKey: ["invoice", selectedTopup.id] });
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

            <button
              onClick={handleConfirmPayment}
              className="w-full py-2 rounded font-semibold flex items-center justify-center bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              disabled={isLoading}
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

      {/* Toast Error */}
      {showErrorToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          ❌ Gagal memproses pembayaran. Silakan coba lagi.
        </div>
      )}
    </PageWrapper>
  );
};

export default TopUp;
