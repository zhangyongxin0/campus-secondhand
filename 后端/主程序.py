from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import sqlite3
import hashlib
import re
import os
import json
import base64
from datetime import datetime
import requests  # 新增导入

app = Flask(__name__)
CORS(app)

# 数据库文件路径
DB_PATH = '校园二手交易.db'

# 百度AI配置
BAIDU_AI_CONFIG = {
    'API_KEY': 'r0lIFD6lE9HuI2lyQw3G13lK',
    'SECRET_KEY': 'Nx6szrbn5CVsX5zx7lSWy9tJJpHaK5jK'
}

def init_db():
    """初始化数据库"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 创建用户表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id VARCHAR(20) UNIQUE NOT NULL,
            password VARCHAR(64) NOT NULL,
            name VARCHAR(50) NOT NULL,
            college VARCHAR(50),
            major VARCHAR(50),
            email VARCHAR(100),
            phone VARCHAR(20),
            created_time DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 创建商品表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS products (
            product_id INTEGER PRIMARY KEY AUTOINCREMENT,
            seller_id INTEGER NOT NULL,
            title VARCHAR(100) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            category_id INTEGER,
            condition VARCHAR(20),
            status VARCHAR(20) DEFAULT '已发布',
            images TEXT,
            created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (seller_id) REFERENCES users (user_id)
        )
    ''')
    
    # 创建分类表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_name VARCHAR(50) UNIQUE NOT NULL,
            parent_id INTEGER,
            created_time DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 创建收藏表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS favorites (
            favorite_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (product_id) REFERENCES products(product_id),
            UNIQUE(user_id, product_id)
        )
    ''')
    
    # 创建留言表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS comments (
            comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            parent_id INTEGER,
            status VARCHAR(20) DEFAULT '正常',
            created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (product_id) REFERENCES products(product_id)
        )
    ''')
    
    # 创建搜索关键词表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS search_keywords (
            keyword_id INTEGER PRIMARY KEY AUTOINCREMENT,
            keyword VARCHAR(100) NOT NULL,
            search_count INTEGER DEFAULT 1,
            last_searched DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_time DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 插入默认分类数据
    cursor.execute('''
        INSERT OR IGNORE INTO categories (category_name) VALUES 
        ('图书资料'), ('数码产品'), ('生活用品'), ('服饰鞋包'), ('运动器材'), ('其他')
    ''')
    
    conn.commit()
    conn.close()
    print("数据库初始化完成！")

# ==================== 百度AI代理路由 ====================

@app.route('/api/baidu-ai/token', methods=['POST'])
def get_baidu_ai_token():
    """百度AI获取访问令牌代理接口"""
    try:
        print("正在获取百度AI访问令牌...")
        
        # 调用百度AI获取token的接口
        url = "https://aip.baidubce.com/oauth/2.0/token"
        params = {
            'grant_type': 'client_credentials',
            'client_id': BAIDU_AI_CONFIG['API_KEY'],
            'client_secret': BAIDU_AI_CONFIG['SECRET_KEY']
        }
        
        response = requests.post(url, params=params, timeout=10)
        data = response.json()
        
        print("百度AI Token 响应:", data)
        
        if 'error' in data:
            return jsonify({
                'success': False,
                'error': data['error_description']
            }), 400
        
        return jsonify({
            'success': True,
            'data': data
        })
        
    except requests.exceptions.Timeout:
        print("百度AI Token 请求超时")
        return jsonify({
            'success': False,
            'error': '请求超时，请稍后重试'
        }), 500
    except Exception as e:
        print("百度AI Token 获取失败:", str(e))
        return jsonify({
            'success': False,
            'error': f'获取token失败: {str(e)}'
        }), 500

@app.route('/api/baidu-ai/recognize', methods=['POST'])
def recognize_product():
    """百度AI图像识别代理接口 - 使用已开通的通用物体识别"""
    try:
        data = request.json
        access_token = data.get('access_token')
        image_base64 = data.get('image')
        
        print("=== 开始图像识别 ===")
        print("接收到的access_token长度:", len(access_token) if access_token else 0)
        print("接收到的image_base64长度:", len(image_base64) if image_base64 else 0)
        
        if not access_token or not image_base64:
            return jsonify({
                'success': False,
                'error': '缺少必要参数: access_token 或 image'
            }), 400
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        # 使用已开通的通用物体识别服务
        url = "https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general"
        api_name = "通用物体识别"
        
        print(f"正在调用百度AI {api_name} 接口...")
        payload = f"image={image_base64}"
        
        response = requests.post(url, params={'access_token': access_token}, data=payload, headers=headers, timeout=30)
        result = response.json()
        
        print("百度AI识别响应状态:", response.status_code)
        print(f"{api_name} 结果:", result)
        
        # 检查识别结果
        if 'error_code' in result:
            error_msg = result.get('error_msg', '识别失败')
            error_code = result.get('error_code', '未知')
            print(f"❌ {api_name} 失败: {error_msg} (代码: {error_code})")
            
            return jsonify({
                'success': False,
                'error': f'{error_msg} (错误码: {error_code})',
                'error_code': error_code
            }), 400
        
        # 识别成功
        print(f"✅ {api_name} 成功，识别到 {len(result.get('result', []))} 个物体")
        return jsonify({
            'success': True,
            'data': result,
            'api_used': 'advanced_general'
        })
        
    except requests.exceptions.Timeout:
        print("❌ 百度AI识别请求超时")
        return jsonify({
            'success': False,
            'error': '识别请求超时，请稍后重试'
        }), 500
    except Exception as e:
        print(f"❌ 百度AI识别失败: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': f'识别失败: {str(e)}'
        }), 500
@app.route('/api/baidu-ai/test', methods=['GET'])
def test_ai_service():
    """测试AI服务状态"""
    try:
        print("测试AI服务连接...")
        
        # 先获取token测试连接
        url = "https://aip.baidubce.com/oauth/2.0/token"
        params = {
            'grant_type': 'client_credentials',
            'client_id': BAIDU_AI_CONFIG['API_KEY'],
            'client_secret': BAIDU_AI_CONFIG['SECRET_KEY']
        }
        
        response = requests.post(url, params=params, timeout=10)
        data = response.json()
        
        if 'access_token' in data:
            return jsonify({
                'success': True,
                'connected': True,
                'message': 'AI服务连接正常',
                'token': '已获取'
            })
        else:
            return jsonify({
                'success': False,
                'connected': False,
                'message': data.get('error_description', '认证失败')
            }), 400
            
    except requests.exceptions.Timeout:
        return jsonify({
            'success': False,
            'connected': False,
            'message': '连接超时'
        }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'connected': False,
            'message': str(e)
        }), 500

# ==================== 基础路由 ====================

@app.route('/')
def hello():
    return jsonify({
        "message": "校园二手平台后端启动成功！",
        "ai_service": "百度AI代理服务已启用",
        "endpoints": {
            "ai_token": "/api/baidu-ai/token",
            "ai_recognize": "/api/baidu-ai/recognize", 
            "ai_test": "/api/baidu-ai/test"
        }
    })

@app.route('/api/test')
def test():
    return jsonify({
        "status": "success", 
        "data": "后端API测试成功！",
        "environment": "Python + Flask",
        "ai_config": {
            "has_api_key": bool(BAIDU_AI_CONFIG['API_KEY']),
            "has_secret_key": bool(BAIDU_AI_CONFIG['SECRET_KEY'])
        }
    })

# ==================== 用户模块 ====================

@app.route('/api/user/register', methods=['POST'])
def register():
    """用户注册接口"""
    data = request.json
    
    # 学号格式验证（10位数字）
    student_id = data.get('student_id', '')
    if not re.match(r'^\d{10}$', student_id):
        return jsonify({
            "success": False,
            "message": "学号必须为10位数字"
        }), 400
    
    # 密码强度验证
    password = data.get('password', '')
    if len(password) < 6 or not re.match(r'^(?=.*[A-Za-z])(?=.*\d)', password):
        return jsonify({
            "success": False,
            "message": "密码需至少6位且包含字母和数字"
        }), 400
    
    # 连接数据库
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 学号唯一性检查
    cursor.execute('SELECT * FROM users WHERE student_id = ?', (student_id,))
    if cursor.fetchone():
        conn.close()
        return jsonify({
            "success": False,
            "message": "该学号已注册"
        }), 400
    
    # 密码加密
    encrypted_pwd = hashlib.sha256(password.encode()).hexdigest()
    
    # 插入用户数据
    try:
        cursor.execute('''
            INSERT INTO users (student_id, password, name, college, major, email, phone)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (student_id, encrypted_pwd, data.get('name'), 
              data.get('college'), data.get('major'), 
              data.get('email'), data.get('phone')))
        
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            "success": True,
            "user_id": user_id,
            "message": "注册成功！"
        })
    except Exception as e:
        conn.close()
        return jsonify({
            "success": False,
            "message": f"注册失败: {str(e)}"
        }), 500

@app.route('/api/user/login', methods=['POST'])
def login():
    """用户登录接口"""
    data = request.json
    student_id = data.get('student_id')
    password = data.get('password')
    
    # 参数验证
    if not student_id or not password:
        return jsonify({
            "success": False,
            "message": "学号和密码不能为空"
        }), 400
    
    # 密码加密
    encrypted_pwd = hashlib.sha256(password.encode()).hexdigest()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 查询用户
    cursor.execute('''
        SELECT user_id, student_id, name, college, major, email, phone 
        FROM users WHERE student_id = ? AND password = ?
    ''', (student_id, encrypted_pwd))
    
    user = cursor.fetchone()
    conn.close()
    
    if user:
        # 登录成功
        user_info = {
            "user_id": user[0],
            "student_id": user[1],
            "name": user[2],
            "college": user[3],
            "major": user[4],
            "email": user[5],
            "phone": user[6]
        }
        
        return jsonify({
            "success": True,
            "token": f"token_{user[0]}_{datetime.now().timestamp()}",
            "user_info": user_info,
            "message": "登录成功"
        })
    else:
        return jsonify({
            "success": False,
            "message": "学号或密码错误"
        }), 401

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user_info(user_id):
    """获取用户信息接口"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT user_id, student_id, name, college, major, email, phone, created_time
        FROM users WHERE user_id = ?
    ''', (user_id,))
    
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return jsonify({
            "success": False,
            "message": "用户不存在"
        }), 404
    
    user_info = {
        "user_id": user[0],
        "student_id": user[1],
        "name": user[2],
        "college": user[3],
        "major": user[4],
        "email": user[5],
        "phone": user[6],
        "created_time": user[7]
    }
    
    return jsonify({
        "success": True,
        "user_info": user_info
    })

@app.route('/api/user/profile', methods=['PUT'])
def update_profile():
    """更新用户资料接口"""
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({
            "success": False,
            "message": "用户ID不能为空"
        }), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 构建更新字段
        update_fields = []
        update_values = []
        
        allowed_fields = ['name', 'college', 'major', 'email', 'phone']
        for field in allowed_fields:
            if field in data:
                update_fields.append(f"{field} = ?")
                update_values.append(data[field])
        
        if not update_fields:
            conn.close()
            return jsonify({
                "success": False,
                "message": "没有可更新的字段"
            }), 400
        
        update_values.append(user_id)
        update_query = f"UPDATE users SET {', '.join(update_fields)} WHERE user_id = ?"
        
        cursor.execute(update_query, update_values)
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "资料更新成功"
        })
        
    except Exception as e:
        conn.close()
        return jsonify({
            "success": False,
            "message": f"资料更新失败: {str(e)}"
        }), 500

# ==================== 商品模块 ====================

@app.route('/api/product/publish', methods=['POST'])
def publish_product():
    """发布商品接口"""
    data = request.json
    
    # 参数验证
    required_fields = ['seller_id', 'title', 'price']
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "success": False,
                "message": f"缺少必要字段: {field}"
            }), 400
    
    # 价格验证
    try:
        price = float(data.get('price'))
        if price <= 0 or price > 99999:
            return jsonify({
                "success": False,
                "message": "价格必须在0.01元至99999元之间"
            }), 400
    except ValueError:
        return jsonify({
            "success": False,
            "message": "价格格式错误"
        }), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 插入商品数据
        cursor.execute('''
            INSERT INTO products (seller_id, title, description, price, category_id, condition, images)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            data.get('seller_id'),
            data.get('title'),
            data.get('description', ''),
            price,
            data.get('category_id'),
            data.get('condition', '九成新'),
            json.dumps(data.get('images', []))
        ))
        
        conn.commit()
        product_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            "success": True,
            "product_id": product_id,
            "message": "商品发布成功！"
        })
        
    except Exception as e:
        conn.close()
        return jsonify({
            "success": False,
            "message": f"商品发布失败: {str(e)}"
        }), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    """获取商品列表接口"""
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', 10, type=int)
    category_id = request.args.get('category_id')
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 构建查询条件
    where_conditions = ["p.status = '已发布'"]
    params = []
    
    if category_id:
        where_conditions.append("p.category_id = ?")
        params.append(category_id)
    
    where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"
    
    # 查询商品总数
    cursor.execute(f'SELECT COUNT(*) FROM products p WHERE {where_clause}', params)
    total_count = cursor.fetchone()[0]
    
    # 查询商品列表
    offset = (page - 1) * page_size
    cursor.execute(f'''
        SELECT p.*, u.name as seller_name, u.student_id as seller_student_id,
               c.category_name
        FROM products p
        LEFT JOIN users u ON p.seller_id = u.user_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE {where_clause}
        ORDER BY p.created_time DESC
        LIMIT ? OFFSET ?
    ''', params + [page_size, offset])
    
    products = cursor.fetchall()
    conn.close()
    
    # 格式化返回数据
    product_list = []
    for product in products:
        product_list.append({
            "product_id": product[0],
            "seller_id": product[1],
            "title": product[2],
            "description": product[3],
            "price": float(product[4]),
            "category_id": product[5],
            "condition": product[6],
            "status": product[7],
            "images": json.loads(product[8]) if product[8] else [],
            "created_time": product[9],
            "seller_name": product[11],
            "seller_student_id": product[12],
            "category_name": product[13]
        })
    
    return jsonify({
        "success": True,
        "products": product_list,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size,
        "current_page": page
    })

@app.route('/api/categories', methods=['GET'])
def get_categories():
    """获取分类列表接口"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT category_id, category_name FROM categories ORDER BY category_id')
    categories = cursor.fetchall()
    conn.close()
    
    category_list = [{"category_id": cat[0], "category_name": cat[1]} for cat in categories]
    
    return jsonify({
        "success": True,
        "categories": category_list
    })

@app.route('/api/product/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    """获取商品详情接口"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT p.*, u.name as seller_name, u.student_id as seller_student_id,
               u.college as seller_college, u.phone as seller_phone,
               c.category_name
        FROM products p
        LEFT JOIN users u ON p.seller_id = u.user_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE p.product_id = ?
    ''', (product_id,))
    
    product = cursor.fetchone()
    conn.close()
    
    if not product:
        return jsonify({
            "success": False,
            "message": "商品不存在"
        }), 404
    
    product_detail = {
        "product_id": product[0],
        "seller_id": product[1],
        "title": product[2],
        "description": product[3],
        "price": float(product[4]),
        "category_id": product[5],
        "condition": product[6],
        "status": product[7],
        "images": json.loads(product[8]) if product[8] else [],
        "created_time": product[9],
        "seller_name": product[11],
        "seller_student_id": product[12],
        "seller_college": product[13],
        "seller_phone": product[14],
        "category_name": product[15]
    }
    
    return jsonify({
        "success": True,
        "product": product_detail
    })

@app.route('/api/user/<int:user_id>/products', methods=['GET'])
def get_user_products(user_id):
    """获取用户发布的商品列表"""
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', 10, type=int)
    status = request.args.get('status', '已发布')
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 查询商品总数
    cursor.execute('SELECT COUNT(*) FROM products WHERE seller_id = ? AND status = ?', 
                  (user_id, status))
    total_count = cursor.fetchone()[0]
    
    # 查询商品列表
    offset = (page - 1) * page_size
    cursor.execute('''
        SELECT p.*, c.category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE p.seller_id = ? AND p.status = ?
        ORDER BY p.created_time DESC
        LIMIT ? OFFSET ?
    ''', (user_id, status, page_size, offset))
    
    products = cursor.fetchall()
    conn.close()
    
    # 格式化返回数据
    product_list = []
    for product in products:
        product_list.append({
            "product_id": product[0],
            "seller_id": product[1],
            "title": product[2],
            "description": product[3],
            "price": float(product[4]),
            "category_id": product[5],
            "condition": product[6],
            "status": product[7],
            "images": json.loads(product[8]) if product[8] else [],
            "created_time": product[9],
            "category_name": product[11]
        })
    
    return jsonify({
        "success": True,
        "products": product_list,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size,
        "current_page": page
    })

# ==================== 交易模块 ====================

@app.route('/api/trade/favorite', methods=['POST'])
def add_favorite():
    """收藏商品"""
    data = request.json
    
    # 参数验证
    required_fields = ['user_id', 'product_id']
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "success": False,
                "message": f"缺少必要字段: {field}"
            }), 400
    
    user_id = data.get('user_id')
    product_id = data.get('product_id')
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 检查是否已收藏
        cursor.execute('SELECT * FROM favorites WHERE user_id = ? AND product_id = ?', 
                      (user_id, product_id))
        if cursor.fetchone():
            conn.close()
            return jsonify({
                "success": False,
                "message": "已收藏该商品"
            }), 400
        
        # 添加收藏
        cursor.execute('''
            INSERT INTO favorites (user_id, product_id) 
            VALUES (?, ?)
        ''', (user_id, product_id))
        
        conn.commit()
        favorite_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            "success": True,
            "favorite_id": favorite_id,
            "message": "收藏成功"
        })
        
    except Exception as e:
        conn.close()
        return jsonify({
            "success": False,
            "message": f"收藏失败: {str(e)}"
        }), 500

@app.route('/api/trade/favorite', methods=['DELETE'])
def remove_favorite():
    """取消收藏"""
    data = request.json
    
    user_id = data.get('user_id')
    product_id = data.get('product_id')
    
    if not user_id or not product_id:
        return jsonify({
            "success": False,
            "message": "缺少用户ID或商品ID"
        }), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        cursor.execute('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', 
                      (user_id, product_id))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({
                "success": False,
                "message": "未找到收藏记录"
            }), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "success": True,
            "message": "取消收藏成功"
        })
        
    except Exception as e:
        conn.close()
        return jsonify({
            "success": False,
            "message": f"取消收藏失败: {str(e)}"
        }), 500

@app.route('/api/trade/favorites/<int:user_id>', methods=['GET'])
def get_favorites(user_id):
    """获取用户收藏列表"""
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', 10, type=int)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 查询收藏总数
    cursor.execute('SELECT COUNT(*) FROM favorites WHERE user_id = ?', (user_id,))
    total_count = cursor.fetchone()[0]
    
    # 查询收藏列表
    offset = (page - 1) * page_size
    cursor.execute('''
        SELECT p.*, u.name as seller_name, c.category_name, f.created_time as favorite_time
        FROM favorites f
        JOIN products p ON f.product_id = p.product_id
        JOIN users u ON p.seller_id = u.user_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE f.user_id = ? AND p.status = '已发布'
        ORDER BY f.created_time DESC
        LIMIT ? OFFSET ?
    ''', (user_id, page_size, offset))
    
    favorites = cursor.fetchall()
    conn.close()
    
    # 格式化返回数据
    favorite_list = []
    for fav in favorites:
        favorite_list.append({
            "product_id": fav[0],
            "seller_id": fav[1],
            "title": fav[2],
            "description": fav[3],
            "price": float(fav[4]),
            "category_id": fav[5],
            "condition": fav[6],
            "status": fav[7],
            "images": json.loads(fav[8]) if fav[8] else [],
            "created_time": fav[9],
            "seller_name": fav[11],
            "category_name": fav[12],
            "favorite_time": fav[13]
        })
    
    return jsonify({
        "success": True,
        "favorites": favorite_list,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size,
        "current_page": page
    })

@app.route('/api/trade/favorite/check', methods=['GET'])
def check_favorite():
    """检查用户是否已收藏商品"""
    user_id = request.args.get('user_id', type=int)
    product_id = request.args.get('product_id', type=int)
    
    if not user_id or not product_id:
        return jsonify({
            "success": False,
            "message": "缺少用户ID或商品ID"
        }), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM favorites WHERE user_id = ? AND product_id = ?', 
                  (user_id, product_id))
    is_favorited = cursor.fetchone() is not None
    
    conn.close()
    
    return jsonify({
        "success": True,
        "is_favorited": is_favorited
    })

@app.route('/api/trade/comment', methods=['POST'])
def add_comment():
    """添加留言"""
    data = request.json
    
    # 参数验证
    required_fields = ['user_id', 'product_id', 'content']
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "success": False,
                "message": f"缺少必要字段: {field}"
            }), 400
    
    user_id = data.get('user_id')
    product_id = data.get('product_id')
    content = data.get('content')
    parent_id = data.get('parent_id')
    
    # 内容长度验证
    if len(content) > 500:
        return jsonify({
            "success": False,
            "message": "留言内容不能超过500个字符"
        }), 400
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 添加留言
        cursor.execute('''
            INSERT INTO comments (user_id, product_id, content, parent_id)
            VALUES (?, ?, ?, ?)
        ''', (user_id, product_id, content, parent_id))
        
        conn.commit()
        comment_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            "success": True,
            "comment_id": comment_id,
            "message": "留言成功"
        })
        
    except Exception as e:
        conn.close()
        return jsonify({
            "success": False,
            "message": f"留言失败: {str(e)}"
        }), 500

@app.route('/api/trade/comments/<int:product_id>', methods=['GET'])
def get_comments(product_id):
    """获取商品留言列表"""
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', 10, type=int)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 查询留言总数
    cursor.execute('SELECT COUNT(*) FROM comments WHERE product_id = ? AND status = "正常"', (product_id,))
    total_count = cursor.fetchone()[0]
    
    # 查询留言列表
    offset = (page - 1) * page_size
    cursor.execute('''
        SELECT c.*, u.name as user_name, u.student_id as user_student_id
        FROM comments c
        JOIN users u ON c.user_id = u.user_id
        WHERE c.product_id = ? AND c.status = '正常'
        ORDER BY c.created_time DESC
        LIMIT ? OFFSET ?
    ''', (product_id, page_size, offset))
    
    comments = cursor.fetchall()
    conn.close()
    
    # 格式化返回数据
    comment_list = []
    for comment in comments:
        comment_list.append({
            "comment_id": comment[0],
            "user_id": comment[1],
            "product_id": comment[2],
            "content": comment[3],
            "parent_id": comment[4],
            "status": comment[5],
            "created_time": comment[6],
            "user_name": comment[7],
            "user_student_id": comment[8]
        })
    
    return jsonify({
        "success": True,
        "comments": comment_list,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size,
        "current_page": page
    })

# ==================== 搜索模块 ====================

@app.route('/api/search', methods=['GET'])
def search_products():
    """关键词搜索商品"""
    keyword = request.args.get('keyword', '')
    category_id = request.args.get('category_id')
    sort_by = request.args.get('sort_by', 'time')
    page = request.args.get('page', 1, type=int)
    page_size = request.args.get('page_size', 10, type=int)
    
    if not keyword:
        return jsonify({
            "success": False,
            "message": "搜索关键词不能为空"
        }), 400
    
    # 记录搜索关键词
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # 更新搜索次数
        cursor.execute('''
            INSERT INTO search_keywords (keyword, search_count, last_searched)
            VALUES (?, 1, CURRENT_TIMESTAMP)
            ON CONFLICT(keyword) DO UPDATE SET
            search_count = search_count + 1,
            last_searched = CURRENT_TIMESTAMP
        ''', (keyword,))
        conn.commit()
    except Exception as e:
        print(f"记录搜索关键词失败: {e}")
    
    # 构建查询条件
    where_conditions = ["p.status = '已发布'"]
    params = []
    
    # 关键词搜索条件
    if keyword:
        where_conditions.append("(p.title LIKE ? OR p.description LIKE ?)")
        params.extend([f'%{keyword}%', f'%{keyword}%'])
    
    # 分类筛选条件
    if category_id:
        where_conditions.append("p.category_id = ?")
        params.append(category_id)
    
    where_clause = " AND ".join(where_conditions)
    
    # 排序方式
    order_by = "p.created_time DESC"
    if sort_by == 'price_asc':
        order_by = "p.price ASC"
    elif sort_by == 'price_desc':
        order_by = "p.price DESC"
    
    # 查询商品总数
    cursor.execute(f'SELECT COUNT(*) FROM products p WHERE {where_clause}', params)
    total_count = cursor.fetchone()[0]
    
    # 查询商品列表
    offset = (page - 1) * page_size
    cursor.execute(f'''
        SELECT p.*, u.name as seller_name, u.student_id as seller_student_id,
               c.category_name
        FROM products p
        LEFT JOIN users u ON p.seller_id = u.user_id
        LEFT JOIN categories c ON p.category_id = c.category_id
        WHERE {where_clause}
        ORDER BY {order_by}
        LIMIT ? OFFSET ?
    ''', params + [page_size, offset])
    
    products = cursor.fetchall()
    conn.close()
    
    # 格式化返回数据
    product_list = []
    for product in products:
        product_list.append({
            "product_id": product[0],
            "seller_id": product[1],
            "title": product[2],
            "description": product[3],
            "price": float(product[4]),
            "category_id": product[5],
            "condition": product[6],
            "status": product[7],
            "images": json.loads(product[8]) if product[8] else [],
            "created_time": product[9],
            "seller_name": product[11],
            "seller_student_id": product[12],
            "category_name": product[13]
        })
    
    return jsonify({
        "success": True,
        "products": product_list,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size,
        "current_page": page,
        "keyword": keyword
    })

@app.route('/api/search/recommend', methods=['GET'])
def get_search_recommend():
    """获取热门搜索推荐"""
    limit = request.args.get('limit', 10, type=int)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT keyword, search_count 
        FROM search_keywords 
        ORDER BY search_count DESC, last_searched DESC 
        LIMIT ?
    ''', (limit,))
    
    keywords = cursor.fetchall()
    conn.close()
    
    keyword_list = [{"keyword": kw[0], "search_count": kw[1]} for kw in keywords]
    
    return jsonify({
        "success": True,
        "keywords": keyword_list
    })

# ==================== 初始化与启动 ====================

# 初始化数据库
init_db()

if __name__ == '__main__':
    print("启动校园二手平台后端服务...")
    print("访问 http://localhost:5000 测试首页")
    print("访问 http://localhost:5000/api/test 测试API")
    print("访问 http://localhost:5000/api/categories 测试分类接口")
    print("访问 http://localhost:5000/api/products 测试商品接口")
    print("访问 http://localhost:5000/api/search?keyword=电脑 测试搜索接口")
    print("访问 http://localhost:5000/api/trade/favorites/1 测试收藏接口")
    print("\n=== 百度AI代理服务 ===")
    print("访问 POST http://localhost:5000/api/baidu-ai/token 获取AI令牌")
    print("访问 POST http://localhost:5000/api/baidu-ai/recognize 商品识别")
    print("访问 GET http://localhost:5000/api/baidu-ai/test 测试AI服务")
    app.run(debug=True, port=5000)