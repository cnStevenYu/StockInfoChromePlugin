/**
 *
 * Created by cnSteven on 2016-3-28.
 */

(function(){
    //Baidu Stock Information api
    var QueryBaiduUrl = "http://apis.baidu.com/apistore/stockservice/stock";

    //Please visit site http://apistore.baidu.com/apiworks/servicedetail/115.html to apply for a api key
    //Baidu Stock Information Api Key, 目前可以为空
    var ApiKey = '';

    //Dom elements
    var StockInput, StockInfo, AddBtn, DelBtn, ShPrice, SzPrice, HsPrice, ShIns, SzIns, HsIns;

    var MSG = {
        CODE_SIZE_ERROR: '请输入6位股票代码!',
        CODE_ERROR: '股票代码不正确!',
        NETWORK_ERROR: '网络连接错误!',
        SERVER_ERROR: '服务器错误!',
        ADD_INFO: '添加成功!',
        DEL_INFO: '删除成功!',
        LIMIT_INFO: '只能添加10只股票!'
    };

    var Util = {

        query: function(ids, done, fail) {
            if (!done || !fail ||
                typeof(done) != 'function' || typeof(fail) != 'function') return;

            $.ajax({
                url: QueryBaiduUrl,
                async: true,
                method: 'Get',
                headers: {'apikey': ApiKey},
                data: {stockid: ids, list: 1},
                dataType: 'json'
            })
                .done(done)
                .fail(fail);
        },

        checkStockId: function(id, success){
            if (!success || typeof(success) != 'function') return;

            var val = '';

            if (id.length != 6) {
                this.showMsg(MSG.CODE_SIZE_ERROR);
                return;
            }

            if (id.charAt(0) === '0' || id.charAt(0) === '3') {
                val = 'sz' + id;
            } else {
                if (id.charAt(0) === '6') {
                    val = 'sh' + id;
                } else {
                    this.showMsg(MSG.CODE_ERROR);
                    return;
                }
            }
            //query Baidu api check whether id is right or not
            this.query(val, function(data){
                    if (data['errMsg'] != 'success' || data['retData']['stockinfo'][0]['name'].length === 0) {
                        this.showMsg(MSG.CODE_ERROR);
                        return;
                    }
                    var stock = {};
                    stock[id] = val;
                    success(stock);
                },
                function(){
                    this.showMsg(MSG.NETWORK_ERROR);
                });
        },

        showMsg: function(str){
            var alter = '';
            if (str === MSG.ADD_INFO || str === MSG.DEL_INFO) {
                alter =
                    '<div class=\"alert alert-info\" style=\"padding: 5px; margin-bottom: 0px\">' +
                    '<a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\" style=\"font-size: inherit\">\&times;</a>' +
                    '<strong>' + str + '</strong>' +
                    '</div>';
            }
            else {
                alter =
                    '<div class=\"alert alert-warning\" style=\"padding: 5px; margin-bottom: 0px\">' +
                    '<a href=\"#\" class=\"close\" data-dismiss=\"alert\" aria-label=\"close\" style=\"font-size: inherit\">\&times;</a>' +
                    '<strong>' + str + '</strong>' +
                    '</div>';
            }
            $('#Alert').empty().append(alter);
        },

        removeStockInfo: function(){
            $("tr").remove('.success').remove('.danger').remove('.info');
        }
    };


    //stock constructor
    function Stock(name, price, increase) {
        this.name = name;
        this.price = price;
        this.increase = increase;
    }

    Stock.prototype.showStockInfo = function() {
        var cls = 'info';

        if (this.increase < 0) cls = 'success';//show green
        else if (this.increase > 0) cls = 'danger';//show red

        return "<tr " + "class=" + cls + ">" +
            "<td>" +
            this.name +
            "</td>" +
            "<td>" +
            this.price +
            "</td>" +
            "<td>" +
            this.increase + "%" +
            "</td>" +
            "</tr>";
    };

    //market constructor
    function Market(name, dot, rate) {
        this.name = name;
        this.dot = dot;
        this.rate = rate;
    }

    Market.prototype.showMarketInfo = function(){
        var cls = '';

        if (this.rate < 0) cls = 'label label-success';//show green
        else if (this.rate > 0) cls = 'label label-danger';//show red

        switch(this.name) {
            case 'shanghai':
                var test = $('#ShPrice');
                test.removeClass().html(this.dot);
                //$('#ShPrice').removeClass().html(this.dot);
                $('#ShIns').removeClass().html(this.rate + '%').addClass(cls);
                break;

            case 'shenzhen':
                $('#SzPrice').removeClass().html(this.dot);
                $('#SzIns').removeClass().html(this.rate + '%').addClass(cls);
                break;

            case 'HSI':
                HsPrice.removeClass().html(this.dot);
                HsIns.removeClass().html(this.rate + '%').addClass(cls);
                break;
        }
    };

    var popup = {
        add: function(){
            var id = StockInput.val();

            chrome.storage.sync.get(null, function(items){
                //make sure equal or less than 10 stocks
                if(Object.keys(items).length >= 10){
                    Util.showMsg(MSG.LIMIT_INFO);
                    return;
                }

                Util.checkStockId(id, function (obj) {
                    chrome.storage.sync.set(obj, function () {
                        Util.showMsg(MSG.ADD_INFO);
                    });
                });
            });
            //clear input
            StockInput.val('');
        },
        del: function(){
            var id = StockInput.val();

            Util.checkStockId(id, function(){

                chrome.storage.sync.get(null, function (items) {
                    for (var key in items) {
                        if (id === key) {
                            chrome.storage.sync.remove(id, function () {
                                Util.showMsg(MSG.DEL_INFO);
                            });
                            return;
                        }
                    }
                    //not in the storage area.
                    Util.showMsg(MSG.CODE_ERROR);
                });
            });
            //clear input
            StockInput.val('');

        },
        update: function(){
            chrome.storage.sync.get(null, function (items) {

                var stockIds = [];

                for (var key in items) {
                    stockIds.push(items[key]);
                }

                var stockIdPars = '';

                if (stockIds.length === 0)
                    stockIdPars = '000001';//not be empty.
                else
                    stockIdPars = stockIds.join(',');

                Util.query(stockIdPars,
                    function (data) { //query success
                        if (data['errMsg'] != 'success') {
                            Util.showMsg(MSG.SERVER_ERROR);
                            return;
                        }

                        //set market
                        var marketInfo = data['retData']['market'];
                        var locations = ['shanghai', 'shenzhen', 'HSI'];
                        for(var key in locations){
                            var mkt = new Market(locations[key],
                                        marketInfo[locations[key]]['curdot'].toFixed(0),
                                        marketInfo[locations[key]]['rate']);
                            mkt.showMarketInfo();
                        }

                        if (stockIds.length > 0) {//if user has added stock ids.

                            //remove the existing stock
                            Util.removeStockInfo();

                            //set every stock
                            var stockInfo = data['retData']['stockinfo'];

                            for (var i = 0; i < stockInfo.length; ++i) {

                                var stock = new Stock(stockInfo[i]['name'],
                                    stockInfo[i]['currentPrice'] === 0 ? stockInfo[i]['closingPrice'] : stockInfo[i]['currentPrice'],
                                    stockInfo[i]['increase'] === -100 ? 0 : stockInfo[i]['increase'].toFixed(2));

                                StockInfo.append(stock.showStockInfo());
                            }
                        }
                    },
                    function (data) {//query failed
                        Util.showMsg(MSG.NETWORK_ERROR);
                    });

            });
        }

    };

    $(document).ready(function(){

        StockInput = $('#StockID');
        StockInfo = $('#result');
        AddBtn = $('#AddID');
        DelBtn = $('#DelID');

        ShPrice = $('#ShPrice');
        SzPrice = $('#SzPrice');
        HsPrice = $('#HsPrice');

        ShIns = $('#ShIns');
        SzIns = $('#SzIns');
        HsIns = $('#HsIns');

        //update popup page
        popup.update();

        //set add event handler
        AddBtn.click(popup.add);

        //set delete event handler
        DelBtn.click(popup.del);

        setInterval(popup.update, 2000);
    });


})();
