$(function () {
    // 当前用户
    let currentUsername = "";
    let chatListData = { // 聊天数据
        "用户名": [
            {
                "datetime":"",
                "soure": "wo" , //wo/ta
                "message": "消息"
            }
        ]
    }
    let sendQueue = [
        {
            id: "",
            toName: "",
            message: {
                "datetime":"",
                "soure": "wo" , //wo/ta
                "message": "消息"
            }
        }
    ];
    let currentWithWhomChat = null; //用户名
    let ws = null;
    // 存入聊天数据中
    function addChatData(whitWho,message) {
        if (chatListData[whitWho] == null) {
            // 没有历史记录
            chatListData[whitWho] = [message];
        }else {
            // 已经有历史记录
            let uud = chatListData[whitWho]
            uud[uud.length] = message;
        }
        // console.log("存放聊天记录后的数据：",chatListData[whitWho])
        // 持久化
        chatDataToLocal();
    }

    // 聊天容器滚动
    function chatContainerScroll(toHeight) {
        let chatContent = document.getElementById("chatContent");
        chatContent.scrollTop = toHeight;
    }
    function chatContainerScrollToBottom() {
        let chatContent = document.getElementById("chatContent");
        chatContainerScroll(chatContent.scrollHeight - chatContent.clientHeight);
    }
    // 存放到视图中
    function addChatDataToView(whitWho,message) {
        if (currentWithWhomChat != whitWho) { return }
        let chatView = $("#chatContent");
        function getChatItemString(childNodeString) {
            return `
               <div class="chat_item">
                    ${childNodeString}
               </div>
            `
        }
        // 还是与ta聊天,需要更新到视图
        if ( message.soure == "wo") {
            chatView.html(chatView.html() + `
                <div class="my">
                    <span class="text">${message.message}</span>
                    <img src="img/headImg.svg" />
                </div>
            `);
        }else {
            // 是“ta”发来的
            chatView.html(chatView.html() + `
                    <div class="outside">
                        <img src="img/headImg.svg" />
                        <span class="text">${message.message}</span>
                    </div>
            `);
        }
        // 滚动到底部
        chatContainerScrollToBottom();

    }

    // 聊天记录还原到视图
    function revertView(whitWho,chatData) {
        // 清空原视图数据
        $("#chatContent").html("");
        if (chatData == null) {return;}
        if (currentWithWhomChat != whitWho) return;
        // 还原
        for (let item of chatData) {
            addChatDataToView(whitWho,item)
        }
        // 滚动到底部
        chatContainerScrollToBottom();


    }
    // 初始化聊天记录
    let SAVE_FLAG = "chatData"
    function initChatData() {
        if (currentUsername == null  ) return;
        let localData = JSON.parse(localStorage.getItem(SAVE_FLAG));
        if (localData == null || localData[currentUsername] == null) return;
        let currentLoginUserChatData = localData[currentUsername];
        // 还原
        chatListData = currentLoginUserChatData;
    }
    function chatDataToLocal() {
        if (chatListData == null) return;
        // 获取原来的数据
        let localData = JSON.parse(localStorage.getItem(SAVE_FLAG));
        if (localData == null) {
            // 第一次持久化
            localData = {}
        }
        localData[currentUsername] = chatListData;
        // 持久化
        localStorage.setItem(SAVE_FLAG,JSON.stringify(localData))
    }


    new Promise(((resolve, reject) => {
        // 初始化用户基本信息
        $.ajax({
            type: "GET",
            url: "/getUser",
            success(result) {
                console.log(result)
                let username = result.message;
                if (username == null) {
                    window.open("/login.html","_self")
                }
                // 维护全局变量
                currentUsername = username;
                // 有信息（用户名）
                $("#currentUser").text($("#currentUser").text()  + username)
                // 初始化聊天数据（还原）
                initChatData();
                resolve();
            }
        })
    })).then((resolve, reject)=>{
        // 建立websocket连接
        ws = new WebSocket(`ws://${window.location.host}/chat`);
        ws.onopen = function () {
            // 显示在线信息
            $("#state").attr("class","online").text("在线");
        }
        ws.onmessage = function (evt) {
            // console.log("滴滴滴，您有新消息：",evt)
            let data =  JSON.parse(evt.data);
            if (data.systemMsgFlag) {
                //系统消息
                let ul = $("#myFriends > ul");
                let sysInfo = $("#sysNoticeContainer");
                switch (data.code) {
                    case 1:
                        // 可以得到上线的用户列表
                        let list = data.message;
                        // 置空列表
                        ul.html("");
                        for(let item of list) {
                            // 如果是自己不添加
                            if (item == currentUsername) continue;
                            ul.html(ul.html() + `<li>${item}</li>`)
                        }
                        break
                    case 2:
                        // 可以得到新上线的用户
                        // 判断列表中是否已经存在
                        let lis = $("#myFriends > ul > li")
                        // 检查列表中是否已经有该好友
                        for (let li of lis) {
                            if ($(li).text() == data.message) {
                                return;
                            }
                        }
                        // 加入到好友列表中
                        ul.html(ul.html() + `<li>${data.message}</li>`)
                        sysInfo.html(sysInfo.html() + `<p>${data.message}已上线！</p>`)
                        break
                    case 3:
                        // 消息发送成功
                        // 根据返回的消息id，将正在发送队列移到聊天记录中
                        console.log("消息发送成功")
                        for (let i = 0;i < sendQueue.length; i++) {
                            let block = sendQueue[i];
                            if (block.id == data.message) {
                                // 移动到聊天记录
                                addChatData(block.toName,block.message);
                                // 更新到视图
                                addChatDataToView(block.toName,block.message);
                                sendQueue.splice(i,1);
                            }
                        }
                        break
                    case 4:
                        // 用户下线
                        // 从列表中移除
                        console.log("接收到要移除的用户：",data.message)
                        if (data.message == null) return;
                        let listItems = $("#myFriends > ul >li");
                        for (let listItem of listItems) {
                            if ($(listItem).text() == data.message) {
                                // 移除
                                $(listItem).remove();
                                break;
                            }
                        }
                        // 广播
                        sysInfo.html(sysInfo.html() + `<p>${data.message}已下线！</p>`)
                        break;
                }
            }else {
                // 非系统消息
                let message = JSON.parse(evt.data);
                // 加入到聊天记录
                let fromName = message.fromName;
                let infoObj = {
                    "datetime":new Date().getTime(),
                    "soure": "ta" , //wo/ta
                    "message": message.message
                }
                // 添加到聊天记录
                addChatData(fromName,infoObj)
                // 添加到视图
                addChatDataToView(fromName,infoObj)


            }

        }
        ws.onclose = function () {
            // 改为离线信息
            $("#state").attr("class","offline").text("离线");
        }
    })
    // 选择用户聊天
    $("#myFriends > ul").on("click","li",function (e) {
        console.log("target")
        let ta = $(e.target).text();
        if (ta == null) return;
        // 维护正在与谁聊天全局变量
        currentWithWhomChat = ta;
        // 维护与谁聊天
        $("#andWhoChat").text(`正在与 [${currentWithWhomChat}] 聊天`);
        // 将历史记录，显示到视图
        let chatData = chatListData[currentWithWhomChat];
        // 还原
        revertView(currentWithWhomChat,chatData);

    })
    // 发送消息
    let chatInput = $("#chatInput");
    $("#send").click(function () {
        if (currentWithWhomChat == null || ws == null) {
            alert("未选择好友或离线状态！");
            return;
        }
        let inputText =  chatInput.val();
        let infoId = new Date().getTime();
        let chatData = {
            infoId: infoId,
            toName: currentWithWhomChat,
            message: inputText
        }
        // 给后端发送聊天信息
        ws.send(JSON.stringify(chatData))
        // 加入正在发送的队列
        sendQueue.push({
            id: infoId,
            toName: currentWithWhomChat,
            message: {
                "datetime":new Date().getTime(),
                "soure": "wo" , //wo/ta
                "message": inputText
            }
        })
        // 置空输入框
        chatInput.val("")

    })





})