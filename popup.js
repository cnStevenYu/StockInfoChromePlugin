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
                    $("#ShPrice").html(marketInfo['shanghai']['curdot'].toFixed(0));
                    $("#SzPrice").html(marketInfo['shenzhen']['curdot'].toFixed(0));
                    $("#HsPrice").html(marketInfo['HSI']['curdot'].toFixed(0));
                    $("#ShIns").html(marketInfo['shanghai']['rate'] + '%');
                    $("#SzIns").html(marketInfo['shenzhen']['rate'] + '%');
                    $("#HsIns").html(marketInfo['HSI']['rate'] + '%');

                    //set every stock
                    var stockInfo = data['retData']['stockinfo'];

                    for (var i = 0; i < stockInfo.length; ++i) {

                        var tr = "<tr>" +
                                    "<td>" +
                                        stockInfo[i]['name'] +
                                    "</td>" +
                                    "<td>" +
                                        stockInfo[i]['currentPrice'] +
                                    "</td>" +
                                    "<td>" +
                                        stockInfo[i]['increase'].toFixed(2) + "%" +
                                    "</td>" +
                                 "</tr>";
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
