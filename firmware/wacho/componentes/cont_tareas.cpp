#include "cont_tareas.h"

lv_obj_t *contenedorTareas;

void crear_contenedor_tareas(lv_obj_t *contenedor)
{
    
    // Crear contenedor para la tarea
    contenedorTareas = lv_obj_create(contenedor);
    lv_obj_set_width(contenedorTareas, 240);
    lv_obj_set_height(contenedorTareas, 35);
    lv_obj_set_align(contenedorTareas, LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(contenedorTareas, LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(contenedorTareas, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    lv_obj_clear_flag(contenedorTareas, LV_OBJ_FLAG_CLICKABLE | LV_OBJ_FLAG_SCROLLABLE);
    //lv_obj_set_style_text_align(contenedorTareas, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_set_style_border_width(contenedorTareas, 0, 0);
    lv_obj_set_style_pad_row(contenedorTareas, 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_column(contenedorTareas, 10, LV_PART_MAIN | LV_STATE_DEFAULT);
    
    lv_obj_set_style_bg_color(contenedorTareas, lv_color_hex(0xFFFFFF), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(contenedorTareas, 0, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_set_style_bg_color(contenedorTareas, lv_color_hex(0xFFFFFF), LV_PART_SCROLLBAR | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(contenedorTareas, 0, LV_PART_SCROLLBAR | LV_STATE_DEFAULT);
    

}

//modifica la altura del contenedor donde se mustra la lista de tareas 
//y ajsuta la posicion del contenedor principal
void ajustar_altura_contenedor_tareas(lv_obj_t *contenedorPrincipal, lv_obj_t *contenedor, lv_obj_t *boton)
{
    if (lv_obj_has_flag(boton, LV_OBJ_FLAG_HIDDEN))
    {
        // Si el botón está oculto, usar el tamaño completo
        lv_obj_set_align(contenedor, LV_ALIGN_BOTTOM_MID);
        lv_obj_set_flex_align(contenedorPrincipal, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
        lv_obj_set_height(contenedor, 160);
        //lv_obj_set_y(contenedor, 0);
    }
    else
    {
        // Si el botón está visible, reducir el tamaño del contenedor
        lv_obj_set_align(contenedor, LV_ALIGN_BOTTOM_MID);
        lv_obj_set_flex_align(contenedorPrincipal, LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_START);
        lv_obj_set_height(contenedor, 120);
        //lv_obj_set_y(contenedor, -40);
    }
}



