#ifndef VAR_TAREAS_H
#define VAR_TAREAS_H

#include <Arduino.h>
#include <ArduinoJson.h>
#include <lvgl.h>
#include <vector>

// 📌 Estructura para representar una tarea completa
struct Tarea {
    String nombre;
    String estado;
    String hora;
    String tipo;
    String taskId;
    String idEmpleado;
    lv_obj_t* label;       // Label del texto de la tarea
    lv_obj_t* contenedor;  // Contenedor completo (hora + nombre + botón)
};

// 📌 Estructura para enviar tarea completada al servidor
struct TareaCompletadaData {
    const char* nombre;
    const char* tipo;
    const char* hora;
};

// 📌 Variables globales para tareas y referencias LVGL
extern std::vector<Tarea> listaTareas;
extern std::vector<Tarea> listaTareasExtras;

extern JsonDocument datosPendientes;
extern JsonDocument datosTareasExtras;

extern lv_obj_t* tareaActiva;
extern lv_obj_t* labelSinPendientes;

#endif
