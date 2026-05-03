package com.delivery.deliveryapp.websocket;

import com.delivery.deliveryapp.order.dto.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class OrderWebSocketController {

    @MessageMapping("/order/update")
    @SendTo("/topic/order/updates")
    public OrderResponse updateOrder(OrderResponse order) {

        return order;
    }
}