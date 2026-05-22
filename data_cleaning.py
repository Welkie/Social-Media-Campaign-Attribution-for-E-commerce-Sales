"""
DATA CLEANING, UNDERSTANDING & PREPARATION - Bước 4
Dự án: Social Media Campaign Attribution for E-commerce Sales
Nhóm: 1

Quy trình:
1. Load & Explore: Tải dữ liệu, kiểm tra cấu trúc, loại dữ liệu
2. Data Understanding: Phân tích chuyển đổi, hành vi người dùng
3. Data Cleaning: Xóa trùng, điền thiếu, chuẩn hóa
4. Data Preparation: Ánh xạ Traffic Types, tạo channel proxy, sắp xếp
"""

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

# ============================================================================
# 1. LOAD & EXPLORE DATA
# ============================================================================
print("=" * 80)
print("BƯỚC 1: TẢI VÀ KHÁM PHÁ DỮ LIỆU")
print("=" * 80)

# Tải dataset
df = pd.read_csv("online_shoppers_intention.csv")

print(f"\nKích thước dataset: {df.shape[0]:,} hàng × {df.shape[1]} cột")
print(f"\nThông tin cơ bản:")
print(df.info())
print(f"\n5 hàng đầu tiên:")
print(df.head())

# ============================================================================
# 2. DATA UNDERSTANDING - Phân tích chuyển đổi & hành vi
# ============================================================================
print("\n" + "=" * 80)
print("BƯỚC 2: HIỂU DỮ LIỆU (Data Understanding)")
print("=" * 80)

# Tỷ lệ chuyển đổi
conversion_rate = (df['Revenue'].sum() / len(df)) * 100
print(f"\nTỷ lệ chuyển đổi chung: {conversion_rate:.2f}%")
print(f"   - Số phiên chuyển đổi: {df['Revenue'].sum():,}")
print(f"   - Số phiên tổng cộng: {len(df):,}")

# Phân tích theo Traffic Type
print(f"\nTỷ lệ chuyển đổi theo Traffic Type:")
traffic_analysis = df.groupby('TrafficType').agg({
    'Revenue': ['sum', 'count', 'mean']
}).round(4)
traffic_analysis.columns = ['Conversions', 'Total_Sessions', 'Conversion_Rate']
traffic_analysis['Conversion_Rate'] = (traffic_analysis['Conversion_Rate'] * 100).round(2)
print(traffic_analysis)

# Phân tích theo Visitor Type
print(f"\nTỷ lệ chuyển đổi theo Visitor Type:")
visitor_analysis = df.groupby('VisitorType').agg({
    'Revenue': ['sum', 'count', 'mean']
}).round(4)
visitor_analysis.columns = ['Conversions', 'Total_Sessions', 'Conversion_Rate']
visitor_analysis['Conversion_Rate'] = (visitor_analysis['Conversion_Rate'] * 100).round(2)
print(visitor_analysis)

# Phân tích theo Month
print(f"\nTỷ lệ chuyển đổi theo Tháng:")
month_analysis = df.groupby('Month').agg({
    'Revenue': ['sum', 'count', 'mean']
}).round(4)
month_analysis.columns = ['Conversions', 'Total_Sessions', 'Conversion_Rate']
month_analysis['Conversion_Rate'] = (month_analysis['Conversion_Rate'] * 100).round(2)
print(month_analysis)

# Kiểm tra dữ liệu thiếu
print(f"\nDữ liệu thiếu (Missing Values):")
missing = df.isnull().sum()
if missing.sum() == 0:
    print("Không có dữ liệu thiếu!")
else:
    print(missing[missing > 0])

# ============================================================================
# 3. DATA CLEANING - Làm sạch dữ liệu
# ============================================================================
print("\n" + "=" * 80)
print("BƯỚC 3: LÀM SẠCH DỮ LIỆU (Data Cleaning)")
print("=" * 80)

# 3.1: Kiểm tra & xóa bản sao (Duplicates)
print(f"\nKiểm tra bản sao:")
duplicates_before = df.duplicated().sum()
print(f"   - Số bản sao tìm thấy: {duplicates_before}")
df = df.drop_duplicates().reset_index(drop=True)
print(f"   - Dataset sau khi loại bỏ: {len(df):,} hàng")

# 3.2: Chuẩn hóa BounceRate & ExitRate (normalize to 0-1 range)
print(f"\nChuẩn hóa BounceRates & ExitRates:")
print(f"   - BounceRates: min={df['BounceRates'].min():.4f}, max={df['BounceRates'].max():.4f}")
print(f"   - ExitRates: min={df['ExitRates'].min():.4f}, max={df['ExitRates'].max():.4f}")

# Đảm bảo các giá trị nằm trong [0, 1]
df['BounceRates'] = df['BounceRates'].clip(0, 1)
df['ExitRates'] = df['ExitRates'].clip(0, 1)
print(f"Chuẩn hóa hoàn tất!")

# 3.3: Chuyển đổi kiểu dữ liệu
print(f"\nChuyển đổi kiểu dữ liệu:")
df['Month'] = df['Month'].astype('category')
df['VisitorType'] = df['VisitorType'].astype('category')
df['TrafficType'] = df['TrafficType'].astype('category')
df['Revenue'] = df['Revenue'].astype('bool')
df['Weekend'] = df['Weekend'].astype('bool')
print(f"Chuyển đổi hoàn tất!")
print(df.dtypes)

# ============================================================================
# 4. DATA PREPARATION - Chuẩn bị dữ liệu
# ============================================================================
print("\n" + "=" * 80)
print("BƯỚC 4: CHUẨN BỊ DỮ LIỆU (Data Preparation)")
print("=" * 80)

# 4.1: Tạo SessionID
print(f"\nTạo SessionID:")
df.insert(0, 'SessionID', range(1, len(df) + 1))
print(f"SessionID tạo thành công! (1 đến {len(df):,})")

# 4.2: Tạo Traffic Segments (Channel Groups) dựa trên TrafficType
print(f"\nTạo Traffic Segments (Channel Groups):")

# Ánh xạ TrafficType thành các channel có ý nghĩa
def map_traffic_to_channel(traffic_type):
    """
    Ánh xạ TrafficType từ dataset thành các channel chính:
    1 → Direct/Search
    2 → Referral/Affiliate
    3 → Organic
    4 → Social Media
    5 → Display Ads
    (mỗi traffic type có conversion rate khác nhau)
    """
    traffic_channel_map = {
        1: 'Direct/Organic',
        2: 'Referral',
        3: 'Social Media',
        4: 'Display Ads',
        5: 'Paid Search',
        6: 'Other'
    }
    return traffic_channel_map.get(int(traffic_type), 'Other')

df['Channel'] = df['TrafficType'].map(map_traffic_to_channel)
print(f"   Phân bố Traffic Segment:")
print(df['Channel'].value_counts())

# 4.3: Tạo tính năng: Bounce Session
print(f"\nTạo tính năng Bounce Session:")
df['IsBounceSession'] = (df['BounceRates'] == 1.0)
bounce_count = df['IsBounceSession'].sum()
print(f"   - Số phiên bounce: {bounce_count:,} ({bounce_count/len(df)*100:.2f}%)")

# 4.4: Tạo tính năng: Num_Visits (từ PageValues - một proxy cho số lần truy cập)
print(f"\nPhân tích PageValues (độ sâu session):")
print(f"   - Min: {df['PageValues'].min():.2f}")
print(f"   - Mean: {df['PageValues'].mean():.2f}")
print(f"   - Max: {df['PageValues'].max():.2f}")

# 4.5: Sắp xếp dữ liệu theo thứ tự thời gian
print(f"\nSắp xếp dữ liệu theo thứ tự thời gian:")
df['Month_order'] = pd.Categorical(df['Month'], 
    categories=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], 
    ordered=True)
df = df.sort_values(['Month_order', 'SessionID']).reset_index(drop=True)
print(f"Sắp xếp hoàn tất!")
df = df.drop('Month_order', axis=1)

# ============================================================================
# 5. FINAL DATA QUALITY CHECKS
# ============================================================================
print("\n" + "=" * 80)
print("KIỂM TRA CHẤT LƯỢNG DỮ LIỆU CUỐI CÙNG")
print("=" * 80)

print(f"\nKiểm tra Sanity:")
print(f"   - Không có NaN: {df.isnull().sum().sum() == 0}")
print(f"   - Không có Infinity: {np.isinf(df.select_dtypes(include=[np.number])).sum().sum() == 0}")
print(f"   - SessionID duy nhất: {df['SessionID'].nunique() == len(df)}")
print(f"   - Revenue chỉ True/False: {set(df['Revenue'].unique()) == {True, False}}")

print(f"\nKích thước dataset cuối cùng: {df.shape}")
print(f"\nThông tin cột chính:")
print(df[['SessionID', 'Month', 'VisitorType', 'Channel', 'PageValues', 
          'BounceRates', 'ExitRates', 'Revenue', 'IsBounceSession']].head(10))

# ============================================================================
# 6. SAVE CLEANED DATA
# ============================================================================
print("\n" + "=" * 80)
print("LƯU DỮ LIỆU ĐÃ LÀNG SẠCH")
print("=" * 80)

df.to_csv("data_cleaned.csv", index=False)
print(f"\nDữ liệu đã được lưu vào: data_cleaned.csv")
print(f"File có kích thước: {len(df):,} hàng × {len(df.columns)} cột")

# Thống kê tóm tắt
print(f"\n" + "=" * 80)
print("THỐNG KÊ TÓM TẮT")
print("=" * 80)
print(f"\nThống kê số metric chính:")
print(f"   - Tổng phiên: {len(df):,}")
print(f"   - Tổng chuyển đổi: {df['Revenue'].sum():,}")
print(f"   - Tỷ lệ chuyển đổi: {conversion_rate:.2f}%")
print(f"   - Số channel: {df['Channel'].nunique()}")
print(f"   - Số tháng: {df['Month'].nunique()}")
print(f"\nBƯỚC 4 HOÀN THÀNH!")
print("=" * 80)