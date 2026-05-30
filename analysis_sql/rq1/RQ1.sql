CREATE DATABASE DAP_Campaign_Attribution;

/*---------------------------------------------
/****------------ RQ1-------------------****/
Which social media channel contributes the most to
sales conversions compared to other channels?*/

/*FIRST TOUCH */
WITH ordered_journey AS (
    SELECT 
        User_ID, 
        Channel, 
        Conversion, 
        Timestamp,
        ROW_NUMBER() OVER (
            PARTITION BY User_ID 
            ORDER BY Timestamp ASC
        ) AS rn
    FROM data_touchpoints -- Thay ??i ? ?ây
),



first_touch AS (
    SELECT User_ID, Channel
    FROM ordered_journey
    WHERE rn = 1 
      AND User_ID IN (
          SELECT DISTINCT User_ID 
          FROM data_touchpoints -- Thay ??i ? ?ây
          WHERE Conversion = 1
      )
)
SELECT 
    Channel,
    COUNT(*) AS conversions,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS conversion_share_pct
FROM first_touch
GROUP BY Channel
ORDER BY conversion_share_pct DESC;



/* LAST TOUCH*/
WITH ordered_journey AS (
    SELECT 
        User_ID, 
        Channel, 
        Conversion, 
        Timestamp,
        ROW_NUMBER() OVER (
            PARTITION BY User_ID 
            ORDER BY Timestamp DESC -- Khác bi?t ? ?ây: S?p x?p gi?m d?n ?? l?y ?i?m ch?m cu?i
        ) AS rn
    FROM data_touchpoints
),
last_touch AS (
    SELECT User_ID, Channel
    FROM ordered_journey
    WHERE rn = 1 
      AND Conversion = 1 -- Ch? quan tâm nh?ng hành trình có sinh ra chuy?n ??i
)
SELECT 
    Channel,
    COUNT(*) AS conversions,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS conversion_share_pct
FROM last_touch
GROUP BY Channel
ORDER BY conversion_share_pct DESC;


/* LINEAR ATTRIBUTE*/
WITH user_paths AS (
    -- B??c 1: ??m t?ng s? ?i?m ch?m (touches) c?a m?i user ?ã mua hàng
    SELECT 
        User_ID, 
        Channel,
        COUNT(*) OVER (PARTITION BY User_ID) AS total_touches
    FROM multi_touch_attribution_data
    WHERE User_ID IN (
        SELECT DISTINCT User_ID 
        FROM multi_touch_attribution_data 
        WHERE Conversion = 1
    )
),
linear_credit AS (
    -- B??c 2: Chia ??u ?i?m (1 chia cho t?ng s? ?i?m ch?m)
    SELECT 
        User_ID, 
        Channel, 
        1.0 / total_touches AS credit
    FROM user_paths
)
-- B??c 3: T?ng h?p ?i?m cho t?ng kênh
SELECT 
    Channel,
    ROUND(SUM(credit), 2) AS total_credit,
    ROUND(SUM(credit) * 100.0 / SUM(SUM(credit)) OVER (), 2) AS attribution_share_pct
FROM linear_credit
GROUP BY Channel
ORDER BY attribution_share_pct DESC;

/* T? L? CHUY?N ??I */
SELECT 
    Channel,
    COUNT(*) AS total_visits,
    SUM(CAST(Conversion AS INT)) AS conversions, -- ?ã thêm CAST ?? s?a l?i BIT
    ROUND(AVG(CAST(Conversion AS FLOAT)) * 100, 2) AS conversion_rate_pct
FROM multi_touch_attribution_data
GROUP BY Channel
ORDER BY conversion_rate_pct DESC;




