from django.urls import path
from . import views

urlpatterns = [
  path('inicio/', views.inicio, name = 'inicio'),
  path('biblioteca/', views.PintarBiblioteca, name = 'biblioteca'),
  path('evaluar/', views.evaluar, name='evaluar'),
  path('api/obtener-criterios/', views.obtener_criterios_fase, name='obtener_criterios'),
]