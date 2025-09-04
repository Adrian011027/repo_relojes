#include "btn_tareas.h"

lv_obj_t *btnTarea;
// 📌 Función para crear un botón dentro de un contenedor de tareas y devolverlo
void crear_boton(lv_obj_t *contenedorTareas)
{
    // Crear el botón dentro del contenedor
    btnTarea = lv_btn_create(contenedorTareas);
   
    lv_obj_set_width(btnTarea , 240);
    lv_obj_set_height(btnTarea , 30);
    lv_obj_set_align(btnTarea , LV_ALIGN_CENTER);
    lv_obj_set_flex_flow(btnTarea , LV_FLEX_FLOW_ROW);
    lv_obj_set_flex_align(btnTarea , LV_FLEX_ALIGN_START, LV_FLEX_ALIGN_CENTER, LV_FLEX_ALIGN_CENTER);
    
    lv_obj_clear_flag(btnTarea , LV_OBJ_FLAG_SCROLLABLE);      /// Flags
    lv_obj_set_style_bg_color(btnTarea , lv_color_hex(0xFFFFFF), LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_bg_opa(btnTarea , 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_row(btnTarea , 0, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_pad_column(btnTarea , 4, LV_PART_MAIN | LV_STATE_DEFAULT);

    lv_obj_clear_flag(btnTarea, LV_OBJ_FLAG_PRESS_LOCK | LV_OBJ_FLAG_GESTURE_BUBBLE | LV_OBJ_FLAG_SNAPPABLE |
        LV_OBJ_FLAG_SCROLLABLE | LV_OBJ_FLAG_SCROLL_ELASTIC | LV_OBJ_FLAG_SCROLL_MOMENTUM |
        LV_OBJ_FLAG_SCROLL_CHAIN);   
}
