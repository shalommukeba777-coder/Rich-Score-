import React, { useState } from 'react';
import { PRICING_PLANS } from '../data/mockData';
import { PricingPlan } from '../types/seo';
import { X, Check, CreditCard, ShieldCheck, Sparkles, Lock } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId?: string;
  onUpgradePlan: (planId: string) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentPlanId = 'starter',
  onUpgradePlan,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(
    PRICING_PLANS.find((p) => p.id === 'growth') || PRICING_PLANS[1]
  );
  const [annualBilling, setAnnualBilling] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Card Form State
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState('Alex Mercer');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setCheckoutSuccess(true);
      onUpgradePlan(selectedPlan.id);
      setTimeout(() => {
        setCheckoutSuccess(false);
        setIsCheckingOut(false);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-sky-700 font-bold font-mono">
                RichScore Plans
              </span>
              <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-bold">
                Transparent Pricing
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">
              Automate SEO &amp; Rich Schema for Your AI Websites
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {!isCheckingOut ? (
            <>
              {/* Annual Switch */}
              <div className="flex items-center justify-center gap-3 text-xs">
                <span className={!annualBilling ? 'text-slate-900 font-bold' : 'text-slate-500'}>
                  Monthly Billing
                </span>
                <button
                  type="button"
                  onClick={() => setAnnualBilling(!annualBilling)}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    annualBilling ? 'bg-sky-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 rounded-full bg-white shadow-xs transition-transform mt-1 ml-1 ${
                      annualBilling ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={annualBilling ? 'text-slate-900 font-bold' : 'text-slate-500'}>
                  Annual (2 Months Free)
                </span>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {PRICING_PLANS.map((plan) => {
                  const price = annualBilling ? Math.round(plan.price * 0.8) : plan.price;
                  const isCurrent = plan.id === currentPlanId;

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-3xl p-6 flex flex-col justify-between transition-all border ${
                        plan.recommended
                          ? 'bg-gradient-to-br from-white via-sky-50/50 to-blue-50/40 border-sky-300 ring-2 ring-sky-500/20 shadow-md'
                          : 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                          {plan.recommended && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-600 text-white">
                              Recommended
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 min-h-[36px]">
                          {plan.description}
                        </p>

                        <div className="pt-2 border-t border-slate-100">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-slate-900 font-mono tabular-nums">
                              ${price}
                            </span>
                            <span className="text-xs text-slate-500">/ month</span>
                          </div>
                          {annualBilling && (
                            <span className="text-[11px] text-emerald-600 font-bold">
                              Billed annually (${price * 12}/yr)
                            </span>
                          )}
                        </div>

                        <ul className="space-y-2 pt-2 text-xs text-slate-700">
                          {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-6">
                        <button
                          onClick={() => {
                            setSelectedPlan(plan);
                            setIsCheckingOut(true);
                          }}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
                            plan.recommended
                              ? 'bg-sky-600 hover:bg-sky-500 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          {isCurrent ? 'Current Active Plan' : `Upgrade to ${plan.name}`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="max-w-md mx-auto p-6 rounded-3xl bg-white border border-slate-200 space-y-5 text-xs shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold">Selected Tier:</span>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedPlan.name} Plan (${annualBilling ? Math.round(selectedPlan.price * 0.8) : selectedPlan.price}/mo)
                  </h3>
                </div>
                <button
                  onClick={() => setIsCheckingOut(false)}
                  className="text-sky-600 hover:underline cursor-pointer text-xs font-bold"
                >
                  Change Plan
                </button>
              </div>

              {checkoutSuccess ? (
                <div className="p-6 text-center space-y-2 text-emerald-700">
                  <ShieldCheck className="w-10 h-10 mx-auto text-emerald-600" />
                  <h4 className="text-base font-bold text-slate-900">Payment Successful!</h4>
                  <p className="text-xs text-slate-600">
                    Your {selectedPlan.name} plan is now activated. Auto-apply and AI features are unlocked.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePay} className="space-y-4">
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      Cardholder Full Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                      className="w-full bg-[#fdfdfd] text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                        className="w-full bg-[#fdfdfd] text-slate-900 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 font-mono shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        required
                        placeholder="MM/YY"
                        className="w-full bg-[#fdfdfd] text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 font-mono shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-semibold block mb-1">CVC</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        required
                        placeholder="CVC"
                        className="w-full bg-[#fdfdfd] text-slate-900 border border-slate-200 rounded-xl px-3 py-2.5 font-mono shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-[11px] pt-1">
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>256-Bit Encrypted Card Payment • Cancel Anytime</span>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs mt-2"
                  >
                    <span>
                      {processing
                        ? 'Authorizing Card...'
                        : `Pay $${annualBilling ? Math.round(selectedPlan.price * 0.8) : selectedPlan.price} & Activate`}
                    </span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
