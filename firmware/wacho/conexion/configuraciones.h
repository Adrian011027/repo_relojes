#ifndef CONFIGURACIONES_H
#define CONFIGURACIONES_H

#include <WiFi.h>

#define reconnectInterval 500
#define maxReconnectAttempts 10 // Número máximo de intentos de reconexión

extern int reconnectAttempts;      // Contador de intentos de reconexión

extern const char *websocket_server; // IP del servidor Flask
extern const int websocket_port;             // Puerto del servidor Flask

// Declaraciones de variables y funciones
extern const char* ssid[];
extern const char* password[];
extern const int numRedes;  
extern IPAddress local_IP;
extern IPAddress gateway;
extern IPAddress subnet;
extern IPAddress primaryDNS;
extern IPAddress secondaryDNS;

#endif