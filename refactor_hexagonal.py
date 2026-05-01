import os

base_dir = "server/src"

directories = [
    "config",
    "core",
    "modules/auth/domain",
    "modules/auth/application",
    "modules/auth/infrastructure/http/controllers",
    "modules/auth/infrastructure/http/routes",
    "modules/auth/infrastructure/database/repositories",
    
    "modules/eventos/domain",
    "modules/eventos/application",
    "modules/eventos/infrastructure/http/controllers",
    "modules/eventos/infrastructure/http/routes",
    "modules/eventos/infrastructure/database/repositories",
    
    "modules/inscripciones/domain",
    "modules/inscripciones/application",
    "modules/inscripciones/infrastructure/http/controllers",
    "modules/inscripciones/infrastructure/http/routes",
    "modules/inscripciones/infrastructure/database/repositories",
]

for d in directories:
    os.makedirs(os.path.join(base_dir, d), exist_ok=True)

print("Estructura Hexagonal creada en server/src/")
