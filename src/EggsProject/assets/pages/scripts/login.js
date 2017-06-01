var Login = function () {
    var o = {
        show: function (text) {
            $("#text").text(text);
            $("#show").show();
        },
        hide: function () {
            $("#show").hide();
        }
    };


    var handleLogin = function () {
        $('.form-horizontal input').keypress(function (e) {
            if (e.which == 13) {
                if ($('.form-horizontal').validate().form()) {
                    var url = "http://101.201.53.25:10001/api/efan/login";
                    var username = $("#userName").val();
                    var password = $("#pw").val();
                    if (!username || !password) {
                        o.show("请输入用户名或密码");
                        return;
                    }
                    var md5pw = md5(password);
                    var data = { "user_name": username, "pw": md5pw };
                    $.ajax({
                        type: "Post",
                        url: url,
                        data: data,
                        async: false,
                        dataType: "json",
                        success: function (res) {
                            if (res.code == 200) {
                                var val = { username: res.user_name, orgid: res.org_id, orgName: res.org_name };
                                var temp = JSON.stringify(val);
                                $.cookie("eggsResult", temp, {
                                    expires: 1,//有效日期
                                    path: "/",//cookie的路 径
                                    secure: false //true,cookie的传输会要求一个安全协议,否则反之
                                });
                                window.location.href = "layout.html";
                            } else {
                                han
                            }
                        }
                    });
                }
                return false;
            }
        });
        $("#loginSubmit").click(function () {
            if ($('.form-horizontal').validate().form()) {
                var url = "http://101.201.53.25:10001/api/efan/login";
                var username = $("#userName").val();
                var password = $("#pw").val();
                var md5pw = md5(password);
                var data = { "userName": username, "pw": md5pw };
                if (!username||!password) {
                    o.show("请输入用户名或密码");
                    return;
                }
                $.ajax({
                    type: "Post",
                    url: url,
                    data: data,
                    async: false,
                    dataType: "json",
                    success: function (res) {
                        if (res.code == 200) {
                            var val = { username: res.user_name, orgid: res.org_id, orgName: res.org_name };
                            var temp = JSON.stringify(val);
                            $.cookie("eggsResult", temp, {
                                expires: 1,//有效日期
                                path: "/",//cookie的路 径
                                secure: false //true,cookie的传输会要求一个安全协议,否则反之
                            });
                            window.location.href = "layout.html";
                        } else {
                            o.show(res.message);
                        }
                    }
                });
            }
        })
    }



    return {
        //main function to initiate the module
        init: function () {
            var cookie = $.cookie("eggsResult");
            if (cookie != "" && cookie != undefined) {
                try {
                    var cook = $.parseJSON(cookie);
                    if (cook.username) {
                        window.location.href = "layout.html";

                    }

                } catch (e) {
                    handleLogin();
                }
            }
            handleLogin();
        }
    };
}();

jQuery(document).ready(function () {
    Login.init();
});