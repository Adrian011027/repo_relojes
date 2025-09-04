#ifndef CONT_HORA_TAREA_H
#define CONT_HORA_TAREA_H

#include "lvgl.h"
#include "funciones/colores.h"

extern lv_obj_t *lbl_tarea;
extern lv_obj_t *labelHora;

void agregarHora(const char *hora, lv_obj_t *contenedor);
void agregarLblTarea(const char *tarea, const char *estado, lv_obj_t *contenedor);

#endif  // CONT_HORA_TAREA_H