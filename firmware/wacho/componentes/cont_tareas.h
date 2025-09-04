#ifndef CONT_TAREAS_H
#define CONT_TAREAS_H

#include <LilyGoLib.h>
#include <LV_Helper.h>
#include <vector>

#include "ui/ui.h"

//exter es para indicar que se usara esta variable en varios archivos 
//y asi no se crea una copia de la misma
extern lv_obj_t *contenedorTareas;

void crear_contenedor_tareas(lv_obj_t *contenedor);
void ajustar_altura_contenedor_tareas(lv_obj_t *contenedorPrincipal, lv_obj_t *contenedor, lv_obj_t *boton);
#endif