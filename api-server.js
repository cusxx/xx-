const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 7860; // 使用7860端口与小程序配置保持一致

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 添加小程序期望的路由
app.post('/idphoto', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      code: 400,
      message: '请选择要上传的文件'
    });
  }

  // 模拟证件照生成
  const imageId = 'idphoto_' + Date.now();
  
  // 模拟base64图片数据
  const mockBase64Standard = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  const mockBase64HD = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  
  res.json({
    code: 200,
    message: '证件照生成成功',
    data: {
      imageId: imageId,
      image_base64_standard: mockBase64Standard,
      image_base64_hd: mockBase64HD,
      processedUrl: 'https://via.placeholder.com/295x413/FF0000/FFFFFF?text=证件照',
      thumbnailUrl: 'https://via.placeholder.com/150x200/FF0000/FFFFFF?text=缩略图',
      originalUrl: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size,
      width: 295,
      height: 413
    }
  });
});

app.post('/add_background', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      code: 400,
      message: '请选择要上传的文件'
    });
  }

  res.json({
    code: 200,
    message: '背景添加成功',
    data: {
      imageId: 'bg_' + Date.now(),
      processedUrl: 'https://via.placeholder.com/295x413/0000FF/FFFFFF?text=背景照',
      originalUrl: `/uploads/${req.file.filename}`,
      filename: req.file.filename
    }
  });
});

app.post('/generate_layout_photos', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      code: 400,
      message: '请选择要上传的文件'
    });
  }

  res.json({
    code: 200,
    message: '排版照生成成功',
    data: {
      imageId: 'layout_' + Date.now(),
      processedUrl: 'https://via.placeholder.com/1800x1200/00FF00/FFFFFF?text=六寸排版照',
      originalUrl: `/uploads/${req.file.filename}`,
      filename: req.file.filename
    }
  });
});

// 模拟用户API
app.post('/api/user/login', (req, res) => {
  const { username, password } = req.body;
  
  // 简单的模拟登录
  if (username && password) {
    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token: 'mock_token_' + Date.now(),
        user: {
          id: 1,
          username: username,
          email: username + '@example.com'
        }
      }
    });
  } else {
    res.status(400).json({
      code: 400,
      message: '用户名或密码不能为空'
    });
  }
});

app.post('/api/user/register', (req, res) => {
  const { username, password, email } = req.body;
  
  res.json({
    code: 200,
    message: '注册成功',
    data: {
      id: Date.now(),
      username: username,
      email: email || username + '@example.com'
    }
  });
});

app.get('/api/user/profile', (req, res) => {
  res.json({
    code: 200,
    message: '获取用户信息成功',
    data: {
      id: 1,
      username: 'demo_user',
      email: 'demo@example.com',
      avatar: 'https://via.placeholder.com/100x100'
    }
  });
});

// 模拟照片处理API
app.post('/api/photo/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      code: 400,
      message: '请选择要上传的文件'
    });
  }

  // 模拟图片处理
  const imageId = 'img_' + Date.now();
  
  res.json({
    code: 200,
    message: '图片上传成功',
    data: {
      imageId: imageId,
      originalUrl: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size
    }
  });
});

app.post('/api/photo/process', (req, res) => {
  const { imageId, size, backgroundColor, dpi } = req.body;
  
  // 模拟处理延迟
  setTimeout(() => {
    res.json({
      code: 200,
      message: '证件照处理成功',
      data: {
        imageId: imageId,
        processedUrl: 'https://via.placeholder.com/295x413/FF0000/FFFFFF?text=证件照',
        thumbnailUrl: 'https://via.placeholder.com/150x200/FF0000/FFFFFF?text=缩略图',
        size: size || '1寸',
        backgroundColor: backgroundColor || '#FFFFFF',
        dpi: dpi || 300,
        width: 295,
        height: 413
      }
    });
  }, 2000); // 模拟2秒处理时间
});

app.get('/api/photo/download/:imageId', (req, res) => {
  const { imageId } = req.params;
  
  res.json({
    code: 200,
    message: '获取下载链接成功',
    data: {
      downloadUrl: 'https://via.placeholder.com/295x413/0000FF/FFFFFF?text=下载图片',
      expiresAt: Date.now() + 3600000 // 1小时后过期
    }
  });
});

app.get('/api/photo/history', (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  
  // 模拟历史记录
  const mockHistory = [];
  for (let i = 0; i < 5; i++) {
    mockHistory.push({
      id: 'history_' + (Date.now() - i * 86400000),
      imageId: 'img_' + (Date.now() - i * 86400000),
      thumbnailUrl: 'https://via.placeholder.com/150x200/00FF00/FFFFFF?text=历史' + (i + 1),
      size: ['1寸', '2寸', '护照'][i % 3],
      backgroundColor: ['#FFFFFF', '#FF0000', '#0000FF'][i % 3],
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      status: 'completed'
    });
  }
  
  res.json({
    code: 200,
    message: '获取历史记录成功',
    data: {
      list: mockHistory,
      total: mockHistory.length,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    }
  });
});

// 模拟模板API
app.get('/api/template/list', (req, res) => {
  const { category } = req.query;
  
  const mockTemplates = [
    {
      id: 'template_1',
      name: '标准证件照',
      category: 'standard',
      thumbnail: 'https://via.placeholder.com/200x280/CCCCCC/000000?text=标准证件照',
      sizes: ['1寸', '2寸'],
      description: '适用于身份证、护照等标准证件照'
    },
    {
      id: 'template_2', 
      name: '签证照片',
      category: 'visa',
      thumbnail: 'https://via.placeholder.com/200x280/DDDDDD/000000?text=签证照片',
      sizes: ['签证'],
      description: '符合各国签证要求的照片规格'
    }
  ];
  
  res.json({
    code: 200,
    message: '获取模板列表成功',
    data: mockTemplates
  });
});

app.get('/api/template/detail/:templateId', (req, res) => {
  const { templateId } = req.params;
  
  res.json({
    code: 200,
    message: '获取模板详情成功',
    data: {
      id: templateId,
      name: '标准证件照',
      description: '适用于身份证、护照等标准证件照',
      thumbnail: 'https://via.placeholder.com/200x280/CCCCCC/000000?text=模板详情',
      sizes: ['1寸', '2寸', '小1寸', '小2寸'],
      backgroundColors: ['#FFFFFF', '#FF0000', '#0000FF', '#C0C0C0'],
      requirements: [
        '正面免冠照片',
        '表情自然，双眼睁开',
        '背景纯色，无阴影',
        '着装整洁'
      ]
    }
  });
});

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 API服务器已启动`);
  console.log(`📍 地址: http://127.0.0.1:${PORT}`);
  console.log(`📋 健康检查: http://127.0.0.1:${PORT}/health`);
  console.log(`\n📚 可用的API端点:`);
  console.log(`   POST /api/user/login - 用户登录`);
  console.log(`   POST /api/user/register - 用户注册`);
  console.log(`   GET  /api/user/profile - 获取用户信息`);
  console.log(`   POST /api/photo/upload - 上传图片`);
  console.log(`   POST /api/photo/process - 处理证件照`);
  console.log(`   GET  /api/photo/download/:imageId - 下载图片`);
  console.log(`   GET  /api/photo/history - 获取历史记录`);
  console.log(`   GET  /api/template/list - 获取模板列表`);
  console.log(`   GET  /api/template/detail/:id - 获取模板详情`);
  console.log(`\n💡 请将config.ts中的host改为: http://127.0.0.1:${PORT}/`);
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在'
  });
});