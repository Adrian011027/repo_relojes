#ifndef WEB_SERVER_CONNECTION_H
#define WEB_SERVER_CONNECTION_H

#include <WebSocketsClient.h> // Librería WebSockets directamente
#include <ArduinoJson.h>

#include "configuraciones.h"
#include "eventos/suspencion.h"
#include "wifi_connection.h"
#include "funciones/login.h"
#include "funciones/archivos.h"
#include "funciones/manejar_mensajes.h"

extern WebSocketsClient webSocket;

void webSocketEvent(WStype_t type, uint8_t *payload, size_t length);
void configurar_websocket();
void mantener_conexion();
void reconectarWebSocket();
void mostrarPendientesLVGL(JsonArray pendientes);


#endif