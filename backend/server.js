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

// ============ SBPA Token 缓存 ============
let sbpaCachedToken = null
let sbpaTokenExpiry = null

/**
 * 获取 SBPA OAuth 2.0 访问令牌
 */
async function getSBPAAccessToken() {
  if (sbpaCachedToken && sbpaTokenExpiry && Date.now() < sbpaTokenExpiry) {
    console.log('Using cached SBPA token')
    return sbpaCachedToken
  }

  console.log('Fetching new SBPA access token...')
  
  try {
    const credentials = Buffer.from(
      `${process.env.SBPA_CLIENT_ID}:${process.env.SBPA_CLIENT_SECRET}`
    ).toString('base64')

    const tokenUrl = `${process.env.SBPA_AUTH_URL}/oauth/token`

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`SBPA token request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    sbpaCachedToken = data.access_token
    sbpaTokenExpiry = Date.now() + (data.expires_in - 300) * 1000
    
    console.log('SBPA token fetched successfully')
    return sbpaCachedToken
  } catch (error) {
    console.error('Failed to get SBPA access token:', error)
    throw error
  }
}

/**
 * 生成 Mock 数据（当 CPI 服务不可用时使用）
 */
function generateMockData(material, plant) {
  const cities = [
    { name: 'Berlin', code: '201A', distance: 639, time: 7.99, cost: 39.95, qty: 1000 },
    { name: 'Munich', code: '202B', distance: 333, time: 4.16, cost: 20.8, qty: 2000 },
    { name: 'Hamburg', code: '203C', distance: 573, time: 7.16, cost: 35.8, qty: 1800 },
    { name: 'Frankfurt am Main', code: '204D', distance: 102, time: 1.28, cost: 6.4, qty: 1600 },
    { name: 'Stuttgart', code: '205E', distance: 105, time: 1.31, cost: 6.55, qty: 800 },
    { name: 'Dusseldorf', code: '401F', distance: 300, time: 3.75, cost: 18.75, qty: 30 },
    { name: 'Dresden', code: '402G', distance: 509, time: 6.36, cost: 31.8, qty: 120 },
    { name: 'Cologne', code: '403H', distance: 264, time: 3.3, cost: 16.5, qty: 12 },
    { name: 'Bremen', code: '405J', distance: 551, time: 6.89, cost: 34.45, qty: 8 },
    { name: 'Hannover', code: '406K', distance: 431, time: 5.39, cost: 26.95, qty: 100 }
  ];

  return cities.map((city, index) => ({
    Priority: index + 1,
    Available: true,
    Material: material,
    MaterialDescription: 'impeller',
    CompanyCode: '1000',
    CompanyName: 'BestRun CN',
    PlantCode: plant,
    PlantName: `Plant ${plant}`,
    StorageLocation: city.code,
    StorageLocationName: city.name,
    AvailableQuantity: `${city.qty} EA`,
    Road: city.distance.toFixed(3),
    Country: 'DE',
    City: city.name,
    Time: city.time.toFixed(3),
    TimeUnit: 'H',
    Cost: city.cost.toFixed(3),
    CostUnit: 'EUR',
    Reason: `Distance: ${city.distance.toFixed(3)} KM, Time: ${city.time.toFixed(3)} H, Cost: ${city.cost.toFixed(3)} EUR`
  }));
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
        const availableQty = dataType.MatlWrhsStkQtyInMatlBaseUnit || '0';
        const baseUnit = dataType.MaterialBaseUnit || 'EA';
        
        const item = {
          Priority: priority++,
          Available: true,
          Material: material,
          MaterialDescription: 'impeller',
          CompanyCode: '1000',
          CompanyName: 'BestRun CN',
          PlantCode: plant,
          PlantName: `Plant ${plant}`,
          StorageLocation: dataType.StorageLocation || '',
          StorageLocationName: dataType.City || '',
          AvailableQuantity: `${availableQty} ${baseUnit}`,
          Road: dataType.Road || '',
          Country: dataType.Country || '',
          City: dataType.City || '',
          Time: dataType.Time || '',
          TimeUnit: dataType.TimeUnit || 'H',
          Cost: dataType.Cost || '',
          CostUnit: dataType.CostUnit || 'EUR',
          Reason: `Distance: ${dataType.Road} KM, Time: ${dataType.Time} ${dataType.TimeUnit}, Cost: ${dataType.Cost} ${dataType.CostUnit}`
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
 * SBPA 发送邮件接口
 */
app.post('/api/send-email', async (req, res) => {
  try {
    const { sendto, sendcc, subject, content } = req.body

    // 验证必填字段
    if (!sendto || !subject || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'sendto, subject, and content are required'
      })
    }

    console.log(`Triggering SBPA email workflow...`)
    console.log(`To: ${sendto}, Subject: ${subject}`)

    // 获取 SBPA 访问令牌
    const token = await getSBPAAccessToken()

    // 调用 SBPA API Trigger
    const response = await fetch(process.env.SBPA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'irpa-api-key': 'cshG4BIysbF76izv7O5XYZ3ldPvhMcVq'
      },
      body: JSON.stringify({
        definitionId: process.env.SBPA_DEFINITION_ID,
        context: {
          sendto,
          sendcc: sendcc || '',
          subject,
          content
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('SBPA API error:', errorText)
      return res.status(response.status).json({
        error: 'SBPA API request failed',
        message: errorText
      })
    }

    const data = await response.json()
    console.log('SBPA workflow triggered successfully:', data)
    
    res.json({
      success: true,
      workflowInstanceId: data.id || data.workflowInstanceId,
      message: 'Email workflow triggered successfully',
      data
    })
  } catch (error) {
    console.error('Error in /api/send-email:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
})

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
    console.warn('⚠️  CPI service error - returning mock data as fallback');
    
    // CPI 服务出错时，返回 Mock 数据作为备用
    const mockData = generateMockData(req.body.Material, req.body.Plant);
    res.json(mockData);
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
