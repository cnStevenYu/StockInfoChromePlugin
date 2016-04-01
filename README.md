# StockInfoChromePlugin
显示股票信息的Chrome插件.

1. 初始只显示沪深以及恒生指数；

2. 可通过股票代码添加/删除自选股票信息；

3. 显示自选股票名称，最新股价，涨跌幅信息，红色上涨，绿色下跌，灰色持平；

4. 当打开popup时，每隔2秒刷新数据.

![界面](https://github.com/cnStevenYu/StockInfoChromePlugin/blob/master/images/stockinfo.png)

目前提供两种安装方式。
## 1.直接安装
将`StockChromePlugin.crx`文件拖到`chrome://extensions`扩展程序页面即可完成安装。

## 2.源码安装
#### 下载源码
下载源码并解压。
#### 申请查询Key
该插件通过百度提供的股票API查询股票信息，需要申请`api key`,申请地址为[百度股票查询API](http://apistore.baidu.com/apiworks/servicedetail/115.html).
将得到的`api key`复制到`popup.js`中的`apiKey`变量。目前测试发现apiKey为空也能进行查询，所以提供了直接安装方式。
#### 安装到Chrome
chrome打开扩展程序界面`chrome://extensions`，然后将整个源码文件夹拖到该页面上即可安装完成。

