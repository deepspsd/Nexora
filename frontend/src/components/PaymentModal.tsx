import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Loader2 } from 'lucide-react';
import { creditPackages, redirectToCheckout } from '@/lib/payments/stripe';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentModal = ({ isOpen, onClose }: PaymentModalProps) => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (priceId: string) => {
    setIsProcessing(true);
    try {
      await redirectToCheckout(priceId);
    } catch (error: any) {
      toast.error(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Purchase Credits
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Choose a package to power your AI projects
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                disabled={isProcessing}
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Packages */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {creditPackages.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  whileHover={{ y: -4 }}
                  className={cn(
                    'relative border-2 rounded-xl p-6 cursor-pointer transition-all',
                    selectedPackage === pkg.id
                      ? 'border-orange-500 shadow-lg shadow-orange-500/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700',
                    pkg.popular && 'ring-2 ring-orange-500 ring-offset-2'
                  )}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {/* Popular Badge */}
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Package Name */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {pkg.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${pkg.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">USD</span>
                  </div>

                  {/* Credits */}
                  <div className="flex items-center space-x-2 mb-4">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold text-orange-500">
                      {pkg.credits + (pkg.bonus || 0)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">credits</span>
                  </div>

                  {/* Bonus */}
                  {pkg.bonus && (
                    <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                      +{pkg.bonus} Bonus Credits!
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>AI Code Generation</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>MVP Development</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Business Planning</span>
                    </li>
                    <li className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Priority Support</span>
                    </li>
                  </ul>

                  {/* Purchase Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(pkg.priceId);
                    }}
                    disabled={isProcessing}
                    className={cn(
                      'w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2',
                      pkg.popular
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700',
                      isProcessing && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Purchase Now</span>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Payment Info */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300 text-center">
                🔒 Secure payment powered by Stripe. Your payment information is encrypted and secure.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;
