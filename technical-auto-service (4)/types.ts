
export enum RepairStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface ServiceProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: 'Maintenance' | 'Repair' | 'Cleaning';
  icon: string;
}

export interface RepairRequest {
  id: string;
  customerName: string;
  phoneNumber: string;
  carBrand: string;
  carModel: string;
  serviceType: 'Service' | 'Repair';
  description: string;
  status: RepairStatus;
  createdAt: string;
  estimatedCost?: number;
  aiDiagnosis?: string;
  imageUrl?: string;
  selectedProductId?: string;
}

export interface DiagnosisResult {
  possibleIssue: string;
  estimatedCostRange: string;
  urgency: 'Low' | 'Medium' | 'High';
}

export interface ShopInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  openHours: string;
}
