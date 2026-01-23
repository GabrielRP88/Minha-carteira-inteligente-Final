
export const generateId = () => Math.random().toString(36).substring(2, 15);

export const getLocalDateStr = (date: Date = new Date()) => {
  return date.toLocaleDateString('en-CA'); 
};

export const getInvoiceKey = (dateStr: string, closingDay: number) => {
  const date = new Date(dateStr + 'T12:00:00');
  const day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();
  if (day > closingDay) {
    month++;
    if (month > 11) { month = 0; year++; }
  }
  return `${year}-${String(month + 1).padStart(2, '0')}`;
};
