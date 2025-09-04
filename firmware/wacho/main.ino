#include <LilyGoLib.h> // Biblioteca para interactuar con el hardware LilyGo
#include <LV_Helper.h> // Biblioteca auxiliar para manejar la interfaz gráfica LVGL
#include "time.h"      // Biblioteca estándar para manejar funciones relacionadas con el tiempo

#include "ui/ui.h" // Archivo de encabezado que define la interfaz gráfica de usuario

#include "conexion/web_server_connection.h" // Funciones para manejar la conexión al servidor
#include "conexion/wifi_connection.h"       // Funciones para manejar la conexión WiFi
#include "funciones/control_carga.h"        // Funciones para controlar la carga de la batería

// Buffer para almacenar cadenas de texto, como la hora formateada
char buf[64];

// Variable para almacenar el tiempo en milisegundos desde el último evento registrado
uint32_t lastMillis;

void setup()
{
  Serial.begin(115200); // Inicializa la comunicación serial a 115200 baudios para depuración

  watch.begin();            // Inicializa el hardware del reloj
  watch.setBrightness(200); // Configura el brillo de la pantalla a un valor de 200
  beginLvglHelper();        // Inicializa el ayudante de LVGL para manejar la interfaz gráfica
  ui_init();                // Inicializa los elementos de la interfaz gráfica definidos en ui.h
  setCpuFrequencyMhz(160); // Cambiar la frecuencia de la CPU a 80 MHz
  // Conectar al WiFi
  conectarWiFi(); // Llama a la función para conectar el dispositivo a una red WiFi

  // Conectar al servidor
  configurar_websocket(); // Configura la conexión al servidor mediante WebSocket

  // Inicializar el sistema de archivos
  iniciarArchivos(); // Inicializa el sistema de archivos del dispositivo

  // Crear una tarea para mantener la conexión al servidor
  xTaskCreatePinnedToCore(
      mantenerConexionTask, // Función que ejecutará la tarea
      "mantenerConexion",   // Nombre de la tarea (para depuración)
      6144,                 // Tamaño de la pila en palabras (6144 palabras = 24 KB)
      NULL,                 // Parámetro para la tarea (ninguno en este caso)
      1,                    // Prioridad de la tarea
      NULL,                 // Handle de la tarea (no se usa aquí)
      1                     // Núcleo en el que se ejecutará la tarea (Core 1)
  );

  // Crear una tarea para actualizar el estado de la batería
  xTaskCreatePinnedToCore(
      actualizarBateriaTask, // Función que ejecutará la tarea
      "actualizarBateria",   // Nombre de la tarea (para depuración)
      2048,                  // Tamaño de la pila en palabras (2048 palabras = 8 KB)
      NULL,                  // Parámetro para la tarea (ninguno en este caso)
      1,                     // Prioridad de la tarea
      NULL,                  // Handle de la tarea (no se usa aquí)
      1                      // Núcleo en el que se ejecutará la tarea (Core 1)
  );

  // Crear una tarea para manejar la suspensión del dispositivo
  xTaskCreatePinnedToCore(
      manejarSuspencionTask,   // Función que ejecutará la tarea
      "manejarSuspencionTask", // Nombre de la tarea (para depuración)
      2048,                    // Tamaño de la pila en palabras (2048 palabras = 8 KB)
      NULL,                    // Parámetro para la tarea (ninguno en este caso)
      1,                       // Prioridad de la tarea
      NULL,                    // Handle de la tarea (no se usa aquí)
      1                        // Núcleo en el que se ejecutará la tarea (Core 1)
  );
}

void loop()
{
  lv_task_handler(); // Llama al manejador de tareas de LVGL para actualizar la interfaz gráfica

  // Verifica si ha pasado más de un segundo desde la última actualización
  if (millis() - lastMillis > 1000)
  {
    lastMillis = millis(); // Actualiza la variable con el tiempo actual

    struct tm timeinfo;
    // Obtiene la hora actual del reloj y la almacena en la estructura timeinfo
    watch.getDateTime(&timeinfo);

    // Formatea la hora en el formato "HH:MM" y la almacena en el buffer buf
    size_t written = strftime(buf, 64, "%H:%M", &timeinfo);

    // Si la hora fue formateada correctamente, actualiza el texto en la interfaz gráfica
    if (written != 0)
    {
      lv_label_set_text(ui_Reloj, buf); // Actualiza el texto del elemento ui_Reloj
      // Serial.println(buf); // (Opcional) Imprime la hora en el monitor serial
    }
  }
}

// Tarea para mantener la conexión al servidor
void mantenerConexionTask(void *parameter)
{
  for (;;)
  {
    mantener_conexion();                 // Llama a la función para mantener la conexión
    vTaskDelay(10 / portTICK_PERIOD_MS); // Espera 10 ms antes de la siguiente iteración
  }
}

// Tarea para actualizar el estado de la batería
void actualizarBateriaTask(void *parameter)
{
  for (;;)
  {
    nivel_bateria();                       // Llama a la función para obtener el nivel de batería
    verificarCarga();                      // Llama a la función para verificar el estado de carga
    vTaskDelay(1000 / portTICK_PERIOD_MS); // Espera 1 segundo antes de la siguiente iteración
  }
}

// Tarea para manejar la suspensión del dispositivo
void manejarSuspencionTask(void *parameter)
{
  for (;;)
  {
    manejarSuspencion();                  // Llama a la función para manejar la suspensión
    vTaskDelay(100 / portTICK_PERIOD_MS); // Espera 100 ms antes de la siguiente iteración
  }
}