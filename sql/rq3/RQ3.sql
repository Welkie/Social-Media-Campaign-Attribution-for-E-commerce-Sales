USE DAP_Campaign_Attribution;

--------------------------------------------
---------------RQ3---------------------------
/*How much does reallocating the marketing budget based
on attribution results improve simulated conversion outcomes?*/

WITH 
-- 1. Tính T? l? chuy?n ??i (CVR) c?a t?ng kênh
cvr_data AS (
    SELECT 
        Channel,
        AVG(CAST(Conversion AS FLOAT)) AS CVR
    FROM data_touchpoints
    GROUP BY Channel
),
-- 2. Tính Tr?ng s? Phân b? Tuy?n tính (Linear Share)
user_paths AS (
    SELECT User_ID, Channel, COUNT(*) OVER (PARTITION BY User_ID) AS total_touches
    FROM data_touchpoints
    WHERE User_ID IN (SELECT DISTINCT User_ID FROM data_touchpoints WHERE Conversion = 1)
),
linear_share AS (
    SELECT 
        Channel, 
        SUM(1.0 / total_touches) / SUM(SUM(1.0 / total_touches)) OVER () AS linear_weight
    FROM user_paths
    GROUP BY Channel
),
-- 3. T?ng h?p Ngân sách & L??t chuy?n ??i cho 3 K?ch b?n
simulation_base AS (
    SELECT 
        c.Channel,
        c.CVR,
        l.linear_weight,
        
        -- S0: Baseline
        10000.0 AS S0_Budget,
        ROUND(10000.0 * c.CVR, 2) AS S0_Expected_Conversions,
        
        -- S1: Conversion-rate weighted
        ROUND(60000.0 * (c.CVR / SUM(c.CVR) OVER()), 2) AS S1_Budget,
        ROUND((60000.0 * (c.CVR / SUM(c.CVR) OVER())) * c.CVR, 2) AS S1_Expected_Conversions,
        
        -- S2: Attribution weighted
        ROUND(60000.0 * l.linear_weight, 2) AS S2_Budget,
        ROUND((60000.0 * l.linear_weight) * c.CVR, 2) AS S2_Expected_Conversions
    FROM cvr_data c
    JOIN linear_share l ON c.Channel = l.Channel
)
-- 4. TÍNH TOÁN CÁC CH? S? YÊU C?U C?A RQ3
SELECT 
    Channel,
    
    -- === K?CH B?N S0 (BASELINE) ===
    S0_Budget,
    S0_Expected_Conversions,
    ROUND(S0_Expected_Conversions * 100, 2) AS S0_Revenue,
    ROUND(((S0_Expected_Conversions * 100) - S0_Budget) / NULLIF(S0_Budget, 0) * 100, 2) AS S0_ROI_Pct,
    
    -- === K?CH B?N S1 ===
    S1_Budget,
    S1_Expected_Conversions,
    ROUND(S1_Expected_Conversions * 100, 2) AS S1_Revenue,
    ROUND(((S1_Expected_Conversions * 100) - S1_Budget) / NULLIF(S1_Budget, 0) * 100, 2) AS S1_ROI_Pct,
    ROUND(((S1_Expected_Conversions - S0_Expected_Conversions) / NULLIF(S0_Expected_Conversions, 0)) * 100, 2) AS S1_Delta_Pct,
    
    -- === K?CH B?N S2 ===
    S2_Budget,
    S2_Expected_Conversions,
    ROUND(S2_Expected_Conversions * 100, 2) AS S2_Revenue,
    ROUND(((S2_Expected_Conversions * 100) - S2_Budget) / NULLIF(S2_Budget, 0) * 100, 2) AS S2_ROI_Pct,
    ROUND(((S2_Expected_Conversions - S0_Expected_Conversions) / NULLIF(S0_Expected_Conversions, 0)) * 100, 2) AS S2_Delta_Pct,
    
    -- === PHÂN TÍCH ?? NH?Y S2 (SENSITIVITY ANALYSIS ±20%) ===
    ROUND(((S2_Expected_Conversions * 80) - S2_Budget) / NULLIF(S2_Budget, 0) * 100, 2) AS S2_ROI_80_USD,
    ROUND(((S2_Expected_Conversions * 120) - S2_Budget) / NULLIF(S2_Budget, 0) * 100, 2) AS S2_ROI_120_USD

FROM simulation_base;