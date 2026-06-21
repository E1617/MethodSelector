from django.urls import path
from . import views

urlpatterns = [
  path('inicio/', views.inicio, name = 'inicio'),
  path('biblioteca/', views.biblioteca, name = 'biblioteca'),
  path('evaluar/', views.evaluar, name = 'evaluar'),
]