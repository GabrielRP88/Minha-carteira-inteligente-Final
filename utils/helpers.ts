export const generateId = () => Math.random().toString(36).substring(2, 15);

export const getLocalDateStr = (date: Date = new Date()) => {
  try {
    return date.toLocaleDateString('en-CA'); 
  } catch (e) {
    return new Date().toLocaleDateString('en-CA');
  }
};

export const getInvoiceKey = (dateStr: string, closingDay: number) => {
  try {
    if (!dateStr) throw new Error("Data inválida");
    const date = new Date(dateStr + 'T12:00:00');
    if (isNaN(date.getTime())) throw new Error("Data inválida");
    
    const day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    
    if (day > closingDay) {
      month++;
      if (month > 11) { month = 0; year++; }
    }
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  } catch (e) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
};