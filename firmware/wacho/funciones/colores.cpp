#include "colores.h"

bool colorEncontrado = false; // ⚡ Definir la variable global aquí

// ⚡ Definir el arreglo de colores
ColorMap listaDeColores[] = {
    { "Rojo", LV_COLOR_MAKE(255, 0, 0) },
    { "Azul", LV_COLOR_MAKE(0, 0, 255) },
    { "Verde", LV_COLOR_MAKE(0, 255, 0) },
    { "Morado", LV_COLOR_MAKE(128, 0, 128) },
    { "Amarillo", LV_COLOR_MAKE(255, 255, 0) },
    { "Naranja", LV_COLOR_MAKE(255, 165, 0) },
    { "Rosa", LV_COLOR_MAKE(255, 20, 147) },
    { "Cian", LV_COLOR_MAKE(0, 255, 255) },
    { "VerdeLimon", LV_COLOR_MAKE(50, 205, 50) },
    { "LuzCalida", LV_COLOR_MAKE(255, 138, 18) }
};

// 📌 Implementación de `colores_Zonas`
lv_color_t colores_Zonas(const char* nombre) {
    if (nombre == nullptr || strlen(nombre) == 0) {
        Serial.println("Error: nombre es NULL o vacío, devolviendo negro.");
        return LV_COLOR_MAKE(0, 0, 0); // Color por defecto (Negro)
    }

    // Buscar el color en `listaDeColores`
    for (int i = 0; i < sizeof(listaDeColores) / sizeof(listaDeColores[0]); i++) {
        if (strcmp(listaDeColores[i].nombre, nombre) == 0) {
            colorEncontrado = true;  // Se encontró el color
            return listaDeColores[i].color;
        }
    }

    // Si no se encuentra el nombre, devolver negro
    Serial.print("Color no encontrado: ");
    Serial.println(nombre);
    colorEncontrado = false;
    return LV_COLOR_MAKE(0, 0, 0); // Negro
}

// 📌 Implementación de `obtenerColorEstado`
lv_color_t obtenerColorEstado(const char *estado) {
    if (strcmp(estado, "Pendiente") == 0) {
        return lv_palette_main(LV_PALETTE_GREY); // Blanco
    } else if (strcmp(estado, "En Progreso") == 0) {
        return lv_palette_main(LV_PALETTE_YELLOW); // Amarillo
    } else if (strcmp(estado, "Completado") == 0) {
        return lv_palette_main(LV_PALETTE_GREEN); // Verde
    } else if (strcmp(estado, "Vencida") == 0) {
        return lv_palette_main(LV_PALETTE_RED); // Rojo
    } else if (strcmp(estado, "Sin Pendientes") == 0) {
        return LV_COLOR_MAKE(255, 255, 255); // Blanco
    }
    return lv_palette_main(LV_PALETTE_INDIGO); // Fallback color
}
