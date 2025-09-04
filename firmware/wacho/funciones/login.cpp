#include "login.h"

struct configuraciones loggin;

void comprobarDatosExistentesLoggin() {
  Serial.println("🔍 Verificando existencia de configuración previa...");
  if (archivoExiste(LOGGIN_FILE_PATH)) {
      Serial.println("📄 Archivo de configuración encontrado, cargando...");
      cargarConfiguracion();
  } else {
      Serial.println("🚫 Archivo de configuración no encontrado. Se requiere configuración inicial.");
      loggin.configuracionNecesaria = true;
  }
}


JsonDocument confLoggin() {
  JsonDocument doc;
  doc["Tipo"] = loggin.Tipo;
  if (loggin.configuracionNecesaria) doc["Registro"] = "Registro";
  else {
    doc["Registro"] = "Inicio";
    doc["uuid"] = loggin.Uuid;
  }

  return doc;
}

void guardarConfiguracionLoggin(String Uuid ) {
  Serial.printf("💾 Guardando configuración loggin con UUID: '%s'\n", Uuid.c_str());

  JsonDocument doc;
  doc["Uuid"] = Uuid;

  if (doc.isNull() || doc.size() == 0) {
      Serial.println("❌ Documento vacío, no se guardará nada.");
      return;
  }

  Serial.println("📄 Preparando para guardar el documento JSON...");
  guardarDocumento(LOGGIN_FILE_PATH, doc);
}
void cargarConfiguracion() {
  Serial.println("📂 Intentando cargar configuración desde loggin.json...");

  JsonDocument doc = leerDocumentoCompleto(LOGGIN_FILE_PATH);

  if (doc.isNull() || doc.size() == 0) {
      Serial.println("⚠️ El archivo de configuración está vacío o no existe.");
      return;
  }

  loggin.Uuid = doc["Uuid"].as<String>();
  Serial.printf("✅ UUID cargado desde archivo: '%s'\n", loggin.Uuid.c_str());
}


