#include "notificacion.h"

unsigned long tiempoInicioNotificacion = 0;
bool notificacionActiva = false;

// 📳 Recibir notificación con vibración
void recibirNotificacion()
{
    Serial.println("📳 Notificación recibida. Vibrando...");

    watch.setWaveform(0, 77); // 🎛️ Patrón de vibración 1-123
    watch.run();              // Ejecutar vibración

    encenderPantalla();
    // Guardar el tiempo en que se activó la notificación
    tiempoInicioNotificacion = millis();
    notificacionActiva = true;
}
void verificarNotificacion()
{
    if (notificacionActiva && (millis() - tiempoInicioNotificacion >= TIEMPO_NOTIFICACION_MS) && !pantallaEncendida)
    {
        atenuarPantalla();
        notificacionActiva = false; // Desactivar la notificación
    }
}

