import socket
def obtener_ip_local():
    try:
        # Se conecta a un host externo, sin importar si existe, para obtener la IP de salida
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))  # Google DNS
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception as e:
        print("Error obteniendo la IP local:", e)
        return "127.0.0.1"
    