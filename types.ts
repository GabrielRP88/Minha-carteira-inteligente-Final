
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

export interface AnimationConfig {
  enabled: boolean;
  type: string; // ID da animação (ex: 'scale-up')
  intensity: number; // 0.5 a 2.0
  speed: number; // 0.5 a 3.0
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  agency: string;
  color: string;
  initialBalance: number;
  isDefault?: boolean;
  type: 'CHECKING' | 'SAVINGS'; // Corrente ou Poupança
  includeInTotal: boolean;      // Incluir no saldo geral
  isVisible: boolean;           // Exibir nas listas
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
  includeInTotal: boolean; // Incluir dívida no total devedor
  isVisible: boolean;      // Exibir nas listas
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
  notified?: boolean;
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

export interface Birthday {
  id: string;
  name: string;
  birthDate: string;
}

export type Language = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'jp' | 'zh' | 'ru' | 'ar' | 'hi' | 'ko' | 'tr' | 'nl' | 'pl' | 'sv' | 'el' | 'he' | 'vi' | 'pt_pt';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  picture?: string;
  avatar?: string;
  avatarConfig?: any;
  address?: string;
  birthDate?: string;
  isLocal: boolean;
  attachmentRetentionMonths?: number;
  language?: Language;
  notificationSound?: 'cash_register' | 'beep' | 'digital' | 'chime' | 'coins' | 'success' | 'drum' | 'bubble' | 'glass' | 'silver' | 'laser' | 'retro' | 'harp' | 'guitar' | 'whistle' | 'crystal';
  notificationsEnabled?: boolean;
  autoBackupConfig?: AutoBackupConfig;
  animationConfig?: AnimationConfig;
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
