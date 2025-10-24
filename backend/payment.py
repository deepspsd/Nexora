"""
Payment Provider Integration
============================

Free-tier payment integration supporting:
- Razorpay (India - Free tier)
- Stripe (Test mode - Free)

Author: NEXORA Team
Version: 1.0.0
"""

import os
import logging
from typing import Dict, Any, Optional
from enum import Enum
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class PaymentProvider(Enum):
    """Supported payment providers"""
    RAZORPAY = "razorpay"
    STRIPE = "stripe"


class PaymentStatus(Enum):
    """Payment status"""
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"


class PaymentManager:
    """Manages payment operations across providers"""
    
    def __init__(self):
        """Initialize payment manager"""
        # Razorpay configuration
        self.razorpay_key_id = os.getenv("RAZORPAY_KEY_ID")
        self.razorpay_key_secret = os.getenv("RAZORPAY_KEY_SECRET")
        
        # Stripe configuration
        self.stripe_publishable_key = os.getenv("STRIPE_PUBLISHABLE_KEY")
        self.stripe_secret_key = os.getenv("STRIPE_SECRET_KEY")
        self.stripe_webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        
        # Check available providers
        self.available_providers = []
        if self.razorpay_key_id and self.razorpay_key_secret:
            self.available_providers.append(PaymentProvider.RAZORPAY)
            logger.info("Razorpay payment provider available")
        
        if self.stripe_secret_key:
            self.available_providers.append(PaymentProvider.STRIPE)
            logger.info("Stripe payment provider available")
        
        if not self.available_providers:
            logger.warning("No payment providers configured")
    
    def create_order(
        self,
        amount: float,
        currency: str = "INR",
        provider: Optional[PaymentProvider] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create a payment order
        
        Args:
            amount: Amount in currency units
            currency: Currency code (INR, USD, etc.)
            provider: Preferred payment provider
            metadata: Additional metadata
            
        Returns:
            Dict with order details
        """
        # Auto-select provider if not specified
        if not provider:
            if currency == "INR" and PaymentProvider.RAZORPAY in self.available_providers:
                provider = PaymentProvider.RAZORPAY
            elif PaymentProvider.STRIPE in self.available_providers:
                provider = PaymentProvider.STRIPE
            elif self.available_providers:
                provider = self.available_providers[0]
            else:
                raise ValueError("No payment provider available")
        
        if provider == PaymentProvider.RAZORPAY:
            return self._create_razorpay_order(amount, currency, metadata)
        elif provider == PaymentProvider.STRIPE:
            return self._create_stripe_payment_intent(amount, currency, metadata)
        else:
            raise ValueError(f"Unsupported provider: {provider}")
    
    def _create_razorpay_order(
        self,
        amount: float,
        currency: str,
        metadata: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Create Razorpay order"""
        try:
            import razorpay
            
            client = razorpay.Client(auth=(self.razorpay_key_id, self.razorpay_key_secret))
            
            # Amount in paise (smallest currency unit)
            amount_paise = int(amount * 100)
            
            order_data = {
                "amount": amount_paise,
                "currency": currency,
                "notes": metadata or {}
            }
            
            order = client.order.create(data=order_data)
            
            return {
                "provider": "razorpay",
                "order_id": order["id"],
                "amount": amount,
                "currency": currency,
                "status": "created",
                "key_id": self.razorpay_key_id
            }
        
        except ImportError:
            logger.error("Razorpay library not installed. Install: pip install razorpay")
            raise ValueError("Razorpay not available")
        except Exception as e:
            logger.error(f"Error creating Razorpay order: {str(e)}")
            raise
    
    def _create_stripe_payment_intent(
        self,
        amount: float,
        currency: str,
        metadata: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Create Stripe payment intent"""
        try:
            import stripe
            
            stripe.api_key = self.stripe_secret_key
            
            # Amount in cents (smallest currency unit)
            amount_cents = int(amount * 100)
            
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency=currency.lower(),
                metadata=metadata or {},
                automatic_payment_methods={"enabled": True}
            )
            
            return {
                "provider": "stripe",
                "payment_intent_id": intent.id,
                "client_secret": intent.client_secret,
                "amount": amount,
                "currency": currency,
                "status": intent.status,
                "publishable_key": self.stripe_publishable_key
            }
        
        except ImportError:
            logger.error("Stripe library not installed. Install: pip install stripe")
            raise ValueError("Stripe not available")
        except Exception as e:
            logger.error(f"Error creating Stripe payment intent: {str(e)}")
            raise
    
    def verify_payment(
        self,
        provider: PaymentProvider,
        payment_id: str,
        order_id: Optional[str] = None,
        signature: Optional[str] = None
    ) -> bool:
        """
        Verify payment completion
        
        Args:
            provider: Payment provider
            payment_id: Payment ID
            order_id: Order ID (for Razorpay)
            signature: Payment signature (for Razorpay)
            
        Returns:
            bool: True if payment is verified
        """
        if provider == PaymentProvider.RAZORPAY:
            return self._verify_razorpay_payment(payment_id, order_id, signature)
        elif provider == PaymentProvider.STRIPE:
            return self._verify_stripe_payment(payment_id)
        else:
            return False
    
    def _verify_razorpay_payment(
        self,
        payment_id: str,
        order_id: str,
        signature: str
    ) -> bool:
        """Verify Razorpay payment signature"""
        try:
            import razorpay
            
            client = razorpay.Client(auth=(self.razorpay_key_id, self.razorpay_key_secret))
            
            params_dict = {
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature
            }
            
            client.utility.verify_payment_signature(params_dict)
            return True
        
        except Exception as e:
            logger.error(f"Razorpay payment verification failed: {str(e)}")
            return False
    
    def _verify_stripe_payment(self, payment_intent_id: str) -> bool:
        """Verify Stripe payment"""
        try:
            import stripe
            
            stripe.api_key = self.stripe_secret_key
            
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return intent.status == "succeeded"
        
        except Exception as e:
            logger.error(f"Stripe payment verification failed: {str(e)}")
            return False
    
    def handle_webhook(
        self,
        provider: PaymentProvider,
        payload: bytes,
        signature: str
    ) -> Optional[Dict[str, Any]]:
        """
        Handle payment webhook
        
        Args:
            provider: Payment provider
            payload: Webhook payload
            signature: Webhook signature
            
        Returns:
            Dict with event data or None if invalid
        """
        if provider == PaymentProvider.RAZORPAY:
            return self._handle_razorpay_webhook(payload, signature)
        elif provider == PaymentProvider.STRIPE:
            return self._handle_stripe_webhook(payload, signature)
        return None
    
    def _handle_razorpay_webhook(self, payload: bytes, signature: str) -> Optional[Dict[str, Any]]:
        """Handle Razorpay webhook"""
        try:
            import razorpay
            
            client = razorpay.Client(auth=(self.razorpay_key_id, self.razorpay_key_secret))
            
            # Verify webhook signature
            client.utility.verify_webhook_signature(payload.decode(), signature, self.razorpay_key_secret)
            
            import json
            event = json.loads(payload)
            
            return {
                "event": event.get("event"),
                "payment_id": event.get("payload", {}).get("payment", {}).get("entity", {}).get("id"),
                "order_id": event.get("payload", {}).get("payment", {}).get("entity", {}).get("order_id"),
                "amount": event.get("payload", {}).get("payment", {}).get("entity", {}).get("amount", 0) / 100,
                "status": event.get("payload", {}).get("payment", {}).get("entity", {}).get("status")
            }
        
        except Exception as e:
            logger.error(f"Razorpay webhook handling failed: {str(e)}")
            return None
    
    def _handle_stripe_webhook(self, payload: bytes, signature: str) -> Optional[Dict[str, Any]]:
        """Handle Stripe webhook"""
        try:
            import stripe
            
            stripe.api_key = self.stripe_secret_key
            
            event = stripe.Webhook.construct_event(
                payload, signature, self.stripe_webhook_secret
            )
            
            if event.type == "payment_intent.succeeded":
                payment_intent = event.data.object
                return {
                    "event": "payment.success",
                    "payment_intent_id": payment_intent.id,
                    "amount": payment_intent.amount / 100,
                    "currency": payment_intent.currency,
                    "status": "success"
                }
            
            return {"event": event.type}
        
        except Exception as e:
            logger.error(f"Stripe webhook handling failed: {str(e)}")
            return None
    
    def get_available_providers(self) -> list:
        """Get list of available payment providers"""
        return [p.value for p in self.available_providers]


# Global payment manager instance
payment_manager = PaymentManager()
