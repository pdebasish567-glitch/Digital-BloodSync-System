from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import EmergencyRequest

@receiver(post_save, sender=EmergencyRequest)
def broadcast_emergency(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            'emergency_alerts',
            {
                'type': 'emergency_message',
                'message': f'URGENT: {instance.units_required} units of {instance.blood_group} blood needed at {instance.location_name}!',
                'data': {
                    'id': instance.id,
                    'blood_group': instance.blood_group,
                    'location': instance.location_name,
                    'urgency': instance.urgency_level
                }
            }
        )
