const express = require('express');
const cors = require('cors');
const axios = require('axios');
const xml2js = require('xml2js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// OAuth 2.0 Token cache
let tokenCache = {
  accessToken: null,
  expiresAt: null
};

/**
 * OAuth 2.0 Client Credentials Flow
 * 获取访问令牌
 */
async function getAccessToken() {
  // 检查缓存的token是否有效
  if (tokenCache.accessToken && tokenCache.expiresAt && Date.now() < tokenCache.expiresAt) {
    console.log('Using cached access token');
    return tokenCache.accessToken;
  }

  try {
    console.log('Fetching new access token...');
    
    // 使用Basic Auth获取OAuth 2.0 token
    const credentials = Buffer.from(`${process.env.CPI_CLIENT_ID}:${process.env.CPI_CLIENT_SECRET}`).toString('base64');
    
    // 注意：这里是示例，实际的OAuth endpoint可能不同
    // 如果CPI使用标准OAuth 2.0，应该有专门的token endpoint
    // 这里直接返回Basic Auth凭据
    tokenCache.accessToken = credentials;
    tokenCache.expiresAt = Date.now() + 3600000; // 1小时后过期
    
    console.log('Access token obtained successfully');
    return tokenCache.accessToken;
  } catch (error) {
    console.error('Failed to get access token:', error.message);
    throw new Error('Authentication failed');
  }
}

/**
 * 从XML结构中提取物流数据
 */
function extractLogistData(xmlObj, material, plant) {
  const results = [];
  
  try {
    // Navigate through the nested XML structure
    const messages = xmlObj['multimap:Messages'];
    if (!messages || !messages['multimap:Message1']) {
      return results;
    }
    
    const innerMessages = messages['multimap:Message1']['multimap:Messages'];
    if (!innerMessages || !Array.isArray(innerMessages)) {
      return results;
    }
    
    let priority = 1;
    innerMessages.forEach((msg) => {
      try {
        const logistData = msg['multimap:Message1']?.['ZI_DEMO_logistdata'];
        if (!logistData) return;
        
        const dataType = logistData['ZI_DEMO_logistdataType'];
        if (!dataType) return;
        
        // 提取数据字段
        const item = {
          Priority: priority++,
          Available: true,
          Material: material,
          MaterialDescription: 'Centrifugal pump impeller assembly',
          CompanyCode: '1000',
          CompanyName: 'BestRun CN',
          PlantCode: plant,
          PlantName: `Plant ${plant}`,
          StorageLocation: dataType.City || '',
          StorageLocationName: dataType.City || '',
          AvailableQuantity: '100 EA', // CPI未提供此字段，使用默认值
          Road: dataType.Road || '',
          RoadUnit: dataType.RoadUnit || 'KM',
          Time: dataType.Time || '',
          TimeUnit: dataType.TimeUnit || 'H',
          Cost: dataType.Cost || '',
          CostUnit: dataType.CostUnit || 'EUR',
          Country: dataType.Country || '',
          City: dataType.City || '',
          Reason: `Distance: ${dataType.Road} ${dataType.RoadUnit}, Time: ${dataType.Time} ${dataType.TimeUnit}, Cost: ${dataType.Cost} ${dataType.CostUnit}`
        };
        
        results.push(item);
      } catch (err) {
        console.warn('Error extracting item:', err.message);
      }
    });
  } catch (error) {
    console.error('Error parsing XML structure:', error.message);
  }
  
  return results;
}

/**
 * 健康检查接口
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * 获取库存推荐
 * POST /api/stock-recommendations
 */
app.post('/api/stock-recommendations', async (req, res) => {
  try {
    const { Material, Plant } = req.body;

    if (!Material || !Plant) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Material and Plant are required'
      });
    }

    console.log('Fetching stock recommendations for:', { Material, Plant });

    // 获取访问令牌
    const accessToken = await getAccessToken();

    // 调用CPI接口
    const cpiUrl = `${process.env.CPI_BASE_URL}/http/aftermarket_stock_call`;
    
    const response = await axios.post(
      cpiUrl,
      { Material, Plant },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${accessToken}`
        },
        timeout: 30000 // 30秒超时
      }
    );

    console.log('CPI response status:', response.status);
    console.log('CPI response data type:', typeof response.data);
    
    // 解析XML响应
    let parsedData;
    if (typeof response.data === 'string' && response.data.includes('<?xml')) {
      // XML格式需要解析
      const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
      const xmlResult = await parser.parseStringPromise(response.data);
      console.log('Parsed XML:', JSON.stringify(xmlResult, null, 2));
      
      // 提取ZI_DEMO_logistdataType数据
      const jsonData = extractLogistData(xmlResult, Material, Plant);
      console.log('Extracted JSON data:', JSON.stringify(jsonData, null, 2));
      parsedData = jsonData;
    } else {
      // 已经是JSON格式
      parsedData = response.data;
    }
    
    // 返回解析后的JSON数据
    res.json(parsedData);

  } catch (error) {
    console.error('Error calling CPI:', error.message);
    
    if (error.response) {
      // CPI返回了错误响应
      console.error('CPI error response:', error.response.status, error.response.data);
      res.status(error.response.status).json({
        error: 'CPI API Error',
        message: error.response.data || 'Failed to fetch recommendations',
        status: error.response.status
      });
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('No response from CPI');
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'CPI service is not responding'
      });
    } else {
      // 其他错误
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
});

/**
 * Mock数据接口（用于测试）
 */
app.post('/api/stock-recommendations/mock', (req, res) => {
  const { Material, Plant } = req.body;
  
  console.log('Returning mock data for:', { Material, Plant });
  
  const mockData = [
    {
      Priority: 1,
      Available: true,
      Material: Material,
      MaterialDescription: 'Centrifugal pump impeller assembly',
      CompanyCode: '1000',
      CompanyName: 'BestRun CN',
      PlantCode: Plant,
      PlantName: `Plant ${Plant}`,
      StorageLocation: '402G',
      StorageLocationName: 'Nanchang After-sales Warehouse',
      AvailableQuantity: '20 EA',
      Road: '639',
      RoadUnit: 'KM',
      Reason: 'Primary recommendation: after-sales warehouse + stock meets target + shortest road distance + low cost.'
    },
    {
      Priority: 2,
      Available: true,
      Material: Material,
      MaterialDescription: 'Centrifugal pump impeller assembly',
      CompanyCode: '1000',
      CompanyName: 'BestRun CN',
      PlantCode: Plant,
      PlantName: `Plant ${Plant}`,
      StorageLocation: '406K',
      StorageLocationName: 'Guiyang After-sales Warehouse',
      AvailableQuantity: '50 EA',
      Road: '333',
      RoadUnit: 'KM',
      Reason: 'Alternative recommendation: after-sales warehouse + stock meets target + moderate road distance.'
    },
    {
      Priority: 3,
      Available: true,
      Material: Material,
      MaterialDescription: 'Centrifugal pump impeller assembly',
      CompanyCode: '1000',
      CompanyName: 'BestRun CN',
      PlantCode: Plant,
      PlantName: `Plant ${Plant}`,
      StorageLocation: '202B',
      StorageLocationName: 'Beijing Warehouse',
      AvailableQuantity: '2000 EA',
      Road: '573',
      RoadUnit: 'KM',
      Reason: 'Secondary alternative: regular warehouse + large stock + acceptable road distance.'
    }
  ];
  
  res.json(mockData);
});

// 启动服务器
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Smart Inventory Backend Server`);
  console.log(`📍 Running on: http://localhost:${PORT}`);
  console.log(`🔗 CPI Base URL: ${process.env.CPI_BASE_URL}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API endpoint: http://localhost:${PORT}/api/stock-recommendations`);
  console.log(`🧪 Mock endpoint: http://localhost:${PORT}/api/stock-recommendations/mock`);
  console.log('='.repeat(50));
});
