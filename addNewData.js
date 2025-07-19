import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Your new tenant data
const newTenants = [
  { room_number: '113', joining_date: '2021-11-01', name: 'PRACHI', monthly_rent: 10200, security_deposit: 4950, mobile: '9454510749', status: 'active' },
  { room_number: '309', joining_date: '2025-02-01', name: 'AMAN SRIVATAV', monthly_rent: 15500, security_deposit: 15500, mobile: '7651941049', status: 'active' },
  { room_number: '113', joining_date: '2021-11-01', name: 'D.R KRISHNA', monthly_rent: 10200, security_deposit: 10200, mobile: '8397094046', status: 'active' },
  { room_number: '202', joining_date: '2023-05-01', name: 'SHAIL', monthly_rent: 6200, security_deposit: 8500, mobile: '7082634926', status: 'active' },
  { room_number: '205', joining_date: '2021-11-01', name: 'MEGHA', monthly_rent: 14000, security_deposit: 14000, mobile: '9773934690', status: 'active' },
  { room_number: '211', joining_date: '2024-05-01', name: 'ABISHEK SINGH', monthly_rent: 16000, security_deposit: 16000, mobile: '7499084227', status: 'active' },
  { room_number: '303', joining_date: '2023-09-01', name: 'CHIRAG BANSAL', monthly_rent: 6500, security_deposit: 9900, mobile: '9996718848', status: 'active' },
  { room_number: '310', joining_date: '2022-11-01', name: 'KARTIK TAYAL', monthly_rent: 13200, security_deposit: 15500, mobile: '8587975954', status: 'active' },
  { room_number: '408', joining_date: '2023-12-01', name: 'VIKASH VARMA', monthly_rent: 13500, security_deposit: 15500, mobile: '9045360168', status: 'active' },
  { room_number: '413', joining_date: '2023-05-01', name: 'ASWAS GANGULY', monthly_rent: 15000, security_deposit: 15000, mobile: '9051070815', status: 'active' },
  { room_number: '119', joining_date: '2025-02-01', name: 'POOJA KUMARI', monthly_rent: 17000, security_deposit: 17000, mobile: '8529581175', status: 'active' },
  { room_number: '306', joining_date: '2024-01-01', name: 'HIMANSHU', monthly_rent: 15500, security_deposit: 15500, mobile: '8809952265', status: 'active' },
  { room_number: '106', joining_date: '2024-01-01', name: 'VIJEET NIGAM', monthly_rent: 15500, security_deposit: 15500, mobile: '9408906385', status: 'active' },
  { room_number: '401', joining_date: '2024-01-01', name: 'ROHIT SENWER', monthly_rent: 6200, security_deposit: 6200, mobile: '8318136798', status: 'active' },
  { room_number: '401', joining_date: '2024-01-01', name: 'CHETAN PANT', monthly_rent: 6500, security_deposit: 6500, mobile: '9528892298', status: 'active' },
  { room_number: '101', joining_date: '2024-01-01', name: 'DAISY KRISHANA', monthly_rent: 8500, security_deposit: 8500, mobile: '9588172468', status: 'active' },
  { room_number: '206', joining_date: '2024-01-01', name: 'PRIYANSHI', monthly_rent: 13200, security_deposit: null, mobile: '9410216649', status: 'active' },
  { room_number: '210', joining_date: '2024-01-01', name: 'SRI KRISHANA', monthly_rent: 16200, security_deposit: 16200, mobile: '8056701270', status: 'active' },
  { room_number: '217', joining_date: '2024-01-01', name: 'SHIVAM VARMA', monthly_rent: 6200, security_deposit: 8900, mobile: '7895160566', status: 'active' },
  { room_number: '404', joining_date: '2024-01-01', name: 'ASHISH PRATHAP', monthly_rent: 15300, security_deposit: 15300, mobile: '9997471023', status: 'active' },
  { room_number: '117', joining_date: '2024-01-01', name: 'DESIGANAR', monthly_rent: 9200, security_deposit: 4500, mobile: '7092098767', status: 'active' },
  { room_number: '116', joining_date: '2025-06-01', name: 'SARTHAK KUMAR', monthly_rent: 16500, security_deposit: 16500, mobile: '9026827765', status: 'active' },
  { room_number: '107', joining_date: '2025-01-01', name: 'SHIV NANDAN', monthly_rent: 10000, security_deposit: null, mobile: '8429721303', status: 'active' },
  { room_number: '203', joining_date: '2025-06-02', name: 'HARSHITA NEGI', monthly_rent: 8500, security_deposit: 1000, mobile: '9193708466', status: 'active' },
  { room_number: '307', joining_date: '2025-06-02', name: 'PRIYA CHAUBEY', monthly_rent: 15500, security_deposit: null, mobile: '8707662459', status: 'active' },
  { room_number: '203', joining_date: '2025-06-02', name: 'SHIV NANDAN', monthly_rent: 8500, security_deposit: 1000, mobile: '7818014291', status: 'active' },
  { room_number: '304', joining_date: '2024-03-01', name: 'ANKIT CHOUDHARY', monthly_rent: 15000, security_deposit: 14000, mobile: '9113770092', status: 'active' },
  { room_number: '207', joining_date: '2025-01-30', name: 'ADITYA', monthly_rent: 8000, security_deposit: null, mobile: '7900465446', status: 'active' },
  { room_number: '201', joining_date: '2024-04-01', name: 'DHRITI SHARMA', monthly_rent: 8500, security_deposit: null, mobile: '7017288218', status: 'active' },
  { room_number: '102', joining_date: '2025-04-01', name: 'SAKSHAM AGRWAL', monthly_rent: 8000, security_deposit: 8000, mobile: '8090507158', status: 'active' },
  { room_number: '102', joining_date: '2025-04-01', name: 'SATYAM', monthly_rent: 8000, security_deposit: 8000, mobile: '8863049944', status: 'active' },
  { room_number: '302', joining_date: '2025-06-01', name: 'HIMANSHU', monthly_rent: 8000, security_deposit: 8000, mobile: '9467777922', status: 'active' },
  { room_number: '302', joining_date: '2025-06-01', name: 'RISHABH', monthly_rent: 8000, security_deposit: 8000, mobile: '9467777922', status: 'active' },
  { room_number: '302', joining_date: '2025-06-01', name: 'DEVENDER', monthly_rent: 8000, security_deposit: 8000, mobile: '9467777922', status: 'active' },
  { room_number: '418', joining_date: '2025-07-01', name: 'SHAGUN', monthly_rent: 8000, security_deposit: 1000, mobile: '9319422504', status: 'active' },
  { room_number: '209', joining_date: '2025-02-01', name: 'HARSHIT KUMAR', monthly_rent: 15000, security_deposit: 15000, mobile: '6394220519', status: 'active' },
  { room_number: '402', joining_date: '2024-01-02', name: 'PARSHANT', monthly_rent: 8500, security_deposit: 4000, mobile: '8423270648', status: 'active' },
  { room_number: '204', joining_date: '2024-02-06', name: 'RASHI GUPTA', monthly_rent: 10500, security_deposit: 10500, mobile: '6387204040', status: 'active' },
  { room_number: '411', joining_date: '2025-02-07', name: 'DIVYANSH', monthly_rent: 10000, security_deposit: null, mobile: '8445774367', status: 'active' },
  { room_number: '402', joining_date: '2025-02-07', name: 'PANKAJ KUMAR', monthly_rent: 8500, security_deposit: 8500, mobile: '7033397085', status: 'active' },
  { room_number: '401', joining_date: '2022-12-03', name: 'NIKIL', monthly_rent: 6200, security_deposit: 8900, mobile: '8299415220', status: 'active' },
  { room_number: '403', joining_date: '2025-05-04', name: 'ARYAN', monthly_rent: 9500, security_deposit: 4750, mobile: '7084015303', status: 'active' },
  { room_number: '403', joining_date: '2025-05-04', name: 'AISHWARYA', monthly_rent: 9500, security_deposit: 4750, mobile: '7084015303', status: 'active' },
  { room_number: '318', joining_date: '2025-07-04', name: 'ARYAN GOYAL', monthly_rent: 8000, security_deposit: 8000, mobile: '6367609001', status: 'active' },
  { room_number: '305', joining_date: '2025-07-04', name: 'AKSNKSHA UP', monthly_rent: 16000, security_deposit: 4000, mobile: '8800170768', status: 'active' },
  { room_number: '417', joining_date: '2025-07-04', name: 'SHIVANI SINGH', monthly_rent: 8000, security_deposit: null, mobile: '8349425617', status: 'active' },
  { room_number: '214', joining_date: '2025-05-02', name: 'RAHUL RANGAR', monthly_rent: 10000, security_deposit: 10000, mobile: '9760187038', status: 'active' },
  { room_number: '103', joining_date: '2025-05-01', name: 'KAUSTAV GHOSH', monthly_rent: 10500, security_deposit: 10500, mobile: '7980414688', status: 'active' },
  { room_number: '303', joining_date: '2024-05-01', name: 'PRADYUM', monthly_rent: 8500, security_deposit: 9500, mobile: '9761019937', status: 'active' },
  { room_number: '313', joining_date: '2024-05-08', name: 'PADMINI KUMARI', monthly_rent: 8500, security_deposit: 8500, mobile: '8789162932', status: 'active' },
  { room_number: '204', joining_date: '2025-05-07', name: 'ARUSHI', monthly_rent: 9500, security_deposit: 9500, mobile: '7903424548', status: 'active' },
  { room_number: '417', joining_date: '2025-05-07', name: 'MEENAKSHI TIWARI', monthly_rent: 8000, security_deposit: 2000, mobile: '9670025539', status: 'active' },
  { room_number: '414', joining_date: '2023-05-11', name: 'BHRIGU PANT', monthly_rent: 13500, security_deposit: 13500, mobile: '999767333', status: 'active' },
  { room_number: '419', joining_date: '2024-06-02', name: 'SHRESTH GAHLOT', monthly_rent: 10500, security_deposit: null, mobile: '9785616505', status: 'active' },
  { room_number: '107', joining_date: '2025-06-06', name: 'SIDHANT SETHI', monthly_rent: 9500, security_deposit: 4750, mobile: '9717827627', status: 'active' },
  { room_number: '312', joining_date: '2024-10-06', name: 'ANISH KUMAR', monthly_rent: 15000, security_deposit: null, mobile: '7309016666', status: 'active' },
  { room_number: '418', joining_date: '2025-06-07', name: 'KHUSHI VARMA', monthly_rent: 8200, security_deposit: 2000, mobile: '8081569878', status: 'active' },
  { room_number: '114', joining_date: '2025-01-07', name: 'ANISH KUMAR', monthly_rent: 16200, security_deposit: 16200, mobile: '9546257643', status: 'active' },
  { room_number: '301', joining_date: '2025-08-05', name: 'NITU TIWARI', monthly_rent: 7500, security_deposit: 7500, mobile: '9140731851', status: 'active' },
  { room_number: '111', joining_date: '2024-08-10', name: 'ARYAN', monthly_rent: 9500, security_deposit: 4750, mobile: '8708407492', status: 'active' },
  { room_number: '111', joining_date: '2024-08-10', name: 'PRANJAL TARIYAL', monthly_rent: 9500, security_deposit: 4750, mobile: '9193375623', status: 'active' },
  { room_number: '218', joining_date: '2023-09-08', name: 'PRIYA BHATT', monthly_rent: 8000, security_deposit: 6500, mobile: '9555069116', status: 'active' },
  { room_number: '116', joining_date: '2023-09-08', name: 'TANUJA RAJE', monthly_rent: 8000, security_deposit: 8000, mobile: '8869960442', status: 'active' },
  { room_number: '416', joining_date: '2023-09-08', name: 'VAISHNAVI', monthly_rent: 13500, security_deposit: 15500, mobile: '9354050289', status: 'active' },
  { room_number: '502', joining_date: '2025-09-06', name: 'HARSH VARMA', monthly_rent: 9000, security_deposit: 5000, mobile: '9340375798', status: 'active' },
  { room_number: '219', joining_date: '2025-09-07', name: 'AMAN SINGH', monthly_rent: 8500, security_deposit: null, mobile: '6388699606', status: 'active' },
  { room_number: '318', joining_date: '2025-09-06', name: 'VIVEK', monthly_rent: 6500, security_deposit: null, mobile: '9669667277', status: 'active' },
  { room_number: '501', joining_date: '2024-09-01', name: 'RISHABH', monthly_rent: 15300, security_deposit: 16500, mobile: '9431495295', status: 'active' },
  { room_number: '217', joining_date: '2024-05-10', name: 'SAGAR SINGH', monthly_rent: 8000, security_deposit: 8000, mobile: '9510933750', status: 'active' },
  { room_number: '116', joining_date: '2023-10-03', name: 'MAIMA GARG', monthly_rent: 8000, security_deposit: 8000, mobile: '7017257053', status: 'active' },
  { room_number: '218', joining_date: '2025-10-04', name: 'MUSKAN', monthly_rent: 7500, security_deposit: 9500, mobile: '7303575456', status: 'active' },
  { room_number: '419', joining_date: '2025-10-06', name: 'JOYATI', monthly_rent: 10500, security_deposit: 10500, mobile: '7908019023', status: 'active' },
  { room_number: '419', joining_date: '2025-06-10', name: 'TANPREET KAUR', monthly_rent: 10500, security_deposit: 10500, mobile: '8400758058', status: 'active' },
  { room_number: '412', joining_date: '2025-06-10', name: 'AMANDEEP SINGH', monthly_rent: 14500, security_deposit: 14500, mobile: '9717558165', status: 'active' },
  { room_number: '418', joining_date: '2025-06-10', name: 'AL TANZEEN KHAN', monthly_rent: 8000, security_deposit: 2000, mobile: '8529085729', status: 'active' }
];

async function addNewData() {
  try {
    console.log('Adding new tenant data...');
    
    // Add tenants in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < newTenants.length; i += batchSize) {
      const batch = newTenants.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('tenants')
        .insert(batch);
      
      if (error) {
        console.error(`Error adding batch ${Math.floor(i/batchSize) + 1}:`, error);
      } else {
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} added successfully (${batch.length} tenants)`);
      }
      
      // Small delay between batches
      if (i + batchSize < newTenants.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('🎉 All new tenant data added successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

addNewData(); 