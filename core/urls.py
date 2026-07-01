from django.urls import path
from . import views

urlpatterns = [
  path('inicio/', views.inicio, name = 'inicio'),
  path('biblioteca/', views.PintarBiblioteca, name = 'biblioteca'),
  path('evaluar/', views.evaluar, name='evaluar'),
  path('api/obtener-criterios/', views.obtener_criterios_fase, name='obtener_criterios'),
  path('api/obtener-metodos/', views.obtener_metodos_por_categoria, name='obtener_metodos'),
  path('api/guardar-evaluacion/', views.guardar_evaluacion_completa, name='guardar_evaluacion'),
]