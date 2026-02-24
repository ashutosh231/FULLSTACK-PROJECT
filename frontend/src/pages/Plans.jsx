import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { purchasePlan } from "../api/authApi";
import { setUser } from "../store/slices/authSlice";
import { successToast, errorToast } from "../utils/toast";
import { createRazorpayOrder, verifyRazorpayPayment } from "../api/authApi";
import { loadRazorpayScript } from "../utils/razorpay";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    tokens: 10,
    description: "Perfect to get started",
    price: 100, // Now paid
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    tokens: 50,
    description: "For regular creators",
    price: 299,
    highlight: true,
  },
  {
    id: "platinum",
    name: "Platinum",
    tokens: 200,
    description: "Maximum tokens",
    price: 799,
    highlight: false,
  },
];

const Plans = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(null);

  const handlePurchase = async (planId) => {
    setLoading(planId);
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) {
      errorToast("Invalid plan");
      setLoading(null);
      return;
    }
    // All plans are now paid
    const loaded = await loadRazorpayScript();
    if (!loaded || typeof window.Razorpay === "undefined") {
      errorToast("Razorpay is not defined. Please check your internet connection and try again.");
      setLoading(null);
      return;
    }
    try {
      const order = await createRazorpayOrder(planId);
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "CreatorConnect",
        description: `${plan.name} Plan Purchase`,
        order_id: order.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId,
            });
            dispatch(setUser(verifyRes));
            successToast(`+${plan.tokens} tokens added!`);
          } catch (err) {
            errorToast(err.response?.data?.message || "Payment verification failed");
          } finally {
            setLoading(null);
          }
        },
        prefill: {
          email: user?.email,
        },
        theme: { color: "#06b6d4" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      errorToast(err.response?.data?.message || "Failed to initiate payment");
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Plans</h1>
          <p className="text-slate-400 mt-1">Get more tokens to use across CreatorConnect.</p>
        </div>
        {user && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <span className="text-slate-400 text-sm">Your balance</span>
            <span className="font-bold text-cyan-400">{user.tokens ?? 0} tokens</span>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`glass-card rounded-2xl p-6 border transition-all duration-300 ${
              plan.highlight
                ? "border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                : "border-slate-700/50 hover:border-slate-600/50"
            }`}
          >
            {plan.highlight && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 mb-4">
                Popular
              </span>
            )}
            <h3 className="text-xl font-bold text-slate-100">{plan.name}</h3>
            <p className="text-slate-400 text-sm mt-1">{plan.description}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-cyan-400">+{plan.tokens}</span>
              <span className="text-slate-400">tokens</span>
            </div>
            <p className="text-slate-500 text-sm mt-1">₹{plan.price}</p>
            <button
              onClick={() => handlePurchase(plan.id)}
              disabled={loading !== null}
              className="w-full mt-6 py-3 rounded-xl font-medium bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 transition-all duration-300"
            >
              {loading === plan.id ? "Processing..." : "Get tokens"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;
