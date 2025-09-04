#ifndef ESTADO_BOTONES_H
#define ESTADO_BOTONES_H

#include "control_tareas/var_tareas.h"
#include "componentes/cont_tareas.h"

void actualizarEstadoBotonYContenedor(std::vector<Tarea> &lista, lv_obj_t *boton, lv_obj_t *contenedor, lv_obj_t *contenedorTareas);

#endif