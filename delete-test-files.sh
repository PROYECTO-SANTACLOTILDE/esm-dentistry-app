#!/bin/bash

# Buscar y borrar todos los archivos *.test.* en el directorio actual y subdirectorios
find . -type f -name "*.test.*" -exec rm -f {} \;

echo "Archivos *.test.* eliminados."
