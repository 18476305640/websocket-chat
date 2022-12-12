package com.zhuangjie.websocket.enums;

import lombok.Getter;

@Getter
public enum MessageEnum {
    ALL_ON_LINE_USERS(1,"当前在线用户集合"),
    NEW_ON_LINE_USER(2,"新在线用户"),
    INFO_SEND_SUCCESS(3,"信息发送成功"),
    USER_OFF_LINE(4,"用户下线");
    private Integer code;
    private String desc;
    MessageEnum(Integer code,String desc) {
        this.code = code;
        this.desc = desc;
    }
}
