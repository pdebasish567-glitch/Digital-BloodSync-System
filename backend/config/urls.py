from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

urlpatterns = [
    path('', RedirectView.as_view(url='api/', permanent=False)),
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/blood/', include('inventory.urls')),
    path('api/emergency/', include('emergency.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
