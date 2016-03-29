function changeStockInfoAndColor(stockInfo){
    var cls = '';

    var rate = stockInfo['increase'];

    if(rate < 0) cls = 'success';
    else if(rate > 0) cls = 'danger';

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

function changeMarketInfoAndColor(marketInfo) {
    var cls = '';

    var rate = marketInfo['rate'];

    if(rate<0) cls = 'label label-success';
    else if(rate>0) cls = 'label label-danger';


    switch (marketInfo['market']){
        case 'shanghai':
            $('#ShPrice').removeClass();
            $('#ShIns').removeClass();

            $('#ShPrice').html(marketInfo['dot']);
            $('#ShIns').html(marketInfo['rate'] + '%');

            //$('#ShPrice').addClass(cls);
            $('#ShIns').addClass(cls);
            break;
        case 'shenzhen':
            $('#SzPrice').removeClass();
            $('#SzIns').removeClass();

            $('#SzPrice').html(marketInfo['dot']);
            $('#SzIns').html(marketInfo['rate'] + '%');

 //           $('#SzPrice').addClass(cls);
            $('#SzIns').addClass(cls);
            break;
        case 'hsi':
            $('#HsPrice').removeClass();
            $('#HsIns').removeClass();

            $('#HsPrice').html(marketInfo['dot']);
            $('#HsIns').html(marketInfo['rate'] + '%');

//            $('#HsPrice').addClass(cls);
            $('#HsIns').addClass(cls);
            break;
    }
}

$(document).ready(function () {

    var queryBaiduUrl = "http://apis.baidu.com/apistore/stockservice/stock";

    var apiKey = '35cef313060e63e4fee417308aa83925';

    chrome.storage.sync.get(null, function (items) {

        var stockIds = [];

        for (var key in items) {
            console.log(items[key]);
            stockIds.push(items[key]);
        }

        if (stockIds.length > 0) {
            var stockIdPars = stockIds.join(',');
            console.log("pars:" + stockIdPars);

            var jqxhr = $.ajax({
                url: queryBaiduUrl,
                async: false,
                method: 'Get',
                headers: {'apikey': apiKey},
                data: {stockid: stockIdPars, list: 1},
                dataType: 'json'
            })
                .done(function (data) { //success

                    console.log(data);
                    if (data['errMsg'] != 'success') {
                        console.log('fail!');
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

                    //set every stock
                    var stockInfo = data['retData']['stockinfo'];

                    for (var i = 0; i < stockInfo.length; ++i) {

                        var tr = changeStockInfoAndColor({'name': stockInfo[i]['name'],
                                                 'price': stockInfo[i]['currentPrice'],
                                                 'increase': stockInfo[i]['increase'].toFixed(2)});
                        $("#result").append(tr);
                    }

                })
                .fail(function (data) {
                    console.log(data);
                    console.log('fail!');
                });
        }

    });

    $("#AddID").click(function(){

        var id = $("#StockID").val();
        var val = "";

        if (id.charAt(0) === '0') {
            val = 'sz' + id;
        } else {
            if (id.charAt(0) === '6') {
                val = 'sh' + id;
            }
        }

        chrome.storage.sync.set({[id]:val}, function(){
            console.log(id + 'added!');
        });

        location.reload();

    });

    $("#DelID").click(function(){

        var id = $("#StockID").val();
        chrome.storage.sync.remove(id, function () {
            console.log(id + 'deleted!');
        });

        location.reload();

    });
});
