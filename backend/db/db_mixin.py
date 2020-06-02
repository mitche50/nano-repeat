from tortoise import fields

"""
Mixins are used as reusable templates for common fields.
An example of this is timestamps created and modified that
should be tracked for many tables.
"""
class TimestampMixin():
    # The time the record was created.
    created_at = fields.DatetimeField(null=True, auto_now_add=True)
    # The last time the record was modified
    modified_at = fields.DatetimeField(null=True, auto_now=True)