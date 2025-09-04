#ifndef CONTROL_TAREAS_H
#define CONTROL_TAREAS_H

#include "funciones/archivos.h"
#include "var_tareas.h"
#include "funciones/colores.h"
#include "componentes/lbls_tareas.h"
#include "componentes/cont_tareas.h"
#include "funciones/estado_botones.h"
#include "conexion/web_server_connection.h"
#include "componentes/btn_tareas.h"

// 📌 Procesar lista inicial de tareas
void procesarPendientes(JsonDocument &doc);
// 📌 Agregar una tarea al contenedor sin que se encimen
void agregarTarea(const char *hora, const char *tarea, const char *estado, const char *tipo);

void agregarTareas(void *param);

void agregarTareasExtras(void *param);

void enviarTareaCompletada(void *param);

void enviarMensajePruebita();
#endif