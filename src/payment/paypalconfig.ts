export const test_paypalconfig = {
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AfS42RaIDp_JX5YvutcqzjZXUq1Qnbt7B8cejcM2lovOi5GrbLj2lP1JFV2P9DO_YBga-Vdec0F_hA5D',
    'client_secret': 'EIXWWL1UR0nZsfhbY2GrkbCeT_igxl7ZvWrM5Otdfkin_9y08MBVyuWAFSOA3DXlDIYzwHCrIjKDv6JH',
    'returnurl': 'http://localhost:3500/complete-paypal-payment',
    'cancel_url': 'http://localhost:3500/complete-paypal-payment',
    'brand_name': 'Vantage Market Research'
}

export const prod_paypalconfig = {
    'mode': 'live', //sandbox or live
    'client_id': 'AXBE2WL1SvxQbUm7g6cBUYuZyTz4OuY98iASdDZhbcL3_jGVSC4PZXxk9rQz9HiFGJhsT9ESGZmt_23K',
    'client_secret': 'EEp7B6rvZA2diKPwSwB8pQ3uF3ZzWX5DC0J2JeZY_XTCGF0M6zGo4BwM5EH6vaZZUfJ1-hXE-muCtXRW',
    'returnurl': 'https://www.vantagemarketresearch.com/complete-paypal-payment',
    'cancel_url': 'https://www.vantagemarketresearch.com/complete-paypal-payment',
    'brand_name': 'Vantage Market Research'
}