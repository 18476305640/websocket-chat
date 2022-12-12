package com.zhuangjie.websocket.ws;

import com.alibaba.fastjson.JSON;
import com.zhuangjie.websocket.dto.input.Message;
import com.zhuangjie.websocket.enums.MessageEnum;
import com.zhuangjie.websocket.enums.UserEnum;
import com.zhuangjie.websocket.util.MessageUtils;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpSession;
import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 聊天端点
 * @author manzhuangjie
 * @date 2022/12/11
 */
@ServerEndpoint(value = "/chat",configurator = GetHttpSessionConfigurator.class)
@Component
public class ChatEndpoint {

    /**
     * 用来储存在线用户的容器
     */
    public static Map<String, ChatEndpoint> onlineUsers = new ConcurrentHashMap<>();

    /**
     * 用来给客户端发送消息
     */
    private Session session;

    // 声明一个HttpSession对象，我们之前在HttpSession对象中存储了用户名
    private HttpSession httpSession;
    @OnOpen
    public void onOpen(Session session, EndpointConfig config) {
        // 将局部的session对象赋值给成员session
        this.session = session;
        // 获取httpSession对象
        HttpSession httpSession = (HttpSession)config.getUserProperties().get(HttpSession.class.getName());
        this.httpSession = httpSession;

        // 从httpSession对象中获取用户名
        String username = (String)httpSession.getAttribute(UserEnum.USERNAME.getKey());
        // 将当前对象存储到容器中
        onlineUsers.put(username,this);
        // 让当前连接的用户知道上线的好友
        sendCurrentOnLineUsers();
        // 让其它连接的用户知道新上线的好友
        sendNewUserToAllUser(username,MessageEnum.NEW_ON_LINE_USER.getCode());



    }



    @OnMessage
    public void onMessage(String message, Session session) {
        System.out.println("后端接收到了");
        System.out.println(message);
        Message messageObj = JSON.parseObject(message,Message.class);
        // 将消息发送给指定的用户
        uToU(httpSession,messageObj);
        // 给当前用户通知，已发送
        noticeAlreadySend(messageObj);

    }
    private void noticeAlreadySend(Message messageObj) {
        String info = MessageUtils.getMessage(true, MessageEnum.INFO_SEND_SUCCESS.getCode(), null, messageObj.getInfoId());
        try {
            session.getBasicRemote().sendText(info);
        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("[ERROR] 通知用户消息发布成功 失败！");
        }
    }
    // 当前用户给其它用户发信息
    private void uToU(HttpSession httpSession, Message messageObj) {
        String toName = messageObj.getToName();
        String info = messageObj.getMessage();
        ChatEndpoint endpoint = onlineUsers.get(toName);
        String sendMessageJson = MessageUtils.getMessage(false, (String)httpSession.getAttribute(UserEnum.USERNAME.getKey()), info);
        try {
            endpoint.session.getBasicRemote().sendText(sendMessageJson);
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    /**关闭时调用*/
    @OnClose
    public void onClose(Session session) {
        // 移除在线session
        for (Map.Entry<String,ChatEndpoint> entry : onlineUsers.entrySet()) {
            if (entry.getValue().session == session) {
                onlineUsers.remove(entry.getKey());
                System.out.println("移除了下线的用户session");
                break;
            }
        }
        // 通知其它在线用户，当前用户已下线
        String username = (String)httpSession.getAttribute(UserEnum.USERNAME.getKey());
        sendNewUserToAllUser(username,MessageEnum.USER_OFF_LINE.getCode());

    }


    private void sendNewUserToAllUser(String username,Integer code) {
        for (Map.Entry<String, ChatEndpoint> entry : onlineUsers.entrySet()) {
            String name =  (String)entry.getKey();
            if (!name.equals(username)) {
                ChatEndpoint endpoint = entry.getValue();
                String message = MessageUtils.getMessage(true, code,null, username);
                try {
                    endpoint.session.getBasicRemote().sendText(message);
                } catch (IOException e) {
                    e.printStackTrace();
                    System.out.println("[ERROR] 通知新用户上线失败！");
                }
            }

        }


    }

    private void sendCurrentOnLineUsers() {
        try {
            String message = MessageUtils.getMessage(true, MessageEnum.ALL_ON_LINE_USERS.getCode(),null, getOnLineUsers());
            this.session.getBasicRemote().sendText(message);
        } catch (IOException e) {
            e.printStackTrace();
            System.out.println("[ERROR] 获取在线的用户失败！");
        }
    }

    private Set<String> getOnLineUsers() {
        Set<String> users = onlineUsers.keySet();
        return users;
    }
}
