export type ActiveView = 'dashboard' | 'recharge' | 'tracking' | 'support' | 'profile' | 'login';

export interface Channel {
  id: string;
  name: string;
  category: 'Sports' | 'Entertainment' | 'Movies' | 'Kids' | 'News' | 'Infotainment' | 'Regional';
  price: number;
}

export interface ServiceRequest {
  id: string;
  type: string;
  address: string;
  technician: string;
  status: 'In Progress' | 'Standby' | 'Completed' | 'Pending' | 'Approved' | 'Declined';
  phone?: string;
  customerName?: string;
  customerId?: string;
  cost?: number;
  createdAt?: string;
  appointmentSlot?: string;
}

export interface InventoryStat {
  name: string;
  count: number;
  trend: string;
  lowStock: boolean;
  price?: number;
}

export interface UserSession {
  isLoggedIn: boolean;
  role: 'customer' | 'admin' | null;
  name: string;
  identifier: string;
  photoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
  planName?: string;
  smartCardNumber?: string;
  activeStatus?: 'Active' | 'Suspended' | 'In Grace Period';
  emailDeliveryStatus?: 'Delivered' | 'Failed' | 'Pending';
  emailDeliveryError?: string;
}

export interface BillingClearance {
  customerId: string;
  customerName: string;
  outstandingBalance: number;
  installFee: number;
  equipmentFee: number;
  packRental: number;
  status: 'Pending' | 'Cleared' | 'Pending Verification' | string;
  utrNumber?: string;
}
