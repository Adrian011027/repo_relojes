#ifndef PANTALLA_H
#define PANTALLA_H

#include "var_pantalla.h"
#include <LilyGoLib.h>

// 🔻 Reducir brillo antes de suspensión
void atenuarPantalla();

// 🔆 Encender la pantalla tras eventos
void encenderPantalla();
void verificarToque();

#endif