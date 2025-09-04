#include "var_tareas.h"

// Inicialización de las variables globales
std::vector<Tarea> listaTareas;
std::vector<Tarea> listaTareasExtras;

JsonDocument datosPendientes;
JsonDocument datosTareasExtras;

lv_obj_t* tareaActiva = nullptr;
lv_obj_t* labelSinPendientes = nullptr;
