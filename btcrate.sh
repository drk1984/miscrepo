#!/bin/bash
x=`curl https://coinbase.com/api/v1/currencies/exchange_rates | cut -d"," -f611 | cut -c15-20`
echo "Current btc price is $x USD"
#sleep 1
y=`echo "$x*0.9" | bc`
echo "90% of btc price is $y USD"
t=`date | cut -f5 -d" "`
echo "Response received at $t"

