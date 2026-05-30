USE DAP_Campaign_Attribution;

---------------------------------------------------
---------------------RQ2---------------------------
/*Which attribution model best reflects the actual
conversion behavior observed in the data?*/

SELECT 
    User_ID,
    MAX(CAST(Conversion AS INT)) AS is_converted, 
    MAX(CASE WHEN Channel = 'Social Media' THEN 1 ELSE 0 END) AS touch_Social_Media,
    MAX(CASE WHEN Channel = 'Email' THEN 1 ELSE 0 END) AS touch_Email,
    MAX(CASE WHEN Channel = 'Search Ads' THEN 1 ELSE 0 END) AS touch_Search_Ads,
    MAX(CASE WHEN Channel = 'Display Ads' THEN 1 ELSE 0 END) AS touch_Display_Ads,
    MAX(CASE WHEN Channel = 'Direct Traffic' THEN 1 ELSE 0 END) AS touch_Direct_Traffic
INTO User_Attribution_Features -- This command creates a new physical table saved in the database
FROM multi_touch_attribution_data
GROUP BY User_ID;
