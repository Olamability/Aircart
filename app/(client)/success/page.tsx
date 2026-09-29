"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useStore from "@/store";
import { motion } from "motion/react";
import { Check, Home, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";

const SuccessPage = () => {
  const { user } = useUser();
  const { resetCart } = useStore();
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const orderNumber = searchParams.get("orderNumber");

  useEffect(() => {
    if (session_id) {
      resetCart();
    }
  }, [session_id, resetCart]);

  return (
    <div
      className="py-5 bg-gradient-to-br from-gray-50 to-gray-100 
    flex items-center justify-center mx-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-6 max-w-xl w-full text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-shop-dark-green rounded-full flex items-center 
    justify-center mx-auto mb-4 shadow-lg"
        >
          <Check className="text-white w-10 h-10" />
        </motion.div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Order Confirmed!
        </h1>
        <div className="space-y-4 mb-4 text-left">
          <p className="text-slate-600">
            Thank you for your purchase. We&apos;re processing your order and
            will deliver it soon. A confirmation email with your order details
            will be sent to your inbox shortly
          </p>
          <p className="text-slate-600">
            Order Number:{" "}
            <span className="text-slate-900 font-semibold">{orderNumber}</span>
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/"
            className="flex items-center justify-center px-4 py-3 font-semibold bg-shop-dark-green text-white rounded-lg hover:bg-shop-dark-green/90 transition-all duration-300 shadow-md"
          >
            <Home className="w-5 h-5 mr-2" />
            Home
          </Link>
          <Link
            href="/orders"
            className="flex items-center justify-center px-4 py-3 
            font-semibold bg-white text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-300 shadow-sm"
          >
            <Package className="w-5 h-5 mr-2" />
            Orders
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center px-4 py-3 font-semibold bg-shop-dark-green text-white rounded-lg hover:bg-shop-dark-green/80 transition-all duration-300 shadow-md"
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            Shop
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessPage;
