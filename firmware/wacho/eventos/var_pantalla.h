#ifndef VAR_PANTALLA_H
#define VAR_PANTALLA_H

#define TIEMPO_ATENUACION_MS 60000  // 30s para reducir brillo
#define TIEMPO_SUSPENSION_MS 80000  // 60s para Deep Sleep

#define TOUCH_INTERRUPT_PIN 16 // GPIO del táctil en el T-Watch S3

extern unsigned long ultimaInteraccion;
extern bool pantallaEncendida;
extern bool enSuspension;

#endif