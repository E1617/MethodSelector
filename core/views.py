from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection
from django.views.decorators.csrf import csrf_exempt
import json # ¡Importante! Te faltaba importar json para procesar el request.body

def inicio(request):
    return render(request, 'core/index.html')

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

# Reutilizamos esta función para que alimente el combo final según la categoría calculada por el JS
def obtener_metodos_por_categoria(request):
    categoria = request.GET.get('categoria', '')
    if not categoria:
        return JsonResponse({'error': 'Falta la categoría'}, status=400)
        
    with connection.cursor() as cursor:
        # Aquí mapeamos tu SP 'GetMethodsForCategoria'
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
            metodo_id = datos.get('metodo_id') # Viene del select dinámico
            resultado_rec = datos.get('resultado_rec', '') # Recomendación / Observaciones
            
            id_proyecto_nuevo = None
            
            with connection.cursor() as cursor:
                # PASO 1: Insertar el proyecto usando tu SP existente
                params_proyecto = [
                    proyecto.get('nombre'),
                    proyecto.get('descripcion'),
                    None, 
                    proyecto.get('presupuesto'),
                    proyecto.get('cliente'),
                ]
                cursor.callproc('InsertNewProjet', params_proyecto)
                
                # Obtener el ID del proyecto recién creado
                cursor.execute("SELECT LAST_INSERT_ID();")
                id_proyecto_nuevo = cursor.fetchone()[0]
                
                # PASO 2: Insertar en cascada usando tu SP "InsertDatailCuestionario"
                # Este SP ejecuta internamente el WHILE para asociar todos los criterios al proyecto.
                cursor.callproc('InsertDatailCuestionario', [metodo_id, id_proyecto_nuevo, resultado_rec])
                
            return JsonResponse({
                'status': 'success',
                'message': '¡Proyecto creado y criterios asociados exitosamente con el SP!',
                'id_proyecto': id_proyecto_nuevo
            })
            
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
            
    return JsonResponse({'error': 'Método no permitido'}, status=405)