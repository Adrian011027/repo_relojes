#include "archivos.h"


// Guardar un documento JSON en un archivo
void guardarDocumento(const char* rutaArchivo, JsonDocument& doc) {
    if (doc.isNull() || doc.size() == 0) {
        Serial.println("Documento JSON vacío. No se guardarán cambios.");
        return;
    }

    File archivo = SPIFFS.open(rutaArchivo, FILE_WRITE);
    if (!archivo) {
        Serial.printf("Error al abrir el archivo %s para guardar.\n", rutaArchivo);
        return;
    }

    if (serializeJson(doc, archivo) == 0) {
        Serial.printf("Error al escribir JSON en el archivo %s\n", rutaArchivo);
    } else {
        Serial.printf("Datos guardados correctamente en %s\n", rutaArchivo);
    }
    archivo.close();
}

// Leer un documento JSON completo desde un archivo

JsonDocument leerDocumentoCompleto(const char* rutaArchivo) {
    JsonDocument doc;

    Serial.printf("📘 Leyendo archivo: %s\n", rutaArchivo);

    if (!SPIFFS.exists(rutaArchivo)) {
        Serial.printf("❌ El archivo %s no existe.\n", rutaArchivo);
        return doc;
    }

    File file = SPIFFS.open(rutaArchivo, FILE_READ);
    if (!file) {
        Serial.printf("❌ Error al abrir el archivo %s para lectura.\n", rutaArchivo);
        return doc;
    }

    DeserializationError error = deserializeJson(doc, file);
    file.close();

    if (error) {
        Serial.printf("❌ Error al deserializar JSON en %s: %s\n", rutaArchivo, error.c_str());
    } else {
        Serial.println("✅ Archivo deserializado correctamente.");
    }

    return doc;
}


// Verificar si un archivo existe
bool archivoExiste(const char* rutaArchivo) {
    if (SPIFFS.exists(rutaArchivo)) {
        return true;
    } else {
        Serial.printf("El archivo %s no existe.\n", rutaArchivo);
        return false;
    }
}

// Borrar un archivo específico
void borrarArchivo(const char* rutaArchivo) {
    if (SPIFFS.exists(rutaArchivo)) {
        if (SPIFFS.remove(rutaArchivo)) {
            Serial.printf("Archivo %s borrado exitosamente.\n", rutaArchivo);
        } else {
            Serial.printf("Error al borrar el archivo %s.\n", rutaArchivo);
        }
    } else {
        Serial.printf("El archivo %s no existe.\n", rutaArchivo);
    }
}

// Iniciar SPIFFS y precargar datos iniciales si es necesario
void iniciarArchivos() {
    Serial.println("🔧 Iniciando sistema de archivos SPIFFS...");
    if (!SPIFFS.begin(true)) { // Cambiar LittleFS por SPIFFS
        Serial.println("Error al montar SPIFFS.");
        return;
    }

    Serial.println("SPIFFS montado correctamente.");
}


JsonDocument analizarDatos(const String& message) {
    JsonDocument doc;

    Serial.println("🔍 Analizando datos recibidos del WebSocket...");

    int inicio = message.indexOf('{');
    int fin = message.lastIndexOf('}') + 1;

    if (inicio == -1 || fin == 0) {
        Serial.println("❌ Error: El mensaje no contiene un JSON válido.");
        return doc;
    }

    String json_str = message.substring(inicio, fin);
    Serial.printf("📨 Extrayendo JSON: %s\n", json_str.c_str());

    DeserializationError error = deserializeJson(doc, json_str);
    if (error) {
        Serial.printf("❌ Error al deserializar: %s\n", error.c_str());
    } else {
        Serial.println("✅ JSON parseado correctamente.");
    }

    return doc;
}
