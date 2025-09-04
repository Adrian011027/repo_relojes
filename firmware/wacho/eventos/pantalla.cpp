#include "pantalla.h"
// 🔻 Reducir brillo antes de suspensión
void atenuarPantalla()
{
    if (pantallaEncendida)
    {
        watch.setBrightness(20);
        // Serial.println("🔅 Pantalla atenuada.");
    }
}

// 🔆 Encender la pantalla tras eventos
void encenderPantalla()
{
    watch.setBrightness(200);
    pantallaEncendida = true;
    ultimaInteraccion = millis();
    // Serial.println("🔆 Pantalla encendida.");
    if(enSuspension){
        enSuspension = false;
        setCpuFrequencyMhz(160); // Cambiar la frecuencia de la CPU a 160 MHz para reestablecer el rendimiento
    }
}

void verificarToque()
{

    if (watch.getTouched())
    {
        Serial.println("🖐️ toque detectado: Activando pantalla.");

        encenderPantalla();
        
    }
}
