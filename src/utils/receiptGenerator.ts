import { Tenant, Bill } from '../types';
import { formatCurrency, getMonthDateRange } from './calculations';

export const generateReceiptHTML = (
  tenant: Tenant,
  bill: Bill
): string => {
  const electricityUnits = bill.electricityReading - (tenant.lastElectricityReading || tenant.electricityJoiningReading);
  const previousReading = tenant.lastElectricityReading || tenant.electricityJoiningReading;
  const currentReading = bill.electricityReading;
  const electricityRate = 12; // ₹12 per unit
  const monthRange = getMonthDateRange(bill.billingPeriod);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Bill - ${tenant.name}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        body {
          font-family: 'Courier New', monospace;
          max-width: 400px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          line-height: 1.4;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .divider {
          border-top: 1px solid #000;
          margin: 15px 0;
        }
        .section {
          margin: 15px 0;
        }
        .section-title {
          font-weight: bold;
          margin-bottom: 10px;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        .total-section {
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          padding: 10px 0;
          margin: 15px 0;
          text-align: center;
          font-weight: bold;
          font-size: 16px;
        }
        .status {
          text-align: center;
          font-weight: bold;
          font-size: 14px;
          margin: 15px 0;
          padding: 8px;
          background: ${bill.paymentStatus === 'paid' ? '#d4edda' : '#f8d7da'};
          color: ${bill.paymentStatus === 'paid' ? '#155724' : '#721c24'};
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
        }
        .contact-info {
          margin-top: 15px;
          text-align: center;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">🏠 Shiv Shiva Residency</div>
        <div class="divider">━━━━━━━━━━━━━━━━━━━━━━</div>
        <div style="font-weight: bold; font-size: 16px;">📄 MONTHLY BILL</div>
      </div>
      
      <div class="section">
        <div class="section-title">👤 Tenant Details:</div>
        <div class="row">
          <span>Name:</span>
          <span>${tenant.name}</span>
        </div>
        <div class="row">
          <span>Room:</span>
          <span>${tenant.roomNumber}</span>
        </div>
        <div class="row">
          <span>Month:</span>
          <span>${(() => {
            const range = getMonthDateRange(bill.billingPeriod);
            return `${range.startDate} to ${range.endDate}`;
          })()}</span>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">⚡ Electricity Details:</div>
        <div class="row">
          <span>Previous Reading:</span>
          <span>${previousReading} units</span>
        </div>
        <div class="row">
          <span>Current Reading:</span>
          <span>${currentReading} units</span>
        </div>
        <div class="row">
          <span>Units Consumed:</span>
          <span>${electricityUnits} units</span>
        </div>
        <div class="row">
          <span>Rate:</span>
          <span>₹${electricityRate} per unit</span>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">💰 Bill Breakdown:</div>
        <div class="row">
          <span>Monthly Rent:</span>
          <span>${formatCurrency(bill.rentAmount)}</span>
        </div>
        <div class="row">
          <span>Electricity:</span>
          <span>${formatCurrency(bill.electricityCharges)}</span>
        </div>
        ${bill.adjustments !== 0 ? `
        <div class="row">
          <span>Adjustments:</span>
          <span>${formatCurrency(bill.adjustments)}</span>
        </div>
        ` : ''}
      </div>
      
      <div class="divider">━━━━━━━━━━━━━━━━━━━━━━</div>
      
      <div class="total-section">
        Total Amount: ${formatCurrency(bill.totalAmount)}
      </div>
      
      <div class="divider">━━━━━━━━━━━━━━━━━━━━━━</div>
      
      <div class="status">
        Payment Status: ${bill.paymentStatus === 'paid' ? '✅ PAID' : '⏳ PENDING'}
      </div>
      
      <div class="footer">
        <div>Thank you for your prompt payment! 💰</div>
      </div>
      
      <div class="contact-info">
        <div>Authorized by: Shiv shiva residency</div>
        <div>💳 UPI ID: jyotishivshiva@ybl</div>
        <div>📞 Contact: +91 8929400391</div>
        <div>📍 Address: A-373 sector 70, Noida-201301</div>
      </div>
      
      <div class="no-print" style="margin-top: 20px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Print Bill
        </button>
        <button onclick="shareWhatsApp()" style="padding: 10px 20px; background:rgb(125, 153, 135); color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
          Share on WhatsApp
        </button>
      </div>
      
      <script>
        function shareWhatsApp() {
          // Format phone number for WhatsApp API
          function formatPhoneNumber(phone) {
            // Remove all non-digit characters
            let cleaned = phone.replace(/\\D/g, '');
            
            // If it's a 10-digit Indian number, add 91
            if (cleaned.length === 10) {
              cleaned = '91' + cleaned;
            }
            
            return cleaned;
          }

          const formattedPhone = formatPhoneNumber('${tenant.mobile}');
          console.log('Original phone: ${tenant.mobile}, Formatted phone:', formattedPhone);
          
          const receiptText = '🏠 Shiv Shiva Residency\\n' +
            '━━━━━━━━━━━━━━━━━━━━━━\\n' +
            '📄 MONTHLY BILL\\n\\n' +
            '👤 Tenant Details:\\n' +
            'Name: ${tenant.name}\\n' +
            'Room: ${tenant.roomNumber}\\n' +
            'Month: ${monthRange.startDate} to ${monthRange.endDate}\\n\\n' +
            '⚡ Electricity Details:\\n' +
            'Previous Reading: ${previousReading} units\\n' +
            'Current Reading: ${currentReading} units\\n' +
            'Units Consumed: ${electricityUnits} units\\n' +
            'Rate: ₹${electricityRate} per unit\\n\\n' +
            '💰 Bill Breakdown:\\n' +
            'Monthly Rent: ${formatCurrency(bill.rentAmount)}\\n' +
            'Electricity: ${formatCurrency(bill.electricityCharges)}\\n' +
            ${bill.adjustments !== 0 ? `'Adjustments: ${formatCurrency(bill.adjustments)}\\n' +` : ''} 
            '\\n━━━━━━━━━━━━━━━━━━━━━━\\n' +
            'Total Amount: ${formatCurrency(bill.totalAmount)}\\n' +
            '━━━━━━━━━━━━━━━━━━━━━━\\n\\n' +
            'Payment Status: ${bill.paymentStatus === 'paid' ? '✅ PAID' : '⏳ PENDING'}\\n\\n' +
            'Thank you for your prompt payment! 💰\\n\\n' +
            'Authorized by: Shiv shiva residency\\n' +
            '💳 UPI ID: jyotishivshiva@ybl\\n' +
            '📞 Contact: +91 8929400391\\n' +
            '📍 Address: A-373 sector 70, Noida-201301';
          
          const url = 'https://wa.me/' + formattedPhone + '?text=' + encodeURIComponent(receiptText);
          console.log('WhatsApp URL:', url);
          window.open(url, '_blank');
        }
      </script>
    </body>
    </html>
  `;
};

export const printReceipt = (tenant: Tenant, bill: Bill) => {
  const receiptHTML = generateReceiptHTML(tenant, bill);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
  }
};

export const shareReceiptWhatsApp = (tenant: Tenant, bill: Bill) => {
  const electricityUnits = bill.electricityReading - (tenant.lastElectricityReading || tenant.electricityJoiningReading);
  const previousReading = tenant.lastElectricityReading || tenant.electricityJoiningReading;
  const currentReading = bill.electricityReading;
  const electricityRate = 12; // ₹12 per unit
  const monthRange = getMonthDateRange(bill.billingPeriod);
  
  // Format phone number for WhatsApp API
  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // If it's a 10-digit Indian number, add 91
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    return cleaned;
  };

  const formattedPhone = formatPhoneNumber(tenant.mobile);
  console.log('Original phone:', tenant.mobile, 'Formatted phone:', formattedPhone);
  
  const text = `🏠 Shiv Shiva Residency
━━━━━━━━━━━━━━━━━━━━━━
📄 MONTHLY BILL

👤 Tenant Details:
Name: ${tenant.name}
Room: ${tenant.roomNumber}
Month: ${monthRange.startDate} to ${monthRange.endDate}

⚡ Electricity Details:
Previous Reading: ${previousReading} units
Current Reading: ${currentReading} units
Units Consumed: ${electricityUnits} units
Rate: ₹${electricityRate} per unit

💰 Bill Breakdown:
Monthly Rent: ${formatCurrency(bill.rentAmount)}
Electricity: ${formatCurrency(bill.electricityCharges)}
${bill.adjustments !== 0 ? `Adjustments: ${formatCurrency(bill.adjustments)}` : ''}

━━━━━━━━━━━━━━━━━━━━━━
Total Amount: ${formatCurrency(bill.totalAmount)}
━━━━━━━━━━━━━━━━━━━━━━

Payment Status: ${bill.paymentStatus === 'paid' ? '✅ PAID' : '⏳ PENDING'}

Thank you for your prompt payment! 💰

Authorized by: Shiv shiva residency
💳 UPI ID: jyotishivshiva@ybl
📞 Contact: +91 8929400391
📍 Address: A-373 sector 70, Noida-201301`;

  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
  console.log('WhatsApp URL:', url);
  window.open(url, '_blank');
};