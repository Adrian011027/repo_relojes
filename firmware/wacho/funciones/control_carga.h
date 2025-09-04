#ifndef CONTROL_CARGA_H
#define CONTROL_CARGA_H

#include <LilyGoLib.h>
#include <LV_Helper.h>

#include "ui/ui.h"

extern bool cargando;
extern unsigned long tiempoInicioCarga;
extern bool estadoCargaAnterior;

void mostrarPantallaCarga();
void ocultarPantallaCarga();
bool estaCargando();
void nivel_bateria();
void verificarCarga();

#endif // CONTROL_CARGA_H