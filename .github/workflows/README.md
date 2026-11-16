# Pruebas unitarias aisladas de Movies Go

Estas pruebas viven solamente en este repositorio de QA para no contaminar ni modificar el proyecto original de Movies Go.

## Objetivo

Validar lo que realmente existe en el backend Java:
- autenticación
- llamadas a OMDb mockeadas
- catálogo en memoria
- persistencia JSON
- builders para fixtures

## Ejecución

El workflow `Isolated Movies Go Unit Tests` hace esto:

1. clona el repositorio original
2. copia el contenido de `tests/unit/java`
3. ejecuta Maven con Java 21
4. destruye el contexto del runner sin tocar el repositorio fuente

Localmente:

```bash
git clone https://github.com/AsaelCRdev/Proyecto-equipo-64-1.git movies-go
cp -R tests/unit/java/. movies-go/Back/src/test/java/
cd movies-go/Back
mvn -B -Dtest=AuthServiceTest,ApiServiceTest,CatalogServiceTest,JsonServiceTest test
