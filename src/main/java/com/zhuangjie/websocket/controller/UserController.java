package com.zhuangjie.websocket.controller;

import com.zhuangjie.websocket.dto.Result;
import com.zhuangjie.websocket.dto.input.User;
import com.zhuangjie.websocket.enums.UserEnum;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

/**
 * 聊天控制器
 * @author manzhuangjie
 * @date 2022/12/10
 */
//@RequestMapping("/user")
@Controller
public class UserController {

    @Value("${chat.login.password}")
    private String username;


    @PostMapping("/login")
    @ResponseBody
    public Result login(@RequestBody User user, HttpSession session) {
        if(this.username.equals(user.getPassword())) {
            // 登录成功
            session.setAttribute(UserEnum.USERNAME.getKey(),user.getUsername());
            return Result.ok("登录成功");
        }
        return Result.error("密码错误！");
    }

    @GetMapping("/getUser")
    @ResponseBody
    public Result getUser(HttpSession session) {
        String username = (String)session.getAttribute(UserEnum.USERNAME.getKey());
        return Result.ok(username);
    }



}
