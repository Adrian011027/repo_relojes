#ifndef NOTIFICACION_H
#define NOTIFICACION_H

#include <LilyGoLib.h>
#include "pantalla.h"

#define TIEMPO_NOTIFICACION_MS 5000 // 5s pantalla encendida tras notificación

extern unsigned long tiempoInicioNotificacion;
extern bool notificacionActiva;

// 📳 Recibir notificación con vibración
void recibirNotificacion();
void verificarNotificacion();

#endif