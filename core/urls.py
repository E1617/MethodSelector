from django.urls import path
from . import views
from . import views_comparation
from . import views_methodhibrid

urlpatterns = [
  path('inicio/', views.inicio, name = 'inicio'),
  path('biblioteca/', views.PintarBiblioteca, name = 'biblioteca'),
  path('evaluar/', views.evaluar, name='evaluar'),
  path('comparar/', views_comparation.ViewComparative, name='comparar'),
  path('elementos/', views_methodhibrid.GetListElements, name='elementos'),
  path('Historial/', views.historial_completo, name='historial'),
  path('api/obtener-criterios/', views.obtener_criterios_fase, name='obtener_criterios'),
  path('api/obtener-metodos/', views.obtener_metodos_por_categoria, name='obtener_metodos'),
  path('api/guardar-evaluacion/', views.guardar_evaluacion_completa, name='guardar_evaluacion'),
  path('historial/reporte/<int:id_proyecto>/', views.generar_reporte, name='generar_reporte'),
  path('api/obtener-justificacion/<int:id_proyecto>/', views.obtener_justificacion, name='api_justificacion'),
  path('SaveMethodHibrid/', views_methodhibrid.SaveMethodHibrid, name='SaveMethodHibrid'),
  path('SaveMethod/', views_methodhibrid.SaveMethod, name='SaveMethod'),
]