#include "tiempo.h"

void actualizarHora(int anio, int mes, int dia, int hora, int minuto, int segundo)
{
    // Serial.printf("⏰ Nueva hora: %04d-%02d-%02d %02d:%02d:%02d\n", año, mes, dia, hora, minuto, segundo);
    // 📌 Actualizar el RTC del T-Watch con la hora recibida
    watch.setDateTime(anio, mes, dia, hora, minuto, segundo);
    Serial.println("✅ RTC actualizado con éxito.");
}
