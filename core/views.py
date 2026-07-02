from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection
from django.views.decorators.csrf import csrf_exempt

import json 
import datetime

def inicio(request):
    try:
        with connection.cursor() as cursor:
            cursor.callproc('GetProjetsByList') 
            resultados_proyectos = cursor.fetchall()
            columnas_p = [col[0] for col in cursor.description]
            lista_proyectos = [dict(zip(columnas_p, fila)) for fila in resultados_proyectos]
            
        with connection.cursor() as cursor:
            cursor.callproc('GetAllMethodsDescription')
            resultados_metodos = cursor.fetchall()
            total_metodos = len(resultados_metodos) 
            
    except Exception as e:
        print(f"Error en el dashboard: {e}")
        lista_proyectos = []
        total_metodos = 0 

    contexto = {
        'proyectos': lista_proyectos,
        'total_metodos': total_metodos
    }
    return render(request, 'core/index.html', contexto)

def evaluar(request): 
    return render(request, 'core/Evaluar.html')
  
def obtener_criterios_fase(request):
    fase_solicitada = request.GET.get('fase', '')
    if not fase_solicitada:
        return JsonResponse({'error': 'No se especificó la fase'}, status=400)
    with connection.cursor() as cursor:
        cursor.callproc('GetCriterioForCategoriaToForm', [fase_solicitada])
        resultados = cursor.fetchall() 
        lista_criterios = [fila[0] for fila in resultados]
    return JsonResponse({'criterios': lista_criterios})

def PintarBiblioteca(request):
    with connection.cursor() as cursor:
        cursor.callproc('GetAllMethodsDescription')
        resultados = cursor.fetchall()
        columnas = [col[0] for col in cursor.description]
        lista_metodos = [dict(zip(columnas, fila)) for fila in resultados]
    contexto = {'biblioteca': lista_metodos}
    return render(request, 'core/bibliotecametodos.html', contexto)

def obtener_metodos_por_categoria(request):
    categoria = request.GET.get('categoria', '')
    if not categoria:
        return JsonResponse({'error': 'Falta la categoría'}, status=400)
        
    with connection.cursor() as cursor:
        cursor.callproc('GetMethodsForCategoria', [categoria])
        resultados = cursor.fetchall()
        
        lista_metodos = [
            {'id': fila[0], 'nombre': fila[1]} 
            for fila in resultados
        ]
        
    return JsonResponse({'metodos': lista_metodos})

@csrf_exempt 
def guardar_evaluacion_completa(request):
    if request.method == 'POST':
        try:
            datos = json.loads(request.body)
            
            proyecto = datos.get('proyecto', {})
            metodo_id = datos.get('metodo_id') 
            resultado_rec = datos.get('resultado_rec', '') 
            fecha_proyecto = proyecto.get('fecha') or datetime.date.today()
            
            id_proyecto_nuevo = None
            
            with connection.cursor() as cursor:
                params_proyecto = [
                    proyecto.get('nombre'),
                    proyecto.get('descripcion'),
                    fecha_proyecto,
                    proyecto.get('presupuesto'),
                    proyecto.get('cliente'),
                ]
                cursor.callproc('InsertNewProjet', params_proyecto)
                cursor.execute("SELECT LAST_INSERT_ID();")
                id_proyecto_nuevo = cursor.fetchone()[0]
                
                cursor.callproc('InsertDatailCuestionario', [id_proyecto_nuevo, metodo_id, resultado_rec])
                
            return JsonResponse({
                'status': 'success',
                'message': '¡Proyecto creado exitosamente!',
                cursor.execute("SELECT LAST_INSERT_ID();")
                id_proyecto_nuevo = cursor.fetchone()[0]
                cursor.callproc('InsertDatailCuestionario', [metodo_id, id_proyecto_nuevo, resultado_rec])
                
            return JsonResponse({
                'status': 'success',
                'message': '¡Proyecto creado y criterios asociados exitosamente con el SP!',
                'id_proyecto': id_proyecto_nuevo
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)