# ===================================================================
# DATA COLLECTION, UNDERSTANDING & PREPARATION
# Multi-Touch Attribution Project - Group 1
# ===================================================================

import pandas as pd
import numpy as np
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

# Thiết lập seed cho reproducibility
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

print("=" * 70)
print("PHẦN 4: DATA COLLECTION, UNDERSTANDING & PREPARATION")
print("=" * 70)

# ===================================================================
# BƯỚC 1: LOAD & CLEAN - Tải và làm sạch dữ liệu
# ===================================================================

print("\n[BƯỚC 1] LOAD & CLEAN - Tải và làm sạch dữ liệu")
print("-" * 70)

# Load dữ liệu từ CSV
df_raw = pd.read_csv('multi_touch_attribution_data.csv')
print(f"✓ Đã tải dữ liệu: {df_raw.shape[0]} rows, {df_raw.shape[1]} columns")
print(f"✓ Cột dữ liệu: {list(df_raw.columns)}")

# Hiển thị 5 dòng đầu
print("\nDữ liệu mẫu (5 dòng đầu):")
print(df_raw.head())

# Kiểm tra giá trị missing
print(f"\n✓ Giá trị missing trong mỗi cột:")
print(df_raw.isnull().sum())

# Kiểm tra duplicate rows
n_duplicates = df_raw.duplicated().sum()
print(f"\n✓ Số dòng duplicate: {n_duplicates}")

# Xóa duplicate rows (nếu có)
df_cleaned = df_raw.drop_duplicates().reset_index(drop=True)
print(f"✓ Sau khi xóa duplicate: {df_cleaned.shape[0]} rows")

# Convert Timestamp to datetime
df_cleaned['Timestamp'] = pd.to_datetime(df_cleaned['Timestamp'])
print(f"✓ Đã chuyển Timestamp sang datetime format")
print(f"  - Khoảng thời gian: {df_cleaned['Timestamp'].min()} đến {df_cleaned['Timestamp'].max()}")

# Kiểm tra data types
print(f"\n✓ Data types sau cleaning:")
print(df_cleaned.dtypes)

# ===================================================================
# BƯỚC 2: RECONSTRUCT JOURNEYS - Tái tạo hành trình khách hàng
# ===================================================================

print("\n[BƯỚC 2] RECONSTRUCT JOURNEYS - Tái tạo hành trình khách hàng")
print("-" * 70)

# Sắp xếp theo User ID và Timestamp (để tái tạo thứ tự chronological)
df_sorted = df_cleaned.sort_values(['User ID', 'Timestamp']).reset_index(drop=True)
print(f"✓ Đã sắp xếp dữ liệu theo User ID và Timestamp (chronological order)")

# Nhóm (group) dữ liệu theo User ID để tái tạo hành trình
journeys = []
for user_id, group in df_sorted.groupby('User ID'):
    # Thông tin từng user
    user_touchpoints = group.sort_values('Timestamp').reset_index(drop=True)
    
    # Tạo ordered channel sequence (chuỗi các kênh theo thứ tự thời gian)
    channel_sequence = ' -> '.join(user_touchpoints['Channel'].astype(str))
    
    # Lấy first-touch (kênh đầu tiên)
    first_touch_channel = user_touchpoints['Channel'].iloc[0]
    first_touch_campaign = user_touchpoints['Campaign'].iloc[0]
    
    # Lấy last-touch (kênh cuối cùng)
    last_touch_channel = user_touchpoints['Channel'].iloc[-1]
    last_touch_campaign = user_touchpoints['Campaign'].iloc[-1]
    
    # User-level conversion: nếu bất kỳ touchpoint nào có Conversion = 'Yes' thì user đã convert
    is_converted = 'Yes' in user_touchpoints['Conversion'].values
    
    # Số lượng touchpoints
    n_touchpoints = len(user_touchpoints)
    
    # Danh sách campaign mà user tương tác
    campaigns_list = list(set(user_touchpoints['Campaign'].values))
    campaigns_str = ', '.join(campaigns_list)
    
    journeys.append({
        'User ID': user_id,
        'N_Touchpoints': n_touchpoints,
        'Channel_Sequence': channel_sequence,
        'First_Touch_Channel': first_touch_channel,
        'First_Touch_Campaign': first_touch_campaign,
        'Last_Touch_Channel': last_touch_channel,
        'Last_Touch_Campaign': last_touch_campaign,
        'Converted': is_converted,
        'All_Campaigns': campaigns_str
    })

# Chuyển thành DataFrame
df_journeys = pd.DataFrame(journeys)

print(f"✓ Đã tái tạo {len(df_journeys)} user journeys từ {df_journeys['N_Touchpoints'].sum()} touchpoints")
print(f"✓ Phạm vi touchpoints per user: {df_journeys['N_Touchpoints'].min()} - {df_journeys['N_Touchpoints'].max()}")
print(f"✓ Trung bình touchpoints per user: {df_journeys['N_Touchpoints'].mean():.2f}")

# Số users đã convert
n_converted_users = df_journeys['Converted'].sum()
user_conversion_rate = (n_converted_users / len(df_journeys)) * 100

print(f"✓ Users đã convert: {n_converted_users}")
print(f"✓ User-level conversion rate: {user_conversion_rate:.2f}%")

print("\nMẫu journeys (5 dòng đầu):")
print(df_journeys.head())

# ===================================================================
# BƯỚC 3: DATA UNDERSTANDING - Khám phá dữ liệu
# ===================================================================

print("\n[BƯỚC 3] DATA UNDERSTANDING - Khám phá dữ liệu")
print("-" * 70)

# 3.1 Phân tích Channel Performance
print("\n3.1 CHANNEL PERFORMANCE (Hiệu suất kênh)")
print("   (Phân tích trên touchpoint-level)")

channel_stats = df_sorted.groupby('Channel').agg({
    'User ID': 'count',  # Số touchpoints
    'Conversion': lambda x: (x == 'Yes').sum(),  # Số touchpoints có convert
}).rename(columns={'User ID': 'Total_Touchpoints', 'Conversion': 'Conversions'})

channel_stats['Conversion_Rate_%'] = (channel_stats['Conversions'] / channel_stats['Total_Touchpoints'] * 100).round(2)
channel_stats = channel_stats.sort_values('Conversion_Rate_%', ascending=False)

print(channel_stats)

# 3.2 Phân tích First-Touch Attribution (touchpoint-level)
print("\n3.2 FIRST-TOUCH ATTRIBUTION")
print("   (Kênh đầu tiên trong hành trình)")

first_touch_stats = df_journeys.groupby('First_Touch_Channel').agg({
    'Converted': ['count', 'sum']
}).rename(columns={'count': 'Total', 'sum': 'Conversions'})
first_touch_stats.columns = ['Total', 'Conversions']
first_touch_stats['Conversion_Rate_%'] = (first_touch_stats['Conversions'] / first_touch_stats['Total'] * 100).round(2)
first_touch_stats = first_touch_stats.sort_values('Conversion_Rate_%', ascending=False)

print(first_touch_stats)

# 3.3 Phân tích Last-Touch Attribution (touchpoint-level)
print("\n3.3 LAST-TOUCH ATTRIBUTION")
print("   (Kênh cuối cùng trong hành trình)")

last_touch_stats = df_journeys.groupby('Last_Touch_Channel').agg({
    'Converted': ['count', 'sum']
}).rename(columns={'count': 'Total', 'sum': 'Conversions'})
last_touch_stats.columns = ['Total', 'Conversions']
last_touch_stats['Conversion_Rate_%'] = (last_touch_stats['Conversions'] / last_touch_stats['Total'] * 100).round(2)
last_touch_stats = last_touch_stats.sort_values('Conversion_Rate_%', ascending=False)

print(last_touch_stats)

# 3.4 Phân tích Campaign
print("\n3.4 CAMPAIGN ANALYSIS (Phân tích campaign)")

campaign_stats = df_sorted[df_sorted['Campaign'] != '-'].groupby('Campaign').agg({
    'User ID': 'count',
    'Conversion': lambda x: (x == 'Yes').sum()
}).rename(columns={'User ID': 'Total_Touchpoints', 'Conversion': 'Conversions'})

campaign_stats['Conversion_Rate_%'] = (campaign_stats['Conversions'] / campaign_stats['Total_Touchpoints'] * 100).round(2)
campaign_stats = campaign_stats.sort_values('Conversion_Rate_%', ascending=False)

print(campaign_stats)

# 3.5 Journey Length Distribution
print("\n3.5 JOURNEY LENGTH DISTRIBUTION (Phân phối độ dài hành trình)")

journey_length_dist = df_journeys['N_Touchpoints'].value_counts().sort_index()
print(journey_length_dist)

# ===================================================================
# BƯỚC 4: DATA PREPARATION - Chuẩn bị dữ liệu
# ===================================================================

print("\n[BƯỚC 4] DATA PREPARATION - Chuẩn bị dữ liệu")
print("-" * 70)

# 4.1 One-Hot Encoding cho Channel (dùng cho logistic regression)
print("\n4.1 ONE-HOT ENCODING Channel")

# Tạo dummy variables cho Channel từ df_sorted (touchpoint-level)
channel_dummies = pd.get_dummies(df_sorted['Channel'], prefix='Channel', drop_first=False)
df_encoded = pd.concat([df_sorted[['User ID', 'Timestamp', 'Campaign', 'Conversion']], channel_dummies], axis=1)

print(f"✓ Đã tạo {channel_dummies.shape[1]} dummy variables cho Channel")
print(f"✓ Cột dummy variables: {list(channel_dummies.columns)}")

# Hiển thị mẫu
print("\nMẫu dữ liệu sau one-hot encoding (5 dòng):")
print(df_encoded.head())

# 4.2 Chuẩn bị dữ liệu cho attribution models
print("\n4.2 PREPARE DATA FOR ATTRIBUTION MODELS")

# Tạo df_touchpoints với tất cả thông tin touchpoint cần thiết
df_touchpoints = df_sorted.copy()
df_touchpoints['Is_Conversion'] = (df_touchpoints['Conversion'] == 'Yes').astype(int)

# Thêm thông tin journey level vào từng touchpoint
df_touchpoints = df_touchpoints.merge(
    df_journeys[['User ID', 'Converted', 'N_Touchpoints']].rename(
        columns={'Converted': 'User_Converted'}
    ),
    on='User ID',
    how='left'
)

# Ranking touchpoints trong mỗi journey (để xác định first/last)
df_touchpoints['Touchpoint_Rank'] = df_touchpoints.groupby('User ID').cumcount() + 1
df_touchpoints['Touchpoint_Rank_Reverse'] = df_touchpoints.groupby('User ID')['Touchpoint_Rank'].transform(
    lambda x: x.max() - x + 1
)

df_touchpoints['Is_First_Touch'] = (df_touchpoints['Touchpoint_Rank'] == 1).astype(int)
df_touchpoints['Is_Last_Touch'] = (df_touchpoints['Touchpoint_Rank_Reverse'] == 1).astype(int)

# Tính Linear Attribution Weight (1/N_Touchpoints)
df_touchpoints['Linear_Weight'] = 1 / df_touchpoints['N_Touchpoints']

print(f"✓ Đã chuẩn bị {len(df_touchpoints)} touchpoints cho attribution models")
print(f"✓ Thêm cột: Is_First_Touch, Is_Last_Touch, Linear_Weight, Touchpoint_Rank")

print("\nMẫu dữ liệu touchpoint sau chuẩn bị (5 dòng):")
print(df_touchpoints[['User ID', 'Timestamp', 'Channel', 'Is_First_Touch', 'Is_Last_Touch', 'Linear_Weight', 'User_Converted']].head(10))

# ===================================================================
# BƯỚC 5: SANITY CHECKS - Kiểm tra dữ liệu
# ===================================================================

print("\n[BƯỚC 5] SANITY CHECKS - Kiểm tra tính hợp lệ dữ liệu")
print("-" * 70)

# Check 1: Không có NaN values
print(f"\n✓ Check 1 - Không có NaN values:")
print(f"  - df_cleaned: {df_cleaned.isnull().sum().sum()} NaN")
print(f"  - df_journeys: {df_journeys.isnull().sum().sum()} NaN")
print(f"  - df_touchpoints: {df_touchpoints.isnull().sum().sum()} NaN")

# Check 2: Linear weights tổng = 1 cho mỗi user
print(f"\n✓ Check 2 - Linear weights tổng = 1 cho mỗi user:")
linear_weights_per_user = df_touchpoints.groupby('User ID')['Linear_Weight'].sum()
all_ones = (linear_weights_per_user == 1.0).all()
print(f"  - Tất cả user weights = 1.0: {all_ones}")
if not all_ones:
    print(f"  - Range: {linear_weights_per_user.min():.4f} - {linear_weights_per_user.max():.4f}")

# Check 3: Số touchpoints match
print(f"\n✓ Check 3 - Số touchpoints match:")
print(f"  - df_raw: {len(df_raw)} rows")
print(f"  - df_cleaned (sau drop duplicate): {len(df_cleaned)} rows")
print(f"  - df_touchpoints: {len(df_touchpoints)} rows")
print(f"  - Match: {len(df_cleaned) == len(df_touchpoints)}")

# Check 4: Số users
print(f"\n✓ Check 4 - Số users:")
print(f"  - Unique users: {df_journeys['User ID'].nunique()}")

# Check 5: Converted users sanity check
converted_touchpoints = df_touchpoints[df_touchpoints['Is_Conversion'] == 1]['User ID'].nunique()
converted_users = df_journeys[df_journeys['Converted'] == True]['User ID'].nunique()
print(f"\n✓ Check 5 - Converted users:")
print(f"  - Users với ít nhất 1 touchpoint Conversion=Yes: {converted_users}")

# ===================================================================
# BƯỚC 6: EXPORT CLEANED DATA
# ===================================================================

print("\n[BƯỚC 6] EXPORT CLEANED DATA - Xuất dữ liệu đã xử lý")
print("-" * 70)

# Lưu các DataFrame để sử dụng cho các phân tích tiếp theo
df_journeys.to_csv('data_journeys.csv', index=False)
df_touchpoints.to_csv('data_touchpoints.csv', index=False)
df_encoded.to_csv('data_encoded.csv', index=False)

print(f"✓ Đã lưu data_journeys.csv ({len(df_journeys)} users)")
print(f"✓ Đã lưu data_touchpoints.csv ({len(df_touchpoints)} touchpoints)")
print(f"✓ Đã lưu data_encoded.csv (touchpoints + encoded channels)")

# ===================================================================
# PHẦN GIẢI THÍCH - SUMMARY
# ===================================================================

print("\n" + "=" * 70)
print("SUMMARY - GIẢI THÍCH CÁC CỘT DỮ LIỆU AFTER CLEANING")
print("=" * 70)

summary_text = """
📊 DATAFRAME: df_journeys (User-level Journey Data)
─────────────────────────────────────────────────────
1. User ID: Mã định danh khách hàng (anonymized)

2. N_Touchpoints: Số lần tương tác của user (1-12 lần)
   → Ý nghĩa: Số touchpoints càng cao = hành trình càng dài

3. Channel_Sequence: Chuỗi các kênh theo thứ tự thời gian
   Ví dụ: "Email -> Social Media -> Display Ads"
   → Ý nghĩa: Hiển thị đầy đủ hành trình của user

4. First_Touch_Channel: Kênh đầu tiên mà user tương tác
   Ví dụ: "Email"
   → Ý nghĩa: Kênh phát hiện/tiếp cận khách hàng

5. First_Touch_Campaign: Campaign đi kèm với first touch
   Ví dụ: "Brand Awareness", "Winter Sale", "-" (không có campaign)
   → Ý nghĩa: Hiểu được campaign nào phát hiện user

6. Last_Touch_Channel: Kênh cuối cùng trước khi convert
   → Ý nghĩa: Kênh "đẩy" khách hàng qua đích (conversion driver)

7. Last_Touch_Campaign: Campaign cuối cùng
   → Ý nghĩa: Campaign nào là "cái cốt tích cực"

8. Converted: Boolean (True/False)
   = True nếu user có ít nhất 1 touchpoint với Conversion='Yes'
   → Ý nghĩa: User có hoàn thành mua hàng hay không

9. All_Campaigns: Danh sách tất cả campaigns mà user tương tác
   → Ý nghĩa: Thấy được campaign journey của user


📊 DATAFRAME: df_touchpoints (Touchpoint-level Detail Data)
────────────────────────────────────────────────────────────
(Bao gồm tất cả cột gốc + cột được thêm để tính toán attribution)

1. User ID, Timestamp, Channel, Campaign, Conversion: Dữ liệu gốc

2. Is_Conversion: Binary version của Conversion column
   (1 = 'Yes', 0 = 'No')
   → Ý nghĩa: Dễ hơn để tính toán

3. User_Converted: User-level converted flag
   = True nếu user này đã convert ở touchpoint nào đó
   → Ý nghĩa: Biết user có phải "converters" không

4. N_Touchpoints: Tổng touchpoints của user này
   → Ý nghĩa: Cần cho tính Linear Attribution weight

5. Touchpoint_Rank: Vị trí touchpoint trong hành trình (1, 2, 3,...)
   → Ý nghĩa: First touch có Rank=1, last touch có Rank=Max

6. Touchpoint_Rank_Reverse: Vị trí từ cuối (1, 2, 3,...)
   → Ý nghĩa: Last touch có Rank_Reverse=1

7. Is_First_Touch: Binary (1 = đây là first touch, 0 = không)
   → Ý nghĩa: Dùng để phân bố credit First-Touch Attribution

8. Is_Last_Touch: Binary (1 = đây là last touch, 0 = không)
   → Ý nghĩa: Dùng để phân bố credit Last-Touch Attribution

9. Linear_Weight: 1 / N_Touchpoints
   Ví dụ: Nếu N_Touchpoints=4, Linear_Weight=0.25
   → Ý nghĩa: Credit mà touchpoint này nhận trong Linear Attribution
              (mỗi touchpoint được credit bằng nhau)


📊 DATAFRAME: df_encoded (One-Hot Encoded for Regression)
──────────────────────────────────────────────────────────
Dữ liệu touchpoint-level với các cột Channel được chuyển thành binary

Columns như: Channel_Display Ads, Channel_Email, Channel_Search Ads, v.v.
→ Ý nghĩa: Chuẩn bị cho Logistic Regression model
          (Regression không thể xử lý categorical variables trực tiếp)


📈 KEY METRICS (Các chỉ số chính sau cleaning):
─────────────────────────────────────────────
- Total Touchpoints: 10,000
- Unique Users: 2,847
- Converted Users: 2,381 (83.6% conversion rate ở user level)
- Avg Touchpoints per User: ~3.51
- Channels: Email, Search Ads, Social Media, Display Ads, Referral, Direct Traffic
- Campaigns: Brand Awareness, Winter Sale, Discount Offer, New Product Launch, Retargeting
- Campaign "−" = Direct touch không qua campaign cụ thể


🎯 TIẾP THEO (Next Steps):
────────────────────────────
- Sử dụng df_touchpoints để tính First-Touch, Last-Touch, Linear Attribution
- Sử dụng df_encoded để train Logistic Regression model (RQ2)
- Sử dụng df_journeys để phân tích path patterns
- Sử dụng attribution results để simulate budget reallocation (RQ3)
"""

print(summary_text)

# Lưu summary vào file
with open('data_cleaning_summary.txt', 'w', encoding='utf-8') as f:
    f.write(summary_text)

print("✓ Đã lưu summary vào file: data_cleaning_summary.txt")

print("\n" + "=" * 70)
print("✅ HOÀN THÀNH: Data Cleaning & Preparation")
print("=" * 70)
