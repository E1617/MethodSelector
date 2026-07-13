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

        with connection.cursor() as cursor:
            cursor.callproc('GetProjetsByListAll') 
            resultados_proyectos = cursor.fetchall()
            columnas_p = [col[0] for col in cursor.description]
            lista_proyectos_Totales = [dict(zip(columnas_p, fila)) for fila in resultados_proyectos]     
            
    except Exception as e:
        print(f"Error en el dashboard: {e}")
        lista_proyectos = []
        total_metodos = 0 

    contexto = {
        'total_proyectos': lista_proyectos_Totales,
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
                    proyecto.get('Equipo'),
                    proyecto.get('Requisitos'),
                ]
                cursor.callproc('InsertNewProjet', params_proyecto)
                cursor.execute("SELECT LAST_INSERT_ID();")
                id_proyecto_nuevo = cursor.fetchone()[0]
                
                cursor.callproc('InsertDatailCuestionario', [id_proyecto_nuevo, metodo_id, resultado_rec])
                
            return JsonResponse({
                'status': 'success',
                'message': '¡Proyecto creado y criterios asociados exitosamente con el SP!',
                'id_proyecto': id_proyecto_nuevo
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)

def historial_completo(request):
    try:
        with connection.cursor() as cursor:
            cursor.callproc('GetProjetsByListAll') 
            resultados = cursor.fetchall()
            columnas = [col[0] for col in cursor.description]
            lista_proyectos = [dict(zip(columnas, fila)) for fila in resultados]

    except Exception as e:
        print(f"Error al recuperar el historial completo: {e}")
        lista_proyectos = []

    contexto = {
        'proyectos': lista_proyectos
    }
    
    return render(request, 'core/Historial.html', contexto)

def obtener_justificacion(request, id_proyecto):
    try:
        with connection.cursor() as cursor:
            cursor.callproc('GetJustificacionesById', [id_proyecto])
            resultados = cursor.fetchall() 
            
            if resultados:
                lista_justificaciones = [fila[0] for fila in resultados if fila[0]]
                justificaciones_recortadas = lista_justificaciones[:2]
                texto_previsualizador = "\n\n".join(justificaciones_recortadas)
                
                return JsonResponse({'status': 'success', 'justificacion': texto_previsualizador})
            else:
                return JsonResponse({'status': 'success', 'justificacion': 'No se encontraron cláusulas registradas.'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


def generar_reporte(request, id_proyecto):
    proyecto_datos = {}
    try:
        with connection.cursor() as cursor:
            cursor.callproc('GetProjetsById', [id_proyecto]) 
            resultado_datos = cursor.fetchone()
            
            if resultado_datos:
                columnas_datos = [col[0] for col in cursor.description]
                proyecto_datos = dict(zip(columnas_datos, resultado_datos))
                
            cursor.callproc('GetJustificacionesById', [id_proyecto])
            resultados_just = cursor.fetchall() 
            
            if resultados_just:
                lista_just = [fila[0] for fila in resultados_just if fila[0]]
                proyecto_datos['Resultado_Justificacion'] = "\n\n".join(lista_just)
            else:
                proyecto_datos['Resultado_Justificacion'] = "No se registraron cláusulas de fundamentación técnica."
                
    except Exception as e:
        print(f"Error al generar el informe combinado: {e}")
        proyecto_datos = None

    contexto = {'proyecto': proyecto_datos}
    return render(request, 'core/informe_metodologico.html', contexto)