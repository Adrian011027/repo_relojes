#ifndef LOGIN_H
#define LOGIN_H

#include "archivos.h"
#include <ArduinoJson.h>

#define LOGGIN_FILE_PATH "/loggin.json"

struct configuraciones {
  String Tipo = "Mesa";
  String Uuid = "";
  bool configuracionNecesaria = false;
};
// Estructura para almacenar la configuración de loggin

extern struct configuraciones loggin;

void comprobarDatosExistentesLoggin();
JsonDocument confLoggin();
void guardarConfiguracionLoggin(String Uuid);
void cargarConfiguracion();

#endif
