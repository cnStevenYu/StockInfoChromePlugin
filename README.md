# StockInfoChromePlugin
显示股票信息的Chrome插件.

1. 通过股票代码添加/删除股票信息；

2. 显示股票名称，最新股价，涨跌幅信息；

3. 每隔2秒刷新数据.

![界面](htt)
## 安装
#### 下载源码
下载源码.
#### 申请查询Key
该插件通过百度提供的股票API查询股票信息，需要申请`api key`,申请地址为[百度股票查询API](http://apistore.baidu.com/apiworks/servicedetail/115.html).
将得到的`api key`复制到`popup.js`中的`apiKey`变量。
#### 安装到Chrome
chrome打开扩展程序界面`chrome://extensions`，将`开发者模式`勾上，然后将整个源码文件夹拖到该页面上即可安装完成。

