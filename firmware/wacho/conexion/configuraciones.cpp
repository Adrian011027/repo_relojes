#include "configuraciones.h"

int reconnectAttempts = 0;      // Contador de intentos de reconexión


const char *websocket_server = "192.168.100.65"; // IP del servidor Flask
const int websocket_port = 2298;              // Puerto del servidor Flask

const char *ssid[] ={
    "MEGACABLE-F29F",
    "SuizT-WiFi_2.4G",
    "La Tiendita",
    "La Tiendota",
    "Mega_2.4G_DF3E"
};

const char *password[] ={
    "DfUE5f3u",
    "SuizT-Changarro",
    ".2020",
    "SuizT-LaTiendita",
    "THDtSFbD"

};

const int numRedes = sizeof(ssid) / sizeof(ssid[0]);  // coontiene el tamaño del conjunto de las redes

// Configuración de la   IP estática
//IPAddress local_IP(192, 168, 100, 220); // Dirección IP fija que deseas asignar
IPAddress gateway(192, 168, 0, 1);   // Dirección IP de la puerta de enlace (router)
IPAddress subnet(255, 255, 255, 0);  // Máscara de subred
IPAddress primaryDNS(8, 8, 8, 8);    // Servidor DNS primario (opcional)
IPAddress secondaryDNS(8, 8, 4, 4);  // Servidor DNS secundario (opcional)

