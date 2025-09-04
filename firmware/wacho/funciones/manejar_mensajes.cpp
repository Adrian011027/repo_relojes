#include "manejar_mensajes.h" // Incluye el archivo de encabezado que declara las funciones y variables necesarias

// Función principal para realizar una acción basada en un mensaje recibido
void realizarAccion(String message)
{
  JsonDocument doc;             // Crea un documento JSON dinámico para almacenar los datos analizados
  doc = analizarDatos(message); // Llama a la función analizarDatos para convertir el mensaje en un objeto JSON

  // Verifica si no es necesaria la configuración inicial del sistema
  if (!loggin.configuracionNecesaria)
  {
    procesarComando(doc); // Procesa el comando contenido en el documento JSON
  }
  else
  {
    /*
    Ejemplo de JSON esperado:
    {"uuid":"1234567890"}
    */
    if (doc["uuid"].is<const char *>()) // Verifica si el JSON contiene un campo "uuid" de tipo cadena
    {
      loggin.Uuid = doc["uuid"].as<String>(); // Asigna el valor del campo "uuid" a la variable loggin.Uuid

      Serial.print("uuid: "); // Imprime el UUID en el monitor serial
      Serial.println(loggin.Uuid);

      loggin.configuracionNecesaria = false;   // Marca que ya no es necesaria la configuración inicial
      guardarConfiguracionLoggin(loggin.Uuid); // Guarda la configuración del UUID en memoria
      Serial.println("🔁 Reiniciando dispositivo tras guardar UUID...");

      ESP.restart();                           // Reinicia el ESP32 para aplicar los cambios
    }

    
    else if (doc["Comando"].is<const char *>()) // Verifica si el JSON contiene un campo "Comando" de tipo cadena
    {
      if (doc["Comando"] == "Prueba" && doc["Prueba"] == "Parpadeo") // Comprueba si el comando es "Prueba" con "Parpadeo"
      {
        // Aquí se podría implementar la lógica para el comando "Prueba" con "Parpadeo"
      }
    }
  }
}

// Función para procesar un comando contenido en un documento JSON
void procesarComando(JsonDocument &doc)
{
  // Verifica si el campo "Comando" no es una cadena válida
  if (!doc["Comando"].is<const char *>()) // ✅ Solucionado el uso de containsKey()
  {
    Serial.println("⚠️ Error: No se encontró un comando válido en el JSON."); // Mensaje de error en el monitor serial
    return;                                                                  // Termina la ejecución de la función
  }

  String comando = doc["Comando"].as<String>(); // Convierte el campo "Comando" en una cadena de texto

  // Mapa estático que asocia comandos con funciones lambda para ejecutarlos
  static std::map<String, std::function<void(JsonDocument &)>> comandos = {
      {"tareas no completadas", [](JsonDocument &doc) // Comando "tareas no completadas"
       {
         datosPendientes.clear();            // Limpia los datos pendientes actuales
         datosPendientes = doc;              // Asigna los nuevos datos pendientes desde el JSON
         lv_async_call(agregarTareas, NULL); // Llama a la función agregarTareas de forma asíncrona
       }},

      {"TareasExtras", [](JsonDocument &doc) // Comando "TareasExtras"
       {
         datosTareasExtras.clear();                // Limpia los datos de tareas extras actuales
         datosTareasExtras = doc;                  // Asigna los nuevos datos de tareas extras desde el JSON
         lv_async_call(agregarTareasExtras, NULL); // Llama a la función agregarTareasExtras de forma asíncrona
       }},

      {"ActualizarTarea", [](JsonDocument &doc) // Comando "ActualizarTarea"
       {
         // Aquí se podría implementar la lógica para actualizar una tarea
         // Actualmente está comentado
         // datosPendientes.clear();
         // datosPendientes = doc;
         // lv_async_call(lv_actualizarTarea, NULL);
       }},

      {"ActualizarHora", [](JsonDocument &doc) // Comando "ActualizarHora"
       {
         // Extrae los valores de fecha y hora del JSON
         int anio = doc["Anio"].as<int>();
         int mes = doc["Mes"].as<int>();
         int dia = doc["Día"].as<int>();
         int hora = doc["Hora"].as<int>();
         int minuto = doc["Minuto"].as<int>();
         int segundo = doc["Segundo"].as<int>();
         actualizarHora(anio, mes, dia, hora, minuto, segundo); // Llama a la función para actualizar la hora del sistema
       }},
      
       {"Ping", [](JsonDocument &doc)
        {
          Serial.println("📡 Ping recibido, respondiendo con Pong...");
       
          StaticJsonDocument<64> respuesta;
          respuesta["Comando"] = "Pong";
       
          String json;
          serializeJson(respuesta, json);
       
          if (webSocket.isConnected()) {
            webSocket.sendTXT(json);
            Serial.println("📤 Pong enviado al servidor:");
            Serial.println(json);
          } else {
            Serial.println("❌ WebSocket no conectado. No +se pudo enviar Pong.");
          }
        }}
      };

  // Busca el comando en el mapa y lo ejecuta si existe
  auto it = comandos.find(comando);
  if (it != comandos.end()) // Si el comando existe en el mapa
  {
    it->second(doc);       // Ejecuta la función asociada al comando
    recibirNotificacion(); // Llama a la función para recibir una notificación
  }
  else
  {
    Serial.println("⚠️ Error: Comando no reconocido -> " + comando); // Mensaje de error si el comando no es válido
  }
}