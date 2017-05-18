$(function () {
    var wxopenid='' , key='' ;
    if (key == '') {
        var access_code = GetQueryString('code');
        if (wxopenid == '') {
            if (access_code == null) {
                var fromurl = location.href;
                var appId = "wxdbd212236685877b";
                var returnurl = "http://wx.efanyun.com/payfor/wechat/wechat.html";
                var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +appId
                    + '&redirect_uri=' + returnurl
                    +'&response_type=code&scope=snsapi_base&state=STATE%23wechat_redirect&connect_redirect=1#wechat_redirect';
              //  var url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxae73861a343f7fd6&redirect_uri=' + encodeURIComponent(fromurl) + '&response_type=code&scope=snsapi_base&state=STATE%23wechat_redirect&connect_redirect=1#wechat_redirect';
                location.href = url;
            }
            else {
                $.ajax({
                    type: 'post',
                    url: 'http://101.201.53.25:10001/api/efan/getWxToken',
                    async: false,
                    cache: false,
                    data: { code: access_code },
                    dataType: 'json',
                    success: function (result) {
                        $("#openid").text(result.openid)
                    }
                });
            }
        } 

        function GetQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
            var r = window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]); return null;
        }
    
    }
});