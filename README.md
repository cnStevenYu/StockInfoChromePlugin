# StockInfoChromePlugin
显示股票信息的Chrome插件.
1. 通过股票代码添加/删除股票信息；
2. 显示股票名称，最新股价，涨跌幅信息；
3. 每隔2秒刷新数据.
## 安装
#### 下载源码
下载源码，
#### 申请查询Key
该插件通过百度提供的股票API查询股票信息，需要申请`api key`,申请地址为[百度股票查询API](http://apistore.baidu.com/apiworks/servicedetail/115.html).
将得到的`api key`复制`popup.js中的`apiKey`变量
