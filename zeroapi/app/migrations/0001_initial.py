# Generated by Django 4.2.1 on 2023-05-26 02:43

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ZeroUser',
            fields=[
                ('uid', models.AutoField(primary_key=True, serialize=False, unique=True)),
                ('username', models.CharField(max_length=100)),
                ('projects', models.JSONField(default=dict)),
                ('is_deployed', models.BooleanField(default=False)),
                ('env_id', models.CharField(default='', max_length=100)),
            ],
        ),
    ]
