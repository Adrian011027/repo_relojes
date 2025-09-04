#include "suspencion.h"

void configurarSuspencion()
{
    watch.setBrightness(200); // Brillo al máximo al inicio
    /*
    watch.configAccelerometer(); // Configurar acelerómetro
    // 📌 Configurar el acelerómetro correctamente
    watch.configAccelerometer(
        SensorBMA423::RANGE_4G,            // Sensibilidad ±4G
        SensorBMA423::ODR_100HZ,           // Frecuencia de muestreo 100Hz
        SensorBMA423::BW_NORMAL_AVG4,      // Ancho de banda normal
        SensorBMA423::PERF_CONTINUOUS_MODE // Modo continuo
    );
    */
    // watch.enableAccelerometer(); // Activar acelerómetro
    
    ultimaInteraccion = millis();

    Serial.println("✅ Sistema iniciado.");

    // Configurar la pantalla táctil como fuente de activación
    esp_sleep_enable_ext1_wakeup(1ULL << TOUCH_INTERRUPT_PIN, ESP_EXT1_WAKEUP_ANY_HIGH);

    // Configurar la detección de movimiento (GPIO_WAKEUP)
    pinMode(TOUCH_INTERRUPT_PIN, INPUT_PULLUP);
    esp_sleep_enable_gpio_wakeup();
}

// 🔻 Apagar pantalla y entrar en Deep Sleep
void suspenderSistema()
{
    if (!enSuspension)
    {
        Serial.println("💤 Entrando en suspensión...");
        pantallaEncendida = false;
        enSuspension = true;
        watch.setBrightness(0);
        // Reducir la frecuencia del procesador
        setCpuFrequencyMhz(80); // Cambiar la frecuencia de la CPU a 80 MHz para ahorrar energía
    }
}

void manejarSuspencion()
{
    unsigned long tiempoActual = millis();

    // 🔻 Reducir brillo tras 30s de inactividad
    if (pantallaEncendida && (tiempoActual - ultimaInteraccion > TIEMPO_ATENUACION_MS))
    {
        atenuarPantalla();
    }

    // 💤 Suspender tras 60s de inactividad
    if (pantallaEncendida && (tiempoActual - ultimaInteraccion > TIEMPO_SUSPENSION_MS))
    {
        suspenderSistema();
    }

    // 🔄 Detectar toque
    verificarToque();
    verificarNotificacion();
}
