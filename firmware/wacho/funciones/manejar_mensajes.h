#ifndef MANEJAR_MENSAJES_H
#define MANEJAR_MENSAJES_H

#include <map> // Usar map en lugar de unordered_map

#include "archivos.h"
#include "login.h"
#include "tiempo.h"
#include "eventos/notificacion.h"
#include "funciones/control_tareas/control_tareas.h"
#include "conexion/web_server_connection.h"

// funcion para crear un mapa de fucniones
void procesarComando(JsonDocument &doc);

void realizarAccion(String message);


#endif