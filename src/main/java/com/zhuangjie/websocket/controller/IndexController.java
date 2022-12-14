package com.zhuangjie.websocket.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@RestController
public class IndexController {
    @GetMapping({"/","/index.html"})
    public void index(HttpServletResponse response) throws IOException {
        response.sendRedirect("/login.html");
    }
}
