#include "wifi_connection.h"

void conectarWiFi()
{
  

  Serial.println("Conectando al WiFi...");
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true); // Guardar credenciales
  for (int i=0; i<numRedes; i++){
    WiFi.begin(ssid[i], password[i]);

    int timeout = 0;
    while (WiFi.status() != WL_CONNECTED && timeout < 10)
    {
      delay(1000);
      Serial.print(".");
      timeout++;
    }

    if (WiFi.status() == WL_CONNECTED)
    {
      Serial.println("\nConexión WiFi exitosa!");
      Serial.print("Dirección IP: ");
      Serial.println(WiFi.localIP());
      return; //Salimos porque ya conectó
    }
    else
    {
      Serial.println("\nNo se pudo conectar al WiFi.");
      WiFi.disconnect(); // Limpia antes de seguir al siguiente intento
    }
  }
  
}

bool verificarConexionWiFi()
{
  static unsigned long tiempoInicio = millis();
  const unsigned long TIEMPO_LIMITE = 2000;

  if (WiFi.status() != WL_CONNECTED)
  {
    Serial.println("[Wi-Fi] No hay conexión, esperando reconexión automática...");

    if (millis() - tiempoInicio > TIEMPO_LIMITE)
    {
      Serial.println("[Wi-Fi] Tiempo de espera agotado. Reiniciando ESP32...");
      return false;
    }

    return false;
  }

  tiempoInicio = millis();
  return true;
}
