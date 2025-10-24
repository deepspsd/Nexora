"""
Subscription Management System
==============================

Manages user subscriptions, credits, and tier-based features.

Author: NEXORA Team
Version: 1.0.0
"""

import os
import logging
from typing import Dict, Any, Optional
from enum import Enum
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class SubscriptionTier(Enum):
    """Subscription tiers"""
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class SubscriptionStatus(Enum):
    """Subscription status"""
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    TRIAL = "trial"


# Tier configurations
TIER_CONFIG = {
    SubscriptionTier.FREE: {
        "name": "Free",
        "price": 0,
        "currency": "INR",
        "credits_per_month": 20,
        "features": [
            "Basic MVP generation",
            "Idea validation",
            "Market research (limited)",
            "Community support"
        ],
        "limits": {
            "mvp_generations": 5,
            "idea_validations": 10,
            "market_research": 5,
            "max_file_size_mb": 5
        }
    },
    SubscriptionTier.STARTER: {
        "name": "Starter",
        "price": 29,
        "currency": "INR",
        "credits_per_month": 100,
        "features": [
            "Everything in Free",
            "Advanced MVP generation",
            "Full market research",
            "Business planning",
            "Pitch deck generation",
            "Email support"
        ],
        "limits": {
            "mvp_generations": 25,
            "idea_validations": 50,
            "market_research": 25,
            "max_file_size_mb": 20
        }
    },
    SubscriptionTier.PRO: {
        "name": "Pro",
        "price": 78,
        "currency": "INR",
        "credits_per_month": 500,
        "features": [
            "Everything in Starter",
            "Unlimited MVP generations",
            "Priority AI processing",
            "Team collaboration",
            "Custom branding",
            "Priority support"
        ],
        "limits": {
            "mvp_generations": -1,  # Unlimited
            "idea_validations": -1,
            "market_research": -1,
            "max_file_size_mb": 100
        }
    },
    SubscriptionTier.ENTERPRISE: {
        "name": "Enterprise",
        "price": 199,
        "currency": "INR",
        "credits_per_month": 2000,
        "features": [
            "Everything in Pro",
            "Dedicated AI resources",
            "Custom AI models",
            "White-label solution",
            "API access",
            "Dedicated support",
            "SLA guarantee"
        ],
        "limits": {
            "mvp_generations": -1,
            "idea_validations": -1,
            "market_research": -1,
            "max_file_size_mb": 500
        }
    }
}


# Credit costs for different operations
CREDIT_COSTS = {
    "mvp_generation": 5,
    "mvp_edit": 2,
    "idea_validation": 3,
    "market_research": 4,
    "business_plan": 4,
    "pitch_deck": 5,
    "chat_message": 1
}


class SubscriptionManager:
    """Manages subscription operations"""
    
    def __init__(self, db):
        """Initialize subscription manager"""
        self.db = db
    
    def get_tier_config(self, tier: SubscriptionTier) -> Dict[str, Any]:
        """Get configuration for a subscription tier"""
        return TIER_CONFIG.get(tier, TIER_CONFIG[SubscriptionTier.FREE])
    
    def get_all_tiers(self) -> Dict[str, Dict[str, Any]]:
        """Get all subscription tiers"""
        return {tier.value: config for tier, config in TIER_CONFIG.items()}
    
    def check_feature_access(
        self,
        user_id: str,
        feature: str,
        count: int = 1
    ) -> tuple[bool, Optional[str]]:
        """
        Check if user has access to a feature
        
        Args:
            user_id: User ID
            feature: Feature name
            count: Number of times feature will be used
            
        Returns:
            Tuple of (has_access, error_message)
        """
        try:
            user = self.db.get_user_by_id(user_id)
            if not user:
                return False, "User not found"
            
            tier = SubscriptionTier(user.get('subscription_tier', 'free'))
            config = self.get_tier_config(tier)
            
            # Check feature limit
            limit_key = f"{feature}s"  # e.g., mvp_generations
            if limit_key in config['limits']:
                limit = config['limits'][limit_key]
                if limit == -1:  # Unlimited
                    return True, None
                
                # Check current usage (would need to track this in DB)
                # For now, just check if they have credits
                pass
            
            # Check credits
            credits_needed = CREDIT_COSTS.get(feature, 1) * count
            if user.get('credits', 0) < credits_needed:
                return False, f"Insufficient credits. Need {credits_needed}, have {user.get('credits', 0)}"
            
            return True, None
        
        except Exception as e:
            logger.error(f"Error checking feature access: {str(e)}")
            return False, "Error checking access"
    
    def deduct_credits(
        self,
        user_id: str,
        operation: str,
        count: int = 1
    ) -> tuple[bool, int]:
        """
        Deduct credits for an operation
        
        Args:
            user_id: User ID
            operation: Operation name
            count: Number of operations
            
        Returns:
            Tuple of (success, remaining_credits)
        """
        try:
            cost = CREDIT_COSTS.get(operation, 1) * count
            
            user = self.db.get_user_by_id(user_id)
            if not user:
                return False, 0
            
            current_credits = user.get('credits', 0)
            if current_credits < cost:
                return False, current_credits
            
            new_credits = current_credits - cost
            self.db.update_user_credits(user_id, new_credits)
            
            logger.info(f"Deducted {cost} credits from user {user_id} for {operation}")
            return True, new_credits
        
        except Exception as e:
            logger.error(f"Error deducting credits: {str(e)}")
            return False, 0
    
    def add_credits(self, user_id: str, amount: int, reason: str = "purchase") -> bool:
        """
        Add credits to user account
        
        Args:
            user_id: User ID
            amount: Credits to add
            reason: Reason for adding credits
            
        Returns:
            bool: Success status
        """
        try:
            user = self.db.get_user_by_id(user_id)
            if not user:
                return False
            
            current_credits = user.get('credits', 0)
            new_credits = current_credits + amount
            
            self.db.update_user_credits(user_id, new_credits)
            logger.info(f"Added {amount} credits to user {user_id} - {reason}")
            
            return True
        
        except Exception as e:
            logger.error(f"Error adding credits: {str(e)}")
            return False
    
    def upgrade_subscription(
        self,
        user_id: str,
        new_tier: SubscriptionTier,
        payment_id: Optional[str] = None
    ) -> bool:
        """
        Upgrade user subscription
        
        Args:
            user_id: User ID
            new_tier: New subscription tier
            payment_id: Payment transaction ID
            
        Returns:
            bool: Success status
        """
        try:
            # Update subscription in database
            query = """
                UPDATE users 
                SET subscription_tier = %s, updated_at = NOW()
                WHERE id = %s
            """
            self.db.execute_query(query, (new_tier.value, user_id))
            
            # Add monthly credits
            config = self.get_tier_config(new_tier)
            self.add_credits(user_id, config['credits_per_month'], f"subscription_{new_tier.value}")
            
            # Record subscription in subscriptions table
            subscription_query = """
                INSERT INTO subscriptions 
                (id, user_id, tier, status, start_date, end_date, payment_id)
                VALUES (%s, %s, %s, %s, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), %s)
            """
            import uuid
            subscription_id = str(uuid.uuid4())
            self.db.execute_query(
                subscription_query,
                (subscription_id, user_id, new_tier.value, SubscriptionStatus.ACTIVE.value, payment_id)
            )
            
            logger.info(f"Upgraded user {user_id} to {new_tier.value}")
            return True
        
        except Exception as e:
            logger.error(f"Error upgrading subscription: {str(e)}")
            return False
    
    def cancel_subscription(self, user_id: str) -> bool:
        """
        Cancel user subscription (downgrade to free at end of period)
        
        Args:
            user_id: User ID
            
        Returns:
            bool: Success status
        """
        try:
            query = """
                UPDATE subscriptions 
                SET status = %s, updated_at = NOW()
                WHERE user_id = %s AND status = %s
            """
            self.db.execute_query(
                query,
                (SubscriptionStatus.CANCELLED.value, user_id, SubscriptionStatus.ACTIVE.value)
            )
            
            logger.info(f"Cancelled subscription for user {user_id}")
            return True
        
        except Exception as e:
            logger.error(f"Error cancelling subscription: {str(e)}")
            return False
    
    def get_user_subscription(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user's current subscription details
        
        Args:
            user_id: User ID
            
        Returns:
            Dict with subscription details or None
        """
        try:
            user = self.db.get_user_by_id(user_id)
            if not user:
                return None
            
            tier = SubscriptionTier(user.get('subscription_tier', 'free'))
            config = self.get_tier_config(tier)
            
            # Get active subscription record
            query = """
                SELECT * FROM subscriptions 
                WHERE user_id = %s AND status = %s
                ORDER BY created_at DESC LIMIT 1
            """
            subscription = self.db.execute_query(
                query,
                (user_id, SubscriptionStatus.ACTIVE.value),
                fetch_one=True
            )
            
            return {
                "tier": tier.value,
                "tier_name": config['name'],
                "price": config['price'],
                "credits": user.get('credits', 0),
                "credits_per_month": config['credits_per_month'],
                "features": config['features'],
                "limits": config['limits'],
                "status": subscription.get('status') if subscription else 'free',
                "start_date": subscription.get('start_date') if subscription else None,
                "end_date": subscription.get('end_date') if subscription else None
            }
        
        except Exception as e:
            logger.error(f"Error getting user subscription: {str(e)}")
            return None
    
    def check_and_renew_subscriptions(self):
        """
        Check for expired subscriptions and renew/downgrade as needed
        This should be run as a cron job
        """
        try:
            query = """
                SELECT user_id, tier FROM subscriptions 
                WHERE status = %s AND end_date < NOW()
            """
            expired = self.db.execute_query(
                query,
                (SubscriptionStatus.ACTIVE.value,),
                fetch_all=True
            )
            
            for sub in expired:
                user_id = sub['user_id']
                # Check if auto-renewal is enabled (would need to track this)
                # For now, downgrade to free
                self.db.execute_query(
                    "UPDATE users SET subscription_tier = %s WHERE id = %s",
                    (SubscriptionTier.FREE.value, user_id)
                )
                
                self.db.execute_query(
                    "UPDATE subscriptions SET status = %s WHERE user_id = %s AND status = %s",
                    (SubscriptionStatus.EXPIRED.value, user_id, SubscriptionStatus.ACTIVE.value)
                )
                
                logger.info(f"Downgraded user {user_id} to free tier (subscription expired)")
        
        except Exception as e:
            logger.error(f"Error checking subscriptions: {str(e)}")


def get_credit_cost(operation: str) -> int:
    """Get credit cost for an operation"""
    return CREDIT_COSTS.get(operation, 1)
