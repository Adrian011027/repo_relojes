#include "control_tareas.h"

// 📌 Procesar lista inicial de tareas (Pendientes o Tareas Extras)
void procesarPendientes(JsonDocument &doc)
{
    if (!doc["tareas no completadas"].is<JsonArray>())
    {
        Serial.println("❌ No se encontraron tareas en el JSON.");
        return;
    }

    JsonArray tareas = doc["tareas no completadas"];

    const char *tipoTarea = (doc["Comando"].is<const char *>() && strcmp(doc["Comando"], "TareasExtras") == 0)
                                ? "TareaExtra"
                                : "Tarea";

    lv_obj_t *contenedor = (strcmp(tipoTarea, "TareaExtra") == 0) ? ui_ContTEContenido : ui_ContPContenido;
    std::vector<Tarea> &listaTareasRef = (strcmp(tipoTarea, "TareaExtra") == 0) ? listaTareasExtras : listaTareas;

    lv_obj_clean(contenedor);
    listaTareasRef.clear();
    Serial.printf("🗑️ Contenedor de %s limpiado\n", tipoTarea);

    if (tareas.isNull() || tareas.size() == 0)
    {
        Serial.printf("ℹ️ No hay tareas en %s.\n", tipoTarea);
        agregarTarea("", "SIN PENDIENTES", "Sin Pendientes", tipoTarea);
        return;
    }

    Serial.printf("📌 Procesando tareas en %s...\n", tipoTarea);

    for (JsonObject tarea : tareas)
    {
        if (!tarea["Hora"].is<const char *>() ||
            !tarea["Tarea"].is<const char *>() ||
            !tarea["Estado"].is<const char *>())
        {
            Serial.println("⚠️ Tarea con parámetros incorrectos. Ignorada.");
            continue;
        }

        agregarTarea(
            tarea["Hora"].as<const char *>(),
            tarea["Tarea"].as<const char *>(),
            tarea["Estado"].as<const char *>(),
            tipoTarea
        );

        // Asignar campos extra a la última tarea agregada
        if (!listaTareasRef.empty())
        {
            Tarea &ultima = listaTareasRef.back();

            if (tarea.containsKey("TaskID")) {
                if (tarea["TaskID"].is<int>()) {
                    // Si viene como número -> convertir a String
                    ultima.taskId = String(tarea["TaskID"].as<int>());
                } else if (tarea["TaskID"].is<const char*>()) {
                    // Si viene como texto -> tomarlo directo
                    ultima.taskId = tarea["TaskID"].as<const char*>();
                }
            } else {
                Serial.println("⚠️ No se encontró TaskID en la tarea JSON");
            }


            if (tarea["IdEmpleado"].is<const char*>())
            {
                ultima.idEmpleado = tarea["IdEmpleado"].as<String>();
            }
            else
            {
                Serial.println("⚠️ No se encontró IdEmpleado en la tarea JSON");
            }

            Serial.printf("🆔 Asignado ID tarea: %s | Empleado: %s\n",
                        ultima.taskId.c_str(), ultima.idEmpleado.c_str());
        }
    }

    lv_task_handler();
}

// 📌 Evento de doble clic para cambiar estado a "En Progreso"
void eventoDobleClicTarea(lv_event_t *e)
{
    Serial.println("🔘 Evento disparado");

    lv_obj_t *boton = lv_event_get_target(e);
    lv_obj_t *label = lv_obj_get_child(boton, 1);

    if (label == NULL) {
        Serial.println("⚠️ No se encontró el label dentro del botón.");
        return;
    }

    for (auto &t : listaTareasExtras)
    {
        if (t.label == label)
        {
            if (t.estado == "Completado")
            {
                Serial.printf("⛔ La tarea '%s' ya está completada y no puede cambiar de estado.\n", t.nombre.c_str());
                return;
            }

            if (t.estado == "En Progreso")
            {
                Serial.printf("🔄 Revirtiendo tarea en progreso: %s a Pendiente\n", t.nombre.c_str());
                t.estado = "Pendiente";
                lv_obj_set_style_text_color(t.label, obtenerColorEstado("Pendiente"), 0);
                actualizarEstadoBotonYContenedor(listaTareasExtras, ui_BtnCompletarTareaExtra, ui_ContTEContenido, ui_ContTareasExtras);
                return;
            }

            for (auto &t_anterior : listaTareasExtras)
            {
                if (t_anterior.estado == "En Progreso")
                {
                    Serial.printf("🔄 Revirtiendo tarea en progreso: %s\n", t_anterior.nombre.c_str());
                    t_anterior.estado = "Pendiente";
                    lv_obj_set_style_text_color(t_anterior.label, obtenerColorEstado("Pendiente"), 0);
                    break;
                }
            }

            Serial.printf("✅ Tarea en proceso: %s\n", t.nombre.c_str());
            t.estado = "En Progreso";
            lv_obj_set_style_text_color(t.label, obtenerColorEstado("En Progreso"), 0);

            actualizarEstadoBotonYContenedor(listaTareasExtras, ui_BtnCompletarTareaExtra, ui_ContTEContenido, ui_ContTareasExtras);
            return;
        }
    }

    Serial.println("❌ No se encontró la tarea en la lista.");
}

// 📌 Agregar una tarea al contenedor
// 📌 Agregar una tarea al contenedor
void agregarTarea(const char *hora, const char *tarea, const char *estado, const char *tipo)
{
    lv_obj_t *contenedor;
    lv_obj_t *contenedorPrincipal;
    lv_obj_t *boton;
    std::vector<Tarea> *listaTareasPtr;

    if (strcmp(tipo, "TareaExtra") == 0)
    {
        contenedor = ui_ContTEContenido;
        contenedorPrincipal = ui_ContTareasExtras;
        boton = ui_BtnCompletarTareaExtra;
        listaTareasPtr = &listaTareasExtras;
    }
    else
    {
        contenedor = ui_ContPContenido;
        contenedorPrincipal = ui_ContPanelPrincial;
        boton = ui_BtnCompletarTarea;
        listaTareasPtr = &listaTareas;
    }

    // 🔹 Crear contenedor propio para la tarea
    lv_obj_t* contenedorTarea = lv_obj_create(contenedor);
    lv_obj_set_width(contenedorTarea, lv_pct(100));
    lv_obj_set_height(contenedorTarea, LV_SIZE_CONTENT);
    lv_obj_set_flex_flow(contenedorTarea, LV_FLEX_FLOW_ROW);
    lv_obj_set_style_pad_all(contenedorTarea, 4, 0);

    // 🔹 Botón y labels dentro del contenedor
    crear_boton(contenedorTarea);
    agregarHora(hora, btnTarea);
    agregarLblTarea(tarea, estado, btnTarea);

    if (strcmp(tipo, "TareaExtra") == 0)
    {
        lv_obj_add_event_cb(btnTarea, eventoDobleClicTarea, LV_EVENT_CLICKED, NULL);
    }
    else
    {
        lv_obj_clear_flag(btnTarea, LV_OBJ_FLAG_CLICKABLE);
    }
    
    // 🔹 Guardar también el contenedor en la estructura
    listaTareasPtr->push_back({tarea, estado, hora, tipo, "", "", lbl_tarea, contenedorTarea});

    Serial.printf("📌 Agregando tarea: %s con label %p y contenedor %p\n", tarea, lbl_tarea, contenedorTarea);

    actualizarEstadoBotonYContenedor(*listaTareasPtr, boton, contenedor, contenedorPrincipal);
}

// 📌 Cargar tareas normales
void agregarTareas(void *param)
{
    procesarPendientes(datosPendientes);
}

// 📌 Cargar tareas extras
void agregarTareasExtras(void *param)
{
    procesarPendientes(datosTareasExtras);
}

// 📌 Enviar tarea completada
void enviarTareaCompletada(void *param)
{
    Serial.println("📤 Enviando tarea completada...");

    TareaCompletadaData *data = static_cast<TareaCompletadaData *>(param);

    if (!data || !data->nombre || !data->tipo) {
        Serial.println("⚠️ Error: Datos de tarea completada no válidos.");
        return;
    }
    
    JsonDocument doc;
    doc["Comando"] = "TareaCompletada";
    doc["accion"] = "TareaCompletada";
    doc["Tarea"] = data->nombre;
    doc["Tipo"] = data->tipo;
    doc["uuid"] = loggin.Uuid;

    String jsonString;
    serializeJson(doc, jsonString);
    webSocket.sendTXT(jsonString);

    Serial.printf("✅ Tarea completada enviada: %s\n", jsonString.c_str());
    Serial.printf("Data : %s", data);
    delete data;
}

// 🔥 Mostrar tareas compactas en el reloj
void mostrarPendientesLVGL(JsonArray pendientes) {
    lv_obj_clean(ui_ContPContenido);  // Limpia contenedor
    int y_offset = 0;

    for (JsonObject tarea : pendientes) {
        const char* hora   = tarea["Hora"];
        const char* nombre = tarea["Tarea"];
        const char* tipo   = tarea["Tipo"];

        // Crear contenedor más pequeño
        lv_obj_t* contenedor = lv_obj_create(ui_ContPContenido);
        lv_obj_set_size(contenedor, 180, 28);   // 🔹 antes 40, ahora más compacto
        lv_obj_set_y(contenedor, y_offset);
        y_offset += 32;  // 🔹 separación más pequeña

        // Label de texto
        lv_obj_t* lbl = lv_label_create(contenedor);
        lv_label_set_text_fmt(lbl, "%s - %s", hora, nombre);
        lv_obj_align(lbl, LV_ALIGN_LEFT_MID, 5, 0);
        lv_obj_set_style_text_font(lbl, &lv_font_montserrat_12, 0);  // 🔹 fuente pequeña
        lv_label_set_long_mode(lbl, LV_LABEL_LONG_SCROLL_CIRCULAR);  // 🔹 scroll si es muy largo

        // Botón de palomita
        lv_obj_t* btn = lv_btn_create(contenedor);
        lv_obj_set_size(btn, 22, 22);  // 🔹 más pequeño
        lv_obj_align(btn, LV_ALIGN_RIGHT_MID, -3, 0);
        lv_obj_t* icono = lv_label_create(btn);
        lv_label_set_text(icono, LV_SYMBOL_OK);
        lv_obj_set_style_text_font(icono, &lv_font_montserrat_14, 0);

        // Estructura para enviar datos
        TareaCompletadaData* data = new TareaCompletadaData{
            nombre,
            tipo,
            hora
        };

        // Evento del botón
        lv_obj_add_event_cb(btn, [](lv_event_t* e) {
            TareaCompletadaData* d = static_cast<TareaCompletadaData*>(lv_event_get_user_data(e));
            Serial.printf("✅ Tarea finalizada: %s\n", d->nombre);
            JsonDocument doc;
            doc["accion"] = "Finalizada";
            doc["Tarea"]  = d->nombre;
            doc["Hora"]   = d->hora;
            doc["Tipo"]   = d->tipo;
            doc["uuid"]   = loggin.Uuid;

            String jsonStr;
            serializeJson(doc, jsonStr);
            webSocket.sendTXT(jsonStr);
            delete d;
        }, LV_EVENT_CLICKED, data);
    }
}
