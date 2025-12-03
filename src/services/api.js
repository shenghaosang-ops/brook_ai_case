// Backend API Configuration
const API_CONFIG = {
  baseUrl: 'http://localhost:3001',
  endpoints: {
    stockRecommendations: '/api/stock-recommendations',
    mockData: '/api/stock-recommendations/mock'
  }
}

/**
 * 获取Mock数据作为备用
 */
function getMockData(material, plant) {
  return [
    {
      key: 'row-1',
      priority: 1,
      available: true,
      materialCode: material,
      materialDescription: 'Centrifugal pump impeller assembly',
      companyCode: '1000',
      companyName: 'BestRun CN',
      plantCode: plant,
      plantName: 'Plant ' + plant,
      storageCode: '402G',
      storageName: 'Nanchang After-sales Warehouse',
      availableQuantity: '20 EA',
      road: '639',
      roadUnit: 'KM',
      reason: 'Primary recommendation: after-sales warehouse + stock meets target + lead time shortest among candidates + low cost.'
    },
    {
      key: 'row-2',
      priority: 2,
      available: true,
      materialCode: material,
      materialDescription: 'Centrifugal pump impeller assembly',
      companyCode: '1000',
      companyName: 'BestRun CN',
      plantCode: plant,
      plantName: 'Plant ' + plant,
      storageCode: '406K',
      storageName: 'Guiyang After-sales Warehouse',
      availableQuantity: '50 EA',
      road: '333',
      roadUnit: 'KM',
      reason: 'Alternative recommendation: after-sales warehouse + stock meets target + lead time second shortest among candidates.'
    }
  ]
}

/**
 * 获取库存推荐数据
 * @param {string} material - 物料编号
 * @param {string} plant - 工厂编号
 * @param {boolean} useMock - 是否使用Mock数据
 * @returns {Promise<Array>} 推荐数据列表
 */
export async function getStockRecommendations(material, plant, useMock = false) {
  const endpoint = useMock ? API_CONFIG.endpoints.mockData : API_CONFIG.endpoints.stockRecommendations;
  const url = `${API_CONFIG.baseUrl}${endpoint}`;

  try {
    console.log(`Calling backend API (${useMock ? 'MOCK' : 'REAL'}):`, { Material: material, Plant: plant });
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Material: material,
        Plant: plant
      })
    });

    console.log('Backend Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Backend Error Response:', errorData);
      throw new Error(`API Error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Backend Response Data:', data);
    
    // 转换后端数据格式为前端需要的格式
    const transformed = transformApiData(data);
    
    if (transformed.length === 0) {
      throw new Error('No recommendations found from CPI');
    }
    
    return transformed;
  } catch (error) {
    console.error('Failed to fetch stock recommendations from backend:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * 转换API返回数据为前端需要的格式
 */
function transformApiData(apiData) {
  if (!apiData || !Array.isArray(apiData)) {
    console.warn('transformApiData: Invalid data', apiData);
    return []
  }

  console.log('transformApiData: Processing', apiData.length, 'items');
  
  const transformed = apiData.map((item, index) => ({
    key: `row-${item.Priority || index + 1}`,
    priority: item.Priority || index + 1,
    available: item.Available !== false,
    materialCode: item.Material || item.MaterialCode || '',
    materialDescription: item.MaterialDescription || item.Description || '',
    companyCode: item.CompanyCode || item.Company || '',
    companyName: item.CompanyName || '',
    plantCode: item.PlantCode || item.Plant || '',
    plantName: item.PlantName || '',
    storageCode: item.StorageLocation || item.StorageCode || item.Warehouse || item.City || '',
    storageName: item.StorageLocationName || item.StorageName || item.WarehouseName || item.City || '',
    availableQuantity: item.AvailableQuantity || item.Quantity || '',
    road: String(item.Road || item.Distance || ''),
    roadUnit: String(item.RoadUnit || item.DistanceUnit || 'KM'),
    reason: item.Reason || item.AIReason || item.Recommendation || ''
  }));
  
  console.log('transformApiData: Transformed data', transformed);
  return transformed;
}

export default {
  getStockRecommendations
}
