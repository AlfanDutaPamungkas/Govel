import React from "react";
import PageWrapper from "../../components/PageWrapper";
import { useQuery } from "@tanstack/react-query";
import { listTransactionsAPI } from "../../services/invoices/invoiceServices";

const TransactionHistory = () => {
  const {data: transactions} = useQuery({
    queryKey: ["list-transactions"],
    queryFn: listTransactionsAPI,
  });
  
  return (
    <PageWrapper>
      <div className="pt-28 px-4 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">
          Transaction History
        </h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-700">
                <th className="py-3 px-4">No.</th>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">URL</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Plan</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.data?.map((tx, index) => (
                <tr
                  key={tx.id}
                  className="hover:bg-gray-50 border-t border-gray-200 transition"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{tx.invoice_id}</td>
                  <td className="py-3 px-4">{new Date(tx.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-medium ${
                        tx.status === "PAID"
                          ? "text-green-600"
                          : "text-yellow-500"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={tx.invoice_url}
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Link
                    </a>
                  </td>
                  <td className="py-3 px-4">{tx.amount}</td>
                  <td className="py-3 px-4">{tx.plan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
};

export default TransactionHistory;
