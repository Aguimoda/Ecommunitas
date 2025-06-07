# Script para analizar la estructura de la base de datos MongoDB y compararla con los modelos
# Autor: Asistente AI
# Fecha: Diciembre 2024

Write-Host "=== ANÁLISIS DE BASE DE DATOS ECOMMUNITAS ===" -ForegroundColor Green
Write-Host "Generando reporte de estructura de base de datos..." -ForegroundColor Yellow

# Configuración
$projectPath = "C:\Users\danie\OneDrive\Desktop\Proyecto FG\Ecommunitas"
$outputFile = "$projectPath\database-structure-report.md"
$modelsPath = "$projectPath\backend\src\models"
$entitiesDoc = "$projectPath\ENTIDADES_BASE_DATOS.md"

# Función para obtener información de MongoDB
function Get-MongoDBInfo {
    Write-Host "Intentando conectar a MongoDB..." -ForegroundColor Cyan
    
    try {
        # Verificar si mongo CLI está disponible
        $mongoCheck = Get-Command mongo -ErrorAction SilentlyContinue
        if (-not $mongoCheck) {
            Write-Host "MongoDB CLI no encontrado" -ForegroundColor Yellow
            return $null
        }
        
        # Script simple para MongoDB
        $mongoScript = 'db.adminCommand("listCollections").cursor.firstBatch.forEach(function(c) { print("Coleccion: " + c.name); var stats = db.getCollection(c.name).stats(); print("Documentos: " + stats.count); print("---"); });'
        
        # Ejecutar comando MongoDB
        $result = & mongo --quiet --eval $mongoScript 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $result -join "`n"
        } else {
            return $null
        }
    }
    catch {
        Write-Host "Error al conectar con MongoDB: $_" -ForegroundColor Red
        return $null
    }
}

# Función para analizar modelos de Mongoose
function Analyze-MongooseModels {
    Write-Host "Analizando modelos de Mongoose..." -ForegroundColor Cyan
    
    $models = @{}
    $modelFiles = Get-ChildItem -Path $modelsPath -Filter "*.ts" -ErrorAction SilentlyContinue
    
    if (-not $modelFiles) {
        Write-Host "No se encontraron archivos de modelo en: $modelsPath" -ForegroundColor Yellow
        return $models
    }
    
    foreach ($file in $modelFiles) {
        try {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
            $modelName = $file.BaseName
            
            $models[$modelName] = @{
                'File' = $file.Name
                'Path' = $file.FullName
                'Size' = $file.Length
                'LastModified' = $file.LastWriteTime
                'HasSchema' = $content -match 'Schema'
                'HasInterface' = $content -match 'interface'
                'HasExport' = $content -match 'export'
            }
            
            # Contar campos aproximados
            $fieldCount = ([regex]::Matches($content, '\w+\s*:\s*\{')).Count
            $models[$modelName]['EstimatedFields'] = $fieldCount
            
            # Contar índices
            $indexCount = ([regex]::Matches($content, 'index\(')).Count
            $models[$modelName]['EstimatedIndexes'] = $indexCount
            
        }
        catch {
            Write-Host "Error al procesar archivo $($file.Name): $_" -ForegroundColor Red
        }
    }
    
    return $models
}

# Función para generar reporte
function Generate-Report {
    param(
        [hashtable]$models,
        [string]$mongoInfo
    )
    
    Write-Host "Generando reporte..." -ForegroundColor Cyan
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    $report = @"
# 📊 REPORTE DE ANÁLISIS DE BASE DE DATOS ECOMMUNITAS

**Fecha de generación:** $timestamp
**Proyecto:** Ecommunitas
**Base de datos:** MongoDB
**ORM:** Mongoose

---

## 🔍 RESUMEN EJECUTIVO

Este reporte compara la estructura real de la base de datos MongoDB con los modelos definidos en la aplicación Ecommunitas.

**Modelos encontrados:** $($models.Keys.Count)
**Ruta de modelos:** ``$modelsPath``

---

## 📋 MODELOS DE MONGOOSE ANALIZADOS

"@

    if ($models.Keys.Count -gt 0) {
        foreach ($modelName in $models.Keys) {
            $model = $models[$modelName]
            $report += @"

### 📄 MODELO: $modelName

- **Archivo:** ``$($model.File)``
- **Tamaño:** $($model.Size) bytes
- **Última modificación:** $($model.LastModified)
- **Tiene Schema:** $(if($model.HasSchema) {'✅ Sí'} else {'❌ No'})
- **Tiene Interface:** $(if($model.HasInterface) {'✅ Sí'} else {'❌ No'})
- **Tiene Export:** $(if($model.HasExport) {'✅ Sí'} else {'❌ No'})
- **Campos estimados:** $($model.EstimatedFields)
- **Índices estimados:** $($model.EstimatedIndexes)

"@
        }
    } else {
        $report += "`n❌ **No se encontraron modelos de Mongoose**`n`n"
    }

    # Agregar información de MongoDB si está disponible
    if ($mongoInfo) {
        $report += @"

---

## 🗄️ ESTRUCTURA REAL DE LA BASE DE DATOS

```
$mongoInfo
```

"@
    } else {
        $report += @"

---

## ⚠️ INFORMACIÓN DE BASE DE DATOS NO DISPONIBLE

No se pudo conectar a MongoDB para obtener la estructura real de la base de datos.

**Posibles causas:**
- MongoDB no está ejecutándose
- El cliente mongo CLI no está instalado o no está en PATH
- Problemas de conexión a la base de datos
- La base de datos no existe o está vacía

**Para obtener información manual:**

1. Asegúrate de que MongoDB esté ejecutándose:
   ```bash
   # En Windows (si MongoDB está como servicio)
   net start MongoDB
   
   # O ejecutar mongod manualmente
   mongod --dbpath C:\data\db
   ```

2. Conecta a MongoDB:
   ```bash
   mongo
   ```

3. Lista las bases de datos:
   ```javascript
   show dbs
   ```

4. Usa la base de datos del proyecto:
   ```javascript
   use ecommunitas  // o el nombre de tu base de datos
   ```

5. Lista las colecciones:
   ```javascript
   show collections
   ```

6. Para cada colección, obtén información:
   ```javascript
   db.users.findOne()  // Ejemplo para colección users
   db.users.getIndexes()
   db.users.stats()
   ```

"@
    }

    # Agregar análisis de discrepancias
    $report += @"

---

## 🔍 ANÁLISIS DE DISCREPANCIAS

### Comparación con ENTIDADES_BASE_DATOS.md

"@

    if (Test-Path $entitiesDoc) {
        try {
            $entitiesContent = Get-Content -Path $entitiesDoc -Raw -ErrorAction Stop
            $report += "✅ **Documento de entidades encontrado:** ``ENTIDADES_BASE_DATOS.md```n`n"
            
            # Analizar discrepancias básicas
            $report += "#### Modelos encontrados en código vs documentación:`n`n"
            
            foreach ($modelName in $models.Keys) {
                $modelNameUpper = $modelName.ToUpper()
                if ($entitiesContent -match $modelName -or $entitiesContent -match $modelNameUpper) {
                    $report += "- ✅ **$modelName:** Documentado`n"
                } else {
                    $report += "- ⚠️ **$modelName:** No encontrado en documentación`n"
                }
            }
            
            # Verificar entidades mencionadas en documentación
            $documentedEntities = @('USER', 'ITEM', 'MESSAGE')
            $report += "`n#### Entidades documentadas vs modelos en código:`n`n"
            
            foreach ($entity in $documentedEntities) {
                $found = $false
                foreach ($modelName in $models.Keys) {
                    if ($modelName.ToUpper() -eq $entity -or $modelName.ToUpper() -eq ($entity.Substring(0,1) + $entity.Substring(1).ToLower())) {
                        $found = $true
                        break
                    }
                }
                
                if ($found) {
                    $report += "- ✅ **$entity:** Modelo implementado`n"
                } else {
                    $report += "- ❌ **$entity:** Modelo no encontrado`n"
                }
            }
        }
        catch {
            $report += "❌ **Error al leer documento de entidades:** $_`n`n"
        }
    } else {
        $report += "❌ **Documento de entidades no encontrado:** ``ENTIDADES_BASE_DATOS.md```n`n"
    }

    $report += @"

---

## 📝 RECOMENDACIONES

### Para mantener la documentación actualizada:

1. **Sincronización regular:** Ejecuta este script después de cambios en los modelos
2. **Validación de esquemas:** Compara campos documentados vs implementados
3. **Índices:** Verifica que los índices documentados coincidan con los implementados
4. **Validaciones:** Asegúrate de que las validaciones estén documentadas

### Próximos pasos:

1. ✅ Revisar discrepancias encontradas
2. ✅ Actualizar ``ENTIDADES_BASE_DATOS.md`` si es necesario
3. ✅ Verificar que la base de datos real coincida con los modelos
4. ✅ Documentar cualquier cambio en los esquemas

### Para conectar a MongoDB:

1. **Instalar MongoDB:** Si no está instalado, descarga desde https://www.mongodb.com/try/download/community
2. **Iniciar servicio:** ``net start MongoDB`` (Windows) o ``sudo systemctl start mongod`` (Linux)
3. **Verificar conexión:** ``mongo --eval "db.adminCommand('ismaster')"``

---

## 🛠️ COMANDOS ÚTILES

### Para MongoDB:
```javascript
// Listar todas las colecciones
show collections

// Obtener esquema de una colección
db.users.findOne()

// Obtener índices
db.users.getIndexes()

// Estadísticas de colección
db.users.stats()

// Contar documentos
db.users.countDocuments()
```

### Para Mongoose (en Node.js):
```javascript
// Obtener información del esquema
const User = require('./models/User');
console.log(User.schema.paths);
console.log(User.schema.indexes());
```

### Para este script:
```powershell
# Ejecutar análisis
.\scripts\database-analysis.ps1

# Ver solo modelos sin conectar a MongoDB
.\scripts\database-analysis.ps1 -SkipMongoDB
```

---

*Reporte generado automáticamente por script de análisis de base de datos*
*Proyecto: Ecommunitas | Fecha: $timestamp*
"@

    return $report
}

# Ejecutar análisis principal
try {
    Write-Host "Iniciando análisis..." -ForegroundColor Green
    
    # Verificar que existe el directorio de modelos
    if (-not (Test-Path $modelsPath)) {
        Write-Host "❌ No se encontró el directorio de modelos: $modelsPath" -ForegroundColor Red
        Write-Host "Verifica que el proyecto esté en la ruta correcta" -ForegroundColor Yellow
        exit 1
    }
    
    # Analizar modelos
    Write-Host "📁 Analizando modelos en: $modelsPath" -ForegroundColor Cyan
    $models = Analyze-MongooseModels
    Write-Host "✅ Modelos analizados: $($models.Keys.Count)" -ForegroundColor Green
    
    if ($models.Keys.Count -gt 0) {
        Write-Host "📋 Modelos encontrados: $($models.Keys -join ', ')" -ForegroundColor White
    }
    
    # Obtener información de MongoDB
    Write-Host "🔌 Intentando conectar a MongoDB..." -ForegroundColor Yellow
    $mongoInfo = Get-MongoDBInfo
    
    if ($mongoInfo) {
        Write-Host "✅ Información de MongoDB obtenida exitosamente" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No se pudo obtener información de MongoDB (continuando sin ella)" -ForegroundColor Yellow
    }
    
    # Generar reporte
    Write-Host "📄 Generando reporte..." -ForegroundColor Cyan
    $report = Generate-Report -models $models -mongoInfo $mongoInfo
    
    # Guardar reporte
    try {
        $report | Out-File -FilePath $outputFile -Encoding UTF8 -ErrorAction Stop
        Write-Host "✅ Reporte guardado exitosamente" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Error al guardar reporte: $_" -ForegroundColor Red
        Write-Host "Intentando guardar en ubicación alternativa..." -ForegroundColor Yellow
        $alternativeFile = "$env:TEMP\database-structure-report.md"
        $report | Out-File -FilePath $alternativeFile -Encoding UTF8
        $outputFile = $alternativeFile
        Write-Host "✅ Reporte guardado en: $outputFile" -ForegroundColor Green
    }
    
    Write-Host "" -ForegroundColor Green
    Write-Host "🎉 ANÁLISIS COMPLETADO EXITOSAMENTE" -ForegroundColor Green
    Write-Host "📄 Reporte guardado en: $outputFile" -ForegroundColor Cyan
    Write-Host "" -ForegroundColor Green
    
    # Mostrar resumen
    Write-Host "📊 RESUMEN DEL ANÁLISIS:" -ForegroundColor Yellow
    Write-Host "- Modelos analizados: $($models.Keys.Count)" -ForegroundColor White
    if ($models.Keys.Count -gt 0) {
        Write-Host "- Archivos de modelo: $($models.Keys -join ', ')" -ForegroundColor White
    }
    
    if ($mongoInfo) {
        Write-Host "- Conexión a MongoDB: ✅ Exitosa" -ForegroundColor Green
    } else {
        Write-Host "- Conexión a MongoDB: ⚠️ No disponible" -ForegroundColor Yellow
    }
    
    Write-Host "- Documento de entidades: $(if (Test-Path $entitiesDoc) {'✅ Encontrado'} else {'❌ No encontrado'})" -ForegroundColor $(if (Test-Path $entitiesDoc) {'Green'} else {'Red'})
    
    Write-Host "" -ForegroundColor Green
    
    # Preguntar si abrir el reporte
    Write-Host "¿Deseas abrir el reporte generado? (s/n): " -ForegroundColor Cyan -NoNewline
    $openFile = Read-Host
    if ($openFile -eq 's' -or $openFile -eq 'S' -or $openFile -eq 'y' -or $openFile -eq 'Y') {
        try {
            Start-Process $outputFile
            Write-Host "📖 Abriendo reporte..." -ForegroundColor Green
        }
        catch {
            Write-Host "❌ No se pudo abrir el reporte automáticamente" -ForegroundColor Red
            Write-Host "Puedes abrirlo manualmente desde: $outputFile" -ForegroundColor Yellow
        }
    }
    
}
catch {
    Write-Host "" -ForegroundColor Red
    Write-Host "❌ ERROR CRÍTICO: $_" -ForegroundColor Red
    Write-Host "" -ForegroundColor Red
    Write-Host "🔧 VERIFICACIONES:" -ForegroundColor Yellow
    Write-Host "1. ✅ El proyecto esté en la ruta correcta: $projectPath" -ForegroundColor White
    Write-Host "2. ✅ Los modelos existan en: $modelsPath" -ForegroundColor White
    Write-Host "3. ⚠️ MongoDB esté ejecutándose (opcional para análisis básico)" -ForegroundColor White
    Write-Host "4. ✅ Permisos de escritura en el directorio del proyecto" -ForegroundColor White
    Write-Host "" -ForegroundColor Red
}

Write-Host "" -ForegroundColor Green
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")