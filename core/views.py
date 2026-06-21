from django.shortcuts import render

def inicio(request):
  return render(request, 'core/index.html')

def biblioteca(request):
  return render(request, 'core/bibliotecametodos.html')

def evaluar(request):
  return render(request, 'core/evaluar.html')