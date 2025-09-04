#include "estado_botones.h"

void actualizarEstadoBotonYContenedor(std::vector<Tarea> &lista, lv_obj_t *boton, lv_obj_t *contenedor, lv_obj_t *contenedorTareas)
{
    bool hayTareaEnProgreso = false;

    // Recorre la lista para verificar si hay alguna tarea en progreso
    for (auto &t : lista)
    {
        if (t.estado == "En Progreso")
        {
            hayTareaEnProgreso = true;
            break;
        }
    }

    // Mostrar u ocultar el botón según el estado de las tareas
    if (hayTareaEnProgreso)
    {
        Serial.println("Mostrando botón");
        lv_obj_clear_flag(boton, LV_OBJ_FLAG_HIDDEN);
    }
    else
    {
        Serial.println("Ocultando botón");
        lv_obj_add_flag(boton, LV_OBJ_FLAG_HIDDEN);
    }

    // Ajustar la altura del contenedor dinámicamente
    ajustar_altura_contenedor_tareas(contenedorTareas, contenedor, boton);
}

