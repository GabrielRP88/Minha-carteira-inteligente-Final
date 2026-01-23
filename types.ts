
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  CREDIT_CARD = 'CREDIT_CARD'
}

export enum PeriodType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export type AutoBackupFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

export interface AutoBackupConfig {
  enabled: boolean;
  frequency: AutoBackupFrequency;
  customDays?: number;
  lastBackup?: number;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  agency: string;
  color: string;
  initialBalance: number;
  isDefault?: boolean;
}

export interface CreditCard {
  id: string;
  name: string;
  brand: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
  bankAccountId?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: string;
  isInstallment: boolean;
  totalInstallments?: number;
  currentInstallment?: number;
  isPaid: boolean;
  parentId?: string;
  addedBy?: string;
  cardId?: string;
  bankAccountId?: string;
  billAttachment?: string;
  billFileName?: string;
  receiptAttachment?: string;
  receiptFileName?: string;
  barcode?: string;
}

export interface Reminder {
  id: string;
  text: string;
  time: string;
  date: string; 
  completed: boolean;
  notified?: boolean;
  transactionId?: string;
  receiptAttachment?: string;
  receiptFileName?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  picture?: string;
  avatar?: string;
  avatarConfig?: any;
  address?: string;
  isLocal: boolean;
  attachmentRetentionMonths?: number;
  language?: 'pt' | 'en' | 'es';
  notificationSound?: 'cash_register' | 'beep' | 'digital' | 'chime' | 'coins' | 'success' | 'drum' | 'bubble' | 'glass' | 'silver' | 'laser' | 'retro' | 'harp' | 'guitar' | 'whistle' | 'crystal';
  notificationsEnabled?: boolean;
  autoBackupConfig?: AutoBackupConfig;
}

export interface DashboardWidget {
  id: string;
  type: 'BALANCE' | 'INSIGHTS' | 'ACCOUNTS' | 'CARDS' | 'CALC' | 'NOTES' | 'CALENDAR_PREVIEW';
  visible: boolean;
  order: number;
  w: 1 | 2; 
  h: number; 
  bgColor?: string;
}

export interface HeaderConfig {
  logoScale: number; 
  nameScale: number; 
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  nickname?: string;
  role: 'ADMIN' | 'MEMBER';
  picture?: string;
}
