//Baidu Stock Information api
var queryBaiduUrl = "http://apis.baidu.com/apistore/stockservice/stock";

//Baidu Stock Information Api Key
//!!!!!Please visit site http://apistore.baidu.com/apiworks/servicedetail/115.html to apply for a api key
var apiKey = '';

//Message
var MSG = {
    CODE_SIZE_ERROR: '请输入6位股票代码!',
    CODE_ERROR:'股票代码不正确!',
    NETWORK_ERROR:'网络连接错误!',
    SERVER_ERROR:'服务器错误!',
    ADD_INFO:'添加成功!',
    DEL_INFO:'删除成功!'
};

//DOM show message
function showMsg(str) {
    var alter = '';
    $('#Alert').empty();
    if(str === MSG.ADD_INFO || str === MSG.DEL_INFO) {
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
    $('#Alert').append(alter);
}

//DOM update stock information and color
function changeStockInfoAndColor(stockInfo){
    var cls = 'info';

    var rate = stockInfo['increase'];

    if(rate < 0) cls = 'success';//show green
    else if(rate > 0) cls = 'danger';//show red

    return "<tr " + "class=" + cls +  ">" +
        "<td>" +
        stockInfo['name'] +
        "</td>" +
        "<td>" +
        stockInfo['price'] +
        "</td>" +
        "<td>" +
        stockInfo['increase'] + "%" +
        "</td>" +
        "</tr>";
}

//DOM update market information and color
function changeMarketInfoAndColor(marketInfo) {
    var cls = '';

    var rate = marketInfo['rate'];

    if(rate<0) cls = 'label label-success';//show green
    else if(rate>0) cls = 'label label-danger';//show red


    switch (marketInfo['market']){
        case 'shanghai':
            $('#ShPrice').removeClass();
            $('#ShIns').removeClass();

            $('#ShPrice').html(marketInfo['dot']);
            $('#ShIns').html(marketInfo['rate'] + '%');

            $('#ShIns').addClass(cls);
            break;
        case 'shenzhen':
            $('#SzPrice').removeClass();
            $('#SzIns').removeClass();

            $('#SzPrice').html(marketInfo['dot']);
            $('#SzIns').html(marketInfo['rate'] + '%');

            $('#SzIns').addClass(cls);
            break;
        case 'hsi':
            $('#HsPrice').removeClass();
            $('#HsIns').removeClass();

            $('#HsPrice').html(marketInfo['dot']);
            $('#HsIns').html(marketInfo['rate'] + '%');

            $('#HsIns').addClass(cls);
            break;
    }
}

//DOM remove stock information
function removeStockInfo() {
    $("tr").remove('.success');
    $("tr").remove('.danger');
    $("tr").remove('.info');
}

//query and set stock information
function getStockInfo(){
    chrome.storage.sync.get(null, function (items) {

        var stockIds = [];

        for (var key in items) {
            stockIds.push(items[key]);
        }

        if (stockIds.length > 0) {
            var stockIdPars = stockIds.join(',');

            queryStockInfo(stockIdPars, function(data){ //query success

                console.log(data);
                if (data['errMsg'] != 'success') {
                    showMsg(MSG.SERVER_ERROR);
                    return;
                }

                //set market
                var marketInfo = data['retData']['market'];
                changeMarketInfoAndColor({'market': 'shanghai',
                    'dot': marketInfo['shanghai']['curdot'].toFixed(0),
                    'rate': marketInfo['shanghai']['rate']});
                changeMarketInfoAndColor({'market': 'shenzhen',
                    'dot': marketInfo['shenzhen']['curdot'].toFixed(0),
                    'rate': marketInfo['shenzhen']['rate']});
                changeMarketInfoAndColor({'market': 'hsi',
                    'dot': marketInfo['HSI']['curdot'].toFixed(0),
                    'rate': marketInfo['HSI']['rate']});

                //remove the existing stock
                removeStockInfo();

                //set every stock
                var stockInfo = data['retData']['stockinfo'];

                for (var i = 0; i < stockInfo.length; ++i) {

                    var stock = {
                        'name': stockInfo[i]['name'],
                        'price': stockInfo[i]['currentPrice'] === 0 ? stockInfo[i]['closingPrice'] : stockInfo[i]['currentPrice'],
                        'increase': stockInfo[i]['increase'] === -100? 0: stockInfo[i]['increase'].toFixed(2)
                    };
                    var tr = changeStockInfoAndColor(stock);
                    $("#result").append(tr);
                }
            },
            function(data){//query failed
                showMsg(MSG.NETWORK_ERROR);
            });

        }

    });
}

//query stock information, call done if succeed and call fail if failed
function queryStockInfo(stockIds, done, fail) {
    if(!done || !fail ||
        typeof(done) != 'function' || typeof(fail) != 'function') return;

    var jqxhr = $.ajax({
        url: queryBaiduUrl,
        async: true,
        method: 'Get',
        headers: {'apikey': apiKey},
        data: {stockid: stockIds, list: 1},
        dataType: 'json'
    })
        .done(done)
        .fail(fail);
}

function checkStockId(id, success){

    if(!success || typeof(success) != 'function') return;

    var val = '';

    if(id.length != 6) {
        showMsg(MSG.CODE_SIZE_ERROR);
        return;
    }

    if (id.charAt(0) === '0' || id.charAt(0) === '3') {
        val = 'sz' + id;
    } else {
        if (id.charAt(0) === '6') {
            val = 'sh' + id;
        } else {
            showMsg(MSG.CODE_ERROR);
            return;
        }
    }
    //query Baidu api check whether id is right or not
    queryStockInfo(val, function(data){
        //console.log(data);
        if(data['errMsg'] != 'success' || data['retData']['stockinfo'][0]['name'].length === 0) {
            showMsg(MSG.CODE_ERROR);
            return;
        }
        success({[id]:val});
    },
    function(){
        showMsg(MSG.NETWORK_ERROR);
    });
}

$(document).ready(function () {

    getStockInfo();

    //set add event handler
    $("#AddID").click(function(){

        var id = $("#StockID").val();

        checkStockId(id, function(obj) {
            chrome.storage.sync.set(obj, function(){
                //console.log(obj + 'added!');
                showMsg(MSG.ADD_INFO);
            });
        });

        //clear input
        $('#StockID').val('');

    });

    //set delete event handler
    $("#DelID").click(function(){

        var id = $("#StockID").val();

        checkStockId(id, function(){

            chrome.storage.sync.get(null, function(items){
                for(var key in items){
                    if (id === key) {
                        chrome.storage.sync.remove(id, function(){
                            showMsg(MSG.DEL_INFO);
                        });
                        return;
                    }
                }
                //not in the storage area.
                showMsg(MSG.CODE_ERROR);
            });
        });

        //clear input
        $('#StockID').val('');
    });

    setInterval(getStockInfo, 2000);
});
