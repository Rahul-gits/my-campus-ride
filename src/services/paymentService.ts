export interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'upi' | 'netbanking';
  name: string;
  last4?: string;
  expiry?: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'ride' | 'pass' | 'refund' | 'topup';
  description: string;
  paymentMethod: string;
  timestamp: Date;
  reference?: string;
  metadata?: Record<string, any>;
}

export interface RidePass {
  id: string;
  name: string;
  type: 'single' | 'daily' | 'weekly' | 'monthly' | 'semester';
  price: number;
  rides: number;
  validity: number; // in days
  description: string;
  features: string[];
  isPopular?: boolean;
  discount?: number;
}

export interface Wallet {
  balance: number;
  currency: string;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  paymentMethod: string;
  metadata?: Record<string, any>;
}

class PaymentService {
  private baseUrl = '/api/payments';

  // Wallet operations
  async getWallet(): Promise<Wallet> {
    const response = await fetch(`${this.baseUrl}/wallet`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch wallet');
    }
    
    return response.json();
  }

  async addToWallet(amount: number, paymentMethod: string): Promise<Transaction> {
    const response = await fetch(`${this.baseUrl}/wallet/topup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ amount, paymentMethod }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add to wallet');
    }
    
    return response.json();
  }

  // Payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await fetch(`${this.baseUrl}/methods`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment methods');
    }
    
    return response.json();
  }

  async addPaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    const response = await fetch(`${this.baseUrl}/methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(method),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add payment method');
    }
    
    return response.json();
  }

  async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const response = await fetch(`${this.baseUrl}/methods/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update payment method');
    }
    
    return response.json();
  }

  async deletePaymentMethod(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/methods/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete payment method');
    }
  }

  // Transactions
  async getTransactions(limit = 20, offset = 0): Promise<Transaction[]> {
    const response = await fetch(`${this.baseUrl}/transactions?limit=${limit}&offset=${offset}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    
    return response.json();
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await fetch(`${this.baseUrl}/transactions/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch transaction');
    }
    
    return response.json();
  }

  // Ride passes
  async getRidePasses(): Promise<RidePass[]> {
    const response = await fetch(`${this.baseUrl}/passes`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch ride passes');
    }
    
    return response.json();
  }

  async purchasePass(passId: string, paymentMethod: string): Promise<Transaction> {
    const response = await fetch(`${this.baseUrl}/passes/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ passId, paymentMethod }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to purchase pass');
    }
    
    return response.json();
  }

  // Payment processing
  async processPayment(request: PaymentRequest): Promise<Transaction> {
    const response = await fetch(`${this.baseUrl}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('Failed to process payment');
    }
    
    return response.json();
  }

  async refundTransaction(transactionId: string, reason: string): Promise<Transaction> {
    const response = await fetch(`${this.baseUrl}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ transactionId, reason }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to process refund');
    }
    
    return response.json();
  }

  // Utility functions
  formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  calculateDiscount(originalPrice: number, discountPercentage: number): number {
    return originalPrice * (discountPercentage / 100);
  }

  getPaymentMethodIcon(type: string): string {
    switch (type) {
      case 'card': return '💳';
      case 'wallet': return '💰';
      case 'upi': return '📱';
      case 'netbanking': return '🏦';
      default: return '💳';
    }
  }

  getTransactionStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'refunded': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
