#ifndef SUSPENCION_H
#define SUSPENCION_H

#include <LilyGoLib.h>
#include "var_pantalla.h"
#include "pantalla.h"
#include "notificacion.h"

void configurarSuspencion();

// 🔻 Apagar pantalla y entrar en Deep Sleep
void suspenderSistema();

void manejarSuspencion();

#endif