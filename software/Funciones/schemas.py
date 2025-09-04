from pydantic import BaseModel, Field, SecretStr
from typing import Optional, Dict, List, Literal

class Users(BaseModel):
    username: str = Field(None, min_length=4, max_length=20)
    password: SecretStr = Field(..., min_length=6, max_length=128)  # 🔑 antes 20, ahora 128
    role: Literal["empleado", "admin"]
    empleado_id: int = Field(None, gt=0, lt=100)

    class Config:
        json_encoders = {
            SecretStr: lambda v: v.get_secret_value()
        }

class UsersUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=4, max_length=20)
    role: Optional[Literal["empleado", "admin"]]
    password: Optional[SecretStr] = Field(None, min_length=6, max_length=128)

    class Config:
        json_encoders = {
            SecretStr: lambda v: v.get_secret_value()
        }

# =====================================================
# TAREAS
# =====================================================

class TareaSchema(BaseModel):
    id: Optional[int] = Field(None, gt=0, lt=100)
    newId: Optional[int] = Field(None, gt=0, lt=100)
    nombre: Optional[str] = Field(None, min_length=2, max_length=100)
    descripcion: Optional[str] = None
    hora: Optional[str] = None  # Ejemplo: "09:30"
    estatus: Optional[int] = None  
    # 1-In Progress, 2-To Do, 3-Extras, 4-ExtraTerminada, 0-Done
    # 1-En progreso 2-por desempeñar 3-extras 4-extras completadas 5-pendientes 

# Días de la semana en minúsculas
DIAS_SEMANA = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]

# =====================================================
# EMPLEADOS
# =====================================================

class EmpleadoSchema(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    puesto: str = Field(..., min_length=2, max_length=100)
    tareas_asignadas: Dict[str, List[TareaSchema]] = Field(
        default_factory=lambda: {dia: [] for dia in DIAS_SEMANA}
    )
    id: Optional[int] = None
    imagen: Optional[str] = None


class EmpleadoUpdateSchema(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=100)
    puesto: Optional[str] = Field(None, min_length=2, max_length=100)
    imagen: Optional[str] = Field(None, min_length=2, max_length=100)
    tareas_asignadas: Optional[Dict[str, List[TareaSchema]]] = None
