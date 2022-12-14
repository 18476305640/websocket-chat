$(function () {



    //防抖函数模板
    function debounce(func, delay) {
        console.log("执行了")
        let timer = null;
        return function (...args) {
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
                func.apply(this, args)
            }, delay)
        }
    }

    function handler() {
        console.log("停止滚动了")
        $("#chatContent").addClass("chatContent");
    }
    //创建刷新指示灯的防抖函数
    const refresh = debounce(handler, 460)

    $("#chatContent")[0].addEventListener("scroll",  ()=> {
        refresh();
        console.log("滚动中")
        $("#chatContent").removeClass("chatContent");

    })

})