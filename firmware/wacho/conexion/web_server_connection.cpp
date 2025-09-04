#include "web_server_connection.h"
#include <ArduinoJson.h>
#include <lvgl.h>
#include "funciones/manejar_mensajes.h"
  // Necesario para usar realizarAccion()

WebSocketsClient webSocket;

void webSocketEvent(WStype_t type, uint8_t *payload, size_t length)
{
  String message = "";

  switch (type)
  {
  case WStype_DISCONNECTED:
    reconectarWebSocket(); // Reintento al desconectarse
    break;

  case WStype_CONNECTED:
  {
    comprobarDatosExistentesLoggin();
    Serial.println("WebSocket Conectado al servidor!");

    String jsonString;
    serializeJson(confLoggin(), jsonString);
    webSocket.sendTXT(jsonString);
    Serial.print("Enviado: ");
    Serial.println(jsonString);

    // ✅ Enviar mensaje inicial de identificación
    enviarMensajePruebita();
    break;
  }

  case WStype_TEXT:
  {
    Serial.printf("[WebSocket] Mensaje recibido: %s\n", payload);
    message = String((char *)payload);

    // ✅ Procesamos TODO mensaje recibido (aunque no tenga campo "accion")
    realizarAccion(message);

    break;
  }

  case WStype_ERROR:
    Serial.printf("[WebSocket] Error: %s\n", payload);
    break;
  }
}

void configurar_websocket()
{
  webSocket.begin(websocket_server, websocket_port, "/ws");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(reconnectInterval);
  webSocket.enableHeartbeat(500, 1000, 3);
}

void mantener_conexion()
{
  webSocket.loop();
}

void enviarMensajePruebita()
{
  StaticJsonDocument<128> doc;
  doc["accion"] = "Pruebita";
  doc["uuid"] = loggin.Uuid;

  String jsonString;
  serializeJson(doc, jsonString);
  webSocket.sendTXT(jsonString);
}

void reconectarWebSocket()
{
  Serial.println("[WebSocket] Intentando reconectar...");

  if (!verificarConexionWiFi())
  {
    Serial.println("[WebSocket] Sin conexión WiFi.");
    return;
  }

  if (reconnectAttempts < maxReconnectAttempts)
  {
    reconnectAttempts++;
    Serial.printf("[WebSocket] Intento %d de %d...\n", reconnectAttempts, maxReconnectAttempts);
    webSocket.disconnect();
    delay(2000);
    webSocket.begin(websocket_server, websocket_port, "/ws");
  }
  else
  {
    Serial.println("[WebSocket] Máximo de intentos alcanzado. Reiniciando WiFi...");
    if (!verificarConexionWiFi())
    {
      WiFi.disconnect();
      delay(5000);
      WiFi.reconnect();
    }
    webSocket.disconnect();
    delay(2000);
    webSocket.begin(websocket_server, websocket_port, "/ws");
    reconnectAttempts = 0;
  }
}

