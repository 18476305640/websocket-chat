$(function (){
    $("#submit").click(function (event) {
        // 获取登录表单数据
        let username = $("#username").val();
        let password = $("#password").val();
        // 登录
        $.ajaxSetup({contentType: "application/json; charset=utf-8"})
        $.ajax({
            type: "POST",
            url: "/login",
            data: JSON.stringify({
                username,password
            }),
            success(result) {
                // console.log(result)
                // 跳转到main.html
                location.href = "/main.html";
            }
        })
        event.preventDefault();
    })
})