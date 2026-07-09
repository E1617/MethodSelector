from django.shortcuts import render
from django.db import connection
import os
from django.conf import settings

def GetAllMethods():
    query = "CALL GetNameAllMethod()"
    
    with connection.cursor() as cursor:
        cursor.execute(query)
        columnas = [col[0] for col in cursor.description]
        return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]

def GetDataMethodByID(MetodoID):
    query = "CALL GetAllToMethodByID(%s)"
    with connection.cursor() as cursor:
        cursor.execute(query, [MetodoID]) 
        columnas = [col[0] for col in cursor.description] 
        fila = cursor.fetchone()
        if fila:
            return dict(zip(columnas, fila))
    return None

def ViewComparative(request):
    todos_los_metodos = GetAllMethods()
    
    metodos_comparar = []
    filas_comparativas = []
    mostrar_tabla = False

    if request.method == "POST":
        ids_seleccionados = request.POST.getlist('method_ids')
        
        if ids_seleccionados:
            mostrar_tabla = True
            for mid in ids_seleccionados:
                datos = GetDataMethodByID(mid)
                if datos:
                    metodos_comparar.append(datos)

            atributos = metodos_comparar[0].keys() if metodos_comparar else []
            for atributo in atributos:
                valores_de_esta_fila = []
                for metodo in metodos_comparar:
                    valores_de_esta_fila.append(metodo.get(atributo, ''))
                
                filas_comparativas.append({
                    'nombre_caracteristica': atributo,
                    'valores': valores_de_esta_fila
                })

    context = {
        'todos_los_metodos': todos_los_metodos,
        'metodos_seleccionados': metodos_comparar,
        'filas': filas_comparativas,
        'mostrar_tabla': mostrar_tabla
    }

    ruta_plantilla = os.path.join(settings.BASE_DIR, 'core', 'templates', 'core', 'comparativa.html')
    return render(request, ruta_plantilla, context)