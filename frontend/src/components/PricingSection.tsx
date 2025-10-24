import React, { useState, useEffect } from "react";
import { Check, X, Star, Zap, Crown, Rocket, ArrowRight, Shield, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  period: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  popular?: boolean;
  enterprise?: boolean;
  features: string[];
  limitations: string[];
  stripePriceId: string;
  credits: number;
}

const PricingSection = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage (stored as separate items)
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userCredits = localStorage.getItem('userCredits');
    const userSubscription = localStorage.getItem('userSubscription');
    
    if (userId && userEmail) {
      setUser({
        id: userId,
        name: userName || '',
        email: userEmail,
        credits: parseInt(userCredits || '0'),
        subscription_tier: userSubscription || 'free'
      });
    }
  }, []);

  const plans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Starter',
      description: 'Perfect for testing ideas and small projects',
      price: 0,
      period: 'forever',
      icon: Rocket,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      credits: 5,
      stripePriceId: '',
      features: [
        '1 complete startup generation per month',
        'Basic market research',
        'Simple MVP templates',
        'Standard business plan',
        'Community support',
        'Basic export options'
      ],
      limitations: [
        'Limited customization',
        'Watermarked outputs',
        'No priority support'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      description: 'For serious entrepreneurs building multiple projects',
      price: billingPeriod === 'monthly' ? 78 : 65,
      originalPrice: billingPeriod === 'monthly' ? 99 : 79,
      period: billingPeriod === 'monthly' ? '/month' : '/month (billed yearly)',
      icon: Zap,
      color: 'text-pulse-600',
      bgColor: 'bg-pulse-50',
      borderColor: 'border-pulse-200',
      popular: true,
      credits: 50,
      stripePriceId: billingPeriod === 'monthly' ? 'price_pro_monthly' : 'price_pro_yearly',
      features: [
        'Unlimited startup generations',
        'Advanced market research with 50+ data sources',
        'Custom MVP development',
        'Professional pitch decks',
        'Team collaboration (up to 5 members)',
        'Priority email support',
        'Advanced export formats (PDF, DOCX, PPT)',
        'Custom branding',
        'API access',
        'Analytics dashboard'
      ],
      limitations: []
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For teams and organizations scaling fast',
      price: billingPeriod === 'monthly' ? 199 : 165,
      period: billingPeriod === 'monthly' ? '/month' : '/month (billed yearly)',
      icon: Crown,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      enterprise: true,
      credits: -1, // Unlimited
      stripePriceId: billingPeriod === 'monthly' ? 'price_enterprise_monthly' : 'price_enterprise_yearly',
      features: [
        'Everything in Professional',
        'Unlimited team members',
        'White-label solutions',
        'Custom AI model training',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom integrations',
        'Advanced security & compliance',
        'On-premise deployment option',
        'Custom contract terms'
      ],
      limitations: []
    }
  ];

  const handleSubscribe = async (plan: PricingPlan) => {
    if (plan.id === 'free') {
      // Handle free plan signup
      navigate('/register');
      return;
    }

    if (plan.enterprise) {
      // Handle enterprise contact
      navigate('/contact');
      return;
    }

    // Check if user is logged in
    if (!user) {
      alert('Please login to subscribe');
      navigate('/login');
      return;
    }

    setLoading(plan.id);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to continue');
        navigate('/login');
        return;
      }

      // Calculate credits based on plan
      const creditsMap: { [key: string]: number } = {
        'pro': 500,
        'enterprise': 2000
      };
      const credits = creditsMap[plan.id] || 100;

      // Create payment order
      const orderResponse = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: plan.price,
          currency: 'INR',
          user_id: user.id,
          credits: credits
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();
      const order = orderData.order;

      // Load Razorpay
      const razorpayLoaded = await loadRazorpay();
      if (!razorpayLoaded) {
        alert('Failed to load payment gateway. Please try again.');
        return;
      }

      // Initialize Razorpay payment
      const options = {
        key: order.key_id,
        amount: order.amount * 100, // Convert to paise
        currency: order.currency,
        name: 'NEXORA',
        description: `${plan.name} Subscription`,
        order_id: order.order_id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch(`${API_BASE_URL}/api/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                provider: 'razorpay',
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature,
                user_id: user.id,
                credits: credits
              }),
            });

            if (verifyResponse.ok) {
              // Upgrade subscription
              const upgradeResponse = await fetch(`${API_BASE_URL}/api/subscription/upgrade`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  user_id: user.id,
                  tier: plan.id,
                  payment_id: response.razorpay_payment_id
                }),
              });

              if (upgradeResponse.ok) {
                alert('Payment successful! Your subscription has been upgraded.');
                navigate('/dashboard');
              } else {
                alert('Payment verified but subscription upgrade failed. Please contact support.');
              }
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function() {
            setLoading(null);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const yearlyDiscount = Math.round(((78 - 65) / 78) * 100);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-white via-gray-50 to-pulse-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-pulse-100 rounded-full opacity-30 blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>

      <div className="section-container relative z-10">
        <div className="text-center mb-12">
          <div className="pulse-chip mx-auto mb-4">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2">05</span>
            <span>Pricing Plans</span>
          </div>
          <h2 className="section-title mb-4">
            Choose Your Success Plan
          </h2>
          <p className="section-subtitle mx-auto">
            Start free, scale as you grow. All plans include our core AI agents and startup generation tools.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200">
            <div className="flex items-center">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={cn(
                  "px-6 py-2 rounded-full font-medium transition-all duration-300",
                  billingPeriod === 'monthly'
                    ? "bg-pulse-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={cn(
                  "px-6 py-2 rounded-full font-medium transition-all duration-300 relative",
                  billingPeriod === 'yearly'
                    ? "bg-pulse-500 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  -{yearlyDiscount}%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isLoading = loading === plan.id;
            
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative rounded-3xl p-8 transition-all duration-500 hover:scale-105",
                  plan.popular 
                    ? "bg-white shadow-2xl border-2 border-pulse-200 transform scale-105" 
                    : "bg-white shadow-lg border border-gray-200 hover:shadow-xl",
                  plan.enterprise && "bg-gradient-to-br from-purple-50 to-white"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-pulse-500 to-pulse-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                      <Star className="w-4 h-4 inline mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={cn("inline-flex p-3 rounded-2xl mb-4", plan.bgColor)}>
                    <Icon className={cn("w-8 h-8", plan.color)} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    {plan.originalPrice && (
                      <div className="text-gray-400 line-through text-lg mb-1">
                        ₹{plan.originalPrice}{plan.period}
                      </div>
                    )}
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">₹{plan.price}</span>
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                    </div>
                  </div>

                  {/* Credits */}
                  <div className="flex items-center justify-center mb-6">
                    <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      {plan.credits === -1 ? 'Unlimited' : plan.credits} credits/month
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="flex items-start opacity-60">
                      <X className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-500 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isLoading}
                  className={cn(
                    "w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center",
                    plan.popular
                      ? "bg-gradient-to-r from-pulse-500 to-pulse-600 text-white hover:shadow-xl hover:scale-105"
                      : plan.enterprise
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-xl hover:scale-105"
                      : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {plan.id === 'free' ? 'Get Started Free' : 
                       plan.enterprise ? 'Contact Sales' : 'Start Free Trial'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>

                {/* Trial Info */}
                {plan.id !== 'free' && !plan.enterprise && (
                  <p className="text-center text-xs text-gray-500 mt-3">
                    14-day free trial • No credit card required
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Toggle */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="text-pulse-600 hover:text-pulse-700 font-medium"
          >
            {showComparison ? 'Hide' : 'Show'} detailed comparison
          </button>
        </div>

        {/* Detailed Comparison Table */}
        {showComparison && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-6 font-semibold text-gray-900">Features</th>
                    <th className="text-center p-6 font-semibold text-gray-900">Starter</th>
                    <th className="text-center p-6 font-semibold text-pulse-600 bg-pulse-50">Professional</th>
                    <th className="text-center p-6 font-semibold text-purple-600">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { feature: 'Startup Generations', starter: '1/month', pro: 'Unlimited', enterprise: 'Unlimited' },
                    { feature: 'Market Research Sources', starter: '5', pro: '50+', enterprise: 'Custom' },
                    { feature: 'Team Members', starter: '1', pro: '5', enterprise: 'Unlimited' },
                    { feature: 'Custom Branding', starter: false, pro: true, enterprise: true },
                    { feature: 'API Access', starter: false, pro: true, enterprise: true },
                    { feature: 'Priority Support', starter: false, pro: true, enterprise: true },
                    { feature: 'Phone Support', starter: false, pro: false, enterprise: true },
                    { feature: 'Custom Integrations', starter: false, pro: false, enterprise: true },
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-6 font-medium text-gray-900">{row.feature}</td>
                      <td className="p-6 text-center">
                        {typeof row.starter === 'boolean' ? (
                          row.starter ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="text-gray-600">{row.starter}</span>
                        )}
                      </td>
                      <td className="p-6 text-center bg-pulse-50/50">
                        {typeof row.pro === 'boolean' ? (
                          row.pro ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="text-pulse-600 font-medium">{row.pro}</span>
                        )}
                      </td>
                      <td className="p-6 text-center">
                        {typeof row.enterprise === 'boolean' ? (
                          row.enterprise ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="text-purple-600 font-medium">{row.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">30-Day Money Back</h3>
            <p className="text-gray-600 text-sm">Not satisfied? Get a full refund, no questions asked.</p>
          </div>
          
          <div className="text-center">
            <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Cancel Anytime</h3>
            <p className="text-gray-600 text-sm">No long-term contracts. Cancel your subscription anytime.</p>
          </div>
          
          <div className="text-center">
            <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
            <p className="text-gray-600 text-sm">Our team is here to help you succeed every step of the way.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
