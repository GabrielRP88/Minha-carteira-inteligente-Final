
import React from 'react';
import { 
  TrendingUp, TrendingDown, CreditCard, Calendar, Filter, Plus, Trash2, 
  CheckCircle2, Clock, ArrowRightLeft, PieChart, Bell, Search, Calculator, 
  FileText, X, ChevronRight, Sun, Moon, Palette, Eye, EyeOff, Lock, Unlock, ShieldCheck 
} from 'lucide-react';

export const CATEGORIES = [
  'Alimentação', 'Lazer', 'Transporte', 'Saúde', 'Educação', 'Moradia', 
  'Salário', 'Investimentos', 'Cartão de Crédito', 'Contas Fixas', 
  'Compras', 'Presentes', 'Outros'
];

export const THEMES = [
  { id: 'default', name: 'Índigo', color: '#6366f1' },
  { id: 'slate', name: 'Slate', color: '#475569' },
  { id: 'sage', name: 'Sálvia', color: '#10b981' },
  { id: 'rose', name: 'Rosé', color: '#f43f5e' },
  { id: 'amber', name: 'Dourado', color: '#f59e0b' },
  { id: 'sky', name: 'Céu', color: '#0ea5e9' },
  { id: 'violet', name: 'Violeta', color: '#8b5cf6' },
  { id: 'minimal', name: 'Grafite', color: '#18181b' },
  { id: 'forest', name: 'Floresta', color: '#166534' },
  { id: 'ocean', name: 'Oceano', color: '#0369a1' }
];

export const ICONS = {
  INCOME: <TrendingUp className="text-emerald-500" />,
  EXPENSE: <TrendingDown className="text-rose-500" />,
  CREDIT_CARD: <CreditCard className="text-blue-500" />,
  CALENDAR: <Calendar className="text-gray-400" />,
  FILTER: <Filter className="size-4" />,
  PLUS: <Plus className="size-5" />,
  TRASH: <Trash2 className="size-4" />,
  CHECK: <CheckCircle2 className="size-4" />,
  CLOCK: <Clock className="size-4" />,
  TRANSFER: <ArrowRightLeft className="size-5" />,
  CHART: <PieChart className="size-5" />,
  BELL: <Bell className="size-5" />,
  SEARCH: <Search className="size-4 text-slate-400" />,
  CALC: <Calculator className="size-5" />,
  NOTES: <FileText className="size-5" />,
  CLOSE: <X className="size-6" />,
  RIGHT: <ChevronRight className="size-4" />,
  SUN: <Sun className="size-5" />,
  MOON: <Moon className="size-5" />,
  PALETTE: <Palette className="size-5" />,
  EYE: <Eye className="size-4" />,
  EYE_OFF: <EyeOff className="size-4" />,
  LOCK: <Lock size={16} />,
  UNLOCK: <Unlock size={16} />,
  SHIELD: <ShieldCheck size={16} />
};
