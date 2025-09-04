#ifndef COLORES_H
#define COLORES_H

#include <lvgl.h>
#include <Arduino.h>

// 📌 Declarar `colorEncontrado` como `extern` para evitar redefiniciones
extern bool colorEncontrado;

// 📌 Declarar la estructura `ColorMap`
struct ColorMap {
    const char* nombre;
    lv_color_t color;
};

// 📌 Declarar `listaDeColores` como `extern`
extern ColorMap listaDeColores[];

// 📌 Declarar funciones (sin implementarlas aquí)
lv_color_t colores_Zonas(const char* nombre);
lv_color_t obtenerColorEstado(const char* estado);

#endif // COLORES_H
