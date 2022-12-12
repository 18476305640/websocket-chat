package com.zhuangjie.websocket.enums;

import lombok.Getter;

/**
 * 用户枚举
 *
 * @author manzhuangjie
 * @date 2022/12/11
 */
@Getter
public enum UserEnum {
    USERNAME("username","用户名");

    private String key;
    private String desc;
    UserEnum(String key,String desc) {
        this.key = key;
        this.desc = desc;
    }


}
