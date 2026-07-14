import json
from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def GetListElements(request):
  lista_elementos = [] # Declaramos la lista al principio
    
  with connection.cursor() as cursor:
      cursor.callproc('GetListAllElements')
      resultados = cursor.fetchall()
      
      # Procesamos las filas DENTRO del bloque 'with' mientras el cursor está activo
      if resultados is not None:
          for fila in resultados:
              lista_elementos.append({  
                  'ID': fila[0],
                  'nombreMetodo': fila[1],
                  'nombreElemento': fila[2],
                  'Descripción': fila[3],
              })
    
  contexto = {'elementos': lista_elementos}
  return render(request, 'core/nuevometodo.html', contexto)

def SaveMethodHibrid(request):
  if request.method == 'POST':
      try:
          data = json.loads(request.body)
          nombre = data.get('nombre')
          descripcion = data.get('descripcion')
          enfoque = data.get('enfoque')
          uso = data.get('uso')
          ventaja = data.get('ventaja')
          desventaja = data.get('desventaja')
          ids_elementos = data.get('elementos')

          if ids_elementos is None:
              ids_elementos = []
        
          lista_ids_string = ",".join(map(str, ids_elementos))

          with connection.cursor() as cursor:
            cursor.execute(
                "CALL SaveMethodHibridAndElements (%s, %s, %s, %s, %s, %s, %s)", 
                [nombre, descripcion, enfoque, uso, ventaja, desventaja, lista_ids_string]
            )

          return JsonResponse({'status': 'success', 'message': 'Metodología híbrida guardada correctamente.'})

      except Exception as e:
          return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
          
  return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

def SaveMethod(request):
  if request.method == 'POST':
      try:
          data = json.loads(request.body)
          nombre = data.get('nombre')
          categoria = data.get('categoria')
          descripcion = data.get('descripcion')
          enfoque = data.get('enfoque')
          uso = data.get('uso')
          ventaja = data.get('ventaja')
          desventaja = data.get('desventaja')

          with connection.cursor() as cursor:
            cursor.execute(
                "CALL InsertToMetodo (%s, %s, %s, %s, %s, %s, %s)", 
                [nombre, categoria, descripcion, enfoque, uso, ventaja, desventaja]
            )

          return JsonResponse({'status': 'success', 'message': 'Metodología guardada correctamente.'})

      except Exception as e:
          return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
          
  return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)