package com.zhuangjie.websocket;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// 不加 webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT 时，打包会报错
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class WebSocketApplicationTests {

    @Test
    void contextLoads() {
    }

}
