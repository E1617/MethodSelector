from django.db.backends.mysql.base import DatabaseWrapper as MySQLDatabaseWrapper
from django.db.backends.mysql.features import DatabaseFeatures as MySQLDatabaseFeatures

# 1. Parcheamos las características para desactivar RETURNING
class CompatDatabaseFeatures(MySQLDatabaseFeatures):
    @property
    def can_return_rows_from_bulk_insert(self):
        return False

    @property
    def can_return_columns_from_insert(self):
        return False

    @property
    def has_select_for_update_of(self):
        return False

# 2. Heredamos el conector base e inyectamos el bypass de versión y características
class DatabaseWrapper(MySQLDatabaseWrapper):
    features_class = CompatDatabaseFeatures

    def check_database_version_supported(self):
        # Al dejar esto vacío, le decimos a Django: "No valides nada, todo está bien"
        pass