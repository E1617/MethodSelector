from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection

def inicio(request):
  return render(request, 'core/index.html')

def evaluar(request): #funcion de Formulario evaluar
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
    contexto = {
        'biblioteca': lista_metodos
    }
    return render(request, 'core/bibliotecametodos.html', contexto)
