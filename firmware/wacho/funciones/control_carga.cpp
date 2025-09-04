#include "control_carga.h"

bool cargando = false;
bool estadoCargaAnterior = false; // Para detectar cambios en el estado de carga
unsigned long tiempoInicioCarga = 0;
const unsigned long DURACION_CARGA = 5000; // 5 segundos de animación

// 📌 Función para verificar si el reloj está cargando
bool estaCargando()
{
    return watch.isCharging(); // Devuelve true si el reloj está cargando
}

void nivel_bateria()
{
    int battery_percent = 0;
    battery_percent = watch.getBatteryPercent();
    lv_label_set_text_fmt(ui_BateriaLabel, "%d%%", battery_percent);
    lv_bar_set_value(ui_BateriaBar, battery_percent, LV_ANIM_OFF);
}

// 📌 Mostrar la pantalla de carga SOLO si se acaba de conectar el cargador
void mostrarPantallaCarga()
{
    if (!cargando)
    {
        cargando = true;
        tiempoInicioCarga = millis(); // Guardar el tiempo de inicio
        lv_obj_clear_flag(ui_ContAnimacionDeCarga, LV_OBJ_FLAG_HIDDEN);
    }
}

// 📌 Ocultar la pantalla de carga
void ocultarPantallaCarga()
{
    cargando = false;
    lv_obj_add_flag(ui_ContAnimacionDeCarga, LV_OBJ_FLAG_HIDDEN);
    lv_timer_handler(); // ⚠️ Procesa actualizaciones sin forzar un refresco inmediato
}

// 📌 Verificar si el estado de carga cambió
void verificarCarga()
{
    static bool primeraLectura = true; // ⚡ Para manejar reinicios sin errores

    bool estadoActual = watch.isCharging(); // 🔋 Verificar estado de carga

    // ⚠️ Si es la primera vez que se lee el estado, asegurarse de actualizar correctamente
    if (primeraLectura)
    {
        estadoCargaAnterior = estadoActual;
        primeraLectura = false; // ✅ Evitar que esto se repita
        if (!estadoActual)
        {
            ocultarPantallaCarga(); // ⛔ Si no está cargando al inicio, oculta la animación
        }
        return;
    }

    // 📌 Si se conecta el cargador, iniciar la animación
    if (estadoActual && !estadoCargaAnterior)
    {
        Serial.println("⚡ Cargador conectado, iniciando animación de carga...");
        mostrarPantallaCarga();
        tiempoInicioCarga = millis(); // Guardar tiempo de inicio de animación
    }
    // 📌 Si se desconecta el cargador, ocultar la animación
    else if (!estadoActual && estadoCargaAnterior)
    {
        Serial.println("🔌 Cargador desconectado, ocultando animación de carga...");
        ocultarPantallaCarga();
    }

    // ⏳ Si la animación lleva más de 5 segundos, ocultarla automáticamente
    if (cargando && (millis() - tiempoInicioCarga >= DURACION_CARGA))
    {
        Serial.println("⌛ Animación de carga finalizada automáticamente.");
        ocultarPantallaCarga();
    }

    // 🔄 Actualizar estado de carga anterior
    estadoCargaAnterior = estadoActual;
}

