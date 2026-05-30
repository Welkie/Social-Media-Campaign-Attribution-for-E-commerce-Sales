CREATE DATABASE DAP_Campaign_Attribution;

/*---------------------------------------------
/****------------ RQ1-------------------****/
Which social media channel contributes the most to
sales conversions compared to other channels?*/

/* FIRST TOUCH ATTRIBUTION */
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
    FROM data_touchpoints -- Changed here to data_touchpoints
),

first_touch AS (
    SELECT User_ID, Channel
    FROM ordered_journey
    WHERE rn = 1 
      AND User_ID IN (
          SELECT DISTINCT User_ID 
          FROM data_touchpoints -- Changed here to data_touchpoints
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

/* LAST TOUCH ATTRIBUTION */
WITH ordered_journey AS (
    SELECT 
        User_ID, 
        Channel, 
        Conversion, 
        Timestamp,
        ROW_NUMBER() OVER (
            PARTITION BY User_ID 
            ORDER BY Timestamp DESC -- Difference here: Sort descending to get the last touchpoint
        ) AS rn
    FROM data_touchpoints
),
last_touch AS (
    SELECT User_ID, Channel
    FROM ordered_journey
    WHERE rn = 1 
      AND Conversion = 1 -- Only focus on journeys that resulted in a conversion
)
SELECT 
    Channel,
    COUNT(*) AS conversions,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS conversion_share_pct
FROM last_touch
GROUP BY Channel
ORDER BY conversion_share_pct DESC;

/* LINEAR ATTRIBUTION */
WITH user_paths AS (
    -- Step 1: Count total touchpoints for each converted user
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
    -- Step 2: Distribute credit (1 divided by total touchpoints)
    SELECT 
        User_ID, 
        Channel, 
        1.0 / total_touches AS credit
    FROM user_paths
)
-- Step 3: Aggregate credit for each channel
SELECT 
    Channel,
    ROUND(SUM(credit), 2) AS total_credit,
    ROUND(SUM(credit) * 100.0 / SUM(SUM(credit)) OVER (), 2) AS attribution_share_pct
FROM linear_credit
GROUP BY Channel
ORDER BY attribution_share_pct DESC;

/* CONVERSION RATE PER CHANNEL */
SELECT 
    Channel,
    COUNT(*) AS total_visits,
    SUM(CAST(Conversion AS INT)) AS conversions, -- Added CAST to fix BIT data type issue
    ROUND(AVG(CAST(Conversion AS FLOAT)) * 100, 2) AS conversion_rate_pct
FROM multi_touch_attribution_data
GROUP BY Channel
ORDER BY conversion_rate_pct DESC;
