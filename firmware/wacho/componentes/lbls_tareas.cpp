#include "lbls_tareas.h"

lv_obj_t *lbl_tarea;
lv_obj_t *labelHora;

void agregarHora(const char *hora, lv_obj_t *contenedor)
{
    // 📌 Crear la etiqueta de la hora (Izquierda)
    lv_obj_t *labelHora = lv_label_create(contenedor);
    lv_label_set_text_fmt(labelHora, "%s", hora);
    lv_obj_set_style_text_color(labelHora, LV_COLOR_MAKE(255, 255, 255), 0);
    lv_obj_set_style_text_font(labelHora, &lv_font_montserrat_16, 0);
    lv_obj_set_width(labelHora, 50);
    lv_obj_set_height(labelHora, LV_SIZE_CONTENT);

    // lv_obj_set_style_border_width(labelHora, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    // lv_obj_set_style_border_color(labelHora, lv_color_hex(0xDE2121), LV_PART_MAIN | LV_STATE_DEFAULT);
    // lv_obj_set_style_border_opa(labelHora, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
}

void agregarLblTarea(const char *tarea, const char *estado, lv_obj_t *contenedor)
{
    lbl_tarea = lv_label_create(contenedor);
    lv_obj_set_width(lbl_tarea, 180);
    lv_obj_set_height(lbl_tarea, LV_SIZE_CONTENT);

    // 🔹 Hacer que el texto se divida en varias líneas si es necesario
    lv_label_set_long_mode(lbl_tarea, LV_LABEL_LONG_WRAP);
    // 🔹 Establecer un ancho máximo para que el texto haga salto de línea automáticamente
    lv_obj_set_width(lbl_tarea, LV_PCT(90)); // Ancho relativo al tamaño del contenedor

    lv_label_set_text_fmt(lbl_tarea, "%s", tarea);
    lv_obj_set_style_text_color(lbl_tarea, obtenerColorEstado(estado), 0);
    lv_obj_set_style_text_align(lbl_tarea, LV_TEXT_ALIGN_AUTO, LV_PART_MAIN | LV_STATE_DEFAULT);
    lv_obj_set_style_text_font(lbl_tarea, &lv_font_montserrat_20, LV_PART_MAIN | LV_STATE_DEFAULT);

    // lv_obj_set_style_border_width(lbl_tarea, 1, LV_PART_MAIN | LV_STATE_DEFAULT);
    // lv_obj_set_style_border_color(lbl_tarea, lv_color_hex(0xDE2121), LV_PART_MAIN | LV_STATE_DEFAULT);
    // lv_obj_set_style_border_opa(lbl_tarea, 255, LV_PART_MAIN | LV_STATE_DEFAULT);
}
