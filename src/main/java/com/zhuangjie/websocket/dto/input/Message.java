package com.zhuangjie.websocket.dto.input;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 浏览器发送给服务器的websocket数据.
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Message {
    /** 消息ID */
    private Long infoId;
    /** 接收方*/
    private String toName;
    /** 发送的数据 */
    private String message;

}
