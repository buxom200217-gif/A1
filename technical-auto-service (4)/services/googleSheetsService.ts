
import { RepairRequest, RepairStatus } from "../types";

/**
 * ปรับปรุงให้การ fetch ใช้รูปแบบที่เรียบง่ายที่สุดเพื่อเลี่ยง CORS
 */
export const fetchRequestsFromSheets = async (scriptUrl: string): Promise<RepairRequest[] | null> => {
  if (!scriptUrl || !scriptUrl.startsWith('https://script.google.com')) return null;
  
  try {
    // การเรียก Google Script แบบ GET มักจะโดน Redirect
    // เราไม่ใส่ Header พิเศษเพื่อให้เป็น "Simple Request"
    const response = await fetch(scriptUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        id: String(item.id || item.ID || ''),
        customerName: String(item.customerName || item.CustomerName || 'ไม่ระบุชื่อ'),
        phoneNumber: String(item.phoneNumber || item.PhoneNumber || ''),
        carBrand: String(item.carBrand || item.CarBrand || ''),
        carModel: String(item.carModel || item.CarModel || ''),
        serviceType: (item.serviceType || item.ServiceType || 'Service') as 'Service' | 'Repair',
        description: String(item.description || item.Description || ''),
        status: (item.status || item.Status || RepairStatus.PENDING) as RepairStatus,
        createdAt: item.createdAt || item.CreatedAt || new Date().toISOString(),
        estimatedCost: Number(item.estimatedCost || item.EstimatedCost || 0),
        aiDiagnosis: item.aiDiagnosis || item.AiDiagnosis || '',
        imageUrl: item.imageUrl || item.ImageUrl || ''
      })) as RepairRequest[];
    }
    
    return [];
  } catch (error) {
    console.error("Google Sheets Connection Error:", error);
    return null; // ส่ง null กลับไปเพื่อให้ UI แสดงผลว่าเชื่อมต่อไม่ได้
  }
};

export const saveRequestToSheets = async (scriptUrl: string, request: RepairRequest): Promise<boolean> => {
  try {
    // POST ไปยัง GAS มักต้องใช้ no-cors ถ้าไม่จัดการ OPTIONS ใน Server
    // แต่ข้อมูลจะยังไปถึง Server ได้
    await fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors", 
      headers: {
        "Content-Type": "text/plain", // ใช้ text/plain เพื่อเลี่ยง preflight
      },
      body: JSON.stringify({ action: 'add', ...request }),
    });
    return true;
  } catch (error) {
    console.error("Error saving to Sheets:", error);
    return false;
  }
};

export const updateRequestStatusInSheets = async (scriptUrl: string, id: string, status: RepairStatus): Promise<boolean> => {
  try {
    await fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify({ action: 'updateStatus', id, status }),
    });
    return true;
  } catch (error) {
    console.error("Error updating status in Sheets:", error);
    return false;
  }
};
