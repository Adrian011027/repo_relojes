#ifndef ARCHIVOS_H
#define ARCHIVOS_H

#include <ArduinoJson.h>
#include <SPIFFS.h> // Cambiar LittleFS por SPIFFS
//#include "datos_iniciales.h"


// Funciones para manejar archivos
extern void guardarDocumento(const char* rutaArchivo, JsonDocument& doc);
extern JsonDocument leerDocumentoCompleto(const char* rutaArchivo);
//void precargarDatos(const char* rutaArchivo, JsonDocument& datosIniciales);
extern void borrarArchivo(const char* rutaArchivo);
extern bool archivoExiste(const char* rutaArchivo);
extern void iniciarArchivos();
extern JsonDocument analizarDatos(const String& message);

#endif
