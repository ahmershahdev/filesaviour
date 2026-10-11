from django.urls import path

from . import views

app_name = "accounts"
urlpatterns = [
    path("account/login", views.login_view, name="login"),
    path("account/register", views.register_view, name="register"),
    path("account/forgot-password", views.forgot_password_view, name="forgot"),
    path("account/reset/<str:uidb64>/<str:token>", views.reset_password_view, name="reset"),
    path("account/logout", views.logout_view, name="logout"),
    path("account/delete", views.delete_account, name="delete"),
    path("dashboard", views.dashboard, name="dashboard"),
    path("dashboard/settings", views.settings_view, name="settings"),
]
